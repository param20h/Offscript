import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/constants";
import {
  inquirySchema,
  isHoneypotTriggered,
  isSubmissionTooFast,
  InquiryPayload,
} from "@/lib/validations/inquiry";
import { isSupabaseConfigured, getSupabaseServerClient } from "@/lib/db/supabase";
import { checkRateLimit, getClientIpHash } from "@/lib/rate-limit";
import { sendInquiryNotification } from "@/lib/email/resend";

export { type InquiryPayload };

const MAX_PAYLOAD_BYTES = 64 * 1024; // 64 KB maximum request size

function createMailtoUrl(name: string, email: string, projectType: string, description: string): string {
  const subject = encodeURIComponent(`Project Inquiry: ${name || "Client"} — ${projectType || "General"}`);
  const body = encodeURIComponent(
    `Hi OFFSCRIPT Team,\n\nName: ${name}\nEmail: ${email}\nDiscipline: ${projectType}\n\nProject Brief:\n${description}\n`
  );
  return `mailto:${SITE_CONFIG.email}?subject=${subject}&body=${body}`;
}

export async function POST(request: Request) {
  try {
    // 1. Payload Size Guard
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        {
          success: false,
          persisted: false,
          error: "Payload exceeds maximum allowed size (64 KB).",
        },
        { status: 413 }
      );
    }

    // 2. Distributed Rate Limiting Check
    const rateLimit = await checkRateLimit(request);

    if (rateLimit.serviceUnavailable) {
      const mailtoUrl = createMailtoUrl("", "", "", "");
      return NextResponse.json(
        {
          success: false,
          persisted: false,
          error: "Rate limiting infrastructure is unconfigured in production. Please contact us directly via email.",
          fallbackEmail: SITE_CONFIG.email,
          mailtoUrl,
        },
        {
          status: 503,
          headers: {
            "Retry-After": "60",
          },
        }
      );
    }

    if (!rateLimit.success) {
      const retryAfterSeconds = rateLimit.retryAfterSeconds || 900;
      return NextResponse.json(
        {
          success: false,
          persisted: false,
          error: `Too many inquiries received from this network. Please wait ${Math.ceil(
            retryAfterSeconds / 60
          )} minutes before submitting another brief.`,
          retryAfter: retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSeconds),
          },
        }
      );
    }

    // 3. Safe JSON Parsing
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          persisted: false,
          error: "Malformed JSON payload.",
        },
        { status: 400 }
      );
    }

    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json(
        {
          success: false,
          persisted: false,
          error: "Request body must be a valid JSON object.",
        },
        { status: 400 }
      );
    }

    const payloadObj = rawBody as Record<string, unknown>;

    // 4. Honeypot Anti-Spam Check
    if (isHoneypotTriggered({ company_website_hp: String(payloadObj.company_website_hp || "") })) {
      // Reject bot traffic immediately without persisting or emailing
      return NextResponse.json(
        {
          success: false,
          persisted: false,
          error: "Automated submission rejected.",
        },
        { status: 400 }
      );
    }

    // 5. Submission Timing Protection (< 3 seconds)
    if (typeof payloadObj.durationMs === "number" && isSubmissionTooFast(payloadObj.durationMs)) {
      return NextResponse.json(
        {
          success: false,
          persisted: false,
          error: "Form submission too fast. Please review your brief before submitting.",
        },
        { status: 400 }
      );
    }

    // 6. Strict Server-Side Validation via Zod Schema
    const validationResult = inquirySchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          persisted: false,
          error: "Validation failed. Please correct the highlighted fields.",
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const inquiry = validationResult.data;
    const { ipHash } = getClientIpHash(request);
    const userAgent = request.headers.get("user-agent") || "unknown";

    // 7. Durable Database Persistence (Must precede email dispatch)
    if (!isSupabaseConfigured()) {
      // Truth in engineering: do not claim persistence when database credentials are not provisioned
      const mailtoUrl = createMailtoUrl(inquiry.name, inquiry.email, inquiry.projectType, inquiry.description);
      return NextResponse.json(
        {
          success: false,
          persisted: false,
          error: "Inquiry database is unconfigured. Your brief has not been stored. Please use direct studio email.",
          fallbackEmail: SITE_CONFIG.email,
          mailtoUrl,
        },
        { status: 503 }
      );
    }

    let inquiryId: string;
    const supabase = getSupabaseServerClient();

    try {
      const { data: inserted, error: insertError } = await supabase
        .from("inquiries")
        .insert({
          name: inquiry.name,
          email: inquiry.email,
          company: inquiry.company || "Independent",
          project_type: inquiry.projectType,
          currency: inquiry.currency,
          budget_range: inquiry.budgetRange,
          timeline: inquiry.timeline,
          description: inquiry.description,
          delivery_status: "pending",
          delivery_attempts: 0,
          metadata: {
            ipHash,
            durationMs: inquiry.durationMs,
            userAgent,
          },
        })
        .select("id")
        .single();

      if (insertError || !inserted?.id) {
        console.error("[INQUIRY_DB_INSERT_FAILED]", insertError);
        const mailtoUrl = createMailtoUrl(inquiry.name, inquiry.email, inquiry.projectType, inquiry.description);
        return NextResponse.json(
          {
            success: false,
            persisted: false,
            error: "Failed to persist project brief to database. Please use direct studio email.",
            fallbackEmail: SITE_CONFIG.email,
            mailtoUrl,
          },
          { status: 500 }
        );
      }

      inquiryId = inserted.id;
    } catch (dbErr) {
      console.error("[INQUIRY_DB_EXCEPTION]", dbErr);
      const mailtoUrl = createMailtoUrl(inquiry.name, inquiry.email, inquiry.projectType, inquiry.description);
      return NextResponse.json(
        {
          success: false,
          persisted: false,
          error: "A database error occurred while recording your brief. Please use direct studio email.",
          fallbackEmail: SITE_CONFIG.email,
          mailtoUrl,
        },
        { status: 500 }
      );
    }

    // 8. Resend Email Notification Dispatch
    const resendResult = await sendInquiryNotification(inquiry, inquiryId);

    // 9. Update Database Record with Delivery Outcome
    if (resendResult.accepted) {
      await supabase
        .from("inquiries")
        .update({
          delivery_status: "delivered",
          delivery_attempts: 1,
        })
        .eq("id", inquiryId);

      return NextResponse.json(
        {
          success: true,
          persisted: true,
          notificationAccepted: true,
          inquiryId,
          message: "Your project brief has been securely recorded and dispatched to the studio inbox.",
        },
        { status: 200 }
      );
    }

    if (resendResult.unconfigured) {
      await supabase
        .from("inquiries")
        .update({
          delivery_status: "unconfigured",
          delivery_attempts: 0,
          last_delivery_error: "Resend unconfigured or awaiting domain DNS verification",
        })
        .eq("id", inquiryId);

      return NextResponse.json(
        {
          success: true,
          persisted: true,
          notificationAccepted: false,
          inquiryId,
          message:
            "Your project brief has been securely stored in our studio intake database. Automated notification dispatch is currently awaiting domain verification.",
        },
        { status: 202 }
      );
    }

    // Resend returned an error
    await supabase
      .from("inquiries")
      .update({
        delivery_status: "failed",
        delivery_attempts: 1,
        last_delivery_error: resendResult.error || "Email provider dispatch rejected",
      })
      .eq("id", inquiryId);

    return NextResponse.json(
      {
        success: true,
        persisted: true,
        notificationAccepted: false,
        inquiryId,
        message:
          "Your project brief has been securely stored in our intake database. Notification dispatch encountered a temporary network delay and will be reviewed manually.",
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("[INQUIRY_POST_UNHANDLED_EXCEPTION]", error);
    const mailtoUrl = createMailtoUrl("", "", "", "");
    return NextResponse.json(
      {
        success: false,
        persisted: false,
        error: "An unexpected server error occurred while processing the inquiry.",
        fallbackEmail: SITE_CONFIG.email,
        mailtoUrl,
      },
      { status: 500 }
    );
  }
}

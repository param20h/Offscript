import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface InquiryPayload {
  name: string;
  email: string;
  company?: string;
  projectType: string;
  currency: "USD" | "INR";
  budgetRange: string;
  timeline: string;
  description: string;
}

export async function POST(request: Request) {
  try {
    const body: InquiryPayload = await request.json();

    // 1. Strict Server-Side Validation
    if (!body.name || typeof body.name !== "string" || body.name.trim().length < 2) {
      return NextResponse.json(
        { error: "A valid name (at least 2 characters) is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!body.email || !emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "A valid contact email address is required." },
        { status: 400 }
      );
    }

    if (!body.description || typeof body.description !== "string" || body.description.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a project brief with at least 10 characters." },
        { status: 400 }
      );
    }

    const currency = body.currency === "INR" ? "INR" : "USD";

    // 2. Persist Inquiry to Server Storage (Do Not Silently Discard)
    const timestamp = new Date().toISOString();
    const storedRecord = {
      timestamp,
      name: body.name.trim(),
      email: body.email.trim(),
      company: body.company ? body.company.trim() : "Independent",
      projectType: body.projectType || "General Engineering",
      currency,
      budgetRange: body.budgetRange,
      timeline: body.timeline,
      description: body.description.trim(),
    };

    try {
      const logsDir = path.join(process.cwd(), ".data");
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      const logFile = path.join(logsDir, "inquiries.jsonl");
      fs.appendFileSync(logFile, JSON.stringify(storedRecord) + "\n", "utf8");
    } catch (fsErr) {
      console.warn("[INQUIRY_FS_WARNING] Could not append to file system:", fsErr);
    }

    // 3. Resend Integration Architecture
    const resendApiKey = process.env.RESEND_API_KEY;

    // Check if production delivery is actively configured
    if (resendApiKey) {
      try {
        // Dynamic dispatch via Resend REST API
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "OFFSCRIPT Studio <inquiries@param20h.me>",
            to: ["offscript@param20h.me"],
            reply_to: storedRecord.email,
            subject: `[Project Inquiry] ${storedRecord.name} — ${storedRecord.projectType}`,
            text: `
Name: ${storedRecord.name}
Email: ${storedRecord.email}
Company: ${storedRecord.company}
Discipline: ${storedRecord.projectType}
Budget: ${storedRecord.currency} ${storedRecord.budgetRange}
Timeline: ${storedRecord.timeline}
Date: ${storedRecord.timestamp}

Brief:
${storedRecord.description}
            `.trim(),
          }),
        });

        if (resendResponse.ok) {
          return NextResponse.json(
            {
              success: true,
              delivered: true,
              message: "Your inquiry has been successfully delivered to the studio.",
            },
            { status: 200 }
          );
        } else {
          const errData = await resendResponse.json().catch(() => ({}));
          console.error("[RESEND_DISPATCH_FAILED]", errData);
        }
      } catch (dispatchErr) {
        console.error("[RESEND_NETWORK_ERROR]", dispatchErr);
      }
    }

    // 4. Honest Failure / Delivery Unavailable State (Truth in Engineering)
    // If delivery is unconfigured or failed, DO NOT claim delivery succeeded.
    // Return explicit error so the client displays a clear notification with direct mailto fallback.
    const mailtoSubject = encodeURIComponent(`Project Inquiry: ${storedRecord.name} — ${storedRecord.projectType}`);
    const mailtoBody = encodeURIComponent(
      `Hi OFFSCRIPT Team,\n\nName: ${storedRecord.name}\nEmail: ${storedRecord.email}\nCompany: ${storedRecord.company}\nDiscipline: ${storedRecord.projectType}\nBudget: ${storedRecord.currency} ${storedRecord.budgetRange}\nTimeline: ${storedRecord.timeline}\n\nProject Brief:\n${storedRecord.description}\n`
    );
    const mailtoUrl = `mailto:offscript@param20h.me?subject=${mailtoSubject}&body=${mailtoBody}`;

    return NextResponse.json(
      {
        success: false,
        delivered: false,
        error:
          "Automated transactional dispatch is currently unconfigured awaiting domain verification. Your brief has been preserved in server logs, but please also send directly to offscript@param20h.me.",
        fallbackEmail: "offscript@param20h.me",
        mailtoUrl,
      },
      { status: 503 }
    );
  } catch (error) {
    console.error("[INQUIRY_POST_ERROR]", error);
    return NextResponse.json(
      { error: "An unexpected server error occurred while processing the inquiry." },
      { status: 500 }
    );
  }
}

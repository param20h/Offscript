import { InquiryInput } from "@/lib/validations/inquiry";

export interface ResendDispatchResult {
  success: boolean;
  accepted: boolean;
  unconfigured: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Escapes unsafe HTML characters to prevent XSS / HTML injection in mail clients.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Checks whether the Resend transactional service has all required environment variables.
 */
export function isResendConfigured(): boolean {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const toEmail = process.env.CONTACT_NOTIFICATION_EMAIL;

  return Boolean(
    apiKey &&
      apiKey.trim().length > 0 &&
      fromEmail &&
      fromEmail.trim().length > 0 &&
      toEmail &&
      toEmail.trim().length > 0
  );
}

/**
 * Dispatches an inquiry notification email to the studio inbox via the Resend REST API.
 * Uses strict timeouts and sanitizes all client-provided fields.
 *
 * @param inquiry Validated inquiry payload
 * @param inquiryId Primary key ID of the persisted database record
 */
export async function sendInquiryNotification(
  inquiry: InquiryInput,
  inquiryId: string
): Promise<ResendDispatchResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const toEmail = process.env.CONTACT_NOTIFICATION_EMAIL;

  if (!apiKey || !fromEmail || !toEmail || apiKey.trim().length === 0) {
    return {
      success: false,
      accepted: false,
      unconfigured: true,
      error: "Resend email dispatch is unconfigured (missing API key or sender/recipient email).",
    };
  }

  const subject = `[Project Inquiry] ${inquiry.name} — ${inquiry.projectType}`;

  const packageSelection = inquiry.packageModel || inquiry.budgetRange || "Launch";

  const textBody = `
NEW INQUIRY REGISTERED — OFFSCRIPT STUDIO
Record ID: ${inquiryId}

Name: ${inquiry.name}
Email: ${inquiry.email}
Company: ${inquiry.company || "Independent"}
Discipline: ${inquiry.projectType}
Package: ${packageSelection}
Timeline: ${inquiry.timeline}

Project Brief:
${inquiry.description}
`.trim();

  const safeName = escapeHtml(inquiry.name);
  const safeEmail = escapeHtml(inquiry.email);
  const safeCompany = escapeHtml(inquiry.company || "Independent");
  const safeDiscipline = escapeHtml(inquiry.projectType);
  const safePackage = escapeHtml(packageSelection);
  const safeTimeline = escapeHtml(inquiry.timeline);
  const safeDescription = escapeHtml(inquiry.description).replace(/\n/g, "<br/>");
  const safeInquiryId = escapeHtml(inquiryId);

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #171717; color: #F0EDE5; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #1f1f21; border: 1px solid #2e2e32; padding: 32px; }
    .header { border-bottom: 2px solid #D6FF35; padding-bottom: 16px; margin-bottom: 24px; }
    .title { font-size: 20px; font-weight: bold; color: #F0EDE5; letter-spacing: -0.5px; }
    .badge { font-family: monospace; font-size: 11px; color: #D6FF35; text-transform: uppercase; margin-top: 4px; }
    .field-row { margin-bottom: 12px; font-size: 14px; }
    .label { font-family: monospace; font-size: 11px; text-transform: uppercase; color: #9c9a94; }
    .value { color: #F0EDE5; font-weight: 500; margin-top: 2px; }
    .brief-box { background-color: #171717; border: 1px solid #2e2e32; padding: 16px; margin-top: 20px; font-size: 14px; line-height: 1.6; color: #F0EDE5; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #2e2e32; font-family: monospace; font-size: 10px; color: #9c9a94; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">OFFSCRIPT STUDIO — NEW PROJECT INQUIRY</div>
      <div class="badge">Verified Database Record: ${safeInquiryId}</div>
    </div>

    <div class="field-row">
      <div class="label">Client Name</div>
      <div class="value">${safeName}</div>
    </div>

    <div class="field-row">
      <div class="label">Contact Email</div>
      <div class="value"><a href="mailto:${safeEmail}" style="color: #D6FF35; text-decoration: none;">${safeEmail}</a></div>
    </div>

    <div class="field-row">
      <div class="label">Organization / Company</div>
      <div class="value">${safeCompany}</div>
    </div>

    <div class="field-row">
      <div class="label">Project Discipline</div>
      <div class="value">${safeDiscipline}</div>
    </div>

    <div class="field-row">
      <div class="label">Engagement Package</div>
      <div class="value">${safePackage}</div>
    </div>

    <div class="field-row">
      <div class="label">Target Timeline</div>
      <div class="value">${safeTimeline}</div>
    </div>

    <div class="label" style="margin-top: 20px;">Project Brief & Objectives</div>
    <div class="brief-box">${safeDescription}</div>

    <div class="footer">
      OFFSCRIPT Studio Intake Pipeline &bull; Automated Dispatch &bull; UTC ${new Date().toISOString()}
    </div>
  </div>
</body>
</html>
`.trim();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail.trim(),
        to: [toEmail.trim()],
        reply_to: inquiry.email.trim(),
        subject,
        text: textBody,
        html: htmlBody,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        success: true,
        accepted: true,
        unconfigured: false,
        messageId: data?.id,
      };
    }

    const errData = await res.json().catch(() => ({}));
    const errMessage = errData?.message || `Resend dispatch failed with status ${res.status}`;
    console.error("[RESEND_DISPATCH_REJECTED]", { status: res.status, error: errMessage });

    return {
      success: false,
      accepted: false,
      unconfigured: false,
      error: errMessage,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const isAbort = err instanceof Error && err.name === "AbortError";
    const errorDesc = isAbort ? "Email dispatch timed out after 8 seconds." : "Email dispatch network failure.";
    console.error("[RESEND_DISPATCH_EXCEPTION]", err);

    return {
      success: false,
      accepted: false,
      unconfigured: false,
      error: errorDesc,
    };
  }
}

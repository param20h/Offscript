import { ProposalRecord, ClientRecord } from "@/lib/db/supabase";
import { formatCurrency } from "@/lib/proposals/pricing";

export interface ProposalDispatchResult {
  success: boolean;
  messageId?: string;
  error?: string;
  unconfigured?: boolean;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Dispatches an executive proposal PDF directly to the client via Resend.
 * Uses official sending identity: OFFSCRIPT Studio <inquiries@offscript.param20h.me>.
 * Never exposes the studio owner's private inbox.
 */
export async function sendProposalToClient({
  proposal,
  client,
  pdfBuffer,
  customMessage,
  accessUrl,
}: {
  proposal: ProposalRecord;
  client: ClientRecord;
  pdfBuffer: Buffer;
  customMessage?: string;
  accessUrl?: string;
}): Promise<ProposalDispatchResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "OFFSCRIPT Studio <inquiries@offscript.param20h.me>";

  if (!apiKey) {
    return {
      success: false,
      unconfigured: true,
      error: "Resend API key is not configured on this server.",
    };
  }

  const formattedTotal = formatCurrency(proposal.total_amount, proposal.currency);
  const formattedAdvance = formatCurrency(proposal.advance_amount, proposal.currency);
  const safeClientName = escapeHtml(client.name);
  const safeTitle = escapeHtml(proposal.title);
  const safeNumber = escapeHtml(proposal.proposal_number);
  const safeCustomMessage = customMessage ? escapeHtml(customMessage) : null;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>OFFSCRIPT Studio Proposal</title>
</head>
<body style="margin:0;padding:32px 16px;background-color:#171717;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,sans-serif;color:#F0EDE5;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;background-color:#141414;border:1px solid rgba(240,237,229,0.12);border-radius:4px;overflow:hidden;">
    <tr>
      <td style="padding:28px 32px;border-bottom:1px solid rgba(240,237,229,0.1);background-color:#111111;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <div style="font-size:20px;font-weight:bold;letter-spacing:-0.5px;color:#F0EDE5;">OFFSCRIPT</div>
              <div style="font-size:10px;font-family:monospace;letter-spacing:1px;color:#D6FF35;text-transform:uppercase;margin-top:2px;">Digital Engineering Studio</div>
            </td>
            <td align="right">
              <span style="font-family:monospace;font-size:11px;color:#F0EDE5;background:rgba(240,237,229,0.06);padding:4px 8px;border-radius:2px;border:1px solid rgba(240,237,229,0.12);">${safeNumber}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding:32px;">
        <p style="font-size:14px;color:#F0EDE5;margin:0 0 16px 0;line-height:1.6;">
          Dear ${safeClientName},
        </p>

        <p style="font-size:14px;color:rgba(240,237,229,0.8);margin:0 0 24px 0;line-height:1.6;">
          Thank you for exploring an engineering partnership with OFFSCRIPT Studio. We have prepared our formal technical proposal and commercial scope for <strong>${safeTitle}</strong>.
        </p>

        ${
          safeCustomMessage
            ? `<div style="padding:16px;background-color:rgba(240,237,229,0.02);border-left:2px solid #D6FF35;margin-bottom:24px;font-size:13px;color:rgba(240,237,229,0.85);line-height:1.6;font-family:monospace;">${safeCustomMessage}</div>`
            : ""
        }

        <div style="background-color:#181818;border:1px solid rgba(240,237,229,0.1);border-radius:3px;padding:20px;margin-bottom:28px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size:12px;font-family:monospace;">
            <tr>
              <td style="color:rgba(240,237,229,0.5);">PROJECT:</td>
              <td align="right" style="color:#F0EDE5;font-weight:bold;">${safeTitle}</td>
            </tr>
            <tr>
              <td style="color:rgba(240,237,229,0.5);">TOTAL INVESTMENT:</td>
              <td align="right" style="color:#D6FF35;font-weight:bold;font-size:14px;">${formattedTotal}</td>
            </tr>
            <tr>
              <td style="color:rgba(240,237,229,0.5);">ADVANCE DEPOSIT:</td>
              <td align="right" style="color:#F0EDE5;">${formattedAdvance} (${proposal.advance_percentage}%)</td>
            </tr>
            <tr>
              <td style="color:rgba(240,237,229,0.5);">VALID UNTIL:</td>
              <td align="right" style="color:#F0EDE5;">${proposal.valid_until}</td>
            </tr>
          </table>
        </div>

        <p style="font-size:13px;color:rgba(240,237,229,0.7);margin:0 0 24px 0;line-height:1.6;">
          You can securely review your complete proposal in our online document viewer, or download the attached PDF for your records.
        </p>

        ${
          accessUrl
            ? `<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
          <tr>
            <td>
              <a href="${accessUrl}" style="display:inline-block;background-color:#D6FF35;color:#171717;font-family:monospace;font-size:12px;font-weight:bold;padding:12px 24px;border-radius:2px;text-decoration:none;text-transform:uppercase;letter-spacing:0.5px;">
                View Your Proposal &rarr;
              </a>
            </td>
          </tr>
        </table>`
            : ""
        }

        <p style="font-size:12px;color:rgba(240,237,229,0.5);margin:0 0 24px 0;line-height:1.6;font-family:monospace;">
          To approve this scope or request adjustments, reply directly to this email or write to <a href="mailto:offscript@param20h.me" style="color:#D6FF35;text-decoration:none;">offscript@param20h.me</a>.
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding:20px 32px;background-color:#111111;border-top:1px solid rgba(240,237,229,0.1);font-family:monospace;font-size:11px;color:rgba(240,237,229,0.4);line-height:1.6;">
        OFFSCRIPT Studio · <a href="https://offscript.param20h.me" style="color:#D6FF35;text-decoration:none;">offscript.param20h.me</a> · <a href="mailto:offscript@param20h.me" style="color:rgba(240,237,229,0.6);text-decoration:none;">offscript@param20h.me</a>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
OFFSCRIPT Studio — Project Proposal
Proposal: ${proposal.proposal_number}
Date: ${new Date(proposal.created_at).toLocaleDateString()}
Valid Until: ${proposal.valid_until}

Dear ${client.name},

Please find attached our formal project proposal for "${proposal.title}".

COMMERCIAL SUMMARY:
Total Amount: ${formattedTotal}
Advance Deposit: ${formattedAdvance} (${proposal.advance_percentage}%)

${customMessage ? `Note: ${customMessage}\n\n` : ""}
${accessUrl ? `View Online Proposal: ${accessUrl}\n\n` : ""}
The complete itemized bill of materials, deliverables, milestone payment schedule, and terms are also included in the attached PDF.

To proceed or request modifications, reply directly to this email or contact us at offscript@param20h.me.

Best regards,
OFFSCRIPT Studio
https://offscript.param20h.me
offscript@param20h.me
  `.trim();

  try {
    const payload = {
      from: fromEmail,
      to: [client.email],
      reply_to: "offscript@param20h.me",
      subject: `Your Project Proposal from OFFSCRIPT Studio [${proposal.proposal_number}]`,
      html,
      text,
      attachments: [
        {
          filename: `${proposal.proposal_number}.pdf`,
          content: pdfBuffer.toString("base64"),
        },
      ],
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: data.message || `Resend API returned HTTP ${res.status}`,
      };
    }

    return {
      success: true,
      messageId: data.id,
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? "Resend request timed out after 12 seconds"
          : err.message
        : "Network error during email dispatch";
    return {
      success: false,
      error: message,
    };
  }
}

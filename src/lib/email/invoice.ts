import { InvoiceRecord, ClientRecord } from "@/lib/db/supabase";
import { formatCurrency } from "@/lib/invoices/pricing";

export interface InvoiceDispatchResult {
  success: boolean;
  messageId?: string;
  deliveryStatus: "accepted_by_provider" | "failed";
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
 * Dispatches a formal invoice vector PDF directly to the client via Resend.
 * Official sender: OFFSCRIPT Studio <inquiries@offscript.param20h.me>.
 * Never exposes the studio owner's private Gmail.
 */
export async function sendInvoiceToClient({
  invoice,
  client,
  pdfBuffer,
  customMessage,
}: {
  invoice: InvoiceRecord;
  client: ClientRecord;
  pdfBuffer: Buffer;
  customMessage?: string;
}): Promise<InvoiceDispatchResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "OFFSCRIPT Studio <inquiries@offscript.param20h.me>";

  if (!apiKey) {
    return {
      success: false,
      deliveryStatus: "failed",
      unconfigured: true,
      error: "Resend API key is not configured on this server.",
    };
  }

  const formattedTotal = formatCurrency(invoice.total_amount, invoice.currency);
  const formattedBalance = formatCurrency(invoice.balance_due, invoice.currency);
  const safeClientName = escapeHtml(client.name);
  const safeNumber = escapeHtml(invoice.invoice_number);
  const safeDueDate = new Date(invoice.due_date).toLocaleDateString();
  const safeCustomMessage = customMessage ? escapeHtml(customMessage) : null;
  const safeInstructions = invoice.payment_instructions
    ? escapeHtml(invoice.payment_instructions)
    : "Please reference invoice number in transaction description.";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>OFFSCRIPT Studio Invoice ${safeNumber}</title>
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
          Please find attached invoice <strong>${safeNumber}</strong> from OFFSCRIPT Studio.
        </p>

        ${
          safeCustomMessage
            ? `<div style="padding:16px;background-color:rgba(240,237,229,0.02);border-left:2px solid #D6FF35;margin-bottom:24px;font-size:13px;color:rgba(240,237,229,0.85);line-height:1.6;font-family:monospace;">${safeCustomMessage}</div>`
            : ""
        }

        <div style="background-color:#181818;border:1px solid rgba(240,237,229,0.1);border-radius:3px;padding:20px;margin-bottom:28px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size:12px;font-family:monospace;">
            <tr>
              <td style="color:rgba(240,237,229,0.5);">INVOICE NUMBER:</td>
              <td align="right" style="color:#F0EDE5;font-weight:bold;">${safeNumber}</td>
            </tr>
            <tr>
              <td style="color:rgba(240,237,229,0.5);">TOTAL INVOICED:</td>
              <td align="right" style="color:#F0EDE5;font-weight:bold;">${formattedTotal}</td>
            </tr>
            <tr>
              <td style="color:rgba(240,237,229,0.5);">DUE DATE:</td>
              <td align="right" style="color:#F0EDE5;">${safeDueDate}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top:12px;border-top:1px solid rgba(240,237,229,0.1);">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="color:#D6FF35;font-size:13px;font-weight:bold;">BALANCE DUE:</td>
                    <td align="right" style="color:#D6FF35;font-size:16px;font-weight:bold;">${formattedBalance}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom:24px;padding:16px;background-color:#111111;border:1px solid rgba(240,237,229,0.08);border-radius:3px;">
          <div style="font-size:11px;font-family:monospace;color:rgba(240,237,229,0.5);text-transform:uppercase;margin-bottom:6px;">Payment Remittance Instructions:</div>
          <div style="font-size:12px;font-family:monospace;color:#F0EDE5;line-height:1.5;">${safeInstructions}</div>
        </div>

        <p style="font-size:13px;color:rgba(240,237,229,0.6);margin:0 0 24px 0;line-height:1.6;">
          An itemized statement of charges is attached as a PDF to this email. For billing inquiries, reply directly to this email or contact us at <a href="mailto:offscript@param20h.me" style="color:#D6FF35;text-decoration:none;">offscript@param20h.me</a>.
        </p>

        <p style="font-size:13px;color:rgba(240,237,229,0.7);margin:0;line-height:1.6;">
          Sincerely,<br>
          <strong style="color:#F0EDE5;">OFFSCRIPT Studio</strong><br>
          <span style="font-size:11px;color:rgba(240,237,229,0.4);">Engineered properly.</span>
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding:16px 32px;background-color:#0d0d0d;border-top:1px solid rgba(240,237,229,0.08);text-align:center;">
        <p style="font-size:10px;font-family:monospace;color:rgba(240,237,229,0.3);margin:0;">
          OFFSCRIPT Studio · <a href="https://offscript.param20h.me" style="color:rgba(240,237,229,0.5);text-decoration:none;">offscript.param20h.me</a> · offscript@param20h.me
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Dear ${client.name},

Please find attached invoice ${invoice.invoice_number} from OFFSCRIPT Studio.

COMMERCIAL SUMMARY:
Invoice: ${invoice.invoice_number}
Total Invoiced: ${formattedTotal}
Balance Due: ${formattedBalance}
Due Date: ${safeDueDate}

${customMessage ? `Note: ${customMessage}\n\n` : ""}
PAYMENT INSTRUCTIONS:
${invoice.payment_instructions || "Please reference invoice number in transaction description."}

The itemized PDF statement is attached to this email. For billing queries, reply directly or contact offscript@param20h.me.

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
      subject: `Invoice ${invoice.invoice_number} [Balance: ${formattedBalance}] — OFFSCRIPT Studio`,
      html,
      text,
      attachments: [
        {
          filename: `${invoice.invoice_number}.pdf`,
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
        deliveryStatus: "failed",
        error: data.message || `Resend API returned HTTP ${res.status}`,
      };
    }

    return {
      success: true,
      messageId: data.id,
      deliveryStatus: "accepted_by_provider",
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
      deliveryStatus: "failed",
      error: message,
    };
  }
}

import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";
import { formatCurrency } from "./pricing";
import {
  InvoiceRecord,
  InvoiceItemRecord,
  PaymentRecord,
  ClientRecord,
} from "@/lib/db/supabase";

export interface InvoicePDFData {
  invoice: InvoiceRecord;
  client: ClientRecord;
  items: InvoiceItemRecord[];
  payments?: PaymentRecord[];
  linkedProposalNumber?: string | null;
}

// Synchronously load pre-rasterized official monochrome studio logo if available
let invoiceLogoPng: Buffer | null = null;
try {
  const logoPath = path.join(process.cwd(), "public", "Logo", "invoice-logo-mono.png");
  if (fs.existsSync(logoPath)) {
    invoiceLogoPng = fs.readFileSync(logoPath);
  }
} catch {
  invoiceLogoPng = null;
}

/**
 * Safe currency formatter for jsPDF (standard Helvetica fonts lack the Unicode Rupee symbol glyph,
 * which causes standard jsPDF to encode ₹ as superscript 1 (¹)).
 */
function formatPdfCurrency(amount: number, currency = "INR"): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const curr = (currency || "INR").toUpperCase();
  const numStr = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe);

  if (curr === "INR") {
    return `INR ${numStr}`;
  }
  if (curr === "USD") {
    return `$${numStr}`;
  }
  if (curr === "EUR") {
    return `EUR ${numStr}`;
  }
  if (curr === "GBP") {
    return `GBP ${numStr}`;
  }
  return `${curr} ${numStr}`;
}

/**
 * Generates an executive, branded OFFSCRIPT Studio invoice vector PDF.
 * Uses strict typography, high-contrast architecture, and multi-page flow.
 */
export function generateInvoicePDF({
  invoice,
  client,
  items,
  payments = [],
  linkedProposalNumber,
}: InvoicePDFData): Buffer {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      y = margin;
      drawPageDecorations();
    }
  };

  const drawPageDecorations = () => {
    // Architectural top accent
    doc.setFillColor(23, 23, 23); // Obsidian
    doc.rect(margin, 8, contentWidth, 0.8, "F");

    // Lime accent mark
    doc.setFillColor(214, 255, 53); // Acid Lime
    doc.rect(margin, 8, 12, 0.8, "F");
  };

  drawPageDecorations();

  // ---------------------------------------------------------------------------
  // 1. HEADER SECTION
  // ---------------------------------------------------------------------------
  if (invoiceLogoPng) {
    const logoW = 46;
    const logoH = logoW / (462 / 124); // ~12.35 mm
    doc.addImage(invoiceLogoPng, "PNG", margin, y + 1, logoW, logoH, undefined, "FAST");
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(23, 23, 23);
    doc.text("OFFSCRIPT", margin, y + 8);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(110, 110, 110);
    doc.text("DIGITAL ENGINEERING STUDIO · TAX INVOICE", margin, y + 13);
  }

  // Invoice Number & Status
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(23, 23, 23);
  doc.text(invoice.invoice_number, pageWidth - margin, y + 7, { align: "right" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const statusLabel = invoice.status.toUpperCase().replace("_", " ");
  doc.text(`STATUS: ${statusLabel}`, pageWidth - margin, y + 12, { align: "right" });

  y += 24;

  // ---------------------------------------------------------------------------
  // 2. CLIENT & INVOICE METADATA GRID
  // ---------------------------------------------------------------------------
  doc.setFillColor(248, 247, 244); // Warm ivory tint
  doc.roundedRect(margin, y, contentWidth, 34, 1.5, 1.5, "F");
  doc.setDrawColor(230, 228, 222);
  doc.roundedRect(margin, y, contentWidth, 34, 1.5, 1.5, "D");

  // Left column: Bill To
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(130, 130, 130);
  doc.text("BILLED TO", margin + 6, y + 7);

  doc.setFontSize(10);
  doc.setTextColor(23, 23, 23);
  doc.text(client.name, margin + 6, y + 13);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  let clientY = y + 18;
  if (client.company_name && client.company_name !== "Independent") {
    doc.text(client.company_name, margin + 6, clientY);
    clientY += 4.5;
  }
  doc.text(client.email, margin + 6, clientY);
  if (client.address) {
    clientY += 4.5;
    doc.text(client.address.slice(0, 45), margin + 6, clientY);
  }

  // Right column: Invoice Dates & Reference
  const rightColX = pageWidth - margin - 6;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(130, 130, 130);
  doc.text("INVOICE DETAILS", rightColX, y + 7, { align: "right" });

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(`Issue Date: ${new Date(invoice.issue_date).toLocaleDateString()}`, rightColX, y + 13, { align: "right" });
  doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, rightColX, y + 18, { align: "right" });

  if (linkedProposalNumber) {
    doc.text(`Proposal Ref: ${linkedProposalNumber}`, rightColX, y + 23, { align: "right" });
  } else if (invoice.invoice_type) {
    doc.text(`Type: ${invoice.invoice_type.toUpperCase()}`, rightColX, y + 23, { align: "right" });
  }

  y += 42;

  // ---------------------------------------------------------------------------
  // 3. ITEMIZED INVOICE TABLE
  // ---------------------------------------------------------------------------
  checkPageBreak(30);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(23, 23, 23);
  doc.text("STATEMENT OF CHARGES", margin, y);
  y += 4;

  // Table header
  doc.setFillColor(23, 23, 23);
  doc.rect(margin, y, contentWidth, 7, "F");

  // Calibrated column layout preventing overlap:
  // DESCRIPTION: margin+4 (22)
  // QTY:         margin+78 (96) [right aligned]
  // UNIT:        margin+84 (102) [left aligned]
  // RATE:        margin+128 (146) [right aligned]
  // TOTAL:       pageWidth-margin-4 (188) [right aligned]
  doc.setFontSize(7.5);
  doc.setTextColor(240, 237, 229);
  doc.setFont("helvetica", "bold");
  doc.text("DESCRIPTION", margin + 4, y + 4.8);
  doc.text("QTY", margin + 78, y + 4.8, { align: "right" });
  doc.text("UNIT", margin + 84, y + 4.8, { align: "left" });
  doc.text("RATE", margin + 128, y + 4.8, { align: "right" });
  doc.text("TOTAL", pageWidth - margin - 4, y + 4.8, { align: "right" });

  y += 7;

  // Items rows
  doc.setFont("helvetica", "normal");
  items.forEach((item, index) => {
    checkPageBreak(12);

    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 248);
      doc.rect(margin, y, contentWidth, 8, "F");
    }

    doc.setFontSize(8.5);
    doc.setTextColor(30, 30, 30);
    const desc = item.description.length > 36 ? `${item.description.slice(0, 33)}...` : item.description;
    doc.text(desc, margin + 4, y + 5.2);

    doc.text(item.quantity.toString(), margin + 78, y + 5.2, { align: "right" });
    const unitText = (item.unit || "unit").slice(0, 8);
    doc.text(unitText, margin + 84, y + 5.2, { align: "left" });
    doc.text(formatPdfCurrency(item.unit_price, invoice.currency), margin + 128, y + 5.2, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(formatPdfCurrency(item.total_price, invoice.currency), pageWidth - margin - 4, y + 5.2, { align: "right" });
    doc.setFont("helvetica", "normal");

    y += 8;
  });

  // Divider line
  doc.setDrawColor(210, 210, 210);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // ---------------------------------------------------------------------------
  // 4. COMMERCIAL SUMMARY & RECONCILIATION BLOCK
  // ---------------------------------------------------------------------------
  checkPageBreak(45);

  const summaryWidth = 96;
  const summaryX = pageWidth - margin - summaryWidth;
  const rightAlignX = pageWidth - margin - 4;

  const printSummaryRow = (label: string, value: string, isBold = false) => {
    doc.setFontSize(8.5);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setTextColor(isBold ? 23 : 80, isBold ? 23 : 80, isBold ? 23 : 80);
    doc.text(label, summaryX + 4, y);
    doc.text(value, rightAlignX, y, { align: "right" });
    y += 5.5;
  };

  printSummaryRow("Subtotal", formatPdfCurrency(invoice.subtotal, invoice.currency));

  if (invoice.discount_amount > 0) {
    printSummaryRow("Discount", `-${formatPdfCurrency(invoice.discount_amount, invoice.currency)}`);
  }

  if (invoice.tax_rate && invoice.tax_rate > 0) {
    printSummaryRow(`Tax / GST (${invoice.tax_rate}%)`, `+${formatPdfCurrency(invoice.tax_amount, invoice.currency)}`);
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(summaryX, y - 2, pageWidth - margin, y - 2);

  printSummaryRow("Total Invoiced", formatPdfCurrency(invoice.total_amount, invoice.currency), true);

  if (invoice.amount_paid > 0) {
    printSummaryRow("Payments Recorded", `-${formatPdfCurrency(invoice.amount_paid, invoice.currency)}`);
  }

  // Balance Due Accent Block
  y += 2;
  doc.setFillColor(23, 23, 23); // Obsidian
  doc.rect(summaryX, y, summaryWidth, 11, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(214, 255, 53); // Acid Lime
  doc.text("BALANCE DUE", summaryX + 4, y + 7.2);
  doc.text(formatPdfCurrency(invoice.balance_due, invoice.currency), rightAlignX, y + 7.2, { align: "right" });

  y += 18;

  // ---------------------------------------------------------------------------
  // 5. PAYMENT LEDGER SUMMARY (If active payments exist)
  // ---------------------------------------------------------------------------
  const recordedPayments = payments.filter((p) => p.status === "recorded");
  if (recordedPayments.length > 0) {
    checkPageBreak(25);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(23, 23, 23);
    doc.text("RECORDED PAYMENTS HISTORY", margin, y);
    y += 4;

    doc.setFillColor(245, 245, 242);
    doc.rect(margin, y, contentWidth, 6, "F");
    doc.setFontSize(7.5);
    doc.setTextColor(90, 90, 90);
    doc.text("DATE", margin + 4, y + 4.2);
    doc.text("METHOD", margin + 35, y + 4.2);
    doc.text("REFERENCE", margin + 70, y + 4.2);
    doc.text("AMOUNT", pageWidth - margin - 4, y + 4.2, { align: "right" });
    y += 6;

    recordedPayments.forEach((p) => {
      checkPageBreak(8);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      doc.text(new Date(p.payment_date).toLocaleDateString(), margin + 4, y + 4.5);
      doc.text(p.payment_method.toUpperCase().replace("_", " "), margin + 35, y + 4.5);
      doc.text(p.transaction_reference || "—", margin + 70, y + 4.5);
      doc.setFont("helvetica", "bold");
      doc.text(formatPdfCurrency(p.amount, invoice.currency), pageWidth - margin - 4, y + 4.5, { align: "right" });
      doc.setFont("helvetica", "normal");
      y += 6;
    });

    y += 6;
  }

  // ---------------------------------------------------------------------------
  // 6. PAYMENT REMITTANCE INSTRUCTIONS & FOOTER
  // ---------------------------------------------------------------------------
  checkPageBreak(35);

  doc.setFillColor(248, 247, 244);
  doc.rect(margin, y, contentWidth, 24, "F");
  doc.setDrawColor(230, 228, 222);
  doc.rect(margin, y, contentWidth, 24, "D");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(110, 110, 110);
  doc.text("PAYMENT INSTRUCTIONS & REMITTANCE", margin + 5, y + 6);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);

  const instructionsText =
    invoice.payment_instructions ||
    "Please remit payment via NEFT/RTGS bank transfer or UPI within the due date specified. Reference invoice number in transaction description.";
  const splitInstructions = doc.splitTextToSize(instructionsText, contentWidth - 10);
  doc.text(splitInstructions, margin + 5, y + 11);

  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text("Official Billing Contact: offscript@param20h.me · Website: https://offscript.param20h.me", margin + 5, y + 20);

  // ---------------------------------------------------------------------------
  // 7. FOOTER ACROSS ALL PAGES
  // ---------------------------------------------------------------------------
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `OFFSCRIPT Studio · ${invoice.invoice_number} · Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

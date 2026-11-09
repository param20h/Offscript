import { jsPDF } from "jspdf";
import { formatCurrency } from "./pricing";
import {
  ProposalRecord,
  ProposalItemRecord,
  ProposalDeliverableRecord,
  ProposalMilestoneRecord,
  ClientRecord,
} from "@/lib/db/supabase";

export interface ProposalPDFData {
  proposal: ProposalRecord;
  client: ClientRecord;
  items: ProposalItemRecord[];
  deliverables: ProposalDeliverableRecord[];
  milestones: ProposalMilestoneRecord[];
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
 * Generates an executive, branded OFFSCRIPT Studio project proposal PDF.
 * Uses strict typography, disciplined layout, and high-contrast styling.
 */
export function generateProposalPDF({
  proposal,
  client,
  items,
  deliverables,
  milestones,
}: ProposalPDFData): Buffer {
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
    // Subtle architectural top accent
    doc.setFillColor(23, 23, 23); // Obsidian
    doc.rect(margin, 8, contentWidth, 0.8, "F");

    // Lime accent mark
    doc.setFillColor(214, 255, 53); // Acid Lime
    doc.rect(margin, 8, 12, 0.8, "F");
  };

  drawPageDecorations();

  // ---------------------------------------------------------------------------
  // HEADER SECTION
  // ---------------------------------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(23, 23, 23);
  doc.text("OFFSCRIPT", margin, y + 8);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(110, 110, 110);
  doc.text("STUDIO OPERATIONS · DIGITAL ENGINEERING", margin, y + 13);

  // Proposal Meta (Right aligned)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(23, 23, 23);
  doc.text(proposal.proposal_number, pageWidth - margin, y + 7, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 110);
  const dateStr = new Date(proposal.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  doc.text(`DATE: ${dateStr}`, pageWidth - margin, y + 12, { align: "right" });
  doc.text(`VALID UNTIL: ${proposal.valid_until}`, pageWidth - margin, y + 16, { align: "right" });

  y += 24;

  // Divider
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // ---------------------------------------------------------------------------
  // CLIENT & TITLE CARD
  // ---------------------------------------------------------------------------
  doc.setFillColor(245, 243, 238); // Warm Ivory tinted box
  doc.roundedRect(margin, y, contentWidth, 24, 1.5, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("PREPARED FOR:", margin + 5, y + 6);
  doc.text("PROJECT PROPOSAL:", margin + 95, y + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(23, 23, 23);
  doc.text(client.name, margin + 5, y + 12);
  doc.text(proposal.title, margin + 95, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.text(
    `${client.company_name} · ${client.email}`,
    margin + 5,
    y + 18
  );
  doc.text(
    `CURRENCY: ${proposal.currency} · STATUS: ${proposal.status.toUpperCase()}`,
    margin + 95,
    y + 18
  );

  y += 32;

  // ---------------------------------------------------------------------------
  // EXECUTIVE SUMMARY
  // ---------------------------------------------------------------------------
  if (proposal.executive_summary || proposal.project_overview) {
    checkPageBreak(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(23, 23, 23);
    doc.text("1. Executive Summary & Overview", margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const summaryText =
      proposal.executive_summary || proposal.project_overview || "";
    const splitSummary = doc.splitTextToSize(summaryText, contentWidth);
    doc.text(splitSummary, margin, y);
    y += splitSummary.length * 4.5 + 8;
  }

  // ---------------------------------------------------------------------------
  // PROBLEM & PROPOSED SOLUTION
  // ---------------------------------------------------------------------------
  if (proposal.problem_statement || proposal.proposed_solution) {
    checkPageBreak(35);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(23, 23, 23);
    doc.text("2. Technical Architecture & Approach", margin, y);
    y += 5;

    if (proposal.problem_statement) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(90, 90, 90);
      doc.text("PROBLEM STATEMENT:", margin, y);
      y += 4;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      const splitProblem = doc.splitTextToSize(
        proposal.problem_statement,
        contentWidth
      );
      doc.text(splitProblem, margin, y);
      y += splitProblem.length * 4 + 4;
    }

    if (proposal.proposed_solution) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(90, 90, 90);
      doc.text("PROPOSED SOLUTION:", margin, y);
      y += 4;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      const splitSolution = doc.splitTextToSize(
        proposal.proposed_solution,
        contentWidth
      );
      doc.text(splitSolution, margin, y);
      y += splitSolution.length * 4 + 6;
    }
  }

  // ---------------------------------------------------------------------------
  // DELIVERABLES & ACCEPTANCE CRITERIA
  // ---------------------------------------------------------------------------
  if (deliverables.length > 0) {
    checkPageBreak(25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(23, 23, 23);
    doc.text("3. Key Deliverables & Scope", margin, y);
    y += 6;

    deliverables.forEach((del, idx) => {
      checkPageBreak(16);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(23, 23, 23);
      doc.text(`${idx + 1}. ${del.title}`, margin + 2, y);
      y += 4.5;

      if (del.description) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(70, 70, 70);
        const splitDesc = doc.splitTextToSize(del.description, contentWidth - 6);
        doc.text(splitDesc, margin + 4, y);
        y += splitDesc.length * 3.8 + 2;
      }

      if (del.acceptance_criteria) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(110, 110, 110);
        const splitCrit = doc.splitTextToSize(
          `Criteria: ${del.acceptance_criteria}`,
          contentWidth - 6
        );
        doc.text(splitCrit, margin + 4, y);
        y += splitCrit.length * 3.5 + 2;
      }

      y += 2;
    });
    y += 4;
  }

  // ---------------------------------------------------------------------------
  // ITEMIZED COMMERCIAL BREAKDOWN
  // ---------------------------------------------------------------------------
  checkPageBreak(45);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(23, 23, 23);
  doc.text("4. Commercial Breakdown & Line Items", margin, y);
  y += 6;

  // Table Header
  doc.setFillColor(23, 23, 23);
  doc.rect(margin, y, contentWidth, 7, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("DESCRIPTION", margin + 3, y + 4.8);
  doc.text("QTY", margin + 84, y + 4.8);
  doc.text("RATE", margin + 134, y + 4.8, { align: "right" });
  doc.text("AMOUNT", pageWidth - margin - 3, y + 4.8, { align: "right" });
  y += 7;

  // Items Rows
  items.forEach((item, idx) => {
    checkPageBreak(12);
    doc.setFillColor(idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 244);
    doc.rect(margin, y, contentWidth, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);
    const titleText = item.title.length > 40 ? `${item.title.slice(0, 37)}...` : item.title;
    doc.text(titleText, margin + 3, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(`${item.quantity} ${item.unit}`, margin + 84, y + 5);
    doc.text(formatPdfCurrency(item.unit_price, proposal.currency), margin + 134, y + 5, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(23, 23, 23);
    doc.text(
      formatPdfCurrency(item.total_price, proposal.currency),
      pageWidth - margin - 3,
      y + 5,
      { align: "right" }
    );

    y += 8;
  });

  // Table Totals Card
  checkPageBreak(40);
  y += 3;
  const totalsX = margin + 90;
  const totalsW = contentWidth - 90;

  doc.setFillColor(245, 243, 238);
  doc.roundedRect(totalsX, y, totalsW, 36, 1, 1, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);

  doc.text("Subtotal:", totalsX + 4, y + 6);
  doc.text(formatPdfCurrency(proposal.subtotal, proposal.currency), pageWidth - margin - 4, y + 6, { align: "right" });

  if (proposal.discount_amount > 0) {
    doc.text(`Discount (${proposal.discount_type}):`, totalsX + 4, y + 11);
    doc.text(`-${formatPdfCurrency(proposal.discount_amount, proposal.currency)}`, pageWidth - margin - 4, y + 11, { align: "right" });
  }

  if (proposal.tax_amount && proposal.tax_amount > 0) {
    doc.text(`Tax (${proposal.tax_rate}%):`, totalsX + 4, y + 16);
    doc.text(formatPdfCurrency(proposal.tax_amount, proposal.currency), pageWidth - margin - 4, y + 16, { align: "right" });
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(23, 23, 23);
  doc.text("Total Proposal Amount:", totalsX + 4, y + 24);
  doc.text(formatPdfCurrency(proposal.total_amount, proposal.currency), pageWidth - margin - 4, y + 24, { align: "right" });

  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.text(`Advance Deposit (${proposal.advance_percentage}%):`, totalsX + 4, y + 30);
  doc.text(formatPdfCurrency(proposal.advance_amount, proposal.currency), pageWidth - margin - 4, y + 30, { align: "right" });

  y += 42;

  // ---------------------------------------------------------------------------
  // MILESTONE PAYMENT SCHEDULE
  // ---------------------------------------------------------------------------
  if (milestones.length > 0) {
    checkPageBreak(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(23, 23, 23);
    doc.text("5. Milestone Payment Schedule", margin, y);
    y += 6;

    milestones.forEach((m, idx) => {
      checkPageBreak(10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 30, 30);
      doc.text(`Milestone ${idx + 1}: ${m.title}`, margin + 2, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text(
        `${m.percentage}% · Due: ${m.due_description || "On completion"}`,
        margin + 80,
        y
      );

      doc.setFont("helvetica", "bold");
      doc.setTextColor(23, 23, 23);
      doc.text(
        formatPdfCurrency(m.amount, proposal.currency),
        pageWidth - margin - 2,
        y,
        { align: "right" }
      );

      y += 6;
    });
    y += 4;
  }

  // ---------------------------------------------------------------------------
  // TERMS & SIGNATURE
  // ---------------------------------------------------------------------------
  checkPageBreak(45);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(23, 23, 23);
  doc.text("6. Terms & Acceptance", margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(90, 90, 90);
  const termsText =
    proposal.terms_and_conditions ||
    "1. Invoices are payable upon receipt of agreed milestones. 2. Code repository access and staging environments are provisioned upon advance deposit confirmation. 3. Scope modifications are managed via written change orders. 4. All intellectual property transfers to client upon final milestone settlement.";
  const splitTerms = doc.splitTextToSize(termsText, contentWidth);
  doc.text(splitTerms, margin, y);
  y += splitTerms.length * 3.5 + 8;

  // Signature Block
  checkPageBreak(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);

  doc.text("OFFSCRIPT STUDIO", margin, y);
  doc.text("CLIENT ACCEPTANCE", margin + 100, y);
  y += 12;

  doc.setDrawColor(180, 180, 180);
  doc.line(margin, y, margin + 70, y);
  doc.line(margin + 100, y, margin + 170, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text("Authorized Studio Principal", margin, y);
  doc.text("Authorized Representative & Date", margin + 100, y);

  // ---------------------------------------------------------------------------
  // FOOTER ON ALL PAGES
  // ---------------------------------------------------------------------------
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 140);
    doc.text(
      "OFFSCRIPT Studio · offscript.param20h.me · offscript@param20h.me",
      margin,
      pageHeight - 8
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: "right" }
    );
  }

  return Buffer.from(doc.output("arraybuffer"));
}

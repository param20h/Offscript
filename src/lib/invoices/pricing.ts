/**
 * OFFSCRIPT STUDIO — AUTHORITATIVE INVOICE & PAYMENT PRICING ENGINE
 * Computes all financial amounts in integer minor units (paise/cents) to prevent
 * floating-point drift and guarantee reconciliation.
 */

export interface InvoiceLineItemInput {
  description: string;
  quantity: number;
  unit?: string;
  unit_price: number;
  sort_order?: number;
}

export interface CalculatedInvoicePricing {
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  line_item_totals: number[];
  paise: {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paid: number;
    balance: number;
  };
}

/**
 * Converts a currency amount to integer minor units (paise/cents).
 */
export function toPaise(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100);
}

/**
 * Converts integer minor units (paise/cents) back to standard currency units.
 */
export function fromPaise(paise: number): number {
  return Math.round(paise) / 100;
}

/**
 * Rounds a number to strictly two decimal places avoiding float representation error.
 */
export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Authoritatively calculates invoice commercial totals.
 */
export function calculateInvoicePricing({
  items,
  discount_type = "none",
  discount_value = 0,
  tax_rate = null,
  amount_paid = 0,
}: {
  items: { quantity: number; unit_price: number }[];
  discount_type?: "none" | "percentage" | "fixed";
  discount_value?: number;
  tax_rate?: number | null;
  amount_paid?: number;
}): CalculatedInvoicePricing {
  // 1. Line item calculation in integer paise
  const line_item_paise = items.map((item) => {
    const qty = Math.max(0, Number(item.quantity) || 0);
    const pricePaise = toPaise(Math.max(0, Number(item.unit_price) || 0));
    return Math.round(qty * pricePaise);
  });

  const line_item_totals = line_item_paise.map(fromPaise);

  // 2. Subtotal
  const subtotal_paise = line_item_paise.reduce((sum, val) => sum + val, 0);

  // 3. Discount
  let discount_paise = 0;
  const safeDiscountVal = Math.max(0, Number(discount_value) || 0);

  if (discount_type === "percentage") {
    const clampedPct = Math.min(100, safeDiscountVal);
    discount_paise = Math.round((subtotal_paise * clampedPct) / 100);
  } else if (discount_type === "fixed") {
    discount_paise = Math.min(subtotal_paise, toPaise(safeDiscountVal));
  }

  const discounted_subtotal_paise = Math.max(0, subtotal_paise - discount_paise);

  // 4. Tax (Configurable and optional; never assumed)
  let tax_paise = 0;
  if (tax_rate !== null && tax_rate !== undefined && Number(tax_rate) > 0) {
    const safeTaxRate = Math.max(0, Number(tax_rate));
    tax_paise = Math.round((discounted_subtotal_paise * safeTaxRate) / 100);
  }

  // 5. Total
  const total_paise = discounted_subtotal_paise + tax_paise;

  // 6. Paid and balance
  const paid_paise = toPaise(Math.max(0, Number(amount_paid) || 0));
  const balance_paise = Math.max(0, total_paise - paid_paise);

  return {
    subtotal: fromPaise(subtotal_paise),
    discount_amount: fromPaise(discount_paise),
    tax_amount: fromPaise(tax_paise),
    total_amount: fromPaise(total_paise),
    amount_paid: fromPaise(paid_paise),
    balance_due: fromPaise(balance_paise),
    line_item_totals,
    paise: {
      subtotal: subtotal_paise,
      discount: discount_paise,
      tax: tax_paise,
      total: total_paise,
      paid: paid_paise,
      balance: balance_paise,
    },
  };
}

/**
 * Reconciles payment transactions against an invoice total.
 */
export function calculatePaymentLedger({
  totalAmount,
  payments,
}: {
  totalAmount: number;
  payments: { amount: number; status: "recorded" | "reversed" }[];
}): {
  total_paid: number;
  balance_due: number;
  total_paid_paise: number;
  balance_due_paise: number;
} {
  const total_paise = toPaise(totalAmount);

  const activePayments = payments.filter((p) => p.status === "recorded");
  const paid_paise = activePayments.reduce(
    (sum, p) => sum + toPaise(Number(p.amount) || 0),
    0
  );

  const balance_paise = Math.max(0, total_paise - paid_paise);

  return {
    total_paid: fromPaise(paid_paise),
    balance_due: fromPaise(balance_paise),
    total_paid_paise: paid_paise,
    balance_due_paise: balance_paise,
  };
}

/**
 * Derives an invoice's operational commercial status from its ledger and due date.
 */
export function deriveInvoiceStatus({
  totalAmount,
  totalPaid,
  dueDate,
  currentStatus,
}: {
  totalAmount: number;
  totalPaid: number;
  dueDate: string;
  currentStatus: string;
}): string {
  if (currentStatus === "void" || currentStatus === "cancelled" || currentStatus === "draft") {
    return currentStatus;
  }

  const total_paise = toPaise(totalAmount);
  const paid_paise = toPaise(totalPaid);

  if (paid_paise >= total_paise && total_paise > 0) {
    return "paid";
  }

  // Check if overdue: if past due date and balance remains
  const today = new Date().toISOString().split("T")[0];
  if (dueDate && dueDate < today) {
    return "overdue";
  }

  if (paid_paise > 0) {
    return "partially_paid";
  }

  return "issued";
}

/**
 * Multi-currency formatter matching OFFSCRIPT editorial standards.
 */
export function formatCurrency(amount: number, currency = "INR"): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const curr = currency.toUpperCase();

  try {
    if (curr === "INR") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(safeAmount);
    }

    if (curr === "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(safeAmount);
    }

    if (curr === "EUR") {
      return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(safeAmount);
    }

    if (curr === "GBP") {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(safeAmount);
    }

    return `${curr} ${safeAmount.toFixed(2)}`;
  } catch {
    return `${curr} ${safeAmount.toFixed(2)}`;
  }
}

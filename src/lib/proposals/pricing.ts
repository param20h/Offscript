/**
 * OFFSCRIPT STUDIO — DECIMAL-SAFE PROPOSAL PRICING ENGINE
 * Ensures exact financial calculations, rounding, and milestone reconciliation.
 */

export interface PricingLineItem {
  quantity: number;
  unit_price: number;
}

export interface CalculatedPricing {
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  advance_amount: number;
  remaining_balance: number;
  line_item_totals: number[];
}

/**
 * Rounds a number strictly to two decimal places avoiding standard float drift.
 */
export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates complete proposal commercial totals with decimal precision.
 */
export function calculateProposalPricing({
  items,
  discount_type = "none",
  discount_value = 0,
  tax_rate = null,
  advance_percentage = 50,
}: {
  items: PricingLineItem[];
  discount_type?: "none" | "percentage" | "fixed";
  discount_value?: number;
  tax_rate?: number | null;
  advance_percentage?: number;
}): CalculatedPricing {
  // 1. Line item calculations
  const line_item_totals = items.map((item) => {
    const qty = Math.max(0, Number(item.quantity) || 0);
    const price = Math.max(0, Number(item.unit_price) || 0);
    return round2(qty * price);
  });

  // 2. Subtotal calculation
  const subtotal = round2(line_item_totals.reduce((sum, val) => sum + val, 0));

  // 3. Discount calculation
  let discount_amount = 0;
  const safeDiscountVal = Math.max(0, Number(discount_value) || 0);

  if (discount_type === "percentage") {
    const clampedPct = Math.min(100, safeDiscountVal);
    discount_amount = round2((subtotal * clampedPct) / 100);
  } else if (discount_type === "fixed") {
    discount_amount = round2(Math.min(subtotal, safeDiscountVal));
  }

  const discountedSubtotal = Math.max(0, round2(subtotal - discount_amount));

  // 4. Tax calculation (optional/configurable)
  let tax_amount = 0;
  if (tax_rate !== null && tax_rate !== undefined && Number(tax_rate) > 0) {
    const safeTaxRate = Math.max(0, Number(tax_rate));
    tax_amount = round2((discountedSubtotal * safeTaxRate) / 100);
  }

  // 5. Total amount
  const total_amount = round2(discountedSubtotal + tax_amount);

  // 6. Advance and balance
  const safeAdvancePct = Math.min(100, Math.max(0, Number(advance_percentage) || 0));
  const advance_amount = round2((total_amount * safeAdvancePct) / 100);
  const remaining_balance = Math.max(0, round2(total_amount - advance_amount));

  return {
    subtotal,
    discount_amount,
    tax_amount,
    total_amount,
    advance_amount,
    remaining_balance,
    line_item_totals,
  };
}

/**
 * Reconciles milestone schedule amounts against the final proposal total.
 * Returns true if the sum of milestone amounts equals total_amount within a 0.05 tolerance.
 */
export function validateMilestonesReconciliation(
  milestones: { amount: number }[],
  totalAmount: number
): { reconciled: boolean; difference: number; sum: number } {
  const sum = round2(milestones.reduce((acc, m) => acc + (Number(m.amount) || 0), 0));
  const difference = round2(Math.abs(sum - totalAmount));
  const reconciled = difference <= 0.05;

  return {
    reconciled,
    difference,
    sum,
  };
}

/**
 * Formats a currency value with proper locale formatting and currency symbol.
 * Default is INR (₹).
 */
export function formatCurrency(
  amount: number,
  currency: string = "INR"
): string {
  const safeAmount = round2(Number(amount) || 0);

  if (currency === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(safeAmount);
  }

  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(safeAmount);
  }

  if (currency === "EUR") {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2,
    }).format(safeAmount);
  }

  if (currency === "GBP") {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 2,
    }).format(safeAmount);
  }

  return `${currency} ${safeAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

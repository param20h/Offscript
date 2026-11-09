import { z } from "zod";

export const invoiceTypeEnum = z.enum([
  "advance",
  "milestone",
  "final",
  "custom",
]);

export const invoiceStatusEnum = z.enum([
  "draft",
  "issued",
  "partially_paid",
  "paid",
  "overdue",
  "cancelled",
  "void",
]);

export const paymentMethodEnum = z.enum([
  "bank_transfer",
  "upi",
  "cash",
  "cheque",
  "card",
  "other",
]);

export const paymentStatusEnum = z.enum(["recorded", "reversed"]);

export const currencyEnum = z.enum(["INR", "USD", "EUR", "GBP"]);
export const discountTypeEnum = z.enum(["none", "percentage", "fixed"]);

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  description: z
    .string({ message: "Item description is required." })
    .trim()
    .min(2, "Description must be at least 2 characters.")
    .max(500),
  quantity: z
    .number({ message: "Quantity must be a valid number." })
    .positive("Quantity must be greater than 0")
    .default(1),
  unit: z.string().trim().default("units"),
  unit_price: z
    .number({ message: "Unit price must be a valid number." })
    .min(0, "Unit price cannot be negative."),
  sort_order: z.number().int().default(0),
});

export const invoiceCreateSchema = z.object({
  client_id: z.string().uuid("A valid client must be selected."),
  proposal_id: z.string().uuid().nullish().transform((v) => v || null),
  milestone_id: z.string().uuid().nullish().transform((v) => v || null),
  invoice_type: invoiceTypeEnum.default("custom"),
  currency: currencyEnum.default("INR"),
  issue_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Issue date must be in YYYY-MM-DD format.")
    .default(() => new Date().toISOString().split("T")[0]),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be in YYYY-MM-DD format."),
  discount_type: discountTypeEnum.default("none"),
  discount_value: z.number().min(0).default(0),
  tax_rate: z
    .number()
    .min(0)
    .max(100)
    .nullish()
    .transform((v) => (v !== undefined ? v : null)),
  notes: z.string().trim().nullish().transform((v) => v || null),
  payment_instructions: z.string().trim().nullish().transform((v) => v || null),
  items: z
    .array(invoiceItemSchema)
    .min(1, "At least one invoice line item is required."),
});

export const invoiceUpdateSchema = invoiceCreateSchema.partial();

export const paymentCreateSchema = z.object({
  amount: z
    .number({ message: "Payment amount must be a number." })
    .positive("Payment amount must be greater than 0."),
  currency: currencyEnum.default("INR"),
  payment_method: paymentMethodEnum.default("bank_transfer"),
  transaction_reference: z
    .string()
    .trim()
    .nullish()
    .transform((v) => v || null),
  payment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Payment date must be in YYYY-MM-DD format.")
    .default(() => new Date().toISOString().split("T")[0]),
  notes: z.string().trim().nullish().transform((v) => v || null),
});

export const paymentReverseSchema = z.object({
  reversal_reason: z
    .string({ message: "Reversal reason is required." })
    .trim()
    .min(3, "Reversal reason must be at least 3 characters.")
    .max(500),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>;
export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;

import { z } from "zod";

export const PROJECT_TYPES = [
  "Web Development",
  "AI & Intelligent Systems",
  "Backend & Cloud Engineering",
  "Creative Development",
  "Automation & Integrations",
  "Product Engineering",
] as const;

export const CURRENCIES = ["USD", "INR"] as const;

export const USD_BUDGETS = [
  "Under $10k",
  "$10k–$25k",
  "$25k–$50k",
  "$50k+",
  "To Be Scoped",
] as const;

export const INR_BUDGETS = [
  "Under ₹8L",
  "₹8L–₹20L",
  "₹20L–₹40L",
  "₹40L+",
  "To Be Scoped",
] as const;

export const ALL_BUDGETS = [
  "Under $10k",
  "$10k–$25k",
  "$25k–$50k",
  "$50k+",
  "Under ₹8L",
  "₹8L–₹20L",
  "₹20L–₹40L",
  "₹40L+",
  "To Be Scoped",
] as const;

export const TIMELINES = [
  "2 to 4 Weeks",
  "4 to 8 Weeks",
  "8 to 12 Weeks",
  "Ongoing / Retainer",
] as const;

/**
 * Strict server-side inquiry validation schema.
 * Rejects empty/malformed inputs, enforces bounds, and validates against verified options.
 */
export const inquirySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "A valid name (at least 2 characters) is required.")
      .max(100, "Name must not exceed 100 characters."),

    email: z
      .string()
      .trim()
      .email("A valid contact email address is required.")
      .max(120, "Email address must not exceed 120 characters."),

    company: z
      .string()
      .trim()
      .max(120, "Company name must not exceed 120 characters.")
      .optional()
      .transform((val) => (val && val.length > 0 ? val : "Independent")),

    projectType: z.enum(PROJECT_TYPES, {
      message: "Please select a recognized project discipline.",
    }),

    currency: z.enum(CURRENCIES, {
      message: "Currency must be either USD ($) or INR (₹).",
    }),

    budgetRange: z.enum(ALL_BUDGETS, {
      message: "Please select an approved budget framework option.",
    }),

    timeline: z.enum(TIMELINES, {
      message: "Please select an approved target timeline option.",
    }),

    description: z
      .string()
      .trim()
      .min(10, "Please provide a project brief with at least 10 characters.")
      .max(3000, "Project brief must not exceed 3,000 characters."),

    // Honeypot field (must remain empty for human submissions)
    company_website_hp: z.string().max(200).optional(),

    // Client submission elapsed duration in milliseconds
    durationMs: z
      .number()
      .int("Submission duration must be an integer.")
      .min(0, "Submission duration cannot be negative.")
      .max(86400000, "Submission duration exceeds 24 hours.")
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Validate currency and budget alignment
    if (data.currency === "USD") {
      const isUsdBudget = (USD_BUDGETS as readonly string[]).includes(data.budgetRange);
      if (!isUsdBudget) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `The selected budget '${data.budgetRange}' does not match USD currency.`,
          path: ["budgetRange"],
        });
      }
    } else if (data.currency === "INR") {
      const isInrBudget = (INR_BUDGETS as readonly string[]).includes(data.budgetRange);
      if (!isInrBudget) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `The selected budget '${data.budgetRange}' does not match INR currency.`,
          path: ["budgetRange"],
        });
      }
    }
  });

export type InquiryInput = z.infer<typeof inquirySchema>;
export type InquiryPayload = InquiryInput;

/**
 * Checks whether the hidden honeypot trap was filled by an automated bot.
 */
export function isHoneypotTriggered(payload: { company_website_hp?: string | null }): boolean {
  return Boolean(payload.company_website_hp && payload.company_website_hp.trim().length > 0);
}

/**
 * Assesses whether the form submission occurred suspiciously fast (< 3000ms).
 */
export function isSubmissionTooFast(durationMs?: number): boolean {
  if (typeof durationMs !== "number") return false;
  return durationMs < 3000;
}

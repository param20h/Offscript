import { z } from "zod";

export const PROJECT_TYPES = [
  "Web Development",
  "AI & Intelligent Systems",
  "Backend & Cloud Engineering",
  "Creative Development",
  "Automation & Integrations",
  "Product Engineering",
] as const;

export const PACKAGE_OPTIONS = [
  "Launch",
  "Scale",
  "Intelligence",
  "Custom Engineering",
  "Custom / Discovery",
] as const;

export type PackageOption = (typeof PACKAGE_OPTIONS)[number];

export const CURRENCIES = ["USD", "INR"] as const;

export const TIMELINES = [
  "2 to 4 Weeks",
  "4 to 8 Weeks",
  "8 to 12 Weeks",
  "Ongoing / Retainer",
] as const;

/**
 * Strict server-side inquiry validation schema.
 * Validates against verified project disciplines, packages, and delivery bounds.
 */
export const inquirySchema = z.object({
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

  packageModel: z.string().optional().default("Launch"),

  currency: z.enum(CURRENCIES).optional().default("USD"),

  budgetRange: z.string().optional(),

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

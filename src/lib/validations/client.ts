import { z } from "zod";

export const clientStatusEnum = z.enum([
  "lead",
  "prospect",
  "active",
  "inactive",
  "archived",
]);

export const clientTypeEnum = z.enum([
  "individual",
  "startup",
  "small_business",
  "enterprise",
  "agency",
  "other",
]);

export const clientSchema = z.object({
  name: z
    .string({ message: "Client name is required." })
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(255, "Name must not exceed 255 characters."),
  company_name: z
    .string()
    .trim()
    .max(255, "Company name must not exceed 255 characters.")
    .default("Independent"),
  email: z
    .string({ message: "Valid email is required." })
    .trim()
    .toLowerCase()
    .email("Invalid email format."),
  phone: z
    .string()
    .trim()
    .max(50, "Phone number must not exceed 50 characters.")
    .nullish()
    .transform((val) => val || null),
  website: z
    .string()
    .trim()
    .max(255, "Website URL must not exceed 255 characters.")
    .nullish()
    .transform((val) => val || null),
  industry: z
    .string()
    .trim()
    .max(100, "Industry must not exceed 100 characters.")
    .nullish()
    .transform((val) => val || null),
  company_size: z
    .string()
    .trim()
    .max(50, "Company size must not exceed 50 characters.")
    .nullish()
    .transform((val) => val || null),
  address: z
    .string()
    .trim()
    .nullish()
    .transform((val) => val || null),
  client_type: clientTypeEnum.default("startup"),
  source: z.string().trim().max(100).default("direct"),
  status: clientStatusEnum.default("lead"),
  notes: z
    .string()
    .trim()
    .nullish()
    .transform((val) => val || null),
});

export const clientUpdateSchema = clientSchema.partial();

export const clientNoteSchema = z.object({
  content: z
    .string({ message: "Note content is required." })
    .trim()
    .min(1, "Note content cannot be empty.")
    .max(5000, "Note must not exceed 5000 characters."),
  author: z.string().trim().max(255).optional(),
});

export const convertInquirySchema = z.object({
  name: z.string().trim().min(2),
  company_name: z.string().trim().default("Independent"),
  email: z.string().trim().email(),
  phone: z.string().trim().nullish(),
  website: z.string().trim().nullish(),
  industry: z.string().trim().nullish(),
  client_type: clientTypeEnum.default("startup"),
  status: clientStatusEnum.default("lead"),
  initial_note: z.string().trim().optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;
export type ClientNoteInput = z.infer<typeof clientNoteSchema>;
export type ConvertInquiryInput = z.infer<typeof convertInquirySchema>;

import { z } from "zod";

export const proposalStatusEnum = z.enum([
  "draft",
  "ready",
  "sent",
  "viewed",
  "accepted",
  "rejected",
  "expired",
  "withdrawn",
]);

export const currencyEnum = z.enum(["INR", "USD", "EUR", "GBP"]);
export const discountTypeEnum = z.enum(["none", "percentage", "fixed"]);

export const proposalItemSchema = z.object({
  id: z.string().optional(),
  title: z
    .string({ message: "Item title is required." })
    .trim()
    .min(2, "Title must be at least 2 characters.")
    .max(255),
  description: z.string().trim().nullish().transform((v) => v || null),
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

export const proposalDeliverableSchema = z.object({
  id: z.string().optional(),
  title: z
    .string({ message: "Deliverable title is required." })
    .trim()
    .min(2, "Title must be at least 2 characters.")
    .max(255),
  description: z.string().trim().nullish().transform((v) => v || null),
  acceptance_criteria: z.string().trim().nullish().transform((v) => v || null),
  sort_order: z.number().int().default(0),
});

export const proposalMilestoneSchema = z.object({
  id: z.string().optional(),
  title: z
    .string({ message: "Milestone title is required." })
    .trim()
    .min(2, "Title must be at least 2 characters.")
    .max(255),
  description: z.string().trim().nullish().transform((v) => v || null),
  amount: z
    .number({ message: "Milestone amount must be a number." })
    .min(0, "Amount cannot be negative."),
  percentage: z
    .number({ message: "Milestone percentage must be a number." })
    .min(0)
    .max(100)
    .default(0),
  due_description: z.string().trim().nullish().transform((v) => v || null),
  sort_order: z.number().int().default(0),
});

export const proposalCreateSchema = z.object({
  client_id: z.string().uuid("A valid client must be selected."),
  inquiry_id: z.string().uuid().nullish().transform((v) => v || null),
  title: z
    .string({ message: "Proposal title is required." })
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(255),
  project_overview: z.string().trim().nullish().transform((v) => v || null),
  executive_summary: z.string().trim().nullish().transform((v) => v || null),
  problem_statement: z.string().trim().nullish().transform((v) => v || null),
  proposed_solution: z.string().trim().nullish().transform((v) => v || null),
  scope_of_work: z.string().trim().nullish().transform((v) => v || null),
  assumptions: z.string().trim().nullish().transform((v) => v || null),
  exclusions: z.string().trim().nullish().transform((v) => v || null),
  terms_and_conditions: z.string().trim().nullish().transform((v) => v || null),
  currency: currencyEnum.default("INR"),
  discount_type: discountTypeEnum.default("none"),
  discount_value: z.number().min(0).default(0),
  tax_rate: z.number().min(0).max(100).nullish().transform((v) => (v !== undefined ? v : null)),
  advance_percentage: z.number().min(0).max(100).default(50),
  valid_until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Valid until date must be in YYYY-MM-DD format."),
  items: z
    .array(proposalItemSchema)
    .min(1, "At least one proposal line item is required."),
  deliverables: z.array(proposalDeliverableSchema).default([]),
  milestones: z.array(proposalMilestoneSchema).default([]),
});

export const proposalUpdateSchema = proposalCreateSchema.partial();

export type ProposalItemInput = z.infer<typeof proposalItemSchema>;
export type ProposalDeliverableInput = z.infer<typeof proposalDeliverableSchema>;
export type ProposalMilestoneInput = z.infer<typeof proposalMilestoneSchema>;
export type ProposalCreateInput = z.infer<typeof proposalCreateSchema>;
export type ProposalUpdateInput = z.infer<typeof proposalUpdateSchema>;

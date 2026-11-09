import { z } from "zod";

export const projectStatusEnum = z.enum([
  "planning",
  "scheduled",
  "in_progress",
  "on_hold",
  "review",
  "completed",
  "cancelled",
]);

export const projectPriorityEnum = z.enum([
  "low",
  "medium",
  "high",
  "urgent",
]);

export const taskStatusEnum = z.enum([
  "todo",
  "in_progress",
  "blocked",
  "review",
  "completed",
  "cancelled",
]);

export const updateVisibilityEnum = z.enum([
  "internal",
  "client",
]);

export const currencyEnum = z.enum(["INR", "USD", "EUR", "GBP"]);

export const milestoneCreateSchema = z.object({
  id: z.string().optional(),
  title: z
    .string({ message: "Milestone title is required." })
    .trim()
    .min(2, "Title must be at least 2 characters.")
    .max(255),
  description: z.string().trim().nullish().transform((v) => v || null),
  status: z.enum(["pending", "in_progress", "completed", "blocked"]).default("pending"),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullish()
    .transform((v) => v || null),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullish()
    .transform((v) => v || null),
  progress_percentage: z.number().int().min(0).max(100).default(0),
  sort_order: z.number().int().default(0),
  client_visible: z.boolean().default(true),
});

export const projectCreateSchema = z.object({
  client_id: z.string().uuid("A valid client must be selected."),
  proposal_id: z.string().uuid().nullish().transform((v) => v || null),
  title: z
    .string({ message: "Project title is required." })
    .trim()
    .min(2, "Title must be at least 2 characters.")
    .max(255),
  description: z.string().trim().nullish().transform((v) => v || null),
  project_type: z.string().trim().default("custom"),
  status: projectStatusEnum.default("planning"),
  priority: projectPriorityEnum.default("medium"),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format.")
    .nullish()
    .transform((v) => v || null),
  estimated_completion_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Target completion date must be in YYYY-MM-DD format.")
    .nullish()
    .transform((v) => v || null),
  total_budget: z.number().min(0).default(0),
  currency: currencyEnum.default("INR"),
  internal_notes: z.string().trim().nullish().transform((v) => v || null),
  client_visible_summary: z.string().trim().nullish().transform((v) => v || null),
  milestones: z.array(milestoneCreateSchema).default([]),
});

export const projectUpdateSchema = projectCreateSchema.partial();

export const taskCreateSchema = z.object({
  milestone_id: z.string().uuid().nullish().transform((v) => v || null),
  title: z
    .string({ message: "Task title is required." })
    .trim()
    .min(2, "Title must be at least 2 characters.")
    .max(255),
  description: z.string().trim().nullish().transform((v) => v || null),
  status: taskStatusEnum.default("todo"),
  priority: projectPriorityEnum.default("medium"),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullish()
    .transform((v) => v || null),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullish()
    .transform((v) => v || null),
  assigned_to: z.string().trim().nullish().transform((v) => v || null),
  client_visible: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

export const projectUpdatePostSchema = z.object({
  milestone_id: z.string().uuid().nullish().transform((v) => v || null),
  title: z
    .string({ message: "Update title is required." })
    .trim()
    .min(2, "Title must be at least 2 characters.")
    .max(255),
  content: z
    .string({ message: "Content is required." })
    .trim()
    .min(5, "Content must be at least 5 characters."),
  update_type: z.string().trim().default("general"),
  visibility: updateVisibilityEnum.default("internal"),
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type MilestoneCreateInput = z.infer<typeof milestoneCreateSchema>;
export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type ProjectUpdatePostInput = z.infer<typeof projectUpdatePostSchema>;

import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type InquiryDeliveryStatus = "pending" | "delivered" | "failed" | "unconfigured";

export type InquiryBusinessStatus =
  | "new"
  | "reviewing"
  | "qualified"
  | "proposal_in_progress"
  | "proposal_sent"
  | "accepted"
  | "rejected"
  | "converted"
  | "archived";

export type InquiryRecord = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  company: string;
  project_type: string;
  currency: "USD" | "INR";
  budget_range: string;
  timeline: string;
  description: string;
  delivery_status: InquiryDeliveryStatus;
  delivery_attempts: number;
  last_delivery_error: string | null;
  business_status?: InquiryBusinessStatus;
  converted_client_id?: string | null;
  metadata: Record<string, unknown>;
};

export type InquiryInsert = {
  id?: string;
  created_at?: string;
  updated_at?: string;
  name: string;
  email: string;
  company?: string;
  project_type: string;
  currency: "USD" | "INR";
  budget_range: string;
  timeline: string;
  description: string;
  delivery_status?: InquiryDeliveryStatus;
  delivery_attempts?: number;
  last_delivery_error?: string | null;
  business_status?: InquiryBusinessStatus;
  converted_client_id?: string | null;
  metadata?: Record<string, unknown>;
};

export type InquiryUpdate = {
  name?: string;
  email?: string;
  company?: string;
  project_type?: string;
  currency?: "USD" | "INR";
  budget_range?: string;
  timeline?: string;
  description?: string;
  delivery_status?: InquiryDeliveryStatus;
  delivery_attempts?: number;
  last_delivery_error?: string | null;
  business_status?: InquiryBusinessStatus;
  converted_client_id?: string | null;
  metadata?: Record<string, unknown>;
  updated_at?: string;
};

export type InquiryNoteRecord = {
  id: string;
  created_at: string;
  inquiry_id: string;
  author: string;
  content: string;
};

export type InquiryNoteInsert = {
  id?: string;
  created_at?: string;
  inquiry_id: string;
  author?: string;
  content: string;
};

export type InquiryNoteUpdate = {
  content?: string;
  author?: string;
};

export type ClientStatus = "lead" | "prospect" | "active" | "inactive" | "archived";

export type ClientType =
  | "individual"
  | "startup"
  | "small_business"
  | "enterprise"
  | "agency"
  | "other";

export type ClientRecord = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  company_name: string;
  email: string;
  phone: string | null;
  website: string | null;
  industry: string | null;
  company_size: string | null;
  address: string | null;
  client_type: ClientType;
  source: string;
  status: ClientStatus;
  notes: string | null;
  created_by: string;
  metadata: Record<string, unknown>;
};

export type ClientInsert = {
  id?: string;
  created_at?: string;
  updated_at?: string;
  name: string;
  company_name?: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  industry?: string | null;
  company_size?: string | null;
  address?: string | null;
  client_type?: ClientType;
  source?: string;
  status?: ClientStatus;
  notes?: string | null;
  created_by?: string;
  metadata?: Record<string, unknown>;
};

export type ClientUpdate = {
  name?: string;
  company_name?: string;
  email?: string;
  phone?: string | null;
  website?: string | null;
  industry?: string | null;
  company_size?: string | null;
  address?: string | null;
  client_type?: ClientType;
  source?: string;
  status?: ClientStatus;
  notes?: string | null;
  created_by?: string;
  metadata?: Record<string, unknown>;
  updated_at?: string;
};

export type ClientNoteRecord = {
  id: string;
  created_at: string;
  client_id: string;
  author: string;
  content: string;
};

export type ClientNoteInsert = {
  id?: string;
  created_at?: string;
  client_id: string;
  author?: string;
  content: string;
};

export type ClientNoteUpdate = {
  content?: string;
  author?: string;
};

export type ProposalStatus =
  | "draft"
  | "ready"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "expired"
  | "withdrawn";

export type ProposalRecord = {
  id: string;
  proposal_number: string;
  client_id: string;
  inquiry_id: string | null;
  title: string;
  project_overview: string | null;
  executive_summary: string | null;
  problem_statement: string | null;
  proposed_solution: string | null;
  scope_of_work: string | null;
  assumptions: string | null;
  exclusions: string | null;
  terms_and_conditions: string | null;
  currency: string;
  subtotal: number;
  discount_type: "none" | "percentage" | "fixed";
  discount_value: number;
  discount_amount: number;
  tax_rate: number | null;
  tax_amount: number | null;
  total_amount: number;
  advance_percentage: number;
  advance_amount: number;
  remaining_balance: number;
  status: ProposalStatus;
  valid_until: string;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  created_by: string;
  snapshot: Record<string, unknown> | null;
  delivery_status: string;
  last_delivery_error: string | null;
  metadata: Record<string, unknown>;
};

export type ProposalInsert = {
  id?: string;
  proposal_number: string;
  client_id: string;
  inquiry_id?: string | null;
  title: string;
  project_overview?: string | null;
  executive_summary?: string | null;
  problem_statement?: string | null;
  proposed_solution?: string | null;
  scope_of_work?: string | null;
  assumptions?: string | null;
  exclusions?: string | null;
  terms_and_conditions?: string | null;
  currency?: string;
  subtotal?: number;
  discount_type?: "none" | "percentage" | "fixed";
  discount_value?: number;
  discount_amount?: number;
  tax_rate?: number | null;
  tax_amount?: number | null;
  total_amount?: number;
  advance_percentage?: number;
  advance_amount?: number;
  remaining_balance?: number;
  status?: ProposalStatus;
  valid_until: string;
  created_at?: string;
  updated_at?: string;
  sent_at?: string | null;
  accepted_at?: string | null;
  rejected_at?: string | null;
  created_by?: string;
  snapshot?: Record<string, unknown> | null;
  delivery_status?: string;
  last_delivery_error?: string | null;
  metadata?: Record<string, unknown>;
};

export type ProposalUpdate = {
  title?: string;
  project_overview?: string | null;
  executive_summary?: string | null;
  problem_statement?: string | null;
  proposed_solution?: string | null;
  scope_of_work?: string | null;
  assumptions?: string | null;
  exclusions?: string | null;
  terms_and_conditions?: string | null;
  currency?: string;
  subtotal?: number;
  discount_type?: "none" | "percentage" | "fixed";
  discount_value?: number;
  discount_amount?: number;
  tax_rate?: number | null;
  tax_amount?: number | null;
  total_amount?: number;
  advance_percentage?: number;
  advance_amount?: number;
  remaining_balance?: number;
  status?: ProposalStatus;
  valid_until?: string;
  sent_at?: string | null;
  accepted_at?: string | null;
  rejected_at?: string | null;
  snapshot?: Record<string, unknown> | null;
  delivery_status?: string;
  last_delivery_error?: string | null;
  metadata?: Record<string, unknown>;
  updated_at?: string;
};

export type ProposalItemRecord = {
  id: string;
  proposal_id: string;
  title: string;
  description: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  sort_order: number;
};

export type ProposalItemInsert = {
  id?: string;
  proposal_id: string;
  title: string;
  description?: string | null;
  quantity?: number;
  unit?: string;
  unit_price: number;
  total_price: number;
  sort_order?: number;
};

export type ProposalDeliverableRecord = {
  id: string;
  proposal_id: string;
  title: string;
  description: string | null;
  acceptance_criteria: string | null;
  sort_order: number;
};

export type ProposalDeliverableInsert = {
  id?: string;
  proposal_id: string;
  title: string;
  description?: string | null;
  acceptance_criteria?: string | null;
  sort_order?: number;
};

export type ProposalMilestoneRecord = {
  id: string;
  proposal_id: string;
  title: string;
  description: string | null;
  amount: number;
  percentage: number;
  due_description: string | null;
  sort_order: number;
};

export type ProposalMilestoneInsert = {
  id?: string;
  proposal_id: string;
  title: string;
  description?: string | null;
  amount: number;
  percentage: number;
  due_description?: string | null;
  sort_order?: number;
};

export type ProposalActivityRecord = {
  id: string;
  proposal_id: string;
  event_type: string;
  actor: string;
  description: string;
  created_at: string;
  metadata: Record<string, unknown>;
};

export type ProposalActivityInsert = {
  id?: string;
  proposal_id: string;
  event_type: string;
  actor?: string;
  description: string;
  created_at?: string;
  metadata?: Record<string, unknown>;
};

export type ProposalAccessTokenRecord = {
  id: string;
  proposal_id: string;
  token_hash: string;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  last_accessed_at: string | null;
  access_count: number;
  created_by: string | null;
};

export type ProposalAccessTokenInsert = {
  id?: string;
  proposal_id: string;
  token_hash: string;
  created_at?: string;
  expires_at: string;
  revoked_at?: string | null;
  last_accessed_at?: string | null;
  access_count?: number;
  created_by?: string | null;
};

export type InvoiceType = "advance" | "milestone" | "final" | "custom";

export type InvoiceStatus =
  | "draft"
  | "issued"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled"
  | "void";

export type PaymentMethod =
  | "bank_transfer"
  | "upi"
  | "cash"
  | "cheque"
  | "card"
  | "other";

export type PaymentStatus = "recorded" | "reversed";

export type InvoiceDeliveryStatus =
  | "draft"
  | "queued"
  | "accepted_by_provider"
  | "delivered"
  | "bounced"
  | "failed";

export type InvoiceRecord = {
  id: string;
  invoice_number: string;
  client_id: string;
  proposal_id: string | null;
  milestone_id: string | null;
  project_id: string | null;
  invoice_type: InvoiceType;
  status: InvoiceStatus;
  currency: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  discount_type: "none" | "percentage" | "fixed";
  discount_value: number;
  discount_amount: number;
  tax_rate: number | null;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  notes: string | null;
  payment_instructions: string | null;
  snapshot: Record<string, unknown> | null;
  delivery_status: InvoiceDeliveryStatus;
  resend_id: string | null;
  sent_at: string | null;
  issued_at: string | null;
  paid_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type InvoiceInsert = {
  id?: string;
  invoice_number: string;
  client_id: string;
  proposal_id?: string | null;
  milestone_id?: string | null;
  project_id?: string | null;
  invoice_type?: InvoiceType;
  status?: InvoiceStatus;
  currency?: string;
  issue_date?: string;
  due_date: string;
  subtotal?: number;
  discount_type?: "none" | "percentage" | "fixed";
  discount_value?: number;
  discount_amount?: number;
  tax_rate?: number | null;
  tax_amount?: number;
  total_amount?: number;
  amount_paid?: number;
  balance_due?: number;
  notes?: string | null;
  payment_instructions?: string | null;
  snapshot?: Record<string, unknown> | null;
  delivery_status?: InvoiceDeliveryStatus;
  resend_id?: string | null;
  sent_at?: string | null;
  issued_at?: string | null;
  paid_at?: string | null;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
};

export type InvoiceUpdate = Partial<InvoiceInsert>;

export type InvoiceItemRecord = {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  sort_order: number;
  created_at: string;
};

export type InvoiceItemInsert = {
  id?: string;
  invoice_id: string;
  description: string;
  quantity?: number;
  unit?: string;
  unit_price: number;
  total_price: number;
  sort_order?: number;
  created_at?: string;
};

export type PaymentRecord = {
  id: string;
  invoice_id: string;
  client_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  transaction_reference: string | null;
  payment_date: string;
  status: PaymentStatus;
  reversal_reason: string | null;
  reversed_at: string | null;
  reversed_by: string | null;
  notes: string | null;
  recorded_by: string;
  created_at: string;
};

export type PaymentInsert = {
  id?: string;
  invoice_id: string;
  client_id: string;
  amount: number;
  currency?: string;
  payment_method?: PaymentMethod;
  transaction_reference?: string | null;
  payment_date?: string;
  status?: PaymentStatus;
  reversal_reason?: string | null;
  reversed_at?: string | null;
  reversed_by?: string | null;
  notes?: string | null;
  recorded_by?: string;
  created_at?: string;
};

export type InvoiceActivityRecord = {
  id: string;
  invoice_id: string;
  event_type: string;
  actor: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type InvoiceActivityInsert = {
  id?: string;
  invoice_id: string;
  event_type: string;
  actor?: string;
  description: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
};

// -----------------------------------------------------------------------------
// PHASE 3F: PROJECT MANAGEMENT & DELIVERY TRACKING
// -----------------------------------------------------------------------------
export type ProjectStatus =
  | "planning"
  | "scheduled"
  | "in_progress"
  | "on_hold"
  | "review"
  | "completed"
  | "cancelled";

export type ProjectPriority = "low" | "medium" | "high" | "urgent";

export type TaskStatus =
  | "todo"
  | "in_progress"
  | "blocked"
  | "review"
  | "completed"
  | "cancelled";

export type UpdateVisibility = "internal" | "client";

export type ProjectRecord = {
  id: string;
  project_number: string;
  client_id: string;
  proposal_id: string | null;
  title: string;
  description: string | null;
  project_type: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date: string | null;
  estimated_completion_date: string | null;
  actual_completion_date: string | null;
  progress_percentage: number;
  total_budget: number;
  currency: string;
  internal_notes: string | null;
  client_visible_summary: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export type ProjectInsert = {
  id?: string;
  project_number: string;
  client_id: string;
  proposal_id?: string | null;
  title: string;
  description?: string | null;
  project_type?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  start_date?: string | null;
  estimated_completion_date?: string | null;
  actual_completion_date?: string | null;
  progress_percentage?: number;
  total_budget?: number;
  currency?: string;
  internal_notes?: string | null;
  client_visible_summary?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
};

export type ProjectUpdate = Partial<ProjectInsert>;

export type ProjectMilestoneRecord = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  progress_percentage: number;
  sort_order: number;
  client_visible: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectMilestoneInsert = {
  id?: string;
  project_id: string;
  title: string;
  description?: string | null;
  status?: string;
  start_date?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  progress_percentage?: number;
  sort_order?: number;
  client_visible?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ProjectTaskRecord = {
  id: string;
  project_id: string;
  milestone_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: ProjectPriority;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  assigned_to: string | null;
  client_visible: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProjectTaskInsert = {
  id?: string;
  project_id: string;
  milestone_id?: string | null;
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: ProjectPriority;
  start_date?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  assigned_to?: string | null;
  client_visible?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};

export type ProjectUpdateRecord = {
  id: string;
  project_id: string;
  milestone_id: string | null;
  title: string;
  content: string;
  update_type: string;
  visibility: UpdateVisibility;
  created_at: string;
  created_by: string | null;
};

export type ProjectUpdateInsert = {
  id?: string;
  project_id: string;
  milestone_id?: string | null;
  title: string;
  content: string;
  update_type?: string;
  visibility?: UpdateVisibility;
  created_at?: string;
  created_by?: string | null;
};

export type ProjectActivityRecord = {
  id: string;
  project_id: string;
  event_type: string;
  actor: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type ProjectActivityInsert = {
  id?: string;
  project_id: string;
  event_type: string;
  actor?: string;
  description: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
};

export type ClientPortalTokenRecord = {
  id: string;
  client_id: string;
  token_hash: string;
  created_at: string;
  expires_at: string;
  last_accessed_at: string | null;
  access_count: number;
  revoked_at: string | null;
  created_by: string;
};

export type ClientPortalTokenInsert = {
  id?: string;
  client_id: string;
  token_hash: string;
  created_at?: string;
  expires_at: string;
  last_accessed_at?: string | null;
  access_count?: number;
  revoked_at?: string | null;
  created_by?: string;
};

export type Database = {
  public: {
    Tables: {
      inquiries: {
        Row: InquiryRecord;
        Insert: InquiryInsert;
        Update: InquiryUpdate;
        Relationships: [];
      };
      inquiry_notes: {
        Row: InquiryNoteRecord;
        Insert: InquiryNoteInsert;
        Update: InquiryNoteUpdate;
        Relationships: [
          {
            foreignKeyName: "inquiry_notes_inquiry_id_fkey";
            columns: ["inquiry_id"];
            referencedRelation: "inquiries";
            referencedColumns: ["id"];
          }
        ];
      };
      clients: {
        Row: ClientRecord;
        Insert: ClientInsert;
        Update: ClientUpdate;
        Relationships: [];
      };
      client_notes: {
        Row: ClientNoteRecord;
        Insert: ClientNoteInsert;
        Update: ClientNoteUpdate;
        Relationships: [
          {
            foreignKeyName: "client_notes_client_id_fkey";
            columns: ["client_id"];
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      proposals: {
        Row: ProposalRecord;
        Insert: ProposalInsert;
        Update: ProposalUpdate;
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey";
            columns: ["client_id"];
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      proposal_items: {
        Row: ProposalItemRecord;
        Insert: ProposalItemInsert;
        Update: Partial<ProposalItemInsert>;
        Relationships: [
          {
            foreignKeyName: "proposal_items_proposal_id_fkey";
            columns: ["proposal_id"];
            referencedRelation: "proposals";
            referencedColumns: ["id"];
          }
        ];
      };
      proposal_deliverables: {
        Row: ProposalDeliverableRecord;
        Insert: ProposalDeliverableInsert;
        Update: Partial<ProposalDeliverableInsert>;
        Relationships: [
          {
            foreignKeyName: "proposal_deliverables_proposal_id_fkey";
            columns: ["proposal_id"];
            referencedRelation: "proposals";
            referencedColumns: ["id"];
          }
        ];
      };
      proposal_milestones: {
        Row: ProposalMilestoneRecord;
        Insert: ProposalMilestoneInsert;
        Update: Partial<ProposalMilestoneInsert>;
        Relationships: [
          {
            foreignKeyName: "proposal_milestones_proposal_id_fkey";
            columns: ["proposal_id"];
            referencedRelation: "proposals";
            referencedColumns: ["id"];
          }
        ];
      };
      proposal_activity: {
        Row: ProposalActivityRecord;
        Insert: ProposalActivityInsert;
        Update: Partial<ProposalActivityInsert>;
        Relationships: [
          {
            foreignKeyName: "proposal_activity_proposal_id_fkey";
            columns: ["proposal_id"];
            referencedRelation: "proposals";
            referencedColumns: ["id"];
          }
        ];
      };
      proposal_access_tokens: {
        Row: ProposalAccessTokenRecord;
        Insert: ProposalAccessTokenInsert;
        Update: Partial<ProposalAccessTokenInsert>;
        Relationships: [
          {
            foreignKeyName: "proposal_access_tokens_proposal_id_fkey";
            columns: ["proposal_id"];
            referencedRelation: "proposals";
            referencedColumns: ["id"];
          }
        ];
      };
      invoices: {
        Row: InvoiceRecord;
        Insert: InvoiceInsert;
        Update: InvoiceUpdate;
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey";
            columns: ["client_id"];
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_proposal_id_fkey";
            columns: ["proposal_id"];
            referencedRelation: "proposals";
            referencedColumns: ["id"];
          }
        ];
      };
      invoice_items: {
        Row: InvoiceItemRecord;
        Insert: InvoiceItemInsert;
        Update: Partial<InvoiceItemInsert>;
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey";
            columns: ["invoice_id"];
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          }
        ];
      };
      payments: {
        Row: PaymentRecord;
        Insert: PaymentInsert;
        Update: Partial<PaymentInsert>;
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey";
            columns: ["invoice_id"];
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_client_id_fkey";
            columns: ["client_id"];
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      invoice_activity: {
        Row: InvoiceActivityRecord;
        Insert: InvoiceActivityInsert;
        Update: Partial<InvoiceActivityInsert>;
        Relationships: [
          {
            foreignKeyName: "invoice_activity_invoice_id_fkey";
            columns: ["invoice_id"];
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          }
        ];
      };
      projects: {
        Row: ProjectRecord;
        Insert: ProjectInsert;
        Update: ProjectUpdate;
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey";
            columns: ["client_id"];
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_proposal_id_fkey";
            columns: ["proposal_id"];
            referencedRelation: "proposals";
            referencedColumns: ["id"];
          }
        ];
      };
      project_milestones: {
        Row: ProjectMilestoneRecord;
        Insert: ProjectMilestoneInsert;
        Update: Partial<ProjectMilestoneInsert>;
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      project_tasks: {
        Row: ProjectTaskRecord;
        Insert: ProjectTaskInsert;
        Update: Partial<ProjectTaskInsert>;
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_tasks_milestone_id_fkey";
            columns: ["milestone_id"];
            referencedRelation: "project_milestones";
            referencedColumns: ["id"];
          }
        ];
      };
      project_updates: {
        Row: ProjectUpdateRecord;
        Insert: ProjectUpdateInsert;
        Update: Partial<ProjectUpdateInsert>;
        Relationships: [
          {
            foreignKeyName: "project_updates_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      project_activity: {
        Row: ProjectActivityRecord;
        Insert: ProjectActivityInsert;
        Update: Partial<ProjectActivityInsert>;
        Relationships: [
          {
            foreignKeyName: "project_activity_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      client_portal_tokens: {
        Row: ClientPortalTokenRecord;
        Insert: ClientPortalTokenInsert;
        Update: Partial<ClientPortalTokenInsert>;
        Relationships: [
          {
            foreignKeyName: "client_portal_tokens_client_id_fkey";
            columns: ["client_id"];
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
  };
};

let cachedServerClient: SupabaseClient<Database> | null = null;

/**
 * Checks whether the server environment has the required Supabase credentials configured.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(url && serviceKey && url.trim().length > 0 && serviceKey.trim().length > 0);
}

/**
 * Factory for a privileged, server-only Supabase client using SUPABASE_SERVICE_ROLE_KEY.
 *
 * Security Guarantee:
 * - This function must only be executed in server contexts (Route Handlers, Server Actions).
 * - It bypasses Row Level Security (RLS) to allow administrative persistence of incoming inquiries.
 * - Session persistence, token refresh, and URL parsing are completely disabled.
 *
 * @throws Error if executed in a browser context or if required environment variables are missing.
 */
export function getSupabaseServerClient(): SupabaseClient<Database> {
  if (typeof window !== "undefined") {
    throw new Error(
      "CRITICAL SECURITY VIOLATION: getSupabaseServerClient() was called in a client/browser environment. " +
        "Service role credentials must strictly remain on the server."
    );
  }

  if (cachedServerClient) {
    return cachedServerClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || supabaseUrl.trim().length === 0) {
    throw new Error(
      "Supabase configuration error: SUPABASE_URL environment variable is missing or empty. " +
        "Please configure this server-only variable."
    );
  }

  if (!serviceRoleKey || serviceRoleKey.trim().length === 0) {
    throw new Error(
      "Supabase configuration error: SUPABASE_SERVICE_ROLE_KEY environment variable is missing or empty. " +
        "Please configure this server-only variable."
    );
  }

  cachedServerClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return cachedServerClient;
}

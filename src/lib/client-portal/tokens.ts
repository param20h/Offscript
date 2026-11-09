import crypto from "crypto";
import {
  getSupabaseServerClient,
  isSupabaseConfigured,
  ClientRecord,
  ProposalRecord,
  InvoiceRecord,
  ProjectRecord,
  ProjectMilestoneRecord,
  ProjectUpdateRecord,
} from "@/lib/db/supabase";
import { getServerConfig } from "@/lib/config";

export interface ClientPortalDossier {
  client: ClientRecord;
  proposals: ProposalRecord[];
  invoices: InvoiceRecord[];
  projects: Array<
    ProjectRecord & {
      milestones: ProjectMilestoneRecord[];
      updates: ProjectUpdateRecord[];
    }
  >;
}

export function hashPortalToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export async function generateClientPortalToken(
  clientId: string,
  createdBy = "admin",
  expiresInDays = 30
): Promise<{ token: string; url: string; expires_at: string }> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured on the server");
  }

  const supabase = getSupabaseServerClient();
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashPortalToken(rawToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  const expiresAtStr = expiresAt.toISOString();

  // Revoke any previous active tokens for this client to ensure only one valid link at a time
  await supabase
    .from("client_portal_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("client_id", clientId)
    .is("revoked_at", null);

  const { error } = await supabase.from("client_portal_tokens").insert({
    client_id: clientId,
    token_hash: tokenHash,
    expires_at: expiresAtStr,
    created_by: createdBy,
  });

  if (error) {
    throw new Error(`Failed to generate portal access token: ${error.message}`);
  }

  const config = getServerConfig();
  const url = `${config.siteUrl}/client/${rawToken}`;

  return {
    token: rawToken,
    url,
    expires_at: expiresAtStr,
  };
}

export async function verifyClientPortalToken(
  rawToken: string
): Promise<ClientPortalDossier | null> {
  if (!rawToken || rawToken.length < 32 || !isSupabaseConfigured()) {
    return null;
  }

  const tokenHash = hashPortalToken(rawToken);
  const supabase = getSupabaseServerClient();

  const { data: tokenRecord, error: tokenErr } = await supabase
    .from("client_portal_tokens")
    .select("*")
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .single();

  if (tokenErr || !tokenRecord) {
    return null;
  }

  // Check expiration
  if (new Date(tokenRecord.expires_at).getTime() < Date.now()) {
    return null;
  }

  // Record access asynchronously
  supabase
    .from("client_portal_tokens")
    .update({
      last_accessed_at: new Date().toISOString(),
      access_count: (tokenRecord.access_count || 0) + 1,
    })
    .eq("id", tokenRecord.id)
    .then(() => {});

  const clientId = tokenRecord.client_id;

  // Fetch client details
  const { data: client, error: clientErr } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (clientErr || !client) {
    return null;
  }

  // Fetch client proposals (only ready, sent, accepted, completed)
  const { data: proposals } = await supabase
    .from("proposals")
    .select("*")
    .eq("client_id", clientId)
    .in("status", ["ready", "sent", "accepted"])
    .order("created_at", { ascending: false });

  // Fetch client invoices (exclude void or cancelled)
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("client_id", clientId)
    .neq("status", "void")
    .neq("status", "cancelled")
    .order("issue_date", { ascending: false });

  // Fetch client projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  const projectList = projects || [];
  const projectsWithScopedRelations = await Promise.all(
    projectList.map(async (prj) => {
      const [milestonesRes, updatesRes] = await Promise.all([
        supabase
          .from("project_milestones")
          .select("*")
          .eq("project_id", prj.id)
          .eq("client_visible", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
        supabase
          .from("project_updates")
          .select("*")
          .eq("project_id", prj.id)
          .eq("visibility", "client")
          .order("created_at", { ascending: false }),
      ]);

      return {
        ...prj,
        milestones: milestonesRes.data || [],
        updates: updatesRes.data || [],
      };
    })
  );

  return {
    client,
    proposals: proposals || [],
    invoices: invoices || [],
    projects: projectsWithScopedRelations,
  };
}

export async function revokeClientPortalToken(clientId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseServerClient();

  const { error } = await supabase
    .from("client_portal_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("client_id", clientId)
    .is("revoked_at", null);

  return !error;
}

export async function getClientPortalTokenMeta(clientId: string): Promise<{
  has_active_token: boolean;
  expires_at?: string;
  last_accessed_at?: string | null;
  access_count?: number;
} | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("client_portal_tokens")
    .select("*")
    .eq("client_id", clientId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) {
    return { has_active_token: false };
  }

  const isExpired = new Date(data.expires_at).getTime() < Date.now();
  if (isExpired) {
    return { has_active_token: false, expires_at: data.expires_at };
  }

  return {
    has_active_token: true,
    expires_at: data.expires_at,
    last_accessed_at: data.last_accessed_at,
    access_count: data.access_count,
  };
}

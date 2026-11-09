import crypto from "crypto";
import {
  getSupabaseServerClient,
  isSupabaseConfigured,
  ProposalRecord,
  ProposalAccessTokenRecord,
  ClientRecord,
  ProposalItemRecord,
  ProposalDeliverableRecord,
  ProposalMilestoneRecord,
} from "@/lib/db/supabase";

/**
 * Validates whether a token string meets the 64-character hex format (256-bit entropy).
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== "string") return false;
  return /^[a-f0-9]{64}$/i.test(token.trim());
}

/**
 * Computes a deterministic SHA-256 hex digest of a token.
 * Only this hash is stored in the database; plaintext tokens are never persisted.
 */
export function hashProposalToken(token: string): string {
  return crypto
    .createHash("sha256")
    .update(token.trim())
    .digest("hex");
}

/**
 * Generates 256 bits (32 bytes) of cryptographically secure random entropy.
 */
export function generateSecureProposalToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export interface ProposalTokenCreationResult {
  token: string;
  tokenHash: string;
  expiresAt: string;
  accessUrl: string;
}

/**
 * Generates and stores a new client proposal access token.
 * Automatically revokes any prior active tokens for this proposal to guarantee single active token semantics.
 */
export async function createProposalAccessToken({
  proposalId,
  expiresInDays = 30,
  createdBy = "admin",
}: {
  proposalId: string;
  expiresInDays?: number;
  createdBy?: string;
}): Promise<ProposalTokenCreationResult> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured on the server");
  }

  const supabase = getSupabaseServerClient();

  // 1. Verify proposal exists
  const { data: proposal, error: propErr } = await supabase
    .from("proposals")
    .select("id, status")
    .eq("id", proposalId)
    .single();

  if (propErr || !proposal) {
    throw new Error("Target proposal could not be found");
  }

  // 2. Generate secure token & SHA-256 hash
  const token = generateSecureProposalToken();
  const tokenHash = hashProposalToken(token);
  const expiresAt = new Date(
    Date.now() + Math.max(1, expiresInDays) * 24 * 60 * 60 * 1000
  ).toISOString();

  // 3. Invalidate/revoke any previous active tokens for this proposal
  await supabase
    .from("proposal_access_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("proposal_id", proposalId)
    .is("revoked_at", null);

  // 4. Persist the new token hash
  const { error: insertErr } = await supabase
    .from("proposal_access_tokens")
    .insert({
      proposal_id: proposalId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      created_by: createdBy,
      access_count: 0,
    });

  if (insertErr) {
    throw new Error(`Failed to store proposal access token: ${insertErr.message}`);
  }

  // 5. Log proposal activity
  try {
    await supabase.from("proposal_activity").insert({
      proposal_id: proposalId,
      event_type: "client_access_generated",
      actor: createdBy,
      description: `Client access link generated (expires in ${expiresInDays} days)`,
      metadata: { expires_at: expiresAt },
    });
  } catch {
    // Non-fatal activity logging failure
  }

  const siteUrl = process.env.SITE_URL || "https://offscript.param20h.me";
  const accessUrl = `${siteUrl.replace(/\/$/, "")}/proposal/${token}`;

  return {
    token,
    tokenHash,
    expiresAt,
    accessUrl,
  };
}

/**
 * Revokes all active access tokens for a given proposal immediately.
 */
export async function revokeProposalAccessToken(proposalId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseServerClient();

  const { error } = await supabase
    .from("proposal_access_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("proposal_id", proposalId)
    .is("revoked_at", null);

  if (!error) {
    try {
      await supabase.from("proposal_activity").insert({
        proposal_id: proposalId,
        event_type: "client_access_revoked",
        actor: "admin",
        description: "Client access link revoked by administrator",
        metadata: {},
      });
    } catch {
      // Non-fatal
    }
    return true;
  }
  return false;
}

export type TokenVerificationFailureReason =
  | "invalid_format"
  | "not_found"
  | "revoked"
  | "expired"
  | "proposal_unavailable";

export type VerifiedProposalAccess =
  | {
      valid: true;
      tokenRecord: ProposalAccessTokenRecord;
      proposal: ProposalRecord;
      client: {
        id: string;
        name: string;
        company_name: string;
        email: string;
      };
      items: ProposalItemRecord[];
      deliverables: ProposalDeliverableRecord[];
      milestones: ProposalMilestoneRecord[];
    }
  | {
      valid: false;
      reason: TokenVerificationFailureReason;
    };

/**
 * Authoritatively verifies a client access token, checks expiry/revocation,
 * updates access counters, and returns client-safe proposal data (using immutable snapshot if present).
 */
export async function verifyAndRetrieveProposalByToken(
  token: string
): Promise<VerifiedProposalAccess> {
  // 1. Format validation
  if (!isValidTokenFormat(token)) {
    return { valid: false, reason: "invalid_format" };
  }

  if (!isSupabaseConfigured()) {
    return { valid: false, reason: "proposal_unavailable" };
  }

  const supabase = getSupabaseServerClient();
  const tokenHash = hashProposalToken(token);

  // 2. Query token hash
  const { data: tokenRecord, error: tokenErr } = await supabase
    .from("proposal_access_tokens")
    .select("*")
    .eq("token_hash", tokenHash)
    .single();

  if (tokenErr || !tokenRecord) {
    return { valid: false, reason: "not_found" };
  }

  // 3. Check revocation
  if (tokenRecord.revoked_at) {
    return { valid: false, reason: "revoked" };
  }

  // 4. Check expiration
  if (new Date(tokenRecord.expires_at).getTime() < Date.now()) {
    return { valid: false, reason: "expired" };
  }

  // 5. Retrieve proposal
  const { data: proposal, error: propErr } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", tokenRecord.proposal_id)
    .single();

  if (propErr || !proposal) {
    return { valid: false, reason: "proposal_unavailable" };
  }

  // 6. Retrieve client (minimal public-safe fields only)
  const { data: client, error: clientErr } = await supabase
    .from("clients")
    .select("id, name, company_name, email")
    .eq("id", proposal.client_id)
    .single();

  if (clientErr || !client) {
    return { valid: false, reason: "proposal_unavailable" };
  }

  // 7. Update access telemetry asynchronously
  try {
    await supabase
      .from("proposal_access_tokens")
      .update({
        access_count: (tokenRecord.access_count || 0) + 1,
        last_accessed_at: new Date().toISOString(),
      })
      .eq("id", tokenRecord.id);

    // If status was 'sent', transition to 'viewed'
    if (proposal.status === "sent") {
      await supabase
        .from("proposals")
        .update({ status: "viewed" })
        .eq("id", proposal.id);

      await supabase.from("proposal_activity").insert({
        proposal_id: proposal.id,
        event_type: "client_viewed",
        actor: "client",
        description: "Proposal opened and viewed by client via secure link",
        metadata: { token_id: tokenRecord.id },
      });
    }
  } catch {
    // Non-fatal telemetry update failure
  }

  // 8. Extract items, deliverables, milestones
  // If proposal has an immutable sent snapshot, respect the snapshot
  let items: ProposalItemRecord[] = [];
  let deliverables: ProposalDeliverableRecord[] = [];
  let milestones: ProposalMilestoneRecord[] = [];

  const snap = proposal.snapshot as any;
  if (snap && snap.items && Array.isArray(snap.items)) {
    items = snap.items;
    deliverables = snap.deliverables || [];
    milestones = snap.milestones || [];
  } else {
    // Fallback to active tables
    const [itemsRes, delivRes, mileRes] = await Promise.all([
      supabase
        .from("proposal_items")
        .select("*")
        .eq("proposal_id", proposal.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("proposal_deliverables")
        .select("*")
        .eq("proposal_id", proposal.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("proposal_milestones")
        .select("*")
        .eq("proposal_id", proposal.id)
        .order("sort_order", { ascending: true }),
    ]);

    items = itemsRes.data || [];
    deliverables = delivRes.data || [];
    milestones = mileRes.data || [];
  }

  return {
    valid: true,
    tokenRecord,
    proposal,
    client: {
      id: client.id,
      name: client.name,
      company_name: client.company_name,
      email: client.email,
    },
    items,
    deliverables,
    milestones,
  };
}

export interface ProposalTokenMetadata {
  exists: boolean;
  expires_at: string | null;
  revoked_at: string | null;
  last_accessed_at: string | null;
  access_count: number;
  is_active: boolean;
  is_expired: boolean;
  is_revoked: boolean;
}

/**
 * Returns public metadata of the latest access token for an administrative dossier.
 * Never returns the plaintext token or token hash.
 */
export async function getActiveProposalTokenMetadata(
  proposalId: string
): Promise<ProposalTokenMetadata> {
  const defaultMeta: ProposalTokenMetadata = {
    exists: false,
    expires_at: null,
    revoked_at: null,
    last_accessed_at: null,
    access_count: 0,
    is_active: false,
    is_expired: false,
    is_revoked: false,
  };

  if (!isSupabaseConfigured()) return defaultMeta;
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("proposal_access_tokens")
    .select("created_at, expires_at, revoked_at, last_accessed_at, access_count")
    .eq("proposal_id", proposalId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return defaultMeta;
  }

  const latest = data[0];
  const isRevoked = Boolean(latest.revoked_at);
  const isExpired = new Date(latest.expires_at).getTime() < Date.now();
  const isActive = !isRevoked && !isExpired;

  return {
    exists: true,
    expires_at: latest.expires_at,
    revoked_at: latest.revoked_at,
    last_accessed_at: latest.last_accessed_at,
    access_count: latest.access_count || 0,
    is_active: isActive,
    is_expired: isExpired,
    is_revoked: isRevoked,
  };
}

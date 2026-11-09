import "server-only";

/**
 * Central Server Configuration Module
 * Enforces server-only isolation. No NEXT_PUBLIC_ variables are used.
 */

export interface ServerConfig {
  siteUrl: string;
  contactEmail: string;
  adminEmails: string[];
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  upstashRedisRestUrl: string;
  upstashRedisRestToken: string;
  resendApiKey: string;
  resendFromEmail: string;
  calendlyUrl: string | null;
}

function parseAdminEmails(raw?: string): string[] {
  if (!raw || raw.trim().length === 0) {
    return ["paramjit.offical34@gmail.com"];
  }
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);
}

function getSiteUrl(): string {
  const raw = process.env.SITE_URL;
  if (raw && raw.trim().length > 0) {
    return raw.trim().replace(/\/$/, "");
  }
  return "https://offscript.param20h.me";
}

function getCalendlyUrl(): string | null {
  const raw = process.env.CALENDLY_URL;
  if (!raw || raw.trim().length === 0) return null;
  try {
    const parsed = new URL(raw.trim());
    if (parsed.protocol === "https:" && parsed.hostname.endsWith("calendly.com")) {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

export const serverConfig: ServerConfig = {
  siteUrl: getSiteUrl(),
  contactEmail: process.env.CONTACT_EMAIL || "offscript@param20h.me",
  adminEmails: parseAdminEmails(process.env.ADMIN_EMAILS),
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL || "",
  upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN || "",
  resendApiKey: process.env.RESEND_API_KEY || "",
  resendFromEmail:
    process.env.RESEND_FROM_EMAIL ||
    "OFFSCRIPT Studio <inquiries@offscript.param20h.me>",
  calendlyUrl: getCalendlyUrl(),
};

export function getServerConfig(): ServerConfig {
  return serverConfig;
}

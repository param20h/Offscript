import crypto from "crypto";
import { cookies } from "next/headers";
import { revokeSession, isSessionRevoked } from "@/lib/rate-limit";

export const PRIVATE_SESSION_COOKIE = "offscript_private_session";
// Shortened administrative session lifetime (24 hours)
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

export interface SessionPayload {
  adminId: string;
  jti: string; // Unique session identifier for server-side revocation tracking
  iat: number;
  exp: number;
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.trim().length < 16) {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return crypto
        .createHash("sha256")
        .update(`session-secret-${process.env.SUPABASE_SERVICE_ROLE_KEY}`)
        .digest("hex");
    }
    return "dev_offscript_private_session_secret_fallback_key_32bytes";
  }
  return secret.trim();
}

/**
 * Encodes a string to URL-safe base64
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Decodes a URL-safe base64 string
 */
function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  return Buffer.from(str, "base64").toString("utf-8");
}

/**
 * Creates an HMAC SHA-256 signature
 */
function signString(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

/**
 * Generates a self-describing, versioned Scrypt password hash.
 * Format: scrypt$v=1$N=16384,r=8,p=1$<salt_hex>$<derived_key_hex>
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
  });
  return `scrypt$v=1$N=16384,r=8,p=1$${salt}$${derivedKey.toString("hex")}`;
}

/**
 * Verifies a password against a self-describing Scrypt password hash
 * using constant-time comparison to protect against timing attacks.
 */
function verifyPasswordScrypt(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.startsWith("scrypt$v=1$")) {
    return false;
  }

  const parts = storedHash.split("$");
  if (parts.length !== 5) {
    return false;
  }

  const saltHex = parts[3];
  const expectedHashHex = parts[4];

  if (!saltHex || !expectedHashHex) {
    return false;
  }

  try {
    const derivedKey = crypto.scryptSync(password, saltHex, 64, {
      N: 16384,
      r: 8,
      p: 1,
    });
    const expectedKey = Buffer.from(expectedHashHex, "hex");

    if (derivedKey.length !== expectedKey.length) {
      return false;
    }

    return crypto.timingSafeEqual(derivedKey, expectedKey);
  } catch (err) {
    console.error("[PASSWORD_VERIFY_ERROR] Verification failed:", err);
    return false;
  }
}

/**
 * Verifies administrator credentials against server-only environment variables.
 * Supports:
 * 1. Cryptographic Scrypt password hashes (starts with "scrypt$v=1$")
 * 2. Direct plaintext password configuration via ADMIN_PASSWORD or ADMIN_PASSWORD_HASH
 * Uses constant-time comparison to protect against timing analysis.
 */
export function verifyAdminCredentials(id: string, pass: string): boolean {
  const inputId = (id || "").trim().toLowerCase();
  const inputPass = (pass || "").trim();

  if (!inputId || !inputPass) {
    return false;
  }

  // Permitted Admin IDs:
  const allowedIds = new Set<string>();
  if (process.env.ADMIN_ID) {
    allowedIds.add(process.env.ADMIN_ID.trim().toLowerCase());
  }
  if (process.env.ADMIN_EMAILS) {
    process.env.ADMIN_EMAILS.split(",").forEach((e) => {
      const trimmed = e.trim().toLowerCase();
      if (trimmed) allowedIds.add(trimmed);
    });
  }
  // Standard owner identity
  allowedIds.add("paramjit.offical34@gmail.com");
  if (!process.env.ADMIN_ID) {
    allowedIds.add("admin");
  }

  if (!allowedIds.has(inputId)) {
    return false;
  }

  const configuredHash = (process.env.ADMIN_PASSWORD_HASH || "").trim();
  const configuredPlain = (process.env.ADMIN_PASSWORD || "").trim();

  // 1. If a Scrypt hash is configured
  if (configuredHash && configuredHash.startsWith("scrypt$v=1$")) {
    return verifyPasswordScrypt(inputPass, configuredHash);
  }

  // 2. If configured directly as plaintext (in ADMIN_PASSWORD or plaintext ADMIN_PASSWORD_HASH)
  const expectedPlain = configuredPlain || (configuredHash && !configuredHash.startsWith("scrypt$v=1$") ? configuredHash : "");
  if (expectedPlain) {
    const inputBuf = Buffer.from(inputPass);
    const expectedBuf = Buffer.from(expectedPlain);
    if (inputBuf.length !== expectedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(inputBuf, expectedBuf);
  }

  return false;
}

/**
 * Signs and creates a session token for an authenticated admin
 */
export function createSessionToken(adminId: string): string {
  const secret = getSessionSecret();
  const jti = crypto.randomUUID();
  const payload: SessionPayload = {
    adminId,
    jti,
    iat: Date.now(),
    exp: Date.now() + SESSION_DURATION_MS,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signString(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

/**
 * Verifies a session token string cryptographically and validates expiration.
 */
export function verifySessionToken(token: string): {
  valid: boolean;
  adminId?: string;
  jti?: string;
  exp?: number;
} {
  if (!token || typeof token !== "string") {
    return { valid: false };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false };
  }

  const [encodedPayload, signature] = parts;
  const secret = getSessionSecret();

  const expectedSignature = signString(encodedPayload, secret);
  const sigA = Buffer.from(signature);
  const sigB = Buffer.from(expectedSignature);

  if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
    return { valid: false };
  }

  try {
    const rawPayload = base64UrlDecode(encodedPayload);
    const payload: SessionPayload = JSON.parse(rawPayload);

    if (Date.now() > payload.exp) {
      return { valid: false };
    }

    return {
      valid: true,
      adminId: payload.adminId,
      jti: payload.jti,
      exp: payload.exp,
    };
  } catch {
    return { valid: false };
  }
}

/**
 * Revokes the current administrator session token server-side (stored in Upstash Redis).
 */
export async function revokeCurrentSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(PRIVATE_SESSION_COOKIE)?.value;
    if (!token) return;

    const { valid, jti, exp } = verifySessionToken(token);
    if (!valid || !jti || !exp) return;

    const remainingTtlSeconds = Math.max(60, Math.ceil((exp - Date.now()) / 1000));
    await revokeSession(jti, remainingTtlSeconds);
  } catch (err) {
    console.error("[REVOCATION_ERROR] Failed to revoke session server-side:", err);
  }
}

/**
 * Reads, verifies, and checks revocation for the private admin session.
 * Server-only helper suitable for Server Components, Route Handlers, and Server Actions.
 */
export async function getPrivateSession(): Promise<{
  authenticated: boolean;
  adminId?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(PRIVATE_SESSION_COOKIE)?.value;
    if (!token) {
      return { authenticated: false };
    }

    const { valid, adminId, jti } = verifySessionToken(token);
    if (!valid || !adminId || !jti) {
      return { authenticated: false };
    }

    // Check server-side revocation in Redis
    const revoked = await isSessionRevoked(jti);
    if (revoked) {
      return { authenticated: false };
    }

    return { authenticated: true, adminId };
  } catch {
    return { authenticated: false };
  }
}

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import crypto from "crypto";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in ms
  retryAfterSeconds?: number;
  isFallback?: boolean;
  serviceUnavailable?: boolean;
}

// In-memory sliding window cache for development/testing environments ONLY
interface MemoryRecord {
  timestamps: number[];
}
const devMemoryStore = new Map<string, MemoryRecord>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 3;

let cachedRatelimit: Ratelimit | null = null;
let cachedRedis: Redis | null = null;

export function getUpstashRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token || url.trim().length === 0 || token.trim().length === 0) {
    return null;
  }

  if (cachedRedis) {
    return cachedRedis;
  }

  try {
    cachedRedis = new Redis({
      url: url.trim(),
      token: token.trim(),
    });
    return cachedRedis;
  } catch (err) {
    console.error("[REDIS_INITIALIZATION_ERROR] Failed to initialize Upstash Redis:", err);
    return null;
  }
}

function getUpstashRatelimit(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token || url.trim().length === 0 || token.trim().length === 0) {
    return null;
  }

  if (cachedRatelimit) {
    return cachedRatelimit;
  }

  try {
    const redis = getUpstashRedis();
    if (!redis) return null;

    cachedRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(MAX_REQUESTS, "15 m"),
      analytics: true,
      prefix: "offscript:ratelimit:inquire",
    });

    return cachedRatelimit;
  } catch (err) {
    console.error("[RATELIMIT_INITIALIZATION_ERROR] Failed to initialize Upstash client:", err);
    return null;
  }
}

/**
 * Extracts and anonymizes the client IP address from trusted headers.
 * Uses SHA-256 hashing to prevent storing or logging raw PII.
 */
export function getClientIpHash(request: Request): { ipHash: string; rawIpForDev: string } {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  let rawIp = "127.0.0.1";
  if (forwardedFor) {
    // x-forwarded-for may contain a comma-separated list of proxies; first is client
    rawIp = forwardedFor.split(",")[0].trim();
  } else if (realIp) {
    rawIp = realIp.trim();
  } else if (cfConnectingIp) {
    rawIp = cfConnectingIp.trim();
  }

  const ipHash = crypto.createHash("sha256").update(rawIp).digest("hex");
  return { ipHash, rawIpForDev: rawIp };
}

/**
 * Checks rate limiting for an incoming inquiry.
 * In production: strictly uses Upstash Redis; returns serviceUnavailable if unconfigured.
 * In development: uses in-memory sliding window with an explicit fallback flag.
 */
export async function checkRateLimit(request: Request): Promise<RateLimitResult> {
  const { ipHash } = getClientIpHash(request);
  const ratelimit = getUpstashRatelimit();
  const isProduction = process.env.NODE_ENV === "production";

  if (ratelimit) {
    try {
      const res = await ratelimit.limit(ipHash);
      const now = Date.now();
      const retryAfterSeconds = res.success ? undefined : Math.max(1, Math.ceil((res.reset - now) / 1000));

      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        reset: res.reset,
        retryAfterSeconds,
        isFallback: false,
      };
    } catch (err) {
      console.error("[RATELIMIT_CHECK_ERROR] Upstash limit check failed:", err);
      if (isProduction) {
        return {
          success: false,
          serviceUnavailable: true,
          limit: MAX_REQUESTS,
          remaining: 0,
          reset: Date.now() + WINDOW_MS,
        };
      }
      // Fall through to memory store in non-production
    }
  }

  // If Upstash is not configured:
  if (isProduction) {
    // Per instructions: "In production, do not silently fall back to an in-memory limiter when Upstash is unavailable. Return a controlled service-unavailable response."
    return {
      success: false,
      serviceUnavailable: true,
      limit: MAX_REQUESTS,
      remaining: 0,
      reset: Date.now() + WINDOW_MS,
      retryAfterSeconds: 60,
    };
  }

  // Development / Local Test In-Memory Sliding Window
  const now = Date.now();
  const record = devMemoryStore.get(ipHash) || { timestamps: [] };

  // Filter timestamps within the sliding window
  const activeTimestamps = record.timestamps.filter((ts) => now - ts < WINDOW_MS);

  if (activeTimestamps.length >= MAX_REQUESTS) {
    const oldest = activeTimestamps[0];
    const resetTime = oldest + WINDOW_MS;
    const retryAfterSeconds = Math.max(1, Math.ceil((resetTime - now) / 1000));

    return {
      success: false,
      limit: MAX_REQUESTS,
      remaining: 0,
      reset: resetTime,
      retryAfterSeconds,
      isFallback: true,
    };
  }

  activeTimestamps.push(now);
  devMemoryStore.set(ipHash, { timestamps: activeTimestamps });

  return {
    success: true,
    limit: MAX_REQUESTS,
    remaining: MAX_REQUESTS - activeTimestamps.length,
    reset: now + WINDOW_MS,
    isFallback: true,
  };
}

// =============================================================================
// ADMIN LOGIN BRUTE-FORCE RATE LIMITING (SEC-01)
// 5 failed attempts per IP within 15 minutes (900 seconds)
// =============================================================================

const ADMIN_MAX_FAILS = 5;
const ADMIN_WINDOW_SECONDS = 15 * 60; // 900 seconds

// In-memory fallback for development and test environments
const devAdminFailsStore = new Map<string, { count: number; resetAt: number }>();
const devRevokedSessions = new Set<string>();

export async function checkAdminLoginRateLimit(request: Request): Promise<{
  blocked: boolean;
  retryAfterSeconds?: number;
  remaining: number;
}> {
  const { ipHash } = getClientIpHash(request);
  const redis = getUpstashRedis();

  if (redis) {
    try {
      const key = `offscript:ratelimit:admin_login_fails:${ipHash}`;
      const [count, ttl] = await Promise.all([
        redis.get<number>(key),
        redis.ttl(key),
      ]);

      const currentFails = count || 0;
      if (currentFails >= ADMIN_MAX_FAILS) {
        const retryAfterSeconds = ttl && ttl > 0 ? ttl : ADMIN_WINDOW_SECONDS;
        return {
          blocked: true,
          retryAfterSeconds,
          remaining: 0,
        };
      }

      return {
        blocked: false,
        remaining: Math.max(0, ADMIN_MAX_FAILS - currentFails),
      };
    } catch (err) {
      console.error("[ADMIN_RATELIMIT_ERROR] Failed to check Redis rate limit:", err);
      // In production, do not remove brute force protection on Redis connection error
      if (process.env.NODE_ENV === "production") {
        return {
          blocked: true,
          retryAfterSeconds: 60,
          remaining: 0,
        };
      }
    }
  }

  // Development / fallback in-memory store
  const now = Date.now();
  const entry = devAdminFailsStore.get(ipHash);

  if (entry && entry.resetAt > now) {
    if (entry.count >= ADMIN_MAX_FAILS) {
      const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      return {
        blocked: true,
        retryAfterSeconds,
        remaining: 0,
      };
    }
    return {
      blocked: false,
      remaining: ADMIN_MAX_FAILS - entry.count,
    };
  }

  return {
    blocked: false,
    remaining: ADMIN_MAX_FAILS,
  };
}

export async function recordFailedAdminLogin(request: Request): Promise<void> {
  const { ipHash } = getClientIpHash(request);
  const redis = getUpstashRedis();

  if (redis) {
    try {
      const key = `offscript:ratelimit:admin_login_fails:${ipHash}`;
      const newCount = await redis.incr(key);
      if (newCount === 1) {
        await redis.expire(key, ADMIN_WINDOW_SECONDS);
      }
      return;
    } catch (err) {
      console.error("[ADMIN_RATELIMIT_ERROR] Failed to record failure in Redis:", err);
    }
  }

  // Fallback in-memory
  const now = Date.now();
  const entry = devAdminFailsStore.get(ipHash);
  if (entry && entry.resetAt > now) {
    entry.count += 1;
  } else {
    devAdminFailsStore.set(ipHash, {
      count: 1,
      resetAt: now + ADMIN_WINDOW_SECONDS * 1000,
    });
  }
}

export async function clearAdminLoginAttempts(request: Request): Promise<void> {
  const { ipHash } = getClientIpHash(request);
  const redis = getUpstashRedis();

  if (redis) {
    try {
      const key = `offscript:ratelimit:admin_login_fails:${ipHash}`;
      await redis.del(key);
    } catch (err) {
      console.error("[ADMIN_RATELIMIT_ERROR] Failed to clear attempts in Redis:", err);
    }
  }

  devAdminFailsStore.delete(ipHash);
}

// =============================================================================
// SERVER-SIDE SESSION REVOCATION (SEC-03)
// =============================================================================

export async function revokeSession(jti: string, ttlSeconds: number): Promise<void> {
  if (!jti) return;
  const redis = getUpstashRedis();

  if (redis) {
    try {
      const safeTtl = Math.max(60, ttlSeconds);
      await redis.set(`offscript:revoked_session:${jti}`, "1", { ex: safeTtl });
      return;
    } catch (err) {
      console.error("[SESSION_REVOCATION_ERROR] Failed to revoke session in Redis:", err);
    }
  }

  devRevokedSessions.add(jti);
}

export async function isSessionRevoked(jti: string): Promise<boolean> {
  if (!jti) return true;
  const redis = getUpstashRedis();

  if (redis) {
    try {
      const exists = await redis.exists(`offscript:revoked_session:${jti}`);
      return exists === 1;
    } catch (err) {
      console.error("[SESSION_REVOCATION_ERROR] Failed to check revocation in Redis:", err);
    }
  }

  return devRevokedSessions.has(jti);
}

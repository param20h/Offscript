import "server-only";
import crypto from "crypto";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  correlationId?: string;
  module?: string;
  action?: string;
  userId?: string;
  [key: string]: unknown;
}

const REDACTED_KEYS = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "session",
  "apikey",
  "api_key",
  "service_role_key",
  "resend_api_key",
]);

function redactSensitiveData(obj: unknown, depth = 0): unknown {
  if (depth > 5) return "[DEPTH_LIMIT]";
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveData(item, depth + 1));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (REDACTED_KEYS.has(lowerKey) || lowerKey.includes("password") || lowerKey.includes("secret")) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof val === "object" && val !== null) {
      sanitized[key] = redactSensitiveData(val, depth + 1);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

export function generateCorrelationId(): string {
  return crypto.randomUUID();
}

export const logger = {
  log(level: LogLevel, message: string, context?: LogContext) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      environment: process.env.NODE_ENV || "development",
      ...((redactSensitiveData(context || {}) as Record<string, unknown>) || {}),
    };

    const out = JSON.stringify(entry);

    if (level === "error") {
      console.error(out);
    } else if (level === "warn") {
      console.warn(out);
    } else {
      console.log(out);
    }
  },

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== "production") {
      this.log("debug", message, context);
    }
  },

  info(message: string, context?: LogContext) {
    this.log("info", message, context);
  },

  warn(message: string, context?: LogContext) {
    this.log("warn", message, context);
  },

  error(message: string, context?: LogContext) {
    this.log("error", message, context);
  },
};

/**
 * Security utilities for CSRF defense and Origin verification
 */

export function validateOrigin(request: Request): { valid: boolean; reason?: string } {
  const method = request.method.toUpperCase();
  // Safe read-only HTTP methods do not require Origin verification
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return { valid: true };
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  const siteUrl = (process.env.SITE_URL || "https://offscript.param20h.me").trim();
  const allowedOrigins = new Set<string>();

  if (siteUrl) {
    try {
      allowedOrigins.add(new URL(siteUrl).origin);
    } catch {
      // ignore parsing error
    }
  }

  // In production, allow HTTPS with the current host
  if (host) {
    allowedOrigins.add(`https://${host}`);
    // Support non-standard ports or HTTP during local development/testing
    if (process.env.NODE_ENV !== "production" || host.includes("localhost") || host.includes("127.0.0.1")) {
      allowedOrigins.add(`http://${host}`);
      allowedOrigins.add("http://localhost:3000");
      allowedOrigins.add("http://localhost:3097");
      allowedOrigins.add("http://localhost:3098");
      allowedOrigins.add("http://localhost:3099");
    }
  }

  if (origin) {
    if (allowedOrigins.has(origin)) {
      return { valid: true };
    }
    return {
      valid: false,
      reason: `Cross-origin request rejected. Origin '${origin}' does not match allowed studio domains.`,
    };
  }

  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (allowedOrigins.has(refOrigin)) {
        return { valid: true };
      }
      return {
        valid: false,
        reason: `Cross-origin request rejected. Referer origin '${refOrigin}' does not match allowed studio domains.`,
      };
    } catch {
      return { valid: false, reason: "Malformed Referer header." };
    }
  }

  // Sec-Fetch-Site guard for modern browsers if origin and referer are omitted
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "none") {
    return {
      valid: false,
      reason: `Cross-origin request rejected. Sec-Fetch-Site '${secFetchSite}' is not same-origin.`,
    };
  }

  return { valid: true };
}

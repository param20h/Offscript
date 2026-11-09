import { NextResponse } from "next/server";
import {
  verifyAdminCredentials,
  createSessionToken,
  PRIVATE_SESSION_COOKIE,
} from "@/lib/auth/session";
import {
  checkAdminLoginRateLimit,
  recordFailedAdminLogin,
  clearAdminLoginAttempts,
} from "@/lib/rate-limit";
import { validateOrigin } from "@/lib/security";

export async function POST(request: Request) {
  try {
    // 1. Cross-Origin Defense (SEC-04)
    const originCheck = validateOrigin(request);
    if (!originCheck.valid) {
      return NextResponse.json(
        { success: false, error: originCheck.reason || "Cross-origin request rejected." },
        { status: 403 }
      );
    }

    // 2. Distributed Brute-Force Rate Limiting (SEC-01)
    const rateLimit = await checkAdminLoginRateLimit(request);
    if (rateLimit.blocked) {
      const retryAfter = rateLimit.retryAfterSeconds || 900;
      return NextResponse.json(
        {
          success: false,
          error: "Too many failed login attempts. Access temporarily locked. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
          },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { adminId, password } = body;

    if (!adminId || !password || typeof adminId !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Admin ID and password are required." },
        { status: 400 }
      );
    }

    // 3. Constant-Time Password Hash Verification (SEC-02)
    const isValid = verifyAdminCredentials(adminId, password);
    if (!isValid) {
      await recordFailedAdminLogin(request);
      return NextResponse.json(
        { success: false, error: "Invalid credentials. Access denied." },
        { status: 401 }
      );
    }

    // 4. Successful login: clear prior failure count (do not count success as failure)
    await clearAdminLoginAttempts(request);

    // 5. Issue session with unique jti and shortened 24-hour lifetime (SEC-03)
    const token = createSessionToken(adminId.trim());

    const response = NextResponse.json({
      success: true,
      redirect: "/private",
    });

    response.cookies.set(PRIVATE_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

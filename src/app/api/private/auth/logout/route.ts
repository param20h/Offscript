import { NextResponse } from "next/server";
import { PRIVATE_SESSION_COOKIE, revokeCurrentSession } from "@/lib/auth/session";
import { validateOrigin } from "@/lib/security";

export async function POST(request: Request) {
  // 1. Cross-Origin Defense (SEC-04)
  const originCheck = validateOrigin(request);
  if (!originCheck.valid) {
    return NextResponse.json(
      { success: false, error: originCheck.reason || "Cross-origin request rejected." },
      { status: 403 }
    );
  }

  // 2. Server-side session revocation in Upstash Redis (SEC-03)
  await revokeCurrentSession();

  // 3. Clear client-side session cookie
  const response = NextResponse.json({
    success: true,
    redirect: "/private/login",
  });

  response.cookies.set(PRIVATE_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}

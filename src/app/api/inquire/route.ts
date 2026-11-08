import { NextResponse } from "next/server";

export interface InquiryPayload {
  name: string;
  email: string;
  company?: string;
  projectType: string;
  budgetRange: string;
  timeline: string;
  description: string;
}

export async function POST(request: Request) {
  try {
    const body: InquiryPayload = await request.json();

    // 1. Server-Side Validation
    if (!body.name || typeof body.name !== "string" || body.name.trim().length < 2) {
      return NextResponse.json(
        { error: "A valid name (at least 2 characters) is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!body.email || !emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!body.description || body.description.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a project brief with at least 10 characters." },
        { status: 400 }
      );
    }

    // 2. Resend Delivery Architecture (Phase 4 integration hook)
    const resendApiKey = process.env.RESEND_API_KEY;
    const isDeliveryConfigured = Boolean(resendApiKey);

    if (isDeliveryConfigured) {
      // In Phase 4, Resend SDK will transmit to offscript@param20h.me
      console.log("[INQUIRY_DISPATCH] Transmitting to offscript@param20h.me via Resend");
    } else {
      // Staged mode prior to Phase 4 email verification
      console.log("[INQUIRY_RECEIVED_STAGED]", {
        name: body.name,
        email: body.email,
        company: body.company || "Independent",
        projectType: body.projectType,
        budgetRange: body.budgetRange,
        timeline: body.timeline,
        descriptionLength: body.description.length,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Inquiry successfully validated and recorded.",
        isDeliveryConfigured,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[INQUIRY_ERROR]", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your inquiry." },
      { status: 500 }
    );
  }
}

import { track } from "@vercel/analytics";

/**
 * OFFSCRIPT Studio Conversion & Telemetry Event Definitions.
 *
 * PRIVACY CONTRACT:
 * - NO personal identifiable information (PII) is ever recorded (no names, emails, companies, or briefs).
 * - NO financial specifics or freeform message text are recorded.
 * - NO database record IDs or client IP addresses are transmitted.
 * - All properties are restricted to non-PII categorical telemetry.
 */
export type AnalyticsEventMap = {
  contact_form_started: {
    entryPoint: "contact_page";
  };
  contact_form_submitted: {
    currency?: "USD" | "INR";
    projectType: string;
    packageModel?: string;
  };
  contact_form_persisted: {
    notificationAccepted: boolean;
  };
  contact_form_failed: {
    errorCategory: "validation" | "rate_limit" | "storage_unavailable" | "network_exception";
  };
  discovery_call_clicked: {
    source: "contact_page" | "contact_cta_section" | "footer" | "navigation";
  };
  project_viewed: {
    slug: string;
    category: string;
  };
  email_contact_clicked: {
    location: "contact_page" | "contact_cta_section" | "footer" | "hero";
  };
};

export type AnalyticsEventName = keyof AnalyticsEventMap;

/**
 * Safely dispatches a privacy-preserving conversion event to Vercel Analytics.
 * Wrapped in strict error handling to guarantee analytics failures never interrupt UX.
 */
export function trackEvent<T extends AnalyticsEventName>(
  name: T,
  properties?: AnalyticsEventMap[T]
): void {
  if (typeof window === "undefined") return;

  try {
    if (properties) {
      track(name, properties as Record<string, string | number | boolean>);
    } else {
      track(name);
    }
  } catch (err) {
    // Analytics failure must never break user interactions
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[ANALYTICS_DISPATCH_WARNING] Event ${name} suppressed:`, err);
    }
  }
}

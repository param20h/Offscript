import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact — Project Inquiries & Discovery Consultation",
  description:
    "Direct project inquiries, discovery consultations, and technical partnership requests for OFFSCRIPT Studio.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/contact`,
  },
  openGraph: {
    title: "Contact — Start an Engagement | OFFSCRIPT",
    description:
      "Direct project inquiries, discovery consultations, and technical partnership requests for OFFSCRIPT Studio.",
    url: `${SITE_CONFIG.url}/contact`,
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

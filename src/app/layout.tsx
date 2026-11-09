import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_CONFIG } from "@/lib/constants";
import PublicLayoutWrapper from "@/components/layout/PublicLayoutWrapper";
import { Analytics } from "@vercel/analytics/react";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#171717",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description:
    "OFFSCRIPT is an independent digital engineering studio building digital products, AI systems, web experiences and custom software.",
  keywords: [
    "Digital Engineering Studio",
    "Independent Engineering Studio",
    "Creative Development",
    "AI Agents",
    "Software Architecture",
    "Next.js Development",
    "Machine Intelligence",
    "OFFSCRIPT",
  ],
  authors: [{ name: SITE_CONFIG.name, url: SITE_CONFIG.url }],
  creator: SITE_CONFIG.name,
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description:
      "OFFSCRIPT is an independent digital engineering studio building digital products, AI systems, web experiences and custom software.",
    images: [
      {
        url: `${SITE_CONFIG.url}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description:
      "OFFSCRIPT is an independent digital engineering studio building digital products, AI systems, web experiences and custom software.",
    images: [`${SITE_CONFIG.url}/opengraph-image`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: SITE_CONFIG.name,
  legalName: SITE_CONFIG.legalName,
  url: SITE_CONFIG.url,
  logo: `${SITE_CONFIG.url}/icon.svg`,
  image: `${SITE_CONFIG.url}/opengraph-image`,
  email: SITE_CONFIG.email,
  description:
    "Independent digital engineering studio building high-performance web platforms, autonomous AI systems, and custom software architectures.",
  serviceType: [
    "Web Development",
    "AI & Intelligent Systems",
    "Backend & Cloud Engineering",
    "Creative Development",
    "Automation & Integrations",
    "Product Engineering",
  ],
  sameAs: ["https://github.com/param20h/Offscript"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-obsidian text-ivory antialiased selection:bg-acid selection:text-obsidian min-h-screen flex flex-col font-sans">
        <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
        <Analytics />
      </body>
    </html>
  );
}

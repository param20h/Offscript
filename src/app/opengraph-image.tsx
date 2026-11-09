import { ImageResponse } from "next/og";
import { SITE_CONFIG } from "@/lib/constants";

export const runtime = "edge";

export const alt = "OFFSCRIPT Studio — Digital Engineering Studio";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#171717",
          padding: "64px 72px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle Architectural Corner Markers */}
        <div
          style={{
            position: "absolute",
            top: "24px",
            left: "24px",
            width: "12px",
            height: "12px",
            borderTop: "2px solid #2e2e32",
            borderLeft: "2px solid #2e2e32",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "24px",
            right: "24px",
            width: "12px",
            height: "12px",
            borderTop: "2px solid #2e2e32",
            borderRight: "2px solid #2e2e32",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            left: "24px",
            width: "12px",
            height: "12px",
            borderBottom: "2px solid #2e2e32",
            borderLeft: "2px solid #2e2e32",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            right: "24px",
            width: "12px",
            height: "12px",
            borderBottom: "2px solid #2e2e32",
            borderRight: "2px solid #2e2e32",
          }}
        />

        {/* Top Header Ribbon */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            borderBottom: "1px solid #2e2e32",
            paddingBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "10px",
                height: "10px",
                backgroundColor: "#D6FF35",
              }}
            />
            <span
              style={{
                color: "#F0EDE5",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontFamily: "monospace",
              }}
            >
              OFFSCRIPT STUDIO
            </span>
          </div>

          <div
            style={{
              color: "#D6FF35",
              fontSize: "13px",
              fontFamily: "monospace",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            DIGITAL ENGINEERING
          </div>
        </div>

        {/* Center Editorial Anchor */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "960px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "12px",
            }}
          >
            <h1
              style={{
                color: "#F0EDE5",
                fontSize: "76px",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                margin: 0,
                lineHeight: 0.95,
                textTransform: "uppercase",
              }}
            >
              OFFSCRIPT
            </h1>
            <span
              style={{
                color: "#D6FF35",
                fontSize: "28px",
                fontWeight: 700,
                fontFamily: "monospace",
              }}
            >
              ®
            </span>
          </div>

          <p
            style={{
              color: "#9c9a94",
              fontSize: "26px",
              fontWeight: 300,
              lineHeight: 1.35,
              margin: 0,
              maxWidth: "860px",
            }}
          >
            Digital products, intelligent systems, and custom software. Built different. Engineered properly.
          </p>
        </div>

        {/* Bottom Colophon Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            borderTop: "1px solid #2e2e32",
            paddingTop: "20px",
            fontFamily: "monospace",
            fontSize: "13px",
            color: "#6b6a65",
          }}
        >
          <div style={{ display: "flex", gap: "24px" }}>
            <span>WEB PLATFORMS</span>
            <span>&bull;</span>
            <span>AI AGENTS</span>
            <span>&bull;</span>
            <span>CLOUD ARCHITECTURE</span>
          </div>

          <div style={{ color: "#F0EDE5" }}>
            {SITE_CONFIG.url.replace(/^https?:\/\//, "")}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

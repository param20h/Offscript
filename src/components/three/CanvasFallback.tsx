import React from "react";

export default function CanvasFallback() {
  return (
    <div
      className="w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[540px] flex items-center justify-center relative overflow-hidden bg-transparent"
      aria-label="OFFSCRIPT Architectural Sculpture Elevation"
    >
      {/* Precision coordinate background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      {/* Geometric Architectural Isometric Drawing */}
      <div className="relative z-10 w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
        <svg
          viewBox="0 0 320 320"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Ground Datum Grid */}
          <line x1="40" y1="240" x2="280" y2="240" stroke="#2B2B2B" strokeWidth="1" />
          <line x1="80" y1="255" x2="240" y2="255" stroke="#2B2B2B" strokeWidth="1" strokeDasharray="3 3" />

          {/* Stepped Base Plinth */}
          <polygon
            points="100,240 220,240 240,250 120,250"
            fill="#1C1C1C"
            stroke="#383838"
            strokeWidth="1"
          />

          {/* Vertical Brushed Silver Monolith (Isometric projection) */}
          {/* Top Face */}
          <polygon
            points="115,75 165,55 195,70 145,90"
            fill="#FAF9F6"
            stroke="#D8DDE4"
            strokeWidth="1.2"
          />
          {/* Left Face (Silver Highlight) */}
          <polygon
            points="115,75 145,90 145,225 115,210"
            fill="#D8DDE4"
            stroke="#C0C8D0"
            strokeWidth="1.2"
          />
          {/* Right Face (Silver Shadow) */}
          <polygon
            points="145,90 195,70 195,205 145,225"
            fill="#A0AAB5"
            stroke="#808B96"
            strokeWidth="1.2"
          />

          {/* Horizontal Warm Ivory Ceramic Cantilever Block (Intersects through pillar) */}
          {/* Top Face (Warm Ivory) */}
          <polygon
            points="60,140 210,105 260,120 110,155"
            fill="#FAF9F6"
            stroke="#F0EDE5"
            strokeWidth="1.2"
          />
          {/* Left Face (Warm Ivory Accent) */}
          <polygon
            points="60,140 110,155 110,185 60,170"
            fill="#F0EDE5"
            stroke="#B8B5AD"
            strokeWidth="1.2"
          />
          {/* Front Face (Warm Ivory Shade) */}
          <polygon
            points="110,155 260,120 260,150 110,185"
            fill="#DCD8CF"
            stroke="#B8B5AD"
            strokeWidth="1.2"
          />

          {/* Acid Lime Architectural Precision Datum Blade */}
          <polygon
            points="55,138 215,101 265,116 105,153"
            fill="#D6FF35"
            stroke="#A9D115"
            strokeWidth="1"
            opacity="0.9"
          />

          {/* Floating Spatial Rectangular Frame (Offset tilt) */}
          <polygon
            points="80,110 240,65 240,210 80,255"
            stroke="#D8DDE4"
            strokeWidth="1.5"
            strokeDasharray="6 3"
            fill="none"
            opacity="0.6"
          />

          {/* Minimalist Axis Tick Indicator */}
          <circle cx="160" cy="160" r="2.5" fill="#D6FF35" />
        </svg>
      </div>
    </div>
  );
}

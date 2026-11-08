import React from "react";

export default function CanvasFallback() {
  return (
    <div
      className="w-full h-full min-h-[420px] sm:min-h-[480px] lg:min-h-[560px] flex items-center justify-center relative overflow-hidden bg-transparent"
      aria-label="OFFSCRIPT Architectural Sculpture Blueprint Fallback"
    >
      {/* Precision coordinate background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-25" />

      {/* Crosshairs & Technical Corner Markers */}
      <div className="absolute top-2 left-2 font-mono text-[9px] text-ivory-dim/70 tracking-widest flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-acid inline-block" />
        SCHEMATIC // ISO_ARCH
      </div>
      <div className="absolute top-2 right-2 font-mono text-[9px] text-ivory-dim/70 tracking-widest">
        AXIS: 32.4° // -18.7°
      </div>
      <div className="absolute bottom-2 left-2 font-mono text-[9px] text-ivory-dim/70 tracking-widest">
        FALLBACK: STATIC_VECTOR
      </div>
      <div className="absolute bottom-2 right-2 font-mono text-[9px] text-acid/80 tracking-widest flex items-center gap-1">
        <span className="w-1 h-1 bg-acid inline-block" />
        STRUCTURE: MONOLITHIC
      </div>

      {/* Geometric Architectural Wireframe Blueprint */}
      <div className="relative z-10 w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
        <svg
          viewBox="0 0 240 240"
          className="w-full h-full text-ivory/80 stroke-current fill-none"
        >
          {/* Subtle Grid Axes */}
          <line
            x1="120"
            y1="20"
            x2="120"
            y2="220"
            className="stroke-obsidian-border"
            strokeDasharray="2 4"
          />
          <line
            x1="20"
            y1="120"
            x2="220"
            y2="120"
            className="stroke-obsidian-border"
            strokeDasharray="2 4"
          />

          {/* Orbital Ellipse A */}
          <ellipse
            cx="120"
            cy="120"
            rx="95"
            ry="40"
            transform="rotate(-25 120 120)"
            className="stroke-ivory/30 stroke-[0.8]"
          />

          {/* Orbital Ellipse B (Acid Accent) */}
          <ellipse
            cx="120"
            cy="120"
            rx="75"
            ry="30"
            transform="rotate(45 120 120)"
            className="stroke-acid/40 stroke-[0.8]"
            strokeDasharray="4 3"
          />

          {/* Monolithic Slab (Isometric Cuboid) */}
          <polygon
            points="95,45 135,30 135,160 95,175"
            className="fill-obsidian-subtle/80 stroke-acid stroke-[1.2]"
          />
          <polygon
            points="135,30 155,42 155,172 135,160"
            className="fill-obsidian-border/50 stroke-acid/60 stroke-[1]"
          />
          <polygon
            points="95,45 115,57 155,42 135,30"
            className="fill-obsidian-surface stroke-acid/80 stroke-[1]"
          />

          {/* Intersecting Cantilever Plate */}
          <polygon
            points="55,120 175,85 185,100 65,135"
            className="fill-obsidian-subtle/70 stroke-ivory stroke-[1.2]"
          />
          <polygon
            points="65,135 185,100 185,115 65,150"
            className="fill-obsidian-border/40 stroke-ivory/60 stroke-[1]"
          />

          {/* Crystalline Octahedral Cage Overlaid */}
          <polygon
            points="120,40 180,120 120,200 60,120"
            className="stroke-acid/70 stroke-[0.8]"
          />
          <line x1="60" y1="120" x2="180" y2="120" className="stroke-acid/50 stroke-[0.8]" />
          <line x1="120" y1="40" x2="120" y2="200" className="stroke-acid/50 stroke-[0.8]" />

          {/* Precision Node Markers */}
          <circle cx="120" cy="40" r="2.5" className="fill-acid" />
          <circle cx="180" cy="120" r="2.5" className="fill-acid" />
          <circle cx="120" cy="200" r="2.5" className="fill-acid" />
          <circle cx="60" cy="120" r="2.5" className="fill-acid" />
          <circle cx="120" cy="120" r="3" className="fill-ivory" />
        </svg>

        {/* Center telemetry label */}
        <div className="absolute -bottom-4 font-mono text-[9px] tracking-widest text-ivory-dim uppercase text-center">
          OFFSCRIPT SCULPTURAL BLUEPRINT
        </div>
      </div>
    </div>
  );
}

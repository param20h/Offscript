import React from "react";

export default function CanvasFallback() {
  return (
    <div
      className="w-full h-full min-h-[380px] lg:min-h-[460px] flex items-center justify-center relative overflow-hidden bg-obsidian-surface border border-obsidian-border"
      aria-label="OFFSCRIPT Architectural Grid Visual Fallback"
    >
      {/* Precision coordinate background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />

      {/* Crosshairs & Technical Corner Markers */}
      <div className="absolute top-4 left-4 font-mono text-[9px] text-ivory-dim tracking-widest flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-acid inline-block" />
        COORD: 37.7749 // -122.4194
      </div>
      <div className="absolute top-4 right-4 font-mono text-[9px] text-ivory-dim tracking-widest">
        SYSTEM: ISO_ENGINE_V0
      </div>
      <div className="absolute bottom-4 left-4 font-mono text-[9px] text-ivory-dim tracking-widest">
        RENDER: HARDWARE_ACCELERATED
      </div>
      <div className="absolute bottom-4 right-4 font-mono text-[9px] text-acid tracking-widest">
        STATE: NOMINAL [2026]
      </div>

      {/* Geometric Wireframe Visual Blueprint */}
      <div className="relative z-10 w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
        {/* Outer boundary square with tick marks */}
        <div className="absolute inset-0 border border-obsidian-border" />
        <div className="absolute -inset-1 border border-acid/20" />

        {/* Concentric isometric geometric planes */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full text-ivory/80 stroke-current fill-none stroke-[1]"
        >
          {/* Coordinate axes */}
          <line
            x1="100"
            y1="20"
            x2="100"
            y2="180"
            className="stroke-acid/40"
            strokeDasharray="2 4"
          />
          <line
            x1="20"
            y1="100"
            x2="180"
            y2="100"
            className="stroke-acid/40"
            strokeDasharray="2 4"
          />

          {/* Diamond isometric plane */}
          <polygon
            points="100,30 170,100 100,170 30,100"
            className="stroke-ivory/60"
          />

          {/* Inner tilted cube projection */}
          <polygon
            points="100,50 145,75 145,125 100,150 55,125 55,75"
            className="stroke-acid"
          />
          <line x1="100" y1="100" x2="100" y2="150" className="stroke-acid/80" />
          <line x1="100" y1="100" x2="145" y2="75" className="stroke-acid/80" />
          <line x1="100" y1="100" x2="55" y2="75" className="stroke-acid/80" />

          {/* Precision Nodes */}
          <circle cx="100" cy="50" r="2.5" className="fill-acid" />
          <circle cx="145" cy="75" r="2.5" className="fill-acid" />
          <circle cx="145" cy="125" r="2.5" className="fill-acid" />
          <circle cx="100" cy="150" r="2.5" className="fill-acid" />
          <circle cx="55" cy="125" r="2.5" className="fill-acid" />
          <circle cx="55" cy="75" r="2.5" className="fill-acid" />
          <circle cx="100" cy="100" r="3" className="fill-white" />
        </svg>

        {/* Center telemetry label */}
        <div className="absolute -bottom-6 font-mono text-[10px] tracking-widest text-ivory-dim uppercase text-center">
          OFFSCRIPT SIGNATURE BLUEPRINT
        </div>
      </div>
    </div>
  );
}

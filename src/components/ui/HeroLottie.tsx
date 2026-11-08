"use client";

import React from "react";
import { Lottie } from "lottie-react";

export default function HeroLottie() {
  return (
    <div
      className="relative w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[540px] flex items-center justify-center select-none"
      aria-label="OFFSCRIPT Hero Animation"
    >
      {/* Subtle architectural background grid accent */}
      <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />

      <div className="w-full max-w-[440px] sm:max-w-[500px] lg:max-w-[540px] xl:max-w-[580px] flex items-center justify-center relative z-10">
        <Lottie
          src="/animations/hero-lottie.json"
          autoplay
          loop
          className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
        />
      </div>
    </div>
  );
}

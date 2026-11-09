"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface MotionWrapperProps {
  children: React.ReactNode;
  id?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  blur?: boolean | number;
  className?: string;
  viewportOnce?: boolean;
}

export default function MotionWrapper({
  children,
  id,
  delay = 0,
  duration = 0.65,
  yOffset = 24,
  blur = true,
  className,
  viewportOnce = false,
}: MotionWrapperProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div id={id} className={className}>
        {children}
      </div>
    );
  }

  const blurAmount = typeof blur === "number" ? blur : blur ? 8 : 0;

  return (
    <motion.div
      id={id}
      initial={{
        opacity: 0,
        y: yOffset,
        filter: blurAmount > 0 ? `blur(${blurAmount}px)` : "none",
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      viewport={{ once: viewportOnce, margin: "-40px" }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for snappy, premium feel
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

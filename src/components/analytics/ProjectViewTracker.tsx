"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface ProjectViewTrackerProps {
  slug: string;
  category: string;
}

export default function ProjectViewTracker({ slug, category }: ProjectViewTrackerProps) {
  useEffect(() => {
    trackEvent("project_viewed", { slug, category });
  }, [slug, category]);

  return null;
}

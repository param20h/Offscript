import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { PROJECTS } from "@/content/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/work",
    "/services",
    "/packages",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${SITE_CONFIG.url}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route.startsWith("/privacy") || route.startsWith("/terms") ? ("monthly" as const) : ("weekly" as const),
    priority: route === "" ? 1.0 : route.startsWith("/privacy") || route.startsWith("/terms") ? 0.5 : 0.8,
  }));

  const projectRoutes = PROJECTS.map((p) => ({
    url: `${SITE_CONFIG.url}/work/${p.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...routes, ...projectRoutes];
}

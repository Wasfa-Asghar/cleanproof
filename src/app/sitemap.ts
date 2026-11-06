import type { MetadataRoute } from "next";
import { FEATURE_SLUGS } from "@/lib/marketing/features-content";
import { INDUSTRY_SLUGS } from "@/lib/marketing/industries-content";
import { HELP_SLUGS } from "@/lib/content/help-articles";
import { PUBLIC_LEGAL_PATHS } from "@/lib/marketing/legal-routes";

const BASE = process.env.APP_URL ?? "http://127.0.0.1:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/features",
    "/industries",
    "/pricing",
    "/demo",
    "/how-it-works",
    "/about",
    "/contact",
    "/help",
    "/samples/completion-report",
    "/sample-report",
    ...PUBLIC_LEGAL_PATHS.map((p) => `/${p}`),
    ...FEATURE_SLUGS.map((s) => `/features/${s}`),
    ...INDUSTRY_SLUGS.map((s) => `/industries/${s}`),
    ...HELP_SLUGS.map((s) => `/help/${s}`),
  ];

  return staticPages.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}

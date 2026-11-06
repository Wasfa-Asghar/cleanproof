import type { MetadataRoute } from "next";

const BASE = process.env.APP_URL ?? "http://127.0.0.1:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/app/",
        "/field/",
        "/auth/",
        "/onboarding/",
        "/api/",
        "/dev/",
        "/r/",
        "/billing/",
      ],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}

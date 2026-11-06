import type { NextConfig } from "next";

/** Isolated build output for Playwright (`npm run dev:e2e`) so a normal `next dev` can keep `.next` without dev-lock conflicts. */
const distDir = process.env.CLEANPROOF_E2E_DIST?.trim() || ".next";

const nextConfig: NextConfig = {
  distDir,
  /* config options here */
  async redirects() {
    return [
      { source: "/features/completion", destination: "/features/cleaning-checklists", permanent: true },
      { source: "/features/inspections", destination: "/features/quality-inspections", permanent: true },
      { source: "/features/complaints", destination: "/features/complaint-management", permanent: true },
      { source: "/industries/end-of-tenancy", destination: "/industries/end-of-tenancy-cleaning", permanent: true },
      { source: "/industries/residential", destination: "/industries/residential-cleaning", permanent: true },
    ];
  },
  async rewrites() {
    return [{ source: "/sample-report", destination: "/samples/completion-report" }];
  },
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  serverExternalPackages: ["@electric-sql/pglite", "drizzle-orm", "postgres"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

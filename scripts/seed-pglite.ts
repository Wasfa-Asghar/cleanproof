/**
 * Seed demo organisation into the same persistent PGlite DB used by `npm run dev:pglite`.
 * Idempotent: skips if demo owner already exists.
 */
process.env.CLEANPROOF_DEV_PGLITE = "true";
process.env.USE_PGLITE = "true";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://cleanproof:dev@127.0.0.1:5432/cleanproof_dev";
process.env.AUTH_SECRET = process.env.AUTH_SECRET ?? "dev-auth-secret-minimum-32-characters!!";
process.env.ALLOW_DEMO_MODE = process.env.ALLOW_DEMO_MODE ?? "true";

import path from "path";
import { migrate } from "drizzle-orm/pglite/migrator";
import { getDb, closeDb } from "@/db";
import { seedDemoOrganisation } from "./seed-demo";

async function main() {
  const db = getDb();
  await migrate(db as never, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  await seedDemoOrganisation();
  console.log("PGlite demo seed complete (.data/pglite)");
  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

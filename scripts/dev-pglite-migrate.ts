/**
 * Development-only: migrate persistent PGlite under .data/pglite
 * Run: CLEANPROOF_DEV_PGLITE=true USE_PGLITE=true tsx scripts/dev-pglite-migrate.ts
 */
process.env.CLEANPROOF_DEV_PGLITE = "true";
process.env.USE_PGLITE = "true";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://cleanproof:dev@127.0.0.1:5432/cleanproof";
process.env.AUTH_SECRET = process.env.AUTH_SECRET ?? "dev-auth-secret-minimum-32-characters!!";

import path from "path";
import { migrate } from "drizzle-orm/pglite/migrator";
import { getDb, closeDb } from "@/db";

async function main() {
  const db = getDb();
  await migrate(db as never, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  console.log("PGlite migrations applied (.data/pglite)");
  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

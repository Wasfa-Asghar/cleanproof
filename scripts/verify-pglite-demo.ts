/** Verify demo users exist in dev PGlite (same path as dev:pglite). */
process.env.CLEANPROOF_DEV_PGLITE = "true";
process.env.USE_PGLITE = "true";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://cleanproof:dev@127.0.0.1:5432/cleanproof_dev";

import { inArray } from "drizzle-orm";
import { getDb, closeDb } from "@/db";
import { users } from "@/db/schema";

const DEMO_EMAILS = [
  "owner@demo.cleanproof.app",
  "manager@demo.cleanproof.app",
  "cleaner@demo.cleanproof.app",
];

async function main() {
  const db = getDb();
  const rows = await db
    .select({ email: users.email })
    .from(users)
    .where(inArray(users.email, DEMO_EMAILS));
  const found = new Set(rows.map((r) => r.email));
  for (const email of DEMO_EMAILS) {
    console.log(found.has(email) ? `OK ${email}` : `MISSING ${email}`);
  }
  if (found.size !== DEMO_EMAILS.length) process.exit(1);
  await closeDb();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

import type { PgliteDatabase } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import path from "path";
import { getDb } from "@/db";
import * as schema from "@/db/schema";

let migrated = false;

export async function ensureMigrated() {
  if (migrated) return;
  if (process.env.USE_PGLITE !== "true") {
    const { migrate: pgMigrate } = await import("drizzle-orm/postgres-js/migrator");
    await pgMigrate(getDb(), { migrationsFolder: path.join(process.cwd(), "drizzle") });
    migrated = true;
    return;
  }
  const db = getDb() as unknown as PgliteDatabase<typeof schema>;
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  migrated = true;
}

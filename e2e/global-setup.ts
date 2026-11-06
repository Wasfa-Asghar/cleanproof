import { existsSync, rmSync } from "fs";
import path from "path";
import { migrate } from "drizzle-orm/pglite/migrator";
import { closeDb, getDb } from "../src/db";
import { seedE2eDatabase } from "../scripts/seed-e2e";

export default async function globalSetup() {
  process.env.CLEANPROOF_DEV_PGLITE = "true";
  process.env.USE_PGLITE = "true";
  process.env.PGLITE_DATA_DIR = `${process.cwd()}/.data/pglite-e2e`;
  if (existsSync(process.env.PGLITE_DATA_DIR)) {
    rmSync(process.env.PGLITE_DATA_DIR, { recursive: true, force: true });
  }
  process.env.DATABASE_URL = "postgresql://cleanproof:e2e@127.0.0.1:5432/cleanproof_e2e";
  process.env.AUTH_SECRET = "e2e-auth-secret-minimum-32-characters!!";
  process.env.ALLOW_DEMO_MODE = "true";
  process.env.APP_URL = "http://127.0.0.1:3099";

  const db = getDb();
  await migrate(db as never, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  await seedE2eDatabase();
  await closeDb();
}

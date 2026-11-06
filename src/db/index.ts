import { existsSync } from "fs";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import postgres from "postgres";
import { getEnv } from "@/lib/env";
import * as schema from "./schema";

function pgliteDataDir(): string {
  const fromEnv = process.env.PGLITE_DATA_DIR;
  if (fromEnv && typeof fromEnv === "string") return fromEnv;
  // Avoid `path.join` here — Turbopack can externalise `path` in ways that break PGlite's fs layer.
  return `${process.cwd()}/.data/pglite`;
}

/** True when the app should use persistent local PGlite (dev:pglite), even if .env.local points at Postgres. */
export function shouldUsePglite(): boolean {
  if (process.env.CLEANPROOF_DEPLOYMENT === "production") return false;
  if (process.env.USE_PGLITE === "true" || process.env.CLEANPROOF_DEV_PGLITE === "true") return true;
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.USE_PGLITE === "false" || process.env.CLEANPROOF_FORCE_POSTGRES === "true") return false;
  if (process.env.NODE_ENV === "test") return process.env.USE_PGLITE !== "false";
  if (process.env.NODE_ENV === "development" && existsSync(pgliteDataDir())) return true;
  return false;
}

type AppDb = ReturnType<typeof drizzlePostgres<typeof schema>>;

interface CleanproofDbGlobal {
  __cleanproofPg?: ReturnType<typeof postgres>;
  __cleanproofPglite?: PGlite;
  __cleanproofDb?: AppDb;
}

const g = globalThis as typeof globalThis & CleanproofDbGlobal;

function createPostgresDb(): AppDb {
  const { DATABASE_URL } = getEnv();
  if (!g.__cleanproofPg) {
    g.__cleanproofPg = postgres(DATABASE_URL, { max: 10, prepare: false });
  }
  return drizzlePostgres(g.__cleanproofPg, { schema });
}

function createPgliteDb(): AppDb {
  if (!g.__cleanproofPglite) {
    g.__cleanproofPglite = new PGlite(pgliteDataDir());
  }
  return drizzlePglite(g.__cleanproofPglite, { schema }) as unknown as AppDb;
}

export function getDb(): AppDb {
  const usePglite = shouldUsePglite();
  if (g.__cleanproofDb) {
    const wrongDriver = (usePglite && g.__cleanproofPg) || (!usePglite && g.__cleanproofPglite);
    if (wrongDriver) {
      g.__cleanproofDb = undefined;
      g.__cleanproofPg = undefined;
      g.__cleanproofPglite = undefined;
    } else {
      return g.__cleanproofDb;
    }
  }
  if (usePglite) {
    g.__cleanproofDb = createPgliteDb();
  } else {
    g.__cleanproofDb = createPostgresDb();
  }
  return g.__cleanproofDb;
}

export async function closeDb() {
  if (g.__cleanproofPg) {
    await g.__cleanproofPg.end({ timeout: 5 });
    g.__cleanproofPg = undefined;
  }
  if (g.__cleanproofPglite) {
    await g.__cleanproofPglite.close();
    g.__cleanproofPglite = undefined;
  }
  g.__cleanproofDb = undefined;
}

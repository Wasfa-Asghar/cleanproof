import { execSync } from "child_process";

process.env.PGLITE_DATA_DIR =
  process.env.PGLITE_DATA_DIR ?? `${process.cwd()}/.data/pglite-e2e`;
process.env.CLEANPROOF_DEV_PGLITE = "true";
process.env.USE_PGLITE = "true";
process.env.APP_URL = process.env.APP_URL ?? "http://127.0.0.1:3099";
process.env.AUTH_SECRET = process.env.AUTH_SECRET ?? "e2e-auth-secret-minimum-32-characters!!";
process.env.ALLOW_DEMO_MODE = "true";

execSync("npx tsx scripts/seed-e2e.ts", { stdio: "inherit", env: process.env });

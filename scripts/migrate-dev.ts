import { execSync } from "child_process";
import { assertSafeDatabaseUrl, parseDatabaseName } from "../src/lib/db/safety";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required.");
  process.exit(2);
}

try {
  assertSafeDatabaseUrl(url, "migrate");
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(2);
}

console.log(`Applying migrations to "${parseDatabaseName(url)}"...`);
execSync("npx drizzle-kit migrate", { stdio: "inherit", env: process.env });

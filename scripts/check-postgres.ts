import { closeDb } from "../src/db";
import { assertSafeDatabaseUrl, parseDatabaseName } from "../src/lib/db/safety";
import { probePostgresConnection } from "../src/lib/db/probe";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("BLOCKED: DATABASE_URL is not set.");
    process.exit(2);
  }
  try {
    assertSafeDatabaseUrl(url, "development");
  } catch (e) {
    console.error("BLOCKED:", e instanceof Error ? e.message : e);
    process.exit(2);
  }
  const ok = await probePostgresConnection(url);
  if (!ok) {
    console.error(`BLOCKED: Cannot connect to PostgreSQL database "${parseDatabaseName(url)}".`);
    process.exit(1);
  }
  console.log(`OK: Connected to PostgreSQL database "${parseDatabaseName(url)}".`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => closeDb());

import { closeDb } from "../src/db";
import { assertSafeDatabaseUrl } from "../src/lib/db/safety";
import { seedDemoOrganisation } from "./seed-demo";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required.");
    process.exit(2);
  }
  assertSafeDatabaseUrl(url, "development");

  const demo = process.argv.includes("--demo");
  if (!demo) {
    console.log("Usage: npm run seed -- --demo   (seeds demo org when ALLOW_DEMO_MODE is intended)");
    process.exit(0);
  }
  if (process.env.ALLOW_DEMO_MODE !== "true" && process.env.NODE_ENV === "production") {
    console.error("Refusing to seed demo data in production.");
    process.exit(1);
  }
  await seedDemoOrganisation();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => closeDb());

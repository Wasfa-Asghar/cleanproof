/**
 * Guards destructive scripts/tests from targeting production-like databases.
 * Does not inspect remote host ownership — operators must use dedicated dev/test URLs.
 */

const PRODUCTION_MARKERS = [
  /prod/i,
  /production/i,
  /live/i,
  /primary/i,
  /replica/i,
];

export type DatabasePurpose = "development" | "test" | "migrate";

export function parseDatabaseName(databaseUrl: string): string {
  try {
    const u = new URL(databaseUrl.replace(/^postgresql:/, "http:"));
    return decodeURIComponent(u.pathname.replace(/^\//, "")).split("?")[0] || "";
  } catch {
    return "";
  }
}

export function isProductionLikeDatabaseUrl(databaseUrl: string): boolean {
  const name = parseDatabaseName(databaseUrl);
  if (!name) return true;
  return PRODUCTION_MARKERS.some((re) => re.test(name) || re.test(databaseUrl));
}

export function assertSafeDatabaseUrl(databaseUrl: string, purpose: DatabasePurpose) {
  if (process.env.CLEANPROOF_DEPLOYMENT === "production") {
    throw new Error(`Refusing ${purpose} operations when CLEANPROOF_DEPLOYMENT=production`);
  }
  if (isProductionLikeDatabaseUrl(databaseUrl)) {
    throw new Error(
      `Refusing ${purpose} on production-like DATABASE_URL (name/host suggests production). Use a dedicated dev/test database (e.g. cleanproof_dev, cleanproof_test).`,
    );
  }
  if (purpose === "test") {
    const name = parseDatabaseName(databaseUrl);
    const looksLikeTest =
      /test|_test|pglite|local|dev/i.test(name) || process.env.ALLOW_UNSAFE_TEST_DB === "true";
    if (!looksLikeTest) {
      throw new Error(
        `TEST database name "${name}" does not look like a test DB. Use cleanproof_test or set ALLOW_UNSAFE_TEST_DB=true (not for CI).`,
      );
    }
  }
}

import { assertSafeDatabaseUrl, parseDatabaseName } from "@/lib/db/safety";
import { probePostgresConnection } from "@/lib/db/probe";

export function getTestDatabaseUrl(): string | undefined {
  return process.env.TEST_DATABASE_URL?.trim() || undefined;
}

export function assertRealPostgresConfigured() {
  const url = getTestDatabaseUrl();
  if (!url) {
    throw new Error("TEST_DATABASE_URL is not set — real PostgreSQL integration tests skipped");
  }
  assertSafeDatabaseUrl(url, "test");
  return url;
}

export async function describeRealPostgres(): Promise<{ available: boolean; reason: string }> {
  const url = getTestDatabaseUrl();
  if (!url) return { available: false, reason: "TEST_DATABASE_URL not set" };
  try {
    assertSafeDatabaseUrl(url, "test");
  } catch (e) {
    return { available: false, reason: e instanceof Error ? e.message : "unsafe test URL" };
  }
  const ok = await probePostgresConnection(url);
  return ok
    ? { available: true, reason: `connected to ${parseDatabaseName(url)}` }
    : { available: false, reason: "connection failed (host unreachable or credentials invalid)" };
}

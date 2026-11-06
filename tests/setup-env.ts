/** Default: PGlite. Set TEST_DATABASE_URL to run integration tests against real PostgreSQL. */
process.env.USE_PGLITE = process.env.FORCE_PGLITE === "true" || !process.env.TEST_DATABASE_URL ? "true" : "false";
process.env.PGLITE_DATA_DIR =
  process.env.PGLITE_DATA_DIR ?? `${process.cwd()}/.data/pglite-test`;
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgresql://cleanproof:cleanproof@127.0.0.1:5432/cleanproof_test";
process.env.AUTH_SECRET = process.env.AUTH_SECRET ?? "test-auth-secret-minimum-32-chars!!";
process.env.ALLOW_DEMO_MODE = "false";
process.env.APP_URL = process.env.APP_URL ?? "http://localhost:3000";

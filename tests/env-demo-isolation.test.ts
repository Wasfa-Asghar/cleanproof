import { afterEach, describe, expect, it } from "vitest";
import { getEnv, isDemoModeEnabled, resetEnvCacheForTests } from "@/lib/env";

describe("production demo isolation", () => {
  afterEach(() => {
    resetEnvCacheForTests();
  });

  it("isDemoModeEnabled is false when CLEANPROOF_DEPLOYMENT=production even if ALLOW_DEMO_MODE=true", () => {
    process.env.CLEANPROOF_DEPLOYMENT = "production";
    process.env.ALLOW_DEMO_MODE = "true";
    process.env.DATABASE_URL = "postgresql://localhost:5432/cleanproof_dev";
    process.env.AUTH_SECRET = "x".repeat(32);
    expect(isDemoModeEnabled()).toBe(false);
  });

  it("getEnv throws when production deployment enables demo flag", () => {
    process.env.CLEANPROOF_DEPLOYMENT = "production";
    process.env.ALLOW_DEMO_MODE = "true";
    process.env.DATABASE_URL = "postgresql://localhost:5432/cleanproof_dev";
    process.env.AUTH_SECRET = "x".repeat(32);
    expect(() => getEnv()).toThrow(/ALLOW_DEMO_MODE cannot be enabled/);
  });
});

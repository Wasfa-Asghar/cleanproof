import { describe, expect, it, vi } from "vitest";
import { isMockBillingAllowed, isBillingDevProcessorAllowed } from "@/lib/billing/guards";
import { shouldUsePglite } from "@/db/index";
import { isDemoModeEnabled, resetEnvCacheForTests } from "@/lib/env";

describe("phase 6.1 production guards", () => {
  it("blocks PGlite, mock billing, demo mode on CLEANPROOF_DEPLOYMENT=production", () => {
    vi.stubEnv("CLEANPROOF_DEPLOYMENT", "production");
    vi.stubEnv("USE_PGLITE", "true");
    vi.stubEnv("CLEANPROOF_DEV_PGLITE", "true");
    vi.stubEnv("ALLOW_DEMO_MODE", "true");
    resetEnvCacheForTests();
    expect(shouldUsePglite()).toBe(false);
    expect(isMockBillingAllowed()).toBe(false);
    expect(isBillingDevProcessorAllowed()).toBe(false);
    expect(isDemoModeEnabled()).toBe(false);
    vi.unstubAllEnvs();
    resetEnvCacheForTests();
  });

  it("does not auto-enable PGlite from disk when NODE_ENV=production without explicit flags", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CLEANPROOF_DEPLOYMENT", undefined);
    vi.stubEnv("USE_PGLITE", undefined);
    vi.stubEnv("CLEANPROOF_DEV_PGLITE", undefined);
    expect(shouldUsePglite()).toBe(false);
    vi.unstubAllEnvs();
  });

  it("allows isolated E2E PGlite when explicitly flagged under CI NODE_ENV", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("USE_PGLITE", "true");
    vi.stubEnv("PGLITE_DATA_DIR", ".data/pglite-e2e");
    expect(shouldUsePglite()).toBe(true);
    expect(isMockBillingAllowed()).toBe(true);
    vi.unstubAllEnvs();
  });

  it("mock billing stays disabled on production deployment even with PGlite flags", () => {
    vi.stubEnv("CLEANPROOF_DEPLOYMENT", "production");
    vi.stubEnv("USE_PGLITE", "true");
    expect(isMockBillingAllowed()).toBe(false);
    vi.unstubAllEnvs();
  });
});

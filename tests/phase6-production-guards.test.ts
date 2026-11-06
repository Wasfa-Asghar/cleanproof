import { describe, expect, it, vi } from "vitest";
import { isMockBillingAllowed, isBillingDevProcessorAllowed } from "@/lib/billing/guards";
import { shouldUsePglite } from "@/db/index";

describe("phase 6 production guards", () => {
  it("disables mock billing in production deployment", () => {
    vi.stubEnv("CLEANPROOF_DEPLOYMENT", "production");
    vi.stubEnv("NODE_ENV", "production");
    expect(isMockBillingAllowed()).toBe(false);
    expect(isBillingDevProcessorAllowed()).toBe(false);
    vi.unstubAllEnvs();
  });

  it("never auto-selects PGlite in production deployment", () => {
    vi.stubEnv("CLEANPROOF_DEPLOYMENT", "production");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("USE_PGLITE", "true");
    expect(shouldUsePglite()).toBe(false);
    vi.unstubAllEnvs();
  });

  it("honours explicit PGlite flags under CI NODE_ENV=production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("USE_PGLITE", "true");
    vi.stubEnv("CLEANPROOF_DEPLOYMENT", undefined);
    expect(shouldUsePglite()).toBe(true);
    vi.unstubAllEnvs();
  });
});

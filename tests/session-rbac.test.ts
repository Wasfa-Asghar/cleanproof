import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { requireValidSession } from "@/lib/auth/rbac";
import { createMinimalOrg, truncateAll } from "./helpers/fixtures";
import { ensureMigrated } from "./helpers/migrate";

describe("session RBAC", () => {
  beforeAll(async () => {
    const { getEnv } = await import("@/lib/env");
    getEnv();
    await ensureMigrated();
  });

  beforeEach(async () => {
    await truncateAll();
  });

  afterEach(async () => {
    await truncateAll();
  });

  it("rejects tampered role in session JWT payload", async () => {
    const fixture = await createMinimalOrg("Tamper");
    await expect(
      requireValidSession({
        userId: fixture.owner.id,
        organizationId: fixture.org.id,
        role: "owner",
      }),
    ).resolves.toMatchObject({ role: "owner" });

    await expect(
      requireValidSession({
        userId: fixture.owner.id,
        organizationId: fixture.org.id,
        role: "manager",
      }),
    ).rejects.toThrow();
  });
});

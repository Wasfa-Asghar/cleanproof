import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { validateImageMagicBytes } from "@/lib/evidence/constants";
import {
  getEvidenceFileForSession,
  initEvidenceUpload,
  completeEvidenceUpload,
} from "@/lib/evidence/service";
import { submitJobChecklistPayload } from "@/lib/jobs/submit-payload";
import type { SessionPayload } from "@/lib/auth/session";
import { MIN_JPEG } from "./helpers/evidence";
import { createMinimalOrg, truncateAll } from "./helpers/fixtures";
import { ensureMigrated } from "./helpers/migrate";

describe("phase 2 evidence", () => {
  beforeAll(async () => {
    const { getEnv } = await import("@/lib/env");
    getEnv();
    await ensureMigrated();
  });

  beforeEach(async () => {
    await truncateAll();
  });

  it("validates jpeg magic bytes", () => {
    expect(validateImageMagicBytes(MIN_JPEG, "image/jpeg")).toBe(true);
    expect(validateImageMagicBytes(Buffer.from([0, 0, 0]), "image/jpeg")).toBe(false);
  });

  it("deduplicates uploads by content hash for the same job", async () => {
    const fixture = await createMinimalOrg("Photo");
    const session: SessionPayload = {
      userId: fixture.cleaner.id,
      organizationId: fixture.org.id,
      role: "cleaner",
    };
    const init1 = await initEvidenceUpload({
      session,
      jobId: fixture.job.id,
      kind: "before",
      mimeType: "image/jpeg",
      sizeBytes: MIN_JPEG.length,
      contentHash: "abc123hash",
    });
    await completeEvidenceUpload({ session, evidenceId: init1.evidenceId, body: MIN_JPEG });
    const init2 = await initEvidenceUpload({
      session,
      jobId: fixture.job.id,
      kind: "before",
      mimeType: "image/jpeg",
      sizeBytes: MIN_JPEG.length,
      contentHash: "abc123hash",
    });
    expect(init2.duplicate).toBe(true);
  });

  it("rejects submit without before/after photos", async () => {
    const fixture = await createMinimalOrg("Submit");
    const session: SessionPayload = {
      userId: fixture.cleaner.id,
      organizationId: fixture.org.id,
      role: "cleaner",
    };
    await expect(
      submitJobChecklistPayload(session, {
        jobId: fixture.job.id,
        idempotencyKey: "key-1",
        items: [],
      }),
    ).rejects.toThrow();
  });

  it("blocks cross-organisation evidence file access", async () => {
    const orgA = await createMinimalOrg("OrgA");
    const orgB = await createMinimalOrg("OrgB");
    const sessionA: SessionPayload = {
      userId: orgA.cleaner.id,
      organizationId: orgA.org.id,
      role: "cleaner",
    };
    const init = await initEvidenceUpload({
      session: sessionA,
      jobId: orgA.job.id,
      kind: "before",
      mimeType: "image/jpeg",
      sizeBytes: MIN_JPEG.length,
      contentHash: "org-a-only",
    });
    await completeEvidenceUpload({ session: sessionA, evidenceId: init.evidenceId, body: MIN_JPEG });

    const sessionB: SessionPayload = {
      userId: orgB.owner.id,
      organizationId: orgB.org.id,
      role: "owner",
    };
    await expect(getEvidenceFileForSession(sessionB, init.evidenceId)).rejects.toThrow();
  });

  it("accepts idempotent duplicate submission keys", async () => {
    const fixture = await createMinimalOrg("Idem");
    const session: SessionPayload = {
      userId: fixture.cleaner.id,
      organizationId: fixture.org.id,
      role: "cleaner",
    };

    for (const kind of ["before", "after"] as const) {
      const init = await initEvidenceUpload({
        session,
        jobId: fixture.job.id,
        kind,
        mimeType: "image/jpeg",
        sizeBytes: MIN_JPEG.length,
        contentHash: `${kind}-hash`,
      });
      await completeEvidenceUpload({ session, evidenceId: init.evidenceId, body: MIN_JPEG });
    }

    const payload = {
      jobId: fixture.job.id,
      idempotencyKey: "same-key",
      items: [] as Array<{ itemId: string; result: "pass" }>,
    };
    const first = await submitJobChecklistPayload(session, payload);
    expect(first.duplicate).toBe(false);
    const second = await submitJobChecklistPayload(session, payload);
    expect(second.duplicate).toBe(true);
  });
});

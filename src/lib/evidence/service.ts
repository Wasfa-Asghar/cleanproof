import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { evidence } from "@/db/schema";
import type { SessionPayload } from "@/lib/auth/session";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { getJobForSession } from "@/lib/db/queries";
import { buildObjectKey, getStorageAdapter } from "@/lib/storage";
import type { EvidenceKind } from "@/lib/storage/types";
import {
  ALLOWED_EVIDENCE_MIMES,
  MAX_EVIDENCE_BYTES,
  extensionForMime,
  validateImageMagicBytes,
} from "./constants";

export async function initEvidenceUpload(input: {
  session: SessionPayload;
  jobId: string;
  itemId?: string;
  kind: EvidenceKind;
  mimeType: string;
  sizeBytes: number;
  contentHash?: string;
}) {
  if (!ALLOWED_EVIDENCE_MIMES.has(input.mimeType)) {
    throw new ForbiddenError("Unsupported file type");
  }
  if (input.sizeBytes <= 0 || input.sizeBytes > MAX_EVIDENCE_BYTES) {
    throw new ForbiddenError("File size not allowed");
  }

  const bundle = await getJobForSession(input.jobId, input.session);
  if (!bundle) throw new NotFoundError();
  if (!["assigned", "in_progress"].includes(bundle.job.status)) {
    throw new ForbiddenError("Job is not open for uploads");
  }

  const db = getDb();

  if (input.contentHash) {
    const hashMatch = and(
      eq(evidence.jobId, input.jobId),
      eq(evidence.contentHash, input.contentHash),
      eq(evidence.kind, input.kind),
      input.itemId ? eq(evidence.itemId, input.itemId) : isNull(evidence.itemId),
    );
    const [existing] = await db.select().from(evidence).where(hashMatch).limit(1);
    if (existing) {
      return { evidenceId: existing.id, duplicate: true as const, uploadUrl: `/api/evidence/upload` };
    }
  }

  const ext = extensionForMime(input.mimeType);
  const [row] = await db
    .insert(evidence)
    .values({
      organizationId: input.session.organizationId,
      jobId: input.jobId,
      itemId: input.itemId ?? null,
      kind: input.kind,
      objectKey: "pending",
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      contentHash: input.contentHash ?? null,
      scanState: "pending",
      uploadedBy: input.session.userId,
    })
    .returning();

  const objectKey = buildObjectKey({
    organizationId: input.session.organizationId,
    jobId: input.jobId,
    evidenceId: row.id,
    extension: ext,
  });

  await db.update(evidence).set({ objectKey }).where(eq(evidence.id, row.id));

  return { evidenceId: row.id, duplicate: false as const, uploadUrl: `/api/evidence/upload` };
}

export async function completeEvidenceUpload(input: {
  session: SessionPayload;
  evidenceId: string;
  body: Buffer;
}) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(evidence)
    .where(and(eq(evidence.id, input.evidenceId), eq(evidence.organizationId, input.session.organizationId)))
    .limit(1);
  if (!row) throw new NotFoundError();

  const jobAccess = await getJobForSession(row.jobId, input.session);
  if (!jobAccess) throw new NotFoundError();

  if (!validateImageMagicBytes(input.body, row.mimeType)) {
    throw new ForbiddenError("Invalid image data");
  }
  if (input.body.length > MAX_EVIDENCE_BYTES) {
    throw new ForbiddenError("File too large");
  }

  const storage = getStorageAdapter();
  await storage.putObject(row.objectKey, input.body, row.mimeType);

  await db
    .update(evidence)
    .set({ scanState: "ready", sizeBytes: input.body.length })
    .where(eq(evidence.id, row.id));

  return { evidenceId: row.id, scanState: "ready" as const };
}

export async function getEvidenceFileForSession(session: SessionPayload, evidenceId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(evidence)
    .where(and(eq(evidence.id, evidenceId), eq(evidence.organizationId, session.organizationId)))
    .limit(1);
  if (!row || row.scanState !== "ready") throw new NotFoundError();
  const jobAccess = await getJobForSession(row.jobId, session);
  if (!jobAccess) throw new NotFoundError();
  const storage = getStorageAdapter();
  const obj = await storage.getObject(row.objectKey);
  if (!obj) throw new NotFoundError();
  return { ...obj, mimeType: row.mimeType };
}

export async function getEvidenceFileByObjectKey(session: SessionPayload, objectKey: string) {
  if (!objectKey.startsWith(session.organizationId + "/")) throw new NotFoundError();
  const db = getDb();
  const [row] = await db
    .select()
    .from(evidence)
    .where(and(eq(evidence.objectKey, objectKey), eq(evidence.organizationId, session.organizationId)))
    .limit(1);
  if (!row || row.scanState !== "ready") throw new NotFoundError();
  const jobAccess = await getJobForSession(row.jobId, session);
  if (!jobAccess) throw new NotFoundError();
  const storage = getStorageAdapter();
  const obj = await storage.getObject(objectKey);
  if (!obj) throw new NotFoundError();
  return { body: obj.body, mimeType: row.mimeType };
}

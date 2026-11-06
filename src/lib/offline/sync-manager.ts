"use client";

import {
  deletePendingSubmission,
  deletePendingUpload,
  listPendingSubmissions,
  listPendingUploads,
  putPendingSubmission,
  putPendingUpload,
  type PendingUpload,
} from "./field-db";

async function sha256Hex(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function uploadPendingPhoto(row: PendingUpload): Promise<PendingUpload> {
  const contentHash = row.contentHash || (await sha256Hex(row.blob));
  const initRes = await fetch("/api/evidence/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jobId: row.jobId,
      itemId: row.itemId,
      kind: row.kind,
      mimeType: row.mimeType,
      sizeBytes: row.blob.size,
      contentHash,
    }),
  });
  if (!initRes.ok) throw new Error("init failed");
  const init = (await initRes.json()) as { evidenceId: string; duplicate?: boolean };

  if (!init.duplicate) {
    const up = await fetch(`/api/evidence/upload?evidenceId=${init.evidenceId}`, {
      method: "POST",
      body: row.blob,
    });
    if (!up.ok) throw new Error("upload failed");
  }

  return { ...row, evidenceId: init.evidenceId, status: "ready", contentHash };
}

export async function syncPendingUploads(jobId?: string): Promise<{ synced: number; failed: number }> {
  const rows = await listPendingUploads(jobId);
  let synced = 0;
  let failed = 0;
  for (const row of rows) {
    if (row.status === "ready") continue;
    if (row.status === "failed" && row.retries >= 8) continue;
    try {
      const updated = await uploadPendingPhoto({ ...row, status: "uploading" });
      await deletePendingUpload(row.localId);
      void updated;
      synced += 1;
    } catch (err) {
      failed += 1;
      await putPendingUpload({
        ...row,
        status: "failed",
        retries: row.retries + 1,
        lastError: err instanceof Error ? err.message : "upload error",
      });
    }
  }
  return { synced, failed };
}

export async function syncPendingSubmissions(): Promise<{ synced: number; failed: number }> {
  const rows = await listPendingSubmissions();
  let synced = 0;
  let failed = 0;
  for (const row of rows) {
    if (row.status === "done") continue;
    if (row.status === "failed" && row.retries >= 8) continue;
    try {
      const res = await fetch("/api/jobs/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: row.jobId,
          idempotencyKey: row.idempotencyKey,
          items: row.items,
        }),
      });
      if (!res.ok) throw new Error("submit failed");
      await deletePendingSubmission(row.localId);
      synced += 1;
    } catch (err) {
      failed += 1;
      await putPendingSubmission({
        ...row,
        status: "failed",
        retries: row.retries + 1,
      });
      void err;
    }
  }
  return { synced, failed };
}

export async function syncAll(jobId?: string) {
  const uploads = await syncPendingUploads(jobId);
  const submissions = await syncPendingSubmissions();
  return { uploads, submissions };
}

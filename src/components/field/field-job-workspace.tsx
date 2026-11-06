"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  loadChecklistDraft,
  putPendingSubmission,
  putPendingUpload,
  saveChecklistDraft,
  listPendingUploads,
} from "@/lib/offline/field-db";
import { syncAll } from "@/lib/offline/sync-manager";
import { startJobFormAction } from "@/lib/jobs/form-actions";
import { ALLOWED_EVIDENCE_MIMES, MAX_EVIDENCE_BYTES } from "@/lib/evidence/constants";

type TemplateItem = {
  id: string;
  section: string;
  label: string;
  evidencePolicy: "none" | "optional" | "required";
};

type SyncedEvidenceRef = {
  id: string;
  kind: "before" | "after" | "during";
  itemId?: string;
};

type Props = {
  jobId: string;
  jobStatus: string;
  syncedEvidence?: SyncedEvidenceRef[];
  templateItems: TemplateItem[];
};

type LocalPhoto = {
  previewUrl: string;
  status: "queued" | "uploading" | "synced" | "failed";
  error?: string;
};

function compressImage(file: File, maxDim = 1280): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("canvas unsupported"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) reject(new Error("compress failed"));
          else resolve(blob);
        },
        "image/jpeg",
        0.82,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("invalid image"));
    };
    img.src = url;
  });
}

function subscribeOnline(onStoreChange: () => void) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}


async function sha256Hex(blob: Blob) {
  const buf = await blob.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function photoKey(kind: "before" | "after" | "during", itemId?: string) {
  return itemId ? `${kind}:${itemId}` : kind;
}

export function FieldJobWorkspace({ jobId, jobStatus, syncedEvidence = [], templateItems }: Props) {
  const router = useRouter();
  const online = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, () => true);
  const [syncNote, setSyncNote] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, { result: string; exceptionReason?: string }>>({});
  const [uploadCounts, setUploadCounts] = useState({ pending: 0, ready: 0 });
  const [localPhotos, setLocalPhotos] = useState<Record<string, LocalPhoto>>({});
  const canEdit = useMemo(() => ["assigned", "in_progress"].includes(jobStatus), [jobStatus]);

  const refreshUploadCounts = useCallback(async () => {
    const rows = await listPendingUploads(jobId);
    setUploadCounts({
      pending: rows.filter((r) => r.status !== "ready").length,
      ready: rows.filter((r) => r.status === "ready").length,
    });
  }, [jobId]);

  const runSync = useCallback(async () => {
    const r = await syncAll(jobId);
    if (r.uploads.synced || r.submissions.synced) {
      setSyncNote(`Synced ${r.uploads.synced} photo(s)`);
    }
    await refreshUploadCounts();
    const rows = await listPendingUploads(jobId);
    setLocalPhotos((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        const kind = key.split(":")[0] as "before" | "after" | "during";
        const stillPending = rows.some(
          (row) =>
            row.kind === kind &&
            row.status !== "ready" &&
            (key.includes(":") ? row.itemId === key.split(":")[1] : !row.itemId),
        );
        if (!stillPending && next[key]?.status !== "failed") {
          next[key] = { ...next[key], status: "synced" };
        }
      }
      return next;
    });
    return r;
  }, [jobId, refreshUploadCounts]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const draft = await loadChecklistDraft(jobId);
      if (!cancelled && draft?.items) setAnswers(draft.items);
      const rows = await listPendingUploads(jobId);
      if (!cancelled) {
        setUploadCounts({
          pending: rows.filter((r) => r.status !== "ready").length,
          ready: rows.filter((r) => r.status === "ready").length,
        });
        setLocalPhotos((prev) => {
          const restored: Record<string, LocalPhoto> = { ...prev };
          for (const row of rows) {
            const key = photoKey(row.kind, row.itemId);
            const existing = restored[key];
            if (existing?.status === "uploading") continue;
            restored[key] = {
              previewUrl: URL.createObjectURL(row.blob),
              status: row.status === "ready" ? "synced" : row.status === "failed" ? "failed" : "queued",
              error: row.lastError,
            };
          }
          for (const ev of syncedEvidence) {
            const key = photoKey(ev.kind, ev.itemId);
            const existing = restored[key];
            if (existing?.status === "queued" || existing?.status === "uploading") continue;
            restored[key] = {
              previewUrl: `/api/evidence/file?id=${ev.id}`,
              status: "synced",
            };
          }
          return restored;
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [jobId, syncedEvidence]);

  useEffect(() => {
    if (!canEdit) return;
    const t = setTimeout(() => {
      saveChecklistDraft({ jobId, items: answers, updatedAt: new Date().toISOString() });
    }, 400);
    return () => clearTimeout(t);
  }, [answers, jobId, canEdit]);

  useEffect(() => {
    if (!online) return;
    const timer = window.setTimeout(() => {
      void runSync();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [online, jobId, runSync]);

  useEffect(() => {
    if (!online || uploadCounts.pending === 0) return;
    const timer = setInterval(() => {
      void runSync();
    }, 2500);
    return () => clearInterval(timer);
  }, [online, uploadCounts.pending, runSync]);

  function resolveMimeType(file: File): string {
    if (file.type && ALLOWED_EVIDENCE_MIMES.has(file.type)) return file.type;
    const lower = file.name.toLowerCase();
    if (lower.endsWith(".png")) return "image/png";
    if (lower.endsWith(".webp")) return "image/webp";
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
    return file.type;
  }

  async function queuePhoto(kind: "before" | "after" | "during", itemId: string | undefined, file: File) {
    const key = photoKey(kind, itemId);
    const mimeType = resolveMimeType(file);
    if (!ALLOWED_EVIDENCE_MIMES.has(mimeType)) {
      setLocalPhotos((prev) => ({
        ...prev,
        [key]: { previewUrl: "", status: "failed", error: "Unsupported file type" },
      }));
      setSyncNote("Unsupported file type — use JPEG, PNG, or WebP.");
      return;
    }
    if (file.size > MAX_EVIDENCE_BYTES) {
      setSyncNote("File too large (max 5 MB).");
      setLocalPhotos((prev) => ({
        ...prev,
        [key]: { previewUrl: "", status: "failed", error: "File too large" },
      }));
      return;
    }

    setLocalPhotos((prev) => ({
      ...prev,
      [key]: { previewUrl: URL.createObjectURL(file), status: "uploading" },
    }));

    try {
      const blob = await compressImage(file);
      const contentHash = await sha256Hex(blob);
      await putPendingUpload({
        localId: crypto.randomUUID(),
        jobId,
        itemId,
        kind,
        mimeType: "image/jpeg",
        contentHash,
        blob,
        status: "queued",
        retries: 0,
      });
      await refreshUploadCounts();
      if (online) {
        await runSync();
      } else {
        setLocalPhotos((prev) => ({
          ...prev,
          [key]: { ...prev[key], status: "queued" },
        }));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setSyncNote(msg);
      setLocalPhotos((prev) => ({
        ...prev,
        [key]: { ...prev[key], status: "failed", error: msg },
      }));
    }
  }

  async function handleSubmit() {
    const idempotencyKey = crypto.randomUUID();
    const items = templateItems.map((item) => ({
      itemId: item.id,
      result: (answers[item.id]?.result ?? "pass") as "pass" | "fail" | "na" | "exception",
      exceptionReason: answers[item.id]?.exceptionReason,
    }));

    if (online) {
      await runSync();
      const res = await fetch("/api/jobs/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, idempotencyKey, items }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSyncNote(typeof err.error === "string" ? err.error : "Submit failed");
        return;
      }
      router.push("/field/today");
      return;
    }

    await putPendingSubmission({
      localId: crypto.randomUUID(),
      jobId,
      idempotencyKey,
      items,
      status: "queued",
      retries: 0,
    });
    setSyncNote("Submission queued offline — will sync when online");
  }

  function renderPhotoPreview(kind: "before" | "after", testId: string) {
    const photo = localPhotos[kind];
    if (!photo?.previewUrl) return null;
    return (
      <div className="mt-2 space-y-1" data-testid={testId}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.previewUrl} alt={`${kind} preview`} className="h-24 w-full rounded-lg object-cover" />
        <p className="text-xs text-slate-600" data-testid={`${testId}-status`}>
          {photo.status === "uploading" && "Uploading…"}
          {photo.status === "queued" && "Queued locally"}
          {photo.status === "synced" && "Synced to server"}
          {photo.status === "failed" && (photo.error ?? "Upload failed")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge tone={online ? "success" : "warning"}>{online ? "Online" : "Offline — saving locally"}</Badge>
        {uploadCounts.pending > 0 ? (
          <Badge tone="warning" data-testid="field-pending-uploads">
            {uploadCounts.pending} photo(s) pending upload
          </Badge>
        ) : null}
        {syncNote ? <span className="text-slate-600">{syncNote}</span> : null}
      </div>

      {jobStatus === "assigned" ? (
        <form action={startJobFormAction}>
          <input type="hidden" name="jobId" value={jobId} />
          <Button type="submit" className="w-full">
            Start job
          </Button>
        </form>
      ) : null}

      {canEdit ? (
        <>
          <section className="rounded-lg border border-slate-200 p-3">
            <h2 className="text-sm font-semibold">Before photos</h2>
            <p className="text-xs text-slate-500">Capture site condition before cleaning (required).</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              data-testid="field-upload-before"
              className="mt-2 block w-full text-sm"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void queuePhoto("before", undefined, f);
                e.target.value = "";
              }}
            />
            {renderPhotoPreview("before", "field-preview-before")}
          </section>

          {templateItems.map((item) => (
            <fieldset key={item.id} className="rounded-lg border border-slate-200 p-3">
              <legend className="text-sm font-medium">{item.label}</legend>
              <p className="text-xs text-slate-500">{item.section}</p>
              <select
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={answers[item.id]?.result ?? "pass"}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [item.id]: { ...prev[item.id], result: e.target.value } }))
                }
              >
                <option value="pass">Done</option>
                <option value="fail">Failed</option>
                <option value="na">N/A</option>
                <option value="exception">Exception</option>
              </select>
              <input
                placeholder="Exception reason if needed"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={answers[item.id]?.exceptionReason ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [item.id]: { ...prev[item.id], result: prev[item.id]?.result ?? "pass", exceptionReason: e.target.value },
                  }))
                }
              />
              {item.evidencePolicy !== "none" ? (
                <div className="mt-2">
                  <label className="text-xs text-slate-600">
                    Photo ({item.evidencePolicy})
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="mt-1 block w-full text-sm"
                      onChange={(ev) => {
                        const f = ev.target.files?.[0];
                        if (f) void queuePhoto("during", item.id, f);
                        ev.target.value = "";
                      }}
                    />
                  </label>
                </div>
              ) : null}
            </fieldset>
          ))}

          <section className="rounded-lg border border-slate-200 p-3">
            <h2 className="text-sm font-semibold">After photos</h2>
            <p className="text-xs text-slate-500">Capture completed work (required).</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              data-testid="field-upload-after"
              className="mt-2 block w-full text-sm"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void queuePhoto("after", undefined, f);
                e.target.value = "";
              }}
            />
            {renderPhotoPreview("after", "field-preview-after")}
          </section>

          <Button type="button" className="w-full min-h-11" data-testid="field-submit-job" onClick={() => void handleSubmit()}>
            Submit for review
          </Button>
        </>
      ) : (
        <p className="text-sm text-slate-600">This job is no longer editable in the field app.</p>
      )}
    </div>
  );
}

"use client";

const DB_NAME = "cleanproof-field";
const DB_VERSION = 1;

export type ChecklistDraft = {
  jobId: string;
  items: Record<string, { result: string; exceptionReason?: string }>;
  updatedAt: string;
};

export type PendingUpload = {
  localId: string;
  jobId: string;
  itemId?: string;
  kind: "before" | "after" | "during";
  mimeType: string;
  contentHash: string;
  blob: Blob;
  evidenceId?: string;
  status: "queued" | "uploading" | "ready" | "failed";
  retries: number;
  lastError?: string;
};

export type PendingSubmission = {
  localId: string;
  jobId: string;
  idempotencyKey: string;
  items: Array<{ itemId: string; result: string; exceptionReason?: string }>;
  status: "queued" | "syncing" | "done" | "failed";
  retries: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("checklist_drafts")) {
        db.createObjectStore("checklist_drafts", { keyPath: "jobId" });
      }
      if (!db.objectStoreNames.contains("pending_uploads")) {
        db.createObjectStore("pending_uploads", { keyPath: "localId" });
      }
      if (!db.objectStoreNames.contains("pending_submissions")) {
        db.createObjectStore("pending_submissions", { keyPath: "localId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function txStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

export async function saveChecklistDraft(draft: ChecklistDraft) {
  await txStore("checklist_drafts", "readwrite", (s) => s.put(draft));
}

export async function loadChecklistDraft(jobId: string) {
  return txStore<ChecklistDraft | undefined>("checklist_drafts", "readonly", (s) => s.get(jobId));
}

export async function listPendingUploads(jobId?: string) {
  const all = await txStore<PendingUpload[]>("pending_uploads", "readonly", (s) => s.getAll());
  return jobId ? all.filter((u) => u.jobId === jobId) : all;
}

export async function putPendingUpload(row: PendingUpload) {
  await txStore("pending_uploads", "readwrite", (s) => s.put(row));
}

export async function deletePendingUpload(localId: string) {
  await txStore("pending_uploads", "readwrite", (s) => s.delete(localId));
}

export async function putPendingSubmission(row: PendingSubmission) {
  await txStore("pending_submissions", "readwrite", (s) => s.put(row));
}

export async function listPendingSubmissions() {
  return txStore<PendingSubmission[]>("pending_submissions", "readonly", (s) => s.getAll());
}

export async function deletePendingSubmission(localId: string) {
  await txStore("pending_submissions", "readwrite", (s) => s.delete(localId));
}

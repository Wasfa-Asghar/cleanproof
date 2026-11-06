import type { Page } from "@playwright/test";

export async function countPendingUploads(page: Page, jobId: string): Promise<number> {
  return page.evaluate(async (id) => {
    const db = await new Promise<IDBDatabase | null>((resolve) => {
      const req = indexedDB.open("cleanproof-field", 1);
      req.onupgradeneeded = () => {
        const database = req.result;
        if (!database.objectStoreNames.contains("pending_uploads")) {
          database.createObjectStore("pending_uploads", { keyPath: "localId" });
        }
        if (!database.objectStoreNames.contains("pending_submissions")) {
          database.createObjectStore("pending_submissions", { keyPath: "localId" });
        }
        if (!database.objectStoreNames.contains("checklist_drafts")) {
          database.createObjectStore("checklist_drafts", { keyPath: "jobId" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
    if (!db || !db.objectStoreNames.contains("pending_uploads")) return 0;
    const rows = await new Promise<Array<{ jobId: string; status: string }>>((resolve, reject) => {
      const tx = db.transaction("pending_uploads", "readonly");
      const store = tx.objectStore("pending_uploads");
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as Array<{ jobId: string; status: string }>);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return rows.filter((r) => r.jobId === id && r.status !== "ready").length;
  }, jobId);
}

export async function countPendingSubmissions(page: Page, jobId: string): Promise<number> {
  return page.evaluate(async (id) => {
    const db = await new Promise<IDBDatabase | null>((resolve) => {
      const req = indexedDB.open("cleanproof-field", 1);
      req.onupgradeneeded = () => {
        const database = req.result;
        if (!database.objectStoreNames.contains("pending_uploads")) {
          database.createObjectStore("pending_uploads", { keyPath: "localId" });
        }
        if (!database.objectStoreNames.contains("pending_submissions")) {
          database.createObjectStore("pending_submissions", { keyPath: "localId" });
        }
        if (!database.objectStoreNames.contains("checklist_drafts")) {
          database.createObjectStore("checklist_drafts", { keyPath: "jobId" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
    if (!db || !db.objectStoreNames.contains("pending_submissions")) return 0;
    const rows = await new Promise<Array<{ jobId: string; status: string }>>((resolve, reject) => {
      const tx = db.transaction("pending_submissions", "readonly");
      const store = tx.objectStore("pending_submissions");
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as Array<{ jobId: string; status: string }>);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return rows.filter((r) => r.jobId === id && r.status !== "done").length;
  }, jobId);
}

export async function clearFieldIdb(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase("cleanproof-field");
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => resolve();
    });
  });
}

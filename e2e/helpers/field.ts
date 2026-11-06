import { expect, type Page } from "@playwright/test";
import { fieldPhotoAfterPath, fieldPhotoBeforePath } from "./media";

async function uploadViaFileInput(
  page: Page,
  testId: "field-upload-before" | "field-upload-after",
  filePath: string,
) {
  const jobId = jobIdFromFieldUrl(page);
  await page.getByTestId(testId).setInputFiles(filePath);
  const initRes = await page.waitForResponse(
    (r) => {
      if (!r.url().includes("/api/evidence/init") || r.request().method() !== "POST" || r.status() !== 200) {
        return false;
      }
      const body = r.request().postDataJSON() as { jobId?: string } | null;
      return body?.jobId === jobId;
    },
    { timeout: 90_000 },
  );
  const initJson = (await initRes.json()) as { evidenceId?: string; duplicate?: boolean };
  if (!initJson.duplicate && initJson.evidenceId) {
    await page.waitForResponse(
      (r) =>
        r.url().includes("/api/evidence/upload") &&
        r.url().includes(`evidenceId=${initJson.evidenceId}`) &&
        r.status() === 200,
      { timeout: 90_000 },
    );
  }
  const previewId = testId === "field-upload-before" ? "field-preview-before" : "field-preview-after";
  await expect(page.getByTestId(previewId)).toBeVisible({ timeout: 30_000 });
}

export async function uploadBeforeAfterPhotos(page: Page) {
  await uploadViaFileInput(page, "field-upload-before", fieldPhotoBeforePath());
  await uploadViaFileInput(page, "field-upload-after", fieldPhotoAfterPath());
  await expect(page.getByTestId("field-pending-uploads")).toHaveCount(0, { timeout: 90_000 });
  await expect(page.getByTestId("field-preview-before-status")).toContainText(/Synced to server|Queued locally/i);
  await expect(page.getByTestId("field-preview-after-status")).toContainText(/Synced to server|Queued locally/i);
}

export async function submitFieldJob(page: Page) {
  const jobId = jobIdFromFieldUrl(page);
  await page.getByTestId("field-submit-job").click();
  const res = await page.waitForResponse(
    (r) => {
      if (!r.url().includes("/api/jobs/submit") || r.request().method() !== "POST") return false;
      const body = r.request().postDataJSON() as { jobId?: string } | null;
      return body?.jobId === jobId;
    },
    { timeout: 90_000 },
  );
  if (!res.ok()) {
    const body = await res.json().catch(() => ({}));
    const msg = typeof body.error === "string" ? body.error : `HTTP ${res.status()}`;
    throw new Error(`Field submit failed: ${msg}`);
  }
  await page.waitForURL(/\/field\/today/, { timeout: 30_000 });
}

export function jobIdFromFieldUrl(page: Page): string {
  const jobId = page.url().match(/\/field\/jobs\/([^/?]+)/)?.[1];
  if (!jobId) throw new Error("Not on a field job page");
  return jobId;
}

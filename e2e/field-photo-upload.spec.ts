import { test, expect } from "@playwright/test";
import { loginAsCleaner, loginAsManager, loginAsOwner } from "./helpers/auth";
import { jobIdFromFieldUrl, submitFieldJob, uploadBeforeAfterPhotos } from "./helpers/field";
import { fieldPhotoBeforePath, invalidEvidencePath } from "./helpers/media";

test.describe("Phase 6.1 — Field photo upload (UI)", () => {
  test("file picker upload, reload persistence, supervisor gallery, invalid type rejected", async ({ page }) => {
    await loginAsOwner(page);
    await page.goto("/app/jobs");
    const form = page.locator("form").filter({ hasText: "Create job" });
    await form.locator('input[name="title"]').fill("E2E photo UI job");
    await form.locator('select[name="assignedUserId"]').selectOption({ label: "E2E Cleaner" });
    await form.getByRole("button", { name: "Create & notify assignee" }).click();
    await page.reload();
    await expect(page.getByRole("link", { name: "E2E photo UI job" })).toBeVisible({ timeout: 20_000 });

    await loginAsCleaner(page);
    await page.goto("/field/today");
    await expect(page.getByRole("link", { name: "E2E photo UI job" })).toBeVisible({ timeout: 30_000 });
    await page.getByRole("link", { name: "E2E photo UI job" }).click();
    await page.waitForURL(/\/field\/jobs\//);
    if (await page.getByRole("button", { name: "Start job" }).isVisible()) {
      await page.getByRole("button", { name: "Start job" }).click();
    }

    await page.getByTestId("field-upload-before").setInputFiles(invalidEvidencePath());
    await expect(page.getByText(/Unsupported file type/i)).toBeVisible();

    await uploadBeforeAfterPhotos(page);
    const jobId = jobIdFromFieldUrl(page);

    await page.reload();
    await expect(page.getByTestId("field-preview-before")).toBeVisible();
    await expect(page.getByTestId("field-preview-after")).toBeVisible();

    await page.getByTestId("field-upload-before").setInputFiles(fieldPhotoBeforePath());
    await expect(page.getByTestId("field-preview-before-status")).toContainText(/Synced|Queued|Uploading/i);

    await submitFieldJob(page);

    await loginAsManager(page);
    await page.goto(`/app/jobs/${jobId}`);
    await expect(page.getByRole("main").getByText("Needs review")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByAltText("before evidence")).toBeVisible();
    await expect(page.getByAltText("after evidence")).toBeVisible();
  });
});

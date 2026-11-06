import { test, expect } from "@playwright/test";
import { loginAsCleaner } from "./helpers/auth";
import { jobIdFromFieldUrl, submitFieldJob } from "./helpers/field";
import { countPendingSubmissions, countPendingUploads } from "./helpers/idb";
import { fieldPhotoAfterPath, fieldPhotoBeforePath } from "./helpers/media";

test.describe("Phase 6.1 — Offline IndexedDB sync", () => {
  test("IDB queue is scoped per browser profile (account switch)", async ({ page, browser }) => {
    await loginAsCleaner(page);
    await page.goto("/field/today");
    await page.getByRole("link", { name: "E2E offline job" }).click();
    await page.waitForURL(/\/field\/jobs\//);
    const jobId = jobIdFromFieldUrl(page);

    await page.context().setOffline(true);
    await page.waitForFunction(() => !navigator.onLine);
    await expect(page.getByText(/Offline — saving locally/i)).toBeVisible({ timeout: 30_000 });
    await page.getByTestId("field-upload-before").setInputFiles(fieldPhotoBeforePath());
    await expect(page.getByTestId("field-preview-before-status")).toContainText("Queued locally", {
      timeout: 30_000,
    });
    expect(await countPendingUploads(page, jobId)).toBeGreaterThan(0);

    const ownerCtx = await browser.newContext();
    const ownerPage = await ownerCtx.newPage();
    await ownerPage.goto("/auth/login");
    await ownerPage.getByLabel("Email").fill("owner@e2e.cleanproof.test");
    await ownerPage.getByLabel("Password").fill("E2eTest1234!");
    await ownerPage.getByRole("button", { name: "Sign in" }).click();
    await ownerPage.waitForURL(/\/app\/overview/);
    expect(await countPendingUploads(ownerPage, jobId)).toBe(0);
    await ownerCtx.close();

    await page.context().setOffline(false);
  });

  test("queues evidence offline, persists in IDB, syncs after reconnect without duplicates", async ({
    page,
    context,
  }) => {
    await loginAsCleaner(page);
    await page.goto("/field/today");
    await page.getByRole("link", { name: "E2E offline sync job" }).click();
    await page.waitForURL(/\/field\/jobs\//);
    if (await page.getByRole("button", { name: "Start job" }).isVisible()) {
      await page.getByRole("button", { name: "Start job" }).click();
    }

    const jobId = jobIdFromFieldUrl(page);

    await context.setOffline(true);
    await page.getByTestId("field-upload-before").setInputFiles(fieldPhotoBeforePath());
    await page.getByTestId("field-upload-after").setInputFiles(fieldPhotoAfterPath());
    await expect(page.getByText(/Offline — saving locally/i)).toBeVisible();
    await expect(page.getByTestId("field-preview-before-status")).toContainText("Queued locally");

    expect(await countPendingUploads(page, jobId)).toBeGreaterThanOrEqual(2);

    await context.setOffline(false);
    await expect(page.getByTestId("field-connection-status").filter({ hasText: "Online" })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("field-pending-uploads")).toHaveCount(0, { timeout: 90_000 });
    await expect(page.getByTestId("field-preview-before-status")).toContainText("Synced to server", {
      timeout: 90_000,
    });

    expect(await countPendingUploads(page, jobId)).toBe(0);

    await submitFieldJob(page);
    expect(await countPendingSubmissions(page, jobId)).toBe(0);
  });
});

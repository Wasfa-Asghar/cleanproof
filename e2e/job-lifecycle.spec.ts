import { test, expect } from "@playwright/test";
import { loginAsCleaner, loginAsManager, loginAsOwner } from "./helpers/auth";
import { uploadBeforeAfterPhotos, submitFieldJob } from "./helpers/field";

test.describe.configure({ mode: "serial" });

test.describe("Journey B — Cleaning job lifecycle", () => {
  test("owner setup visibility, cleaner submit, supervisor approve", async ({ page }) => {
    await loginAsOwner(page);
    await page.goto("/app/sites");
    await expect(page.getByText("E2E Client Co")).toBeVisible();
    await expect(page.getByText("E2E Main Site")).toBeVisible();
    await page.goto("/app/templates");
    await expect(page.getByText("E2E checklist")).toBeVisible();
    await page.goto("/app/jobs");
    await expect(page.getByRole("link", { name: "E2E lifecycle job" })).toBeVisible();

    await page.goto("/auth/login");
    await loginAsCleaner(page);
    await page.getByRole("link", { name: "E2E lifecycle job" }).click();
    await page.getByRole("button", { name: "Start job" }).click();
    await expect(page.getByRole("button", { name: "Submit for review" })).toBeVisible();

    await uploadBeforeAfterPhotos(page);
    await submitFieldJob(page);

    await loginAsManager(page);
    await page.goto("/app/jobs");
    await page.getByRole("link", { name: "E2E lifecycle job" }).first().click();
    await page.waitForURL(/\/app\/jobs\/[^/?]+$/);
    await expect(page.getByRole("heading", { name: "E2E lifecycle job" })).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole("button", { name: "Approve" })).toBeVisible({ timeout: 60_000 });
    await page.getByRole("button", { name: "Approve" }).click();
    await page.reload();
    await expect(page.getByText("Approved", { exact: true }).first()).toBeVisible({ timeout: 30_000 });
  });

  test("clarification, resubmit, reject reclean, final approve", async ({ page }) => {
    await loginAsOwner(page);
    await page.goto("/app/jobs");
    const form = page.locator("form").filter({ hasText: "Create job" });
    await form.locator('input[name="title"]').fill("E2E review branches job");
    await form.locator('select[name="assignedUserId"]').selectOption({ label: "E2E Cleaner" });
    await form.getByRole("button", { name: "Create & notify assignee" }).click();
    await expect(page.getByRole("link", { name: "E2E review branches job" })).toBeVisible({ timeout: 30_000 });

    await loginAsCleaner(page);
    await page.goto("/field/today");
    await expect(page.getByRole("link", { name: "E2E review branches job" })).toBeVisible({ timeout: 30_000 });
    await page.getByRole("link", { name: "E2E review branches job" }).click();
    await page.waitForURL(/\/field\/jobs\//);
    await page.getByRole("button", { name: "Start job" }).click();
    await uploadBeforeAfterPhotos(page);
    await submitFieldJob(page);

    await loginAsManager(page);
    await page.goto("/app/jobs");
    await page.getByRole("link", { name: "E2E review branches job" }).first().click();
    await page.getByPlaceholder("What must the cleaner clarify or fix?").fill("Please confirm restroom checklist.");
    await page.getByRole("button", { name: "Send back to cleaner" }).click();
    await page.reload();
    await expect(page.getByText("Please confirm restroom checklist.")).toBeVisible({ timeout: 30_000 });

    await loginAsCleaner(page);
    await page.goto("/field/today");
    await expect(page.getByRole("link", { name: "E2E review branches job" })).toBeVisible({ timeout: 30_000 });
    await page.getByRole("link", { name: "E2E review branches job" }).click();
    await page.waitForURL(/\/field\/jobs\//);
    await uploadBeforeAfterPhotos(page);
    await submitFieldJob(page);

    await loginAsManager(page);
    await page.goto("/app/jobs");
    await page.getByRole("link", { name: "E2E review branches job" }).first().click();
    await page.getByPlaceholder("Reason for rejection").fill("Missed sanitiser — re-clean required.");
    await page.getByRole("button", { name: "Reject & create re-clean" }).click();
    await page.reload();
    await expect(page.getByText("Missed sanitiser — re-clean required.")).toBeVisible({ timeout: 30_000 });
    await page.goto("/app/issues");
    await expect(page.getByRole("heading", { name: /Issues & complaints/i })).toBeVisible();

    await loginAsCleaner(page);
    await page.goto("/field/today");
    const recleanLink = page.getByRole("link", { name: /Re-clean:/i }).first();
    await recleanLink.click();
    await page.waitForURL(/\/field\/jobs\//);
    await page.getByRole("button", { name: "Start job" }).click();
    await uploadBeforeAfterPhotos(page);
    await submitFieldJob(page);

    await loginAsManager(page);
    await page.goto("/app/quality");
    await page.getByRole("link", { name: /Re-clean:/i }).first().click();
    await page.getByRole("button", { name: "Approve" }).click();
    await expect(page.getByText("Approved", { exact: true }).first()).toBeVisible();
  });
});

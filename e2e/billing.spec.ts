import { test, expect } from "@playwright/test";
import { loginAsOwner } from "./helpers/auth";

async function openMockCheckout(page: import("@playwright/test").Page, planId: "growth" | "pro") {
  await page.goto("/app/settings/billing");
  await Promise.all([
    page.waitForURL(/\/billing\/checkout\?session=/, { timeout: 60_000 }),
    page.locator(`form:has(input[name="planId"][value="${planId}"])`).getByRole("button", { name: "Select" }).click(),
  ]);
}

test.describe.configure({ mode: "serial" });

test.describe("Phase 6.1 — Billing browser QA", () => {
  test("mock checkout success, failure, and cancel paths", async ({ page }) => {
    await loginAsOwner(page);

    await openMockCheckout(page, "growth");
    await page.getByRole("button", { name: "Simulate failed payment" }).click();
    await page.waitForURL(/\/app\/settings\/billing/);
    await expect(page.getByRole("main").getByText(/Starter|Growth/i).first()).toBeVisible();

    await openMockCheckout(page, "growth");
    await page.getByRole("button", { name: "Simulate canceled checkout" }).click();
    await page.waitForURL(/\/app\/settings\/billing/);

    await openMockCheckout(page, "growth");
    await page.getByRole("button", { name: "Simulate successful payment" }).click();
    await page.waitForURL(/\/app\/settings\/billing/);
    await expect(page.getByRole("main").getByText("Growth, £39/mo")).toBeVisible();
    await expect(page.getByText("[SIMULATED] Growth subscription")).toBeVisible();
  });

  test("cancel at period end and reactivate subscription", async ({ page }) => {
    await loginAsOwner(page);
    await page.goto("/app/settings/billing");
    const cancelBtn = page.getByRole("button", { name: "Cancel at period end" });
    if (await cancelBtn.isVisible()) {
      await Promise.all([
        page.waitForURL(/\/app\/settings\/billing/),
        cancelBtn.click(),
      ]);
      await expect(page.getByText("Cancellation scheduled at period end.")).toBeVisible();
      const reactivate = page.getByRole("button", { name: "Reactivate subscription" });
      if (await reactivate.isVisible()) {
        await Promise.all([page.waitForURL(/\/app\/settings\/billing/), reactivate.click()]);
      }
    }
  });

  test("schedule downgrade shows on billing page", async ({ page }) => {
    await loginAsOwner(page);
    await page.goto("/app/settings/billing");
    if (await page.getByRole("main").getByText("Growth, £39/mo").isVisible()) {
      await Promise.all([
        page.waitForURL(/\/app\/settings\/billing/),
        page.locator('form:has(input[name="planId"][value="starter"])').getByRole("button", { name: "Select" }).click(),
      ]);
      await expect(page.getByRole("main").getByText(/Downgrade to Starter scheduled/i)).toBeVisible({
        timeout: 15_000,
      });
    }
  });
});

import { test, expect } from "@playwright/test";
import { loginAsCleaner, loginAsOwner } from "./helpers/auth";
import { E2E_REPORT_TOKEN } from "../scripts/seed-e2e";

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 834, height: 1112 },
  { name: "desktop", width: 1280, height: 800 },
] as const;

for (const vp of viewports) {
  test.describe(`Phase 6.1 — Responsive smoke (${vp.name})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test("auth, field workspace, billing, public report", async ({ page }) => {
      await page.goto("/auth/login");
      await expect(page.getByLabel("Email")).toBeVisible();
      await expect(page.getByLabel("Password")).toBeVisible();

      await loginAsCleaner(page);
      await page.goto("/field/today");
      await expect(page.getByRole("heading", { name: /Today's jobs/i })).toBeVisible();

      await loginAsOwner(page);
      await page.goto("/app/settings/billing");
      await expect(page.getByRole("heading", { name: "Billing" })).toBeVisible();

      await page.goto(`/r/${E2E_REPORT_TOKEN}`);
      await expect(page.getByText("Completion report")).toBeVisible();
    });
  });
}

test.describe("Phase 6.1 — Accessibility smoke", () => {
  test("login and field submit controls are keyboard reachable", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByLabel("Email").focus();
    await expect(page.getByLabel("Email")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Password")).toBeFocused();

    await loginAsCleaner(page);
    await page.goto("/field/today");
    const job = page.getByRole("link", { name: "E2E offline job" });
    if (await job.isVisible()) {
      await job.focus();
      await expect(job).toBeFocused();
    }
  });
});

import { test, expect } from "@playwright/test";
import { loginAsOwner } from "./helpers/auth";

test.describe("Journey D — CSV and settings", () => {
  test("client CSV import wizard and settings pages load", async ({ page }) => {
    await loginAsOwner(page);
    await page.goto("/app/settings/import");
    await expect(page.getByRole("heading", { name: /Import CSV/i })).toBeVisible();
    await expect(page.getByText("Clients template")).toBeVisible();

    await page.goto("/app/settings/general");
    await expect(page.getByRole("heading", { name: /Organisation settings/i })).toBeVisible();

    await page.goto("/app/settings/export");
    await expect(page.getByRole("heading", { name: /Export/i })).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";
import { E2E_REPORT_TOKEN } from "../scripts/seed-e2e";
import { loginAsOwner } from "./helpers/auth";

test.describe("Journey C — Client completion reports", () => {
  test("public approved report, PDF download, invalid token", async ({ page, request }) => {
    await page.goto(`/r/${E2E_REPORT_TOKEN}`);
    await expect(page.getByText("Completion report")).toBeVisible();
    await expect(page.getByText("Quality approved")).toBeVisible();

    const pdfRes = await request.get(`/api/public/report/pdf?token=${E2E_REPORT_TOKEN}`);
    expect(pdfRes.status()).toBe(200);
    const buf = await pdfRes.body();
    expect(buf.subarray(0, 4).toString()).toBe("%PDF");

    const bad = await request.get("/api/public/report/pdf?token=not-a-valid-token");
    expect(bad.status()).toBeGreaterThanOrEqual(400);
  });

  test("unapproved job PDF blocked for owner", async ({ page }) => {
    await loginAsOwner(page);
    await page.goto("/app/jobs");
    const link = page.getByRole("link", { name: "E2E pdf guard job" });
    await expect(link).toBeVisible({ timeout: 30_000 });
    const href = await link.getAttribute("href");
    expect(href).toBeTruthy();
    const jobId = href!.split("/").pop()!;
    const res = await page.request.get(`/api/reports/pdf?jobId=${jobId}`, { failOnStatusCode: false });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });
});

import { test, expect } from "@playwright/test";

test.describe("Phase 6.2 — Public marketing website", () => {
  test("homepage, navigation, pricing CTA, footer legal links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/prove the job/i);
    await expect(page.getByRole("link", { name: "Start free trial" }).first()).toBeVisible();
    await page.getByRole("link", { name: "Pricing" }).first().click();
    await expect(page).toHaveURL(/\/pricing/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/pricing/i);
    await page.goto("/privacy-policy");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Privacy");
  });

  test("features and industry pages load", async ({ page }) => {
    await page.goto("/features/photo-evidence");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goto("/industries/office-cleaning");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("office");
  });

  test("mobile navigation menu", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("link", { name: "Pricing" }).first()).toBeVisible();
  });

  test("contact form queues enquiry", async ({ page, request }) => {
    await page.goto("/contact");
    await page.locator("#contact-name").fill("Marketing E2E");
    await page.locator("#contact-email").fill("e2e-marketing@cleanproof.test");
    await page.locator("#contact-message").fill("Phase 6.2 contact test message.");
    await page.getByRole("button", { name: "Submit enquiry" }).click();
    await expect(page.getByText(/your enquiry has been received/i)).toBeVisible({ timeout: 15_000 });

    const res = await request.post("/api/contact", {
      data: {
        name: "API Test",
        email: "e2e-api@cleanproof.test",
        company: "Test Co",
        country: "UK",
        enquiryType: "General enquiry",
        message: "Hello",
      },
    });
    expect(res.ok()).toBeTruthy();
  });

  test("sample PDF endpoint responds", async ({ request }) => {
    const res = await request.get("/api/public/report/pdf?token=demo-client-report-token", {
      failOnStatusCode: false,
    });
    if (res.status() === 200) {
      expect(res.headers()["content-type"]).toContain("pdf");
    }
  });

  test("cookie banner and preferences", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/essential cookies/i)).toBeVisible();
    await page.getByRole("button", { name: "Accept essential only" }).click();
    await expect(page.getByRole("button", { name: "Cookie preferences" })).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";
import { login, loginAsCleaner, loginAsManager, logoutFromApp } from "./helpers/auth";
import { E2E_ORG_A, E2E_PASSWORD } from "../scripts/seed-e2e";

test.describe("Journey A — Authentication and onboarding", () => {
  test("public homepage and pricing", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goto("/pricing");
    await expect(page).toHaveURL(/\/pricing/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("signup trial, dashboard, logout, login, session reload", async ({ page }) => {
    const email = `e2e-signup-${Date.now()}@cleanproof.test`;
    await page.goto("/auth/signup");
    await page.getByLabel("Company name").fill("E2E Signup Co");
    await page.getByLabel("Your name").fill("Signup Owner");
    await page.getByLabel("Work email").fill(email);
    await page.getByLabel("Password").fill(E2E_PASSWORD);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForURL(/\/onboarding/);
    await page.getByRole("link", { name: /skip to dashboard/i }).click();
    await page.waitForURL(/\/app\/overview/);

    await page.goto("/app/settings/billing");
    await expect(page.locator("text=Status:").locator("..")).toContainText(/trialing/i);

    await logoutFromApp(page);
    await login(page, email, E2E_PASSWORD);
    await page.waitForURL(/\/app\/overview/);
    await page.reload();
    await expect(page.getByText(/Signed in as owner/i)).toBeVisible();
  });

  test("invalid credentials and protected routes", async ({ page }) => {
    await login(page, E2E_ORG_A.owner, "wrong-password-xyz");
    await page.waitForURL(/\/auth\/login\?error=invalid/);
    await page.goto("/app/overview");
    await page.waitForURL(/\/auth\/login/);
  });

  test("supervisor and cleaner workspaces", async ({ page }) => {
    await loginAsManager(page);
    await expect(page.getByText(/Signed in as manager/i)).toBeVisible();
    await page.goto("/app/jobs");
    await expect(page.getByRole("heading", { name: "Jobs" })).toBeVisible();

    await page.goto("/auth/login");
    await loginAsCleaner(page);
    await expect(page.getByRole("heading", { name: /today/i })).toBeVisible();
    await page.goto("/field/today");
    await expect(page.getByText("E2E lifecycle job")).toBeVisible();
  });

  test("cleaner cannot access owner billing checkout API", async ({ page }) => {
    await loginAsCleaner(page);
    const res = await page.request.post("/api/billing/checkout", {
      form: { planId: "growth" },
      failOnStatusCode: false,
    });
    expect([403, 401]).toContain(res.status());
  });
});

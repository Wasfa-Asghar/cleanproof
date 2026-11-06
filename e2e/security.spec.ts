import { test, expect } from "@playwright/test";
import { loginAsOwner } from "./helpers/auth";
import { E2E_ORG_B, E2E_PASSWORD } from "../scripts/seed-e2e";

test.describe("Journey F — Tenant billing isolation", () => {
  test("org A session cannot complete org B checkout session", async ({ browser }) => {
    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    await loginAsOwner(pageA);
    await pageA.goto("/app/settings/billing");
    await Promise.all([
      pageA.waitForURL(/checkout\?session=/, { timeout: 60_000 }),
      pageA.locator('form:has(input[name="planId"][value="pro"])').getByRole("button", { name: "Select" }).click(),
    ]);
    const checkoutUrl = pageA.url();
    expect(checkoutUrl).toMatch(/checkout\?session=/);

    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await pageB.goto("/auth/login");
    await pageB.getByLabel("Email").fill(E2E_ORG_B.owner);
    await pageB.getByLabel("Password").fill(E2E_PASSWORD);
    await pageB.getByRole("button", { name: "Sign in" }).click();
    await pageB.waitForURL(/\/app\/overview/);

    await pageB.goto(checkoutUrl);
    await expect(pageB).toHaveURL(/\/app\/settings\/billing/, { timeout: 15_000 });
    await expect(pageB).not.toHaveURL(/checkout\?session=/);

    const sessionRef = new URL(checkoutUrl).searchParams.get("session");
    expect(sessionRef).toBeTruthy();
    const complete = await pageB.request.post("/api/billing/mock/complete", {
      multipart: { session: sessionRef!, outcome: "success" },
      failOnStatusCode: false,
    });
    expect(complete.status()).toBeGreaterThanOrEqual(400);
    await ctxA.close();
    await ctxB.close();
  });
});

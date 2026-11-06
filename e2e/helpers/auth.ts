import type { Page } from "@playwright/test";
import { E2E_ORG_A, E2E_PASSWORD } from "../../scripts/seed-e2e";

export async function login(page: Page, email: string, password = E2E_PASSWORD) {
  await page.context().clearCookies();
  await page.goto("/auth/login");
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase("cleanproof-field");
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => resolve();
    });
  });
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

export async function loginAsOwner(page: Page) {
  await login(page, E2E_ORG_A.owner);
  await page.waitForURL(/\/app\/overview/);
}

export async function loginAsManager(page: Page) {
  await login(page, E2E_ORG_A.manager);
  await page.waitForURL(/\/app\/overview/);
}

export async function loginAsCleaner(page: Page) {
  await login(page, E2E_ORG_A.cleaner);
  await page.waitForURL(/\/field\/today/);
}

export async function logoutFromApp(page: Page) {
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL("/");
}

/**
 * Capture genuine CleanProof UI screenshots for marketing (E2E seed + dev server).
 *
 * Prerequisite: `npm run dev:e2e` on http://127.0.0.1:3099 (isolated .next-e2e, PGLITE e2e DB).
 *
 * Usage:
 *   node scripts/capture-marketing-screenshots.mjs
 *   MARKETING_CAPTURE_URL=http://127.0.0.1:3099 node scripts/capture-marketing-screenshots.mjs
 */
import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const BASE = process.env.MARKETING_CAPTURE_URL ?? "http://127.0.0.1:3099";
const OUT = path.join(process.cwd(), "public/marketing/screenshots");
const BEFORE_FIXTURE = path.join(process.cwd(), "e2e/fixtures/e2e-before.jpg");
const AFTER_FIXTURE = path.join(process.cwd(), "e2e/fixtures/e2e-after.jpg");

/** Must match scripts/seed-e2e.ts */
const E2E_PW = process.env.E2E_CAPTURE_PASSWORD ?? "E2eTest1234!";
const OWNER = "owner@e2e.cleanproof.test";
const MANAGER = "manager@e2e.cleanproof.test";
const CLEANER = "cleaner@e2e.cleanproof.test";

/** @type {import('@playwright/test').ViewportSize} */
const VIEW_DESKTOP = { width: 1280, height: 800 };
/** @type {import('@playwright/test').ViewportSize} */
const VIEW_MOBILE = { width: 390, height: 844 };

/**
 * @param {import('@playwright/test').Page} page
 * @param {[string, string]} creds
 */
async function login(page, [email, password]) {
  await page.goto(`${BASE}/auth/login`, { waitUntil: "networkidle" });
  await page.locator("#auth-email").fill(email);
  await page.locator("#auth-password").fill(password);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith("/auth/login"), { timeout: 45_000 }),
    page.getByRole("button", { name: "Sign in" }).click(),
  ]);
  await page.waitForLoadState("networkidle");
}

/**
 * @param {import('@playwright/test').Browser} browser
 * @param {import('@playwright/test').ViewportSize | null} viewport
 */
async function newPage(browser, viewport) {
  const context = await browser.newContext({ viewport: viewport ?? VIEW_DESKTOP });
  const page = await context.newPage();
  return { context, page };
}

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const errors = [];

try {
  // --- 1. Owner overview ---
  {
    const { context, page } = await newPage(browser, VIEW_DESKTOP);
    try {
      await login(page, [OWNER, E2E_PW]);
      await page.goto(`${BASE}/app/overview`, { waitUntil: "networkidle" });
      await page.locator("main h1").first().waitFor({ state: "visible", timeout: 30_000 });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(OUT, "owner-overview.png"), fullPage: false });
      console.log("captured owner-overview.png");
    } catch (e) {
      errors.push(["owner-overview.png", e]);
      console.error(e);
    }
    await context.close();
  }

  // --- 2. Jobs list ---
  {
    const { context, page } = await newPage(browser, VIEW_DESKTOP);
    try {
      await login(page, [OWNER, E2E_PW]);
      await page.goto(`${BASE}/app/jobs`, { waitUntil: "networkidle" });
      await page.locator("main").getByRole("table").waitFor({ state: "visible", timeout: 30_000 });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(OUT, "jobs-list.png"), fullPage: false });
      console.log("captured jobs-list.png");
    } catch (e) {
      errors.push(["jobs-list.png", e]);
      console.error(e);
    }
    await context.close();
  }

  // --- 3. Job detail (manager — E2E review job: checklist + before/after evidence) ---
  let firstJobPath = "/app/jobs";
  {
    const { context, page } = await newPage(browser, VIEW_DESKTOP);
    try {
      await login(page, [MANAGER, E2E_PW]);
      await page.goto(`${BASE}/app/jobs`, { waitUntil: "networkidle" });
      const link = page.getByRole("link", { name: /E2E review job/ });
      await link.waitFor({ state: "visible", timeout: 30_000 });
      const href = await link.getAttribute("href");
      if (href) firstJobPath = href;
      await link.click();
      await page.waitForURL(/\/app\/jobs\/[^/]+$/, { timeout: 30_000 });
      await page.locator("main").getByRole("heading", { level: 1 }).first().waitFor({ state: "visible" });
      await page.getByRole("heading", { name: "Photo evidence" }).waitFor({ state: "visible", timeout: 30_000 });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(OUT, "job-detail.png"), fullPage: true });
      console.log("captured job-detail.png");
    } catch (e) {
      errors.push(["job-detail.png", e]);
      console.error(e);
    }
    await context.close();
  }

  // --- 3b. Supervisor quality review (same job — review panel + evidence) ---
  {
    const { context, page } = await newPage(browser, VIEW_DESKTOP);
    try {
      await login(page, [MANAGER, E2E_PW]);
      await page.goto(`${BASE}/app/jobs`, { waitUntil: "networkidle" });
      await page.getByRole("link", { name: /E2E review job/ }).click();
      await page.waitForURL(/\/app\/jobs\/[^/]+$/, { timeout: 30_000 });
      await page.getByRole("heading", { name: "Quality review" }).waitFor({ state: "visible", timeout: 30_000 });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(OUT, "supervisor-review.png"), fullPage: true });
      console.log("captured supervisor-review.png");
    } catch (e) {
      errors.push(["supervisor-review.png", e]);
      console.error(e);
    }
    await context.close();
  }

  // --- Quality queue ---
  {
    const { context, page } = await newPage(browser, VIEW_DESKTOP);
    try {
      await login(page, [MANAGER, E2E_PW]);
      await page.goto(`${BASE}/app/quality`, { waitUntil: "networkidle" });
      await page.locator("main h1").filter({ hasText: /quality/i }).waitFor({ state: "visible", timeout: 30_000 });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(OUT, "quality-queue.png"), fullPage: false });
      console.log("captured quality-queue.png");
    } catch (e) {
      errors.push(["quality-queue.png", e]);
      console.error(e);
    }
    await context.close();
  }

  // --- Issues board ---
  {
    const { context, page } = await newPage(browser, VIEW_DESKTOP);
    try {
      await login(page, [MANAGER, E2E_PW]);
      await page.goto(`${BASE}/app/issues`, { waitUntil: "networkidle" });
      await page.locator("main h1").first().waitFor({ state: "visible", timeout: 30_000 });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(OUT, "issues-board.png"), fullPage: false });
      console.log("captured issues-board.png");
    } catch (e) {
      errors.push(["issues-board.png", e]);
      console.error(e);
    }
    await context.close();
  }

  // --- Billing ---
  {
    const { context, page } = await newPage(browser, VIEW_DESKTOP);
    try {
      await login(page, [OWNER, E2E_PW]);
      await page.goto(`${BASE}/app/settings/billing`, { waitUntil: "networkidle" });
      await page.locator("main").getByRole("heading", { name: /billing/i }).waitFor({ state: "visible", timeout: 30_000 });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(OUT, "billing.png"), fullPage: false });
      console.log("captured billing.png");
    } catch (e) {
      errors.push(["billing.png", e]);
      console.error(e);
    }
    await context.close();
  }

  // --- Client report (public) ---
  {
    const { context, page } = await newPage(browser, VIEW_DESKTOP);
    try {
      await page.goto(`${BASE}/r/e2e-client-report-token`, { waitUntil: "networkidle" });
      await page.locator("body").getByText(/completion|report/i).first().waitFor({ state: "visible", timeout: 30_000 });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(OUT, "client-report.png"), fullPage: false });
      console.log("captured client-report.png");
    } catch (e) {
      errors.push(["client-report.png", e]);
      console.error(e);
    }
    await context.close();
  }

  // --- Field: open E2E lifecycle job, start, upload before/after (deterministic fixtures) ---
  async function prepareFieldJob(page) {
    await login(page, [CLEANER, E2E_PW]);
    await page.goto(`${BASE}/field/today`, { waitUntil: "networkidle" });
    const lifecycle = page.getByRole("link", { name: "E2E lifecycle job" });
    await lifecycle.waitFor({ state: "visible", timeout: 30_000 });
    await lifecycle.click();
    await page.waitForURL(/\/field\/jobs\//, { timeout: 30_000 });
    if (await page.getByRole("button", { name: "Start job" }).isVisible()) {
      await page.getByRole("button", { name: "Start job" }).click();
      await page.waitForTimeout(600);
    }
    await page.getByTestId("field-upload-before").setInputFiles(BEFORE_FIXTURE);
    await page.getByTestId("field-upload-after").setInputFiles(AFTER_FIXTURE);
    await page.locator("[data-testid=field-preview-before-status]").filter({ hasText: /Synced|Queued/i }).waitFor({
      state: "visible",
      timeout: 45_000,
    });
    await page.locator("[data-testid=field-preview-after-status]").filter({ hasText: /Synced|Queued/i }).waitFor({
      state: "visible",
      timeout: 45_000,
    });
  }

  // --- 4. Field workspace desktop (checklist + evidence) ---
  {
    const { context, page } = await newPage(browser, VIEW_DESKTOP);
    try {
      await prepareFieldJob(page);
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(OUT, "field-workspace.png"), fullPage: true });
      console.log("captured field-workspace.png");
    } catch (e) {
      errors.push(["field-workspace.png", e]);
      console.error(e);
    }
    await context.close();
  }

  // --- 5. Field checklist (mobile narrow, checklist sections) ---
  {
    const { context, page } = await newPage(browser, VIEW_MOBILE);
    try {
      await prepareFieldJob(page);
      const checklistSection = page.locator("fieldset").filter({ hasText: "Vacuum floors" }).first();
      await checklistSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(OUT, "field-checklist.png"), fullPage: false });
      console.log("captured field-checklist.png");
    } catch (e) {
      errors.push(["field-checklist.png", e]);
      console.error(e);
    }
    await context.close();
  }

  // --- 6. Before/after evidence (mobile, scroll to sections) ---
  {
    const { context, page } = await newPage(browser, VIEW_MOBILE);
    try {
      await prepareFieldJob(page);
      await page.getByRole("heading", { name: "Before photos" }).scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(OUT, "field-evidence.png"), fullPage: true });
      console.log("captured field-evidence.png");
    } catch (e) {
      errors.push(["field-evidence.png", e]);
      console.error(e);
    }
    await context.close();
  }

  // --- 7. Field workspace mobile (viewport 390 - today or job) ---
  {
    const { context, page } = await newPage(browser, VIEW_MOBILE);
    try {
      await login(page, [CLEANER, E2E_PW]);
      await page.goto(`${BASE}/field/today`, { waitUntil: "networkidle" });
      await page.locator("main h1").first().waitFor({ state: "visible" });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(OUT, "field-workspace-mobile.png"), fullPage: false });
      console.log("captured field-workspace-mobile.png");
    } catch (e) {
      errors.push(["field-workspace-mobile.png", e]);
      console.error(e);
    }
    await context.close();
  }
} finally {
  await browser.close();
}

if (errors.length) {
  console.error(`\n${errors.length} screenshot(s) failed.`);
  process.exit(1);
}

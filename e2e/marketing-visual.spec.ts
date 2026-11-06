import { test } from "@playwright/test";
import fs from "fs";
import path from "path";

const OUT = path.join(process.cwd(), "e2e/visual/phase-6-3");

const urls = [
  { name: "home-desktop", path: "/", width: 1440, height: 900 },
  { name: "home-mobile", path: "/", width: 390, height: 844 },
  { name: "features-index", path: "/features", width: 1440, height: 900 },
  { name: "feature-photo-evidence", path: "/features/photo-evidence", width: 1440, height: 900 },
  { name: "industries-index", path: "/industries", width: 1440, height: 900 },
  { name: "industry-office", path: "/industries/office-cleaning", width: 1440, height: 900 },
  { name: "pricing", path: "/pricing", width: 1440, height: 900 },
  { name: "contact", path: "/contact", width: 1440, height: 900 },
  { name: "demo", path: "/demo", width: 1440, height: 900 },
  { name: "about", path: "/about", width: 1440, height: 900 },
  { name: "help", path: "/help", width: 1440, height: 900 },
  { name: "privacy", path: "/privacy-policy", width: 1440, height: 900 },
  { name: "tablet-pricing", path: "/pricing", width: 834, height: 1112 },
];

test.describe("Phase 6.3 — marketing visual captures", () => {
  test("capture key public pages", async ({ page }) => {
    fs.mkdirSync(OUT, { recursive: true });
    for (const u of urls) {
      await page.setViewportSize({ width: u.width, height: u.height });
      await page.goto(u.path);
      await page.waitForLoadState("domcontentloaded");
      await page.screenshot({
        path: path.join(OUT, `${u.name}.png`),
        fullPage: true,
      });
    }
  });
});

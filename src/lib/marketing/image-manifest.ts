/** Marketing imagery, see public/marketing/IMAGE_MANIFEST.json */

export type ProductScreenshot = {
  file: string;
  alt: string;
  caption: string;
  capturedFrom: string;
};

export const PRODUCT_SCREENSHOTS: Record<string, ProductScreenshot> = {
  "owner-overview": {
    file: "/marketing/screenshots/owner-overview.png",
    alt: "CleanProof owner overview dashboard in a web browser",
    caption: "Owner workspace, organisation-level view after sign-in.",
    capturedFrom: "Replace with Playwright capture: npm run dev:e2e then node scripts/capture-marketing-screenshots.mjs (owner session, /app/overview)",
  },
  "jobs-list": {
    file: "/marketing/screenshots/jobs-list.png",
    alt: "CleanProof jobs list showing scheduled and in-progress cleaning visits",
    caption: "Schedule and track cleaning jobs across sites.",
    capturedFrom: "Replace with Playwright capture: node scripts/capture-marketing-screenshots.mjs (owner session, /app/jobs)",
  },
  "job-detail": {
    file: "/marketing/screenshots/job-detail.png",
    alt: "CleanProof job detail with checklist results and evidence thumbnails",
    caption: "Supervisors open a job to review checklist answers and photos.",
    capturedFrom: "Replace with Playwright capture: manager session opens first job from /app/jobs",
  },
  "field-workspace": {
    file: "/marketing/screenshots/field-workspace.png",
    alt: "CleanProof field workspace checklist and photo capture on desktop viewport",
    caption: "Cleaners complete checklists and upload before/after photos.",
    capturedFrom: "Replace with Playwright capture: cleaner session, /field/today then first job link",
  },
  /** Narrow viewport capture of the field workspace */
  "field-workspace-mobile": {
    file: "/marketing/screenshots/field-workspace-mobile.png",
    alt: "CleanProof field workspace on a narrow mobile browser viewport",
    caption: "Same field UI at phone width, no native app install required.",
    capturedFrom: "Replace with Playwright capture: cleaner session, 390×844, /field/today",
  },
  "quality-queue": {
    file: "/marketing/screenshots/quality-queue.png",
    alt: "CleanProof quality review queue listing jobs awaiting supervisor approval",
    caption: "Approve, send back, or reject from one queue.",
    capturedFrom: "Replace with Playwright capture: manager session, /app/quality",
  },
  "issues-board": {
    file: "/marketing/screenshots/issues-board.png",
    alt: "CleanProof issues board showing open quality complaints",
    caption: "Track complaints and link corrective re-clean jobs.",
    capturedFrom: "Replace with Playwright capture: manager session, /app/issues",
  },
  "client-report": {
    file: "/marketing/screenshots/client-report.png",
    alt: "Public CleanProof client completion report opened from a share link",
    caption: "Read-only completion view for approved jobs.",
    capturedFrom: "Replace with Playwright capture: public route /r/e2e-client-report-token (seeded demo token)",
  },
  billing: {
    file: "/marketing/screenshots/billing.png",
    alt: "CleanProof subscription billing page showing plan and usage",
    caption: "Manage plan, usage limits, and subscription status.",
    capturedFrom: "Replace with Playwright capture: owner session, /app/settings/billing",
  },
};

export type ProductScreenshotKey = keyof typeof PRODUCT_SCREENSHOTS;

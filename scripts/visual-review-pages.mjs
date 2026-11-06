/**
 * Routes for automated reference-vs-implementation capture.
 */
import fs from "fs";
import path from "path";

export const DESIGN_REF_SUBDIR = "CleanProof_Design_References/page-previews";

/** @typedef {{ id: string; route: string; referenceFile: string; login?: [string, string]; waitFor?: string }} VisualPage */

/** @type {VisualPage[]} */
export const VISUAL_REVIEW_PAGES = [
  { id: "home", route: "/", referenceFile: "01-home.png" },
  { id: "features", route: "/features", referenceFile: "02-features.png" },
  { id: "feature-photo-evidence", route: "/features/photo-evidence", referenceFile: "03-features-photo-evidence.png" },
  { id: "feature-checklists", route: "/features/cleaning-checklists", referenceFile: "04-features-cleaning-checklists.png" },
  { id: "feature-quality", route: "/features/quality-inspections", referenceFile: "05-features-quality-inspections.png" },
  { id: "feature-reclean", route: "/features/reclean-management", referenceFile: "06-features-reclean-management.png" },
  { id: "feature-complaints", route: "/features/complaint-management", referenceFile: "07-features-complaint-management.png" },
  { id: "feature-client-reports", route: "/features/client-reports", referenceFile: "08-features-client-reports.png" },
  { id: "feature-offline", route: "/features/offline-field-workflow", referenceFile: "09-features-offline-field-workflow.png" },
  { id: "feature-team", route: "/features/team-management", referenceFile: "10-features-team-management.png" },
  { id: "feature-analytics", route: "/features/quality-analytics", referenceFile: "11-features-quality-analytics.png" },
  { id: "industries", route: "/industries", referenceFile: "12-industries.png" },
  { id: "industry-commercial", route: "/industries/commercial-cleaning", referenceFile: "13-industries-commercial-cleaning.png" },
  { id: "industry-office", route: "/industries/office-cleaning", referenceFile: "14-industries-office-cleaning.png" },
  { id: "industry-eot", route: "/industries/end-of-tenancy-cleaning", referenceFile: "15-industries-end-of-tenancy-cleaning.png" },
  { id: "industry-residential", route: "/industries/residential-cleaning", referenceFile: "16-industries-residential-cleaning.png" },
  { id: "how-it-works", route: "/how-it-works", referenceFile: "17-how-it-works.png" },
  { id: "pricing", route: "/pricing", referenceFile: "18-pricing.png" },
  { id: "demo", route: "/demo", referenceFile: "19-demo.png" },
  { id: "sample-report", route: "/sample-report", referenceFile: "20-sample-report.png" },
  { id: "about", route: "/about", referenceFile: "21-about.png" },
  { id: "contact", route: "/contact", referenceFile: "22-contact.png" },
  { id: "help", route: "/help", referenceFile: "23-help.png" },
  { id: "help-getting-started", route: "/help/getting-started", referenceFile: "24-help-getting-started.png" },
  { id: "help-managing-jobs", route: "/help/managing-jobs", referenceFile: "25-help-managing-jobs.png" },
  { id: "help-cleaner", route: "/help/cleaner-mobile-workflow", referenceFile: "26-help-cleaner-mobile-workflow.png" },
  { id: "help-photo", route: "/help/photo-evidence", referenceFile: "27-help-photo-evidence.png" },
  { id: "help-quality", route: "/help/quality-reviews", referenceFile: "28-help-quality-reviews.png" },
  { id: "help-client-reports", route: "/help/client-reports", referenceFile: "29-help-client-reports.png" },
  { id: "help-billing", route: "/help/billing", referenceFile: "30-help-billing.png" },
  { id: "privacy", route: "/privacy-policy", referenceFile: "31-privacy-policy.png" },
  { id: "terms", route: "/terms", referenceFile: "32-terms.png" },
  { id: "cookies", route: "/cookie-policy", referenceFile: "33-cookie-policy.png" },
  { id: "refund", route: "/refund-policy", referenceFile: "34-refund-policy.png" },
  { id: "subscription-terms", route: "/subscription-terms", referenceFile: "35-subscription-terms.png" },
  { id: "acceptable-use", route: "/acceptable-use", referenceFile: "36-acceptable-use.png" },
  { id: "dpa", route: "/data-processing-agreement", referenceFile: "37-data-processing-agreement.png" },
  { id: "security", route: "/security", referenceFile: "38-security.png" },
  { id: "signup", route: "/auth/signup", referenceFile: "39-signup.png" },
  { id: "login", route: "/auth/login", referenceFile: "40-login.png" },
  { id: "reset", route: "/auth/reset", referenceFile: "41-reset-password.png" },
  {
    id: "app-overview",
    route: "/app/overview",
    referenceFile: "42-dashboard.png",
    login: ["owner@e2e.cleanproof.test", process.env.E2E_CAPTURE_PASSWORD ?? "E2eTest1234!"],
    waitFor: "main h1",
  },
  {
    id: "field-mobile",
    route: "/field/today",
    referenceFile: "43-field-mobile.png",
    login: ["cleaner@e2e.cleanproof.test", process.env.E2E_CAPTURE_PASSWORD ?? "E2eTest1234!"],
    waitFor: "main h1",
  },
];

export function resolveDesignRefRoot(cwd = process.cwd()) {
  const a = path.join(cwd, ".design-ref", DESIGN_REF_SUBDIR);
  const b = path.join(cwd, ".design-ref", "page-previews");
  if (fs.existsSync(a)) return a;
  if (fs.existsSync(b)) return b;
  return a;
}

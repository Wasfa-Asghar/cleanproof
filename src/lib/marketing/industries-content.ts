import type { ProductScreenshotKey } from "./image-manifest";

export const INDUSTRY_SLUGS = [
  "commercial-cleaning",
  "office-cleaning",
  "end-of-tenancy-cleaning",
  "residential-cleaning",
] as const;

export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number];

export type LicensedPhotoKey =
  | "commercial-team"
  | "commercial-office-clean"
  | "end-of-tenancy"
  | "residential-clean"
  | "supervisor-inspection";

export type IndustryPageContent = {
  slug: IndustrySlug;
  title: string;
  heroEyebrow: string;
  heroTitle: string;
  heroLead: string;
  metaDescription: string;
  /** `/marketing/photos/<key>.jpg` */
  heroPhotoKey: LicensedPhotoKey;
  heroScreenshotKey: ProductScreenshotKey;
  workflowScreenshotKey: ProductScreenshotKey;
  referencePng: string;
  challenges: string[];
  howCleanProofHelps: string[];
  faq: Array<{ q: string; a: string }>;
};

export const INDUSTRY_PAGES: Record<IndustrySlug, IndustryPageContent> = {
  "commercial-cleaning": {
    slug: "commercial-cleaning",
    title: "Commercial cleaning software",
    heroEyebrow: "Industry / Commercial cleaning",
    heroTitle: "Quality control across every contract.",
    heroLead: "Run multi-site commercial cleaning operations with clear accountability and customer-ready reports.",
    metaDescription:
      "Checklists, photo evidence, supervisor review, and client reports for commercial cleaning operators.",
    heroPhotoKey: "commercial-team",
    heroScreenshotKey: "jobs-list",
    workflowScreenshotKey: "field-workspace-mobile",
    referencePng: "13-industries-commercial-cleaning.png",
    challenges: [
      "Multiple sites with different supervisors and rotating cleaners",
      "Clients asking for proof without wanting full system access",
      "Repeat missed tasks on high-traffic areas",
      "Complaints that lack a linked job history",
    ],
    howCleanProofHelps: [
      "Assign jobs per site with published checklist templates",
      "Require before/after photos on every visit",
      "Route submissions through a supervisor quality queue",
      "Share approved PDF reports via secure links",
    ],
    faq: [
      {
        q: "Is CleanProof a CRM for bidding work?",
        a: "No. CleanProof focuses on job verification, quality, and reporting after work is scheduled.",
      },
    ],
  },
  "office-cleaning": {
    slug: "office-cleaning",
    title: "Office cleaning verification",
    heroEyebrow: "Industry / Office cleaning",
    heroTitle: "Prove the standard of every office clean.",
    heroLead: "Keep recurring office checklists, supervisor reviews and client documentation in one workflow.",
    metaDescription:
      "Recurring office schedules, washroom checks, photo evidence, and completion reports in one system.",
    heroPhotoKey: "commercial-office-clean",
    heroScreenshotKey: "quality-queue",
    workflowScreenshotKey: "client-report",
    referencePng: "14-industries-office-cleaning.png",
    challenges: [
      "Recurring evening or early-morning schedules",
      "Washroom and kitchen standards that must be provable",
      "Facility managers who want reports, not dashboards",
      "Supervisors covering several buildings per week",
    ],
    howCleanProofHelps: [
      "Template checklists for reception, washrooms, and breakout areas",
      "Mobile field flow sized for phone screens",
      "Quality queue to catch incomplete evidence before sign-off",
      "Client reports suitable for facility manager inboxes",
    ],
    faq: [
      {
        q: "Can we run both office and other commercial sites?",
        a: "Yes. Sites and jobs are organised inside one organisation with plan limits on active sites.",
      },
    ],
  },
  "end-of-tenancy-cleaning": {
    slug: "end-of-tenancy-cleaning",
    title: "End of tenancy cleaning",
    heroEyebrow: "Industry / End of tenancy",
    heroTitle: "Every detail documented before handover.",
    heroLead: "Record room-level cleaning tasks, photo evidence and approvals for move-out work.",
    metaDescription:
      "Detailed checklists, before/after photos, and approval workflows for end-of-tenancy and move-out cleans.",
    heroPhotoKey: "end-of-tenancy",
    heroScreenshotKey: "job-detail",
    workflowScreenshotKey: "client-report",
    referencePng: "15-industries-end-of-tenancy-cleaning.png",
    challenges: [
      "Detailed room-by-room expectations",
      "Disputes that hinge on photographic proof",
      "Tight handover windows with multiple contractors",
      "Need for a single PDF pack for agents or landlords",
    ],
    howCleanProofHelps: [
      "Granular checklist templates per property type",
      "Mandatory before/after site photos",
      "Supervisor approval before reports are shared",
      "Downloadable PDF sample available on the marketing site",
    ],
    faq: [
      {
        q: "Does CleanProof manage keys or access codes?",
        a: "Site instructions can hold access notes; physical key tracking is outside product scope.",
      },
    ],
  },
  "residential-cleaning": {
    slug: "residential-cleaning",
    title: "Residential cleaning teams",
    heroEyebrow: "Industry / Residential teams",
    heroTitle: "Consistent home cleaning, even as your team grows.",
    heroLead: "Assign jobs, guide cleaners and respond to customer concerns without scattered messages.",
    metaDescription:
      "Assign cleaners, capture checklists and photos, and resolve quality issues for residential teams.",
    heroPhotoKey: "residential-clean",
    heroScreenshotKey: "field-workspace-mobile",
    workflowScreenshotKey: "issues-board",
    referencePng: "16-industries-residential-cleaning.png",
    challenges: [
      "Smaller teams covering many homes per week",
      "Customers with varying instructions per property",
      "Quality drift when supervision is remote",
      "Need for simple proof when a customer questions a visit",
    ],
    howCleanProofHelps: [
      "Per-job checklists with exception reasons",
      "Cleaner mobile workspace without app store installs",
      "Issue tracking when a customer complains",
      "Share approved reports when clients want documentation",
    ],
    faq: [
      {
        q: "Is residential a good fit for Starter plans?",
        a: "Many small teams start on Starter; compare cleaner, site, and job limits on Pricing.",
      },
    ],
  },
};

export function isIndustrySlug(slug: string): slug is IndustrySlug {
  return (INDUSTRY_SLUGS as readonly string[]).includes(slug);
}

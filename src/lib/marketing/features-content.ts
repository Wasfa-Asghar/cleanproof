import { PRODUCT_SCREENSHOTS } from "./image-manifest";

export type ProductScreenshotKey = keyof typeof PRODUCT_SCREENSHOTS;

export type FeatureHeroLayout = "split_phone" | "split_desktop" | "split_report";

export type FeatureHighlight = {
  glyph: string;
  title: string;
  body: string;
  hrefSlug: FeatureSlug;
};

export type FeaturePageContent = {
  slug: string;
  /** Short label for `<title>` and cards, unchanged for SEO continuity */
  title: string;
  /** Reference-aligned headline (shown as page H1) */
  heroTitle: string;
  heroEyebrow: string;
  /** Hero subcopy, matches reference “lead” (one line); kept truthful vs capabilities */
  heroLead: string;
  metaDescription: string;
  problem: string;
  solution: string;
  workflow: string;
  benefits: string[];
  limitations?: string[];
  relatedSlugs: string[];
  heroLayout: FeatureHeroLayout;
  highlights: readonly FeatureHighlight[];
  /** Shown in the hero panel (reference layout) */
  heroScreenshotKey: ProductScreenshotKey;
  /** Lower “workflow” split panel */
  workflowScreenshotKey: ProductScreenshotKey;
  referencePng: string;
  faq: Array<{ q: string; a: string }>;
};

export const FEATURE_SLUGS = [
  "photo-evidence",
  "cleaning-checklists",
  "quality-inspections",
  "reclean-management",
  "complaint-management",
  "client-reports",
  "offline-field-workflow",
  "team-management",
  "quality-analytics",
] as const;

export type FeatureSlug = (typeof FEATURE_SLUGS)[number];

export const FEATURE_PAGES: Record<FeatureSlug, FeaturePageContent> = {
  "photo-evidence": {
    slug: "photo-evidence",
    title: "Before & after photo evidence",
    heroEyebrow: "Feature / Photo evidence",
    heroTitle: "See the work, not just the status.",
    heroLead: "Keep before-and-after photos attached to the right job, site and checklist.",
    metaDescription:
      "Capture site-level before and after photos on every job. Supervisors review evidence before client reports are shared.",
    problem:
      "Photos scattered across WhatsApp and personal camera rolls are hard to tie to a specific job, site, or checklist. When a client questions a visit, you waste time searching for proof.",
    solution:
      "CleanProof requires site-level before and after photos as part of the field workflow. Images upload to the job record, pass supervisor review, and can appear on approved client reports.",
    workflow:
      "A cleaner opens the assigned job on mobile, captures before photos, completes checklist tasks, then uploads after photos. Supervisors see thumbnails on the job detail page before approving.",
    benefits: [
      "Photos stay linked to the job and organisation",
      "Duplicate detection reduces accidental re-uploads",
      "Approved evidence can flow into PDF client reports",
      "Invalid file types and oversized files are rejected client-side",
    ],
    limitations: [
      "Full browser reload while offline requires a service worker (not yet shipped); cleaners should stay on the job screen until sync completes.",
    ],
    relatedSlugs: ["cleaning-checklists", "quality-inspections", "client-reports"],
    heroLayout: "split_phone",
    highlights: [
      {
        glyph: "▣",
        title: "Before + after capture",
        body: "Photos stay linked to the job and organisation instead of living in chat threads.",
        hrefSlug: "photo-evidence",
      },
      {
        glyph: "▣",
        title: "Evidence gallery",
        body: "Supervisors review thumbnails on the job record before anything is shared externally.",
        hrefSlug: "photo-evidence",
      },
      {
        glyph: "▣",
        title: "Supervisor review",
        body: "Evidence is visible in the quality workflow alongside checklist answers.",
        hrefSlug: "quality-inspections",
      },
    ],
    heroScreenshotKey: "field-workspace-mobile",
    workflowScreenshotKey: "quality-queue",
    referencePng: "03-features-photo-evidence.png",
    faq: [
      {
        q: "Which image formats are supported?",
        a: "JPEG, PNG, and WebP up to 5 MB per file after compression in the field app.",
      },
      {
        q: "Can supervisors see photos before approval?",
        a: "Yes. Job detail and the quality queue show evidence for jobs awaiting review.",
      },
    ],
  },
  "cleaning-checklists": {
    slug: "cleaning-checklists",
    title: "Cleaning checklists",
    heroEyebrow: "Feature / Cleaning checklists",
    heroTitle: "Consistent cleaning starts with a clear checklist.",
    heroLead: "Give every cleaner the right tasks for every site, with a record of completion.",
    metaDescription:
      "Publish checklist templates, assign them to jobs, and capture pass/fail/exception answers from the field.",
    problem:
      "Paper checklists get lost, cannot enforce required tasks, and do not travel with the job record when a client asks what was done.",
    solution:
      "Build reusable checklist templates with sections, required tasks, and optional per-task photo policies. Each job locks to a template version at assignment time.",
    workflow:
      "Owners publish templates. New jobs reference the active version. Cleaners mark each line as done, failed, N/A, or exception, with reasons when needed, then submit for review.",
    benefits: [
      "Template publish history for auditability",
      "Required tasks enforced at submission",
      "Checklist drafts autosave locally while editing",
      "Supervisors see answers alongside evidence",
    ],
    relatedSlugs: ["photo-evidence", "quality-inspections"],
    heroLayout: "split_phone",
    highlights: [
      {
        glyph: "☷",
        title: "Site-specific tasks",
        body: "Templates attach to jobs so the right scope shows for each site visit.",
        hrefSlug: "cleaning-checklists",
      },
      {
        glyph: "☷",
        title: "Task-level notes",
        body: "Exceptions and clarifications stay on the line item, not in a separate message.",
        hrefSlug: "cleaning-checklists",
      },
      {
        glyph: "☷",
        title: "Completed vs skipped",
        body: "Supervisors see pass, fail, N/A, and exception states with reasons when required.",
        hrefSlug: "quality-inspections",
      },
    ],
    heroScreenshotKey: "field-workspace-mobile",
    workflowScreenshotKey: "quality-queue",
    referencePng: "04-features-cleaning-checklists.png",
    faq: [
      {
        q: "Can different sites use different templates?",
        a: "Jobs are created against your published templates per site assignment workflow in the owner dashboard.",
      },
    ],
  },
  "quality-inspections": {
    slug: "quality-inspections",
    title: "Supervisor quality inspections",
    heroEyebrow: "Feature / Quality inspections",
    heroTitle: "Know what passed. Find what needs attention.",
    heroLead: "Review submitted work, compare evidence and approve only when standards are met.",
    metaDescription:
      "Approve completed jobs, send work back for clarification, or reject and trigger a re-clean from the quality queue.",
    problem:
      "Without a central review step, under-documented jobs can reach clients, or supervisors chase cleaners through messages with no audit trail.",
    solution:
      "Submitted jobs land in Needs review. Supervisors approve, request clarification, or reject with reasons. Actions are recorded on the job timeline.",
    workflow:
      "After cleaner submission, managers open the quality queue or job detail, inspect checklist answers and photos, then approve or send back.",
    benefits: [
      "Clear job statuses from assigned through approved",
      "Clarification comments return jobs to cleaners in-app",
      "Rejection can spawn linked re-clean jobs and issues",
    ],
    relatedSlugs: ["reclean-management", "photo-evidence"],
    heroLayout: "split_desktop",
    highlights: [
      {
        glyph: "⬡",
        title: "Review queue",
        body: "Submitted jobs surface in one supervisor-facing queue instead of ad-hoc messages.",
        hrefSlug: "quality-inspections",
      },
      {
        glyph: "⬡",
        title: "Required explanations",
        body: "Send-back and rejection actions capture reasons on the job record.",
        hrefSlug: "quality-inspections",
      },
      {
        glyph: "⬡",
        title: "Approval history",
        body: "Timeline entries show who reviewed and when, useful when clients ask what changed.",
        hrefSlug: "quality-inspections",
      },
    ],
    heroScreenshotKey: "quality-queue",
    workflowScreenshotKey: "field-workspace-mobile",
    referencePng: "05-features-quality-inspections.png",
    faq: [
      {
        q: "Who can approve jobs?",
        a: "Users with manager or owner roles in your organisation can perform review actions.",
      },
    ],
  },
  "reclean-management": {
    slug: "reclean-management",
    title: "Re-clean assignments",
    heroEyebrow: "Feature / Re-clean management",
    heroTitle: "Close the loop on missed work.",
    heroLead: "Turn a failed inspection into a tracked corrective job with a clear owner and evidence.",
    metaDescription:
      "When a job fails review, assign a structured re-clean with fresh checklist completion and evidence.",
    problem:
      "Informal 'go back tomorrow' instructions get forgotten and are impossible to report on later.",
    solution:
      "Rejecting a job can create a linked re-clean assignment with its own field workflow. The original rejection reason stays on record.",
    workflow:
      "Supervisor rejects with a reason → re-clean job appears for the cleaner → second submission goes through review again.",
    benefits: [
      "Linked issue records for complaint tracking",
      "Separate job record for the corrective visit",
      "Quality queue shows re-clean titles clearly",
    ],
    relatedSlugs: ["quality-inspections", "complaint-management"],
    heroLayout: "split_desktop",
    highlights: [
      {
        glyph: "⟳",
        title: "Linked corrective jobs",
        body: "A new visit record carries its own checklist and evidence instead of a vague follow-up note.",
        hrefSlug: "reclean-management",
      },
      {
        glyph: "⟳",
        title: "Fresh evidence",
        body: "Corrective visits capture photos and answers the same way as the original job.",
        hrefSlug: "photo-evidence",
      },
      {
        glyph: "⟳",
        title: "Verified resolution",
        body: "Re-clean submissions return to the quality queue until approved or sent back again.",
        hrefSlug: "quality-inspections",
      },
    ],
    heroScreenshotKey: "quality-queue",
    workflowScreenshotKey: "field-workspace-mobile",
    referencePng: "06-features-reclean-management.png",
    faq: [
      {
        q: "Does the original job stay visible?",
        a: "Yes. The primary job retains rejection history; the re-clean is a separate job linked through your issues workflow.",
      },
    ],
  },
  "complaint-management": {
    slug: "complaint-management",
    title: "Issues & complaints",
    heroEyebrow: "Feature / Complaint management",
    heroTitle: "One place to resolve every customer concern.",
    heroLead: "Connect complaints to specific cleaning jobs, people, deadlines and corrective action.",
    metaDescription:
      "Log quality issues, assign follow-up work, and move statuses from open through resolved.",
    problem:
      "Complaints buried in email threads do not connect to the job, site, or photos that prove what happened.",
    solution:
      "The issues board gives supervisors a shared view of open complaints with statuses, linked jobs, and re-clean assignments.",
    workflow:
      "Create or escalate an issue from review outcomes, assign work, and close the loop when the re-clean passes inspection.",
    benefits: [
      "Kanban-style statuses",
      "Links to jobs and sites in your tenant",
      "Supports operational reporting on repeat problems",
    ],
    relatedSlugs: ["reclean-management", "client-reports"],
    heroLayout: "split_desktop",
    highlights: [
      {
        glyph: "◈",
        title: "Issue categories",
        body: "Structured issue types help your team respond consistently across sites.",
        hrefSlug: "complaint-management",
      },
      {
        glyph: "◈",
        title: "Owner assignment",
        body: "Each issue can have a clear internal owner until it is resolved.",
        hrefSlug: "complaint-management",
      },
      {
        glyph: "◈",
        title: "Customer concerns",
        body: "Link issues to the job record so responses reference evidence, not memory.",
        hrefSlug: "complaint-management",
      },
    ],
    heroScreenshotKey: "issues-board",
    workflowScreenshotKey: "field-workspace-mobile",
    referencePng: "07-features-complaint-management.png",
    faq: [
      {
        q: "Can clients log issues directly?",
        a: "Client-facing intake depends on your process; CleanProof focuses on internal tracking and resolution workflows.",
      },
    ],
  },
  "client-reports": {
    slug: "client-reports",
    title: "Client completion reports",
    heroEyebrow: "Feature / Client reports",
    heroTitle: "Show clients exactly what was done.",
    heroLead: "Publish secure, approved cleaning summaries with photos, checklists and PDF download.",
    metaDescription:
      "Generate PDF reports and expiring share links for approved jobs, without giving clients access to your full dashboard.",
    problem:
      "Clients want proof of service, but granting dashboard access exposes unrelated sites, pricing, and staff data.",
    solution:
      "Approved jobs can publish tokenised report links and downloadable PDFs with checklist summaries and approved imagery.",
    workflow:
      "Supervisor approves → owner generates or shares report link → client opens read-only report → PDF download optional.",
    benefits: [
      "Token-based public URLs without login",
      "PDF export for email archives",
      "Unapproved jobs cannot download internal PDFs",
    ],
    limitations: ["Only approved evidence and statuses appear on client reports."],
    relatedSlugs: ["photo-evidence", "quality-inspections"],
    heroLayout: "split_report",
    highlights: [
      {
        glyph: "▤",
        title: "Shareable link",
        body: "Clients open a read-only completion view without a staff login.",
        hrefSlug: "client-reports",
      },
      {
        glyph: "▤",
        title: "Branded PDFs",
        body: "Download an archive copy for facility managers or internal records.",
        hrefSlug: "client-reports",
      },
      {
        glyph: "▤",
        title: "Revocable access",
        body: "Report links can expire or be revoked from the owner reports area.",
        hrefSlug: "client-reports",
      },
    ],
    heroScreenshotKey: "client-report",
    workflowScreenshotKey: "field-workspace-mobile",
    referencePng: "08-features-client-reports.png",
    faq: [
      {
        q: "Can I revoke a report link?",
        a: "Report sharing supports expiry and revocation from the owner reports area.",
      },
    ],
  },
  "offline-field-workflow": {
    slug: "offline-field-workflow",
    title: "Offline field workflow",
    heroEyebrow: "Feature / Offline field workflow",
    heroTitle: "Keep work moving when the signal drops.",
    heroLead: "Queue checklist changes and photos locally, then sync them when connectivity returns.",
    metaDescription:
      "Queue checklist edits and photo uploads locally, then sync when the device is back online.",
    problem:
      "Basements, large facilities, and rural sites often have weak signal. Losing progress frustrates cleaners and creates gaps in evidence.",
    solution:
      "The field workspace stores pending uploads and submissions in IndexedDB, shows offline status, and syncs automatically when online.",
    workflow:
      "Cleaner goes offline → completes checklist and selects photos → items queue locally → connectivity returns → sync uploads and submit.",
    benefits: [
      "Pending operations scoped per browser profile",
      "Automatic retry with backoff for failed uploads",
      "Supervisors only see data after successful server sync",
    ],
    limitations: [
      "Full page reload while offline is not supported without a service worker; cleaners should reopen the job from Today when possible.",
    ],
    relatedSlugs: ["photo-evidence", "cleaning-checklists"],
    heroLayout: "split_phone",
    highlights: [
      {
        glyph: "◌",
        title: "Offline queue",
        body: "Checklist answers and selected photos wait locally until the device can reach the server.",
        hrefSlug: "offline-field-workflow",
      },
      {
        glyph: "◌",
        title: "Reconnect sync",
        body: "Pending uploads retry with backoff when connectivity returns.",
        hrefSlug: "offline-field-workflow",
      },
      {
        glyph: "◌",
        title: "Upload status",
        body: "Cleaners can see which items are still pending before submitting for review.",
        hrefSlug: "offline-field-workflow",
      },
    ],
    heroScreenshotKey: "field-workspace-mobile",
    workflowScreenshotKey: "quality-queue",
    referencePng: "09-features-offline-field-workflow.png",
    faq: [
      {
        q: "Is offline mode a native mobile app?",
        a: "CleanProof runs in the mobile browser. No separate app install is required.",
      },
    ],
  },
  "team-management": {
    slug: "team-management",
    title: "Team & roles",
    heroEyebrow: "Feature / Team management",
    heroTitle: "The right people. The right work.",
    heroLead: "Manage cleaners and supervisors with role-based access and clear job assignments.",
    metaDescription:
      "Owners, managers, and cleaners see purpose-built workspaces with organisation-scoped data.",
    problem:
      "Sharing one login or over-permissioning cleaners creates data leaks and billing confusion.",
    solution:
      "Role-based access separates owner billing and setup, supervisor review tools, and cleaner field interfaces, all tenant isolated.",
    workflow:
      "Owner invites team members → assigns roles → cleaners see only their jobs in /field → managers review in /app.",
    benefits: [
      "Organisation-scoped queries on every API route",
      "Separate field and office navigation",
      "Usage limits tied to plan catalog",
    ],
    relatedSlugs: ["quality-inspections", "quality-analytics"],
    heroLayout: "split_desktop",
    highlights: [
      {
        glyph: "♧",
        title: "Team assignments",
        body: "Jobs are routed to the cleaners and supervisors on your account, scoped per organisation.",
        hrefSlug: "team-management",
      },
      {
        glyph: "♧",
        title: "Role permissions",
        body: "Owners, managers, and cleaners see different navigation and actions by design.",
        hrefSlug: "team-management",
      },
      {
        glyph: "♧",
        title: "Site responsibility",
        body: "Sites and jobs stay inside your tenant boundary on every API route.",
        hrefSlug: "team-management",
      },
    ],
    heroScreenshotKey: "owner-overview",
    workflowScreenshotKey: "field-workspace-mobile",
    referencePng: "10-features-team-management.png",
    faq: [
      {
        q: "How many cleaners can I add?",
        a: "Active cleaner limits depend on your subscription plan. See live limits on the billing page.",
      },
    ],
  },
  "quality-analytics": {
    slug: "quality-analytics",
    title: "Quality analytics",
    heroEyebrow: "Feature / Quality analytics",
    heroTitle: "Find recurring issues before they become complaints.",
    heroLead: "Track approvals, re-cleans, quality trends and unresolved work across sites.",
    metaDescription:
      "Analytics views summarise operational activity for owners, built on the same job and issue records your team creates daily.",
    problem:
      "Spreadsheets exported once a month cannot tell you which sites generate repeat complaints this week.",
    solution:
      "The analytics area aggregates job and quality signals from your live data, without fabricating industry benchmarks.",
    workflow:
      "Team completes jobs and issues normally → owners open Analytics for period summaries and trends.",
    benefits: [
      "Uses real tenant data you already capture",
      "Complements, not replaces, supervisor review",
      "Higher plans include expanded analytics features per catalog",
    ],
    limitations: ["Analytics depth varies by plan; see Pricing for feature lists."],
    relatedSlugs: ["complaint-management", "team-management"],
    heroLayout: "split_desktop",
    highlights: [
      {
        glyph: "▥",
        title: "Approval rate",
        body: "Summaries reflect jobs your team actually submits and approves, your data only.",
        hrefSlug: "quality-analytics",
      },
      {
        glyph: "▥",
        title: "Re-clean trends",
        body: "See where corrective visits concentrate without inventing external benchmarks.",
        hrefSlug: "reclean-management",
      },
      {
        glyph: "▥",
        title: "Overdue issues",
        body: "Open issues stay visible until someone resolves or re-assigns them.",
        hrefSlug: "complaint-management",
      },
    ],
    heroScreenshotKey: "owner-overview",
    workflowScreenshotKey: "field-workspace-mobile",
    referencePng: "11-features-quality-analytics.png",
    faq: [
      {
        q: "Do you benchmark against other companies?",
        a: "No. Analytics reflect your organisation only.",
      },
    ],
  },
};

const WORKFLOW_SCENARIO = {
  title: "Riverside Office · Evening clean",
  body: "A fictional demo walk-through, the same story as the interactive demo: checklist completion, evidence, supervisor review, and an approved client report.",
  checks: [
    "Cleaner assignment",
    "Checklist and photographs",
    "Review and corrective action",
    "Approved client report",
  ] as const,
};

export function getFeatureWorkflowScenario() {
  return WORKFLOW_SCENARIO;
}

export function isFeatureSlug(slug: string): slug is FeatureSlug {
  return (FEATURE_SLUGS as readonly string[]).includes(slug);
}

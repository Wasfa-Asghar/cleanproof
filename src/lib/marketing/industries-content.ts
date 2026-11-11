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
  | "supervisor-inspection"
  | "mobile-cleaning-team"
  | "kitchen-sanitize"
  | "window-cleaning"
  | "hero-dining"
  | "hero-cleaning-team";

export type IndustrySplitSection = {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  photoKey: LicensedPhotoKey;
  photoAlt: string;
};

export type IndustryPoint = { title: string; body: string };

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
  /** Short context band under the hero */
  introTitle: string;
  introLead: string;
  /** "What matters in this industry" cards */
  focusPoints: IndustryPoint[];
  /** "What we verify on every visit" cards */
  verifyTitle: string;
  verifyLead: string;
  verifyPoints: IndustryPoint[];
  /** Image + copy section (image first on desktop) */
  splitPrimary: IndustrySplitSection;
  /** Image + copy section, reversed on desktop */
  splitSecondary: IndustrySplitSection;
  /** Qualitative outcomes, no invented live metrics */
  outcomes: IndustryPoint[];
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
    introTitle: "Commercial contracts live or die on proof.",
    introLead:
      "Facility managers, landlords and procurement teams all ask the same question: what was actually done on site, and who signed it off? CleanProof keeps that answer attached to every visit, across every building you clean.",
    focusPoints: [
      {
        title: "Multi-site consistency",
        body: "The same checklist standard runs across your whole portfolio, so a relief cleaner or a new supervisor starts from the same page on day one.",
      },
      {
        title: "Client-ready reporting",
        body: "Facility managers receive a read-only completion report without a dashboard login, a training session, or another tool to learn.",
      },
      {
        title: "Supervisor visibility",
        body: "One quality queue shows every job waiting for approval, so visits are signed off from evidence instead of memory.",
      },
    ],
    verifyTitle: "What gets verified on every commercial visit",
    verifyLead:
      "Each job carries the same structure from assignment to approval, which is what makes the final report defensible when a client asks.",
    verifyPoints: [
      {
        title: "Per-site checklists",
        body: "Templates are assigned to the job, so the field session opens with the exact tasks expected for that building and visit type.",
      },
      {
        title: "Before and after photos",
        body: "Cleaners attach photos to the visit record, and supervisors can see whether the evidence matches the areas that were flagged.",
      },
      {
        title: "Exception reasons",
        body: "When a task cannot be completed, the reason is recorded against the line instead of being lost in a group chat.",
      },
      {
        title: "Supervisor sign-off",
        body: "Approval, clarification and rejection decisions are captured with the person and the time, forming a traceable record.",
      },
    ],
    splitPrimary: {
      eyebrow: "Built for multi-site operations",
      title: "One standard, every building you clean.",
      body: "Commercial cleaning rarely fails because of one bad clean. It fails when the standard drifts between sites, shifts and supervisors. CleanProof keeps the checklist, the evidence and the review step identical across your portfolio so you can compare like for like.",
      bullets: [
        "Assign jobs per site with published checklist templates",
        "Rotate cleaners without losing the standard",
        "See which sites are waiting on supervisor review",
        "Compare evidence quality across contracts",
      ],
      photoKey: "commercial-office-clean",
      photoAlt: "Commercial cleaner working in an open-plan office environment",
    },
    splitSecondary: {
      eyebrow: "Reporting clients actually open",
      title: "Give facility managers the record, not a login.",
      body: "Most clients do not want another dashboard. They want to know the work happened and that someone checked it. CleanProof turns approved visits into a clean, read-only report you can send as a link or a PDF.",
      bullets: [
        "Read-only completion view from a secure token link",
        "Only supervisor-approved jobs appear on shared reports",
        "PDF export for handover packs and client inboxes",
        "A layout that reflects your operation, not a stock template",
      ],
      photoKey: "supervisor-inspection",
      photoAlt: "Supervisor reviewing cleaning quality on site",
    },
    outcomes: [
      { title: "Fewer \"was it done?\" emails", body: "Clients check the completion report instead of chasing the contract manager for an update." },
      { title: "Faster supervisor reviews", body: "Approvals happen from one queue rather than across inboxes, calls and paper forms." },
      { title: "A clear audit trail", body: "Every decision, exception and photo stays attached to the visit record for when it matters." },
      { title: "Easier handovers", body: "A relief supervisor picks up a site using the same checklist and the visit history behind it." },
    ],
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
        a: "No. CleanProof focuses on job verification, quality and reporting after work is scheduled. It sits alongside whichever system you use to win and plan contracts.",
      },
      {
        q: "Can one organisation run many sites?",
        a: "Yes. Sites and jobs live inside one organisation, with plan limits on active sites and cleaners, so you can standardise quality across a portfolio without separate accounts.",
      },
      {
        q: "Do clients need training to read a report?",
        a: "No. Client reports open from a link as a read-only page, and the same content can be downloaded as a PDF for their own files.",
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
    introTitle: "Offices are judged on the spaces nobody talks about.",
    introLead:
      "A reception can look immaculate while the washrooms quietly fall behind. CleanProof puts recurring office standards into a repeatable checklist with photo evidence, so quality is visible before a client raises it.",
    focusPoints: [
      {
        title: "Recurring schedules",
        body: "Evening, early-morning and weekend cleans run from the same template, so a rotated crew keeps the standard a regular cleaner would.",
      },
      {
        title: "Washroom and kitchen checks",
        body: "High-attention areas get their own checklist lines and evidence requirements instead of one vague \"cleaned\" tick.",
      },
      {
        title: "Facility manager reporting",
        body: "Share an approved completion report a building manager can read in under a minute, from a link, with no login.",
      },
    ],
    verifyTitle: "What gets verified on every office visit",
    verifyLead:
      "Recurring work is easy to perform and hard to prove. Each office visit is structured the same way so the evidence stands up.",
    verifyPoints: [
      {
        title: "Area-based templates",
        body: "Reception, washrooms, kitchens, desks and meeting rooms each carry their own tasks inside a single visit.",
      },
      {
        title: "Evidence on key areas",
        body: "Photo capture can be required on the washrooms and kitchens where complaints usually start.",
      },
      {
        title: "Consumables and exceptions",
        body: "Stock or access problems are logged against the line so nothing silently disappears from the report.",
      },
      {
        title: "Supervisor quality queue",
        body: "Incomplete submissions are caught before anything is shared with the client.",
      },
    ],
    splitPrimary: {
      eyebrow: "Recurring standards",
      title: "Keep the Monday standard on a Friday night shift.",
      body: "Recurring office cleaning is simple to perform and hard to prove. CleanProof gives every visit the same structure, so a relief cleaner on a late shift follows the checklist a regular cleaner would, and a supervisor can see that it happened.",
      bullets: [
        "Templates for reception, washrooms, kitchen and desk areas",
        "Mandatory photos on the areas that generate complaints",
        "Exception reasons when access or stock is a problem",
        "One queue to review the week of office visits",
      ],
      photoKey: "kitchen-sanitize",
      photoAlt: "Office kitchen and washroom surfaces being sanitised",
    },
    splitSecondary: {
      eyebrow: "Reports for building managers",
      title: "A report a facility manager will actually read.",
      body: "Instead of forwarding a spreadsheet, send a clean completion summary built from approved visits only. It shows what was completed, what was flagged, and who signed it off.",
      bullets: [
        "Read-only page opened from a secure link",
        "Download as a PDF for the building's own file",
        "Only supervisor-approved jobs are included",
        "No dashboard access required for the client",
      ],
      photoKey: "window-cleaning",
      photoAlt: "Cleaning a large office window and glass partition",
    },
    outcomes: [
      { title: "Fewer washroom complaints", body: "Evidence on the areas that matter most is captured on every visit, not just the easy ones." },
      { title: "Consistent results across shifts", body: "Rotating cleaners work from the same published template, so the standard does not move." },
      { title: "Quicker client answers", body: "Building managers see proof without emailing the account manager and waiting." },
      { title: "Cleaner site handovers", body: "A new supervisor inherits the checklist and the visit history behind it." },
    ],
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
        q: "Can we run office and other commercial sites together?",
        a: "Yes. Sites, templates and jobs sit inside one organisation, with plan limits on active sites and cleaners.",
      },
      {
        q: "Can photos be required only in some areas?",
        a: "Checklists can require evidence on the lines you choose, such as washrooms and kitchens, rather than every single task.",
      },
      {
        q: "How are overnight or early visits handled?",
        a: "A visit is a visit: the job carries its site, template and assigned cleaner regardless of the time it is scheduled.",
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
    introTitle: "A move-out clean is judged after you leave.",
    introLead:
      "Deposit disputes and agent sign-offs rarely hinge on effort, they hinge on whether you can show the state of each room. CleanProof records room-level tasks with before and after evidence before the keys change hands.",
    focusPoints: [
      {
        title: "Room-by-room detail",
        body: "Each room carries its own tasks, so an oven, a shower screen and a skirting board are never bundled into one vague tick.",
      },
      {
        title: "Photo proof at handover",
        body: "Before and after photos attach to the visit, giving you a defensible record if a dispute is raised weeks later.",
      },
      {
        title: "A single handover pack",
        body: "Approved visits become a PDF pack that agents, landlords or inventory clerks can file against the property.",
      },
    ],
    verifyTitle: "What gets verified on every handover clean",
    verifyLead:
      "The value of a move-out record is in the detail. CleanProof keeps the detail structured from the first room to the final sign-off.",
    verifyPoints: [
      {
        title: "Granular templates",
        body: "Templates can be built per property type, so a one-bed flat and a four-bed house do not share the same vague list.",
      },
      {
        title: "Mandatory before and after photos",
        body: "Evidence is captured at the same points every time, which makes comparisons, and disputes, far easier to settle.",
      },
      {
        title: "Supervisor approval",
        body: "Nothing is published to a client or agent until a supervisor has reviewed the visit and signed it off.",
      },
      {
        title: "PDF handover pack",
        body: "Export an approved record for the agent, landlord or inventory file in one download.",
      },
    ],
    splitPrimary: {
      eyebrow: "Room-level accuracy",
      title: "Every room, every task, on the record.",
      body: "End-of-tenancy work is detailed by nature. CleanProof breaks a property into rooms and surfaces so the field session guides the cleaner through the full list, and the finished record shows exactly what was covered.",
      bullets: [
        "Per-room checklist templates for each property type",
        "Task-level notes for stubborn marks or existing damage",
        "Before and after photos stored on the same visit",
        "Exceptions recorded instead of skipped silently",
      ],
      photoKey: "kitchen-sanitize",
      photoAlt: "Deep cleaning a kitchen as part of a move-out clean",
    },
    splitSecondary: {
      eyebrow: "Built for disputes",
      title: "Bring evidence, not opinions.",
      body: "When a landlord or agent questions a clean, an approved record with dated photos and a checklist result settles the question quickly. CleanProof keeps that record ready long after the visit is over.",
      bullets: [
        "Dated visit records with checklist outcomes",
        "Photo evidence stored against the job",
        "Supervisor sign-off before the report is shared",
        "Downloadable PDF for the property file",
      ],
      photoKey: "residential-clean",
      photoAlt: "Cleaning a residential room before a tenancy handover",
    },
    outcomes: [
      { title: "Faster handovers", body: "One approved record covers the paperwork agents ask for at move-out." },
      { title: "A stronger dispute position", body: "Dated photos and checklist results support your side of the story when it is challenged." },
      { title: "Consistent quality", body: "Detailed templates keep the same standard across every property." },
      { title: "Less re-work", body: "Supervisors catch gaps before the keys are returned, not after." },
    ],
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
        a: "Site instructions can hold access notes for the team. Physical key tracking sits outside the product and stays with your existing process.",
      },
      {
        q: "Can we use it for both apartments and houses?",
        a: "Yes. Build a template per property type and assign the right one when the job is created.",
      },
      {
        q: "How long are photos kept?",
        a: "Visit records and evidence stay in your organisation's account, so you can refer back to them during a dispute.",
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
    introTitle: "Small teams feel quality problems first.",
    introLead:
      "With a few cleaners covering many homes, quality depends on a handful of people. CleanProof gives every visit the same checklist and a simple way to capture evidence, so standards hold even when you are not on site.",
    focusPoints: [
      {
        title: "Per-home instructions",
        body: "Each property keeps its own checklist and notes, so a different cleaner still knows the routine when someone is off.",
      },
      {
        title: "Remote supervision",
        body: "Owners and senior cleaners review visits from a phone instead of driving between jobs to check them.",
      },
      {
        title: "Simple proof",
        body: "When a customer questions a visit, the record answers with a checklist result and photos taken on the day.",
      },
    ],
    verifyTitle: "What gets verified on every home visit",
    verifyLead:
      "Residential work runs on trust and routine. CleanProof keeps both visible to the person reviewing the visit.",
    verifyPoints: [
      {
        title: "Per-job checklists",
        body: "Each home carries the tasks and preferences that matter to that customer, not a generic list.",
      },
      {
        title: "Cleaner mobile workspace",
        body: "The field view is built for a phone browser, so there is nothing to install and no training day.",
      },
      {
        title: "Exception reasons",
        body: "Skipped tasks are explained and recorded, not quietly dropped from the visit.",
      },
      {
        title: "Issue tracking",
        body: "Customer concerns link back to the original visit so you can respond with real context.",
      },
    ],
    splitPrimary: {
      eyebrow: "Built for mobile teams",
      title: "Run the day from your phone.",
      body: "Residential teams move between homes all day. CleanProof relies on the browser your cleaners already have, so the checklist, the photos and the exception notes all work from a phone with no app store install.",
      bullets: [
        "Mobile field workspace, no app to install",
        "Per-home checklists and house notes",
        "Photo capture when a customer asks for proof",
        "Issue log linked to the original visit",
      ],
      photoKey: "hero-dining",
      photoAlt: "Cleaning a bright residential dining and living space",
    },
    splitSecondary: {
      eyebrow: "Growing without drifting",
      title: "Add cleaners without losing your standard.",
      body: "As a residential team grows, the small things that made you good get harder to pass on. Templates and visit records let a new cleaner learn the routine from the job, and let you check the work without being there.",
      bullets: [
        "Published templates for each service type",
        "New cleaners work from an existing structure",
        "Owners and seniors review visits remotely",
        "Approved reports when clients want documentation",
      ],
      photoKey: "mobile-cleaning-team",
      photoAlt: "Residential cleaning team moving between homes with supplies",
    },
    outcomes: [
      { title: "Happier customers", body: "Concerns are answered with a record rather than an apology." },
      { title: "Less owner time on the road", body: "Reviews happen from a phone, not from a car between appointments." },
      { title: "Smoother onboarding", body: "New cleaners follow templates instead of shadowing for weeks." },
      { title: "Fewer repeat complaints", body: "Issues are logged and linked, so patterns become visible over time." },
    ],
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
        a: "Many small teams begin on Starter. Compare cleaner, site and job limits on the Pricing page to see where you fit.",
      },
      {
        q: "Do cleaners need a special phone?",
        a: "No. The field workspace runs in the mobile browser, so any reasonably modern phone works.",
      },
      {
        q: "Can each customer have different tasks?",
        a: "Yes. Checklists are assigned per job, so a home can carry its own task list and house notes.",
      },
    ],
  },
};

export function isIndustrySlug(slug: string): slug is IndustrySlug {
  return (INDUSTRY_SLUGS as readonly string[]).includes(slug);
}

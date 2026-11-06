export const FEATURE_PAGES: Record<string, { title: string; description: string; bullets: string[] }> = {
  completion: {
    title: "Job completion checklists",
    description: "Versioned templates, site overrides, and immutable job snapshots.",
    bullets: [
      "Reusable templates with publish history",
      "Required tasks, exceptions, and optional photo evidence",
      "Cleaner mobile flow with autosave",
    ],
  },
  inspections: {
    title: "Quality inspections",
    description: "Supervisor queue with approve, reject, and audit trail.",
    bullets: ["Priority filters by site and severity", "Scorecards and random audits", "Blocking rules for missing evidence"],
  },
  complaints: {
    title: "Complaint tracking",
    description: "From client report to re-clean and closure.",
    bullets: ["Kanban statuses with SLA targets", "Root-cause tags and trends", "Link issues to jobs and sites"],
  },
  "client-reports": {
    title: "Client completion reports",
    description: "Branded PDFs and expiring share links.",
    bullets: ["Approved images only", "Revocation and access logs", "Client acknowledgement"],
  },
};

export const INDUSTRY_PAGES: Record<string, { title: string; description: string }> = {
  "commercial-cleaning": {
    title: "Commercial cleaning",
    description: "Multi-site offices, retail, and managed buildings with recurring schedules.",
  },
  "end-of-tenancy": {
    title: "End of tenancy",
    description: "Handover photo reports and dispute-ready evidence for specialist teams.",
  },
  residential: {
    title: "Residential teams",
    description: "Adjacent segment, quality proof for recurring home cleans with lighter scope.",
  },
};

export const LEGAL_DOCS: Record<string, { title: string; body: string[] }> = {
  terms: {
    title: "Terms of service",
    body: [
      "Placeholder terms for development. Replace with counsel-reviewed terms listing plan limits, billing interval, and acceptable use.",
      "CleanProof provides software only; cleaning services are performed by your organisation.",
    ],
  },
  privacy: {
    title: "Privacy notice",
    body: [
      "Describe controller/processor roles, categories of personal data (staff, client contacts, site images), retention defaults, and sub-processors.",
      "Include UK GDPR / applicable US state / Canadian references after legal review.",
    ],
  },
  dpa: {
    title: "Data Processing Agreement",
    body: ["Our data processing terms for cleaning businesses that use CleanProof, covering how we handle personal data on your behalf."],
  },
  refunds: {
    title: "Cancellation & refunds",
    body: [
      "Self-service cancellation stops future renewals; access continues through paid period unless otherwise stated.",
      "Refund policy must match Mollie and consumer regulations for your markets.",
    ],
  },
  security: {
    title: "Security",
    body: [
      "Each customer’s data is kept separate, passwords are hashed, photos and reports are only served to authorised people, and key actions are logged.",
    ],
  },
  cookies: {
    title: "Cookie preferences",
    body: ["Essential session cookies for authentication; optional analytics only with consent."],
  },
  accessibility: {
    title: "Accessibility statement",
    body: ["Target WCAG 2.2 AA for core workflows; contact channel for accessibility feedback."],
  },
};

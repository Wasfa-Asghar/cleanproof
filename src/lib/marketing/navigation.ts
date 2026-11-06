export type NavLink = { href: string; label: string; description?: string };

export const productLinks: NavLink[] = [
  { href: "/features", label: "All features", description: "Explore the full product" },
  { href: "/demo", label: "Interactive demo", description: "Try owner, supervisor, and cleaner views" },
  { href: "/pricing", label: "Pricing", description: "Plans built for growing teams" },
];

export const featureNavLinks: NavLink[] = [
  { href: "/features/cleaning-checklists", label: "Cleaning checklists" },
  { href: "/features/photo-evidence", label: "Photo evidence" },
  { href: "/features/quality-inspections", label: "Quality inspections" },
  { href: "/features/client-reports", label: "Client reports" },
  { href: "/features/offline-field-workflow", label: "Offline field workflow" },
];

export const industryNavLinks: NavLink[] = [
  { href: "/industries/commercial-cleaning", label: "Commercial cleaning" },
  { href: "/industries/office-cleaning", label: "Office cleaning" },
  { href: "/industries/end-of-tenancy-cleaning", label: "End of tenancy" },
  { href: "/industries/residential-cleaning", label: "Residential teams" },
];

export const resourceLinks: NavLink[] = [
  { href: "/help", label: "Help centre" },
  { href: "/about", label: "About CleanProof" },
  { href: "/contact", label: "Contact" },
  { href: "/security", label: "Security" },
];

export const footerColumns = {
  product: [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/demo", label: "Demo" },
    { href: "/sample-report", label: "Sample report" },
  ],
  features: [
    { href: "/features/photo-evidence", label: "Photo evidence" },
    { href: "/features/cleaning-checklists", label: "Checklists" },
    { href: "/features/client-reports", label: "Client reports" },
    { href: "/features/quality-analytics", label: "Quality analytics" },
  ],
  industries: industryNavLinks.map(({ href, label }) => ({ href, label })),
  company: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/help", label: "Help centre" },
  ],
  support: [
    { href: "/help/getting-started", label: "Getting started" },
    { href: "/help/billing", label: "Billing help" },
    { href: "/contact", label: "Contact support" },
  ],
  legal: [
    { href: "/privacy-policy", label: "Privacy policy" },
    { href: "/terms", label: "Terms of service" },
    { href: "/cookie-policy", label: "Cookie policy" },
    { href: "/refund-policy", label: "Refund & cancellation" },
    { href: "/subscription-terms", label: "Subscription terms" },
    { href: "/acceptable-use", label: "Acceptable use" },
    { href: "/data-processing-agreement", label: "DPA" },
    { href: "/security", label: "Security" },
  ],
} as const;

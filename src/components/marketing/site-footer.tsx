import Link from "next/link";
import { businessIdentity, formatBusinessField } from "@/lib/config/business-identity";
import { MarketingWordmark } from "@/components/marketing/marketing-wordmark";
import { CtaBand } from "@/components/marketing/cta-band";

const footerGroups = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "All features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/demo", label: "Product demo" },
      { href: "/how-it-works", label: "How it works" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/industries", label: "Industries" },
      { href: "/help", label: "Help centre" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy-policy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/cookie-policy", label: "Cookies" },
      { href: "/subscription-terms", label: "Subscriptions" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="marketing-footer mt-auto bg-[var(--cp-footer)] text-white">
      <CtaBand />
      <div className="marketing-footer-brand mx-auto max-w-[1440px] px-5 sm:px-8">
        <MarketingWordmark href="/" variant="light" />
      </div>
      <div className="mx-auto max-w-[1920px] px-5 sm:px-8">
        <div className="marketing-footer-grid grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,0.8fr))_minmax(0,0.9fr)] lg:gap-0">
          <div className="marketing-footer-about">
            <p className="max-w-[330px] text-sm leading-relaxed text-[#b6ced2]">
              Cleaning quality control, job verification and client reporting software for professional cleaning teams.
            </p>
            <p className="mt-3 text-xs text-[#91aab0]">A product of {businessIdentity.operatorName}</p>
          </div>
          {footerGroups.map((group) => (
            <div key={group.title} className="marketing-footer-links">
              <p className="text-sm font-medium text-[#91aab0]">{group.title}</p>
              <ul className="mt-5 space-y-3">
                {group.links.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-[#d3dfe2] transition-colors hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="marketing-footer-contact">
            <ul className="space-y-3">
              <li>
                <Link href="/auth/login" className="text-sm text-[#d3dfe2] transition-colors hover:text-white">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-[#d3dfe2] transition-colors hover:text-white">
                  Book a demo
                </Link>
              </li>
            </ul>
            <p className="mt-8 text-xs leading-relaxed text-[#91aab0]">
              Questions?{" "}
              <a href={`mailto:${businessIdentity.supportEmail}`} className="underline underline-offset-4 hover:text-white">
                Contact our team
              </a>
            </p>
          </div>
        </div>

        <div className="marketing-footer-legal space-y-3 text-[11px] leading-relaxed text-[#91aab0]">
          <p>
            CleanProof is a software product of {businessIdentity.operatorName}, a company registered in {formatBusinessField(businessIdentity.registrationCountry)} (company number{" "}
            {formatBusinessField(businessIdentity.companyRegistrationNumber)}). Registered office: {formatBusinessField(businessIdentity.registeredAddress)}.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {businessIdentity.copyrightYear} {businessIdentity.operatorName}. All rights reserved. ·{" "}
              <a href={`mailto:${businessIdentity.supportEmail}`} className="hover:text-white">
                {formatBusinessField(businessIdentity.supportEmail)}
              </a>{" "}
              ·{" "}
              <a href={`tel:${businessIdentity.supportPhone.replace(/\s/g, "")}`} className="hover:text-white">
                {formatBusinessField(businessIdentity.supportPhone)}
              </a>
            </p>
            <p>thehouseofveynor.uk</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

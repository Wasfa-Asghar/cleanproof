"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { FEATURE_PAGES, type FeatureSlug } from "@/lib/marketing/features-content";
import { HOME_FAQ } from "@/lib/marketing/home-faq";
import { INDUSTRY_PAGES, type IndustrySlug } from "@/lib/marketing/industries-content";
import { PRICING_FAQ } from "@/lib/marketing/pricing-faq";

type FaqItem = { q: string; a: string };

export function MarketingPageFaq() {
  const pathname = usePathname();
  const route = pathname.split("/").filter(Boolean);
  let items: FaqItem[] = [];
  let title = "Common questions";
  let pricingLinks = false;
  let industryLinks = false;

  if (pathname === "/") {
    items = HOME_FAQ;
    title = "Questions operators ask before rollout";
  } else if (pathname === "/pricing") {
    items = PRICING_FAQ;
    title = "Billing questions";
    pricingLinks = true;
  } else if (route[0] === "features" && route[1] && route[1] in FEATURE_PAGES) {
    items = FEATURE_PAGES[route[1] as FeatureSlug].faq;
  } else if (route[0] === "industries" && route[1] && route[1] in INDUSTRY_PAGES) {
    items = INDUSTRY_PAGES[route[1] as IndustrySlug].faq;
    industryLinks = true;
  }

  return (
    <section className="mx-auto max-w-[1216px] px-4 py-[var(--marketing-section-y)]">
      <div className="marketing-faq-layout">
        <div className="marketing-section-intro max-w-2xl">
          <p className="text-sm font-medium text-[var(--cp-muted)]">FAQ</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--cp-navy)] md:text-[1.75rem]">
            {title}
          </h2>
          {pricingLinks ? (
            <p className="mt-5 text-sm text-[var(--cp-muted)]">
              See also{" "}
              <Link href="/subscription-terms" className="font-medium text-[var(--cp-teal)] underline decoration-teal-200/80 underline-offset-[5px] hover:decoration-[var(--cp-teal)]">
                subscription terms
              </Link>{" "}
              and{" "}
              <Link href="/refund-policy" className="font-medium text-[var(--cp-teal)] underline decoration-teal-200/80 underline-offset-[5px] hover:decoration-[var(--cp-teal)]">
                refund &amp; cancellation policy
              </Link>
              .
            </p>
          ) : null}
          {industryLinks ? (
            <p className="mt-5 text-sm">
              <Link href="/features" className="font-semibold text-[var(--cp-teal)] underline decoration-teal-200/80 underline-offset-[5px] hover:decoration-[var(--cp-teal)]">
                Explore all features →
              </Link>
            </p>
          ) : null}
        </div>
        <FaqAccordion items={items} />
      </div>
    </section>
  );
}

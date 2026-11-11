import type { Metadata } from "next";
import { HelpCentreView } from "@/components/marketing/help-search";
import { HELP_ARTICLES, HELP_CATEGORIES, HELP_FEATURED_SLUGS } from "@/lib/content/help-articles";

export const metadata: Metadata = {
  title: "Help centre",
  description: "Guides for jobs, field workflow, evidence, reviews, reports, and billing.",
};

export default function HelpIndexPage() {
  const articles = Object.values(HELP_ARTICLES);
  const featured = HELP_FEATURED_SLUGS.map((slug) => HELP_ARTICLES[slug]).filter(Boolean);

  return <HelpCentreView articles={articles} categories={HELP_CATEGORIES} featured={featured} />;
}

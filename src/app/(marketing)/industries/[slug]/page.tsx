import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { IndustryPageView } from "@/components/marketing/industry-page-view";
import { INDUSTRY_PAGES, INDUSTRY_SLUGS, isIndustrySlug } from "@/lib/marketing/industries-content";

export const instant = false;

export function generateStaticParams() {
  return INDUSTRY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/industries/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  if (!isIndustrySlug(slug)) return {};
  const page = INDUSTRY_PAGES[slug];
  return { title: page.title, description: page.metaDescription };
}

export default async function IndustryPage({ params }: PageProps<"/industries/[slug]">) {
  const { slug } = await params;
  if (!isIndustrySlug(slug)) notFound();
  return <IndustryPageView page={INDUSTRY_PAGES[slug]} />;
}

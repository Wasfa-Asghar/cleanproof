import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FeaturePageView } from "@/components/marketing/feature-page-view";
import { FEATURE_PAGES, FEATURE_SLUGS, isFeatureSlug } from "@/lib/marketing/features-content";

/** Access `params` outside Suspense, opt out of instant shell for this segment */
export const instant = false;

export function generateStaticParams() {
  return FEATURE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/features/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  if (!isFeatureSlug(slug)) return {};
  const page = FEATURE_PAGES[slug];
  return { title: page.title, description: page.metaDescription };
}

export default async function FeaturePage({ params }: PageProps<"/features/[slug]">) {
  const { slug } = await params;
  if (!isFeatureSlug(slug)) notFound();
  return <FeaturePageView page={FEATURE_PAGES[slug]} />;
}

import { notFound, redirect } from "next/navigation";
import { LegalDocumentView } from "@/components/marketing/legal-document-view";
import { LEGAL_SLUG_ALIASES } from "@/lib/content/legal-documents";
import { resolveLegalDocument } from "@/lib/marketing/legal-routes";

export function generateStaticParams() {
  return Object.keys(LEGAL_SLUG_ALIASES).map((doc) => ({ doc }));
}

export default async function LegacyLegalDocPage({ params }: PageProps<"/legal/[doc]">) {
  const { doc } = await params;
  const canonical = LEGAL_SLUG_ALIASES[doc];
  if (canonical) {
    redirect(`/${canonical}`);
  }
  const page = resolveLegalDocument(doc);
  if (!page) notFound();
  return <LegalDocumentView document={page} currentPath={`/${page.slug}`} />;
}

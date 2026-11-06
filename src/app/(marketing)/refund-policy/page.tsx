import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/marketing/legal-document-view";
import { LEGAL_DOCUMENTS } from "@/lib/content/legal-documents";

const doc = LEGAL_DOCUMENTS["refund-policy"];

export const metadata: Metadata = { title: doc.title };

export default function Page() {
  return <LegalDocumentView document={doc} currentPath="/refund-policy" />;
}

import { LEGAL_DOCUMENTS, LEGAL_SLUG_ALIASES } from "@/lib/content/legal-documents";

export const PUBLIC_LEGAL_PATHS = [
  "privacy-policy",
  "terms",
  "cookie-policy",
  "refund-policy",
  "subscription-terms",
  "acceptable-use",
  "data-processing-agreement",
  "security",
] as const;

export function resolveLegalDocument(path: string) {
  const key = LEGAL_SLUG_ALIASES[path] ?? path;
  return LEGAL_DOCUMENTS[key] ?? null;
}

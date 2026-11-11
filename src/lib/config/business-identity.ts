/**
 * Central business identity for public site, legal pages, and pre-launch validation.
 * Never substitute fake values, use REQUIRES_VERIFICATION until confirmed.
 */

export type VerificationField = string | "REQUIRES_VERIFICATION";

export const businessIdentity = {
  /** Static year for static prerender, update when rolling annual copyright */
  copyrightYear: "2026" as const,
  tradingName: "CleanProof" as const,
  /** Public product name shown in logos, titles, and chrome */
  brandPresentation: "House of Veynor presents CleanProof" as const,
  brandPresenter: "House of Veynor presents" as const,
  legalEntityName: "The House Of Veynor Ltd" as VerificationField,
  registrationCountry: "England and Wales" as VerificationField,
  companyRegistrationNumber: "17561169" as VerificationField,
  registeredAddress: "Office 2236, 85 Dunstall Hill, Wolverhampton, England, WV6 0SR" as VerificationField,
  supportEmail: "sales@thehouseofveynor.uk" as VerificationField,
  supportPhone: "+44 7366 980115" as VerificationField,
  privacyEmail: "sales@thehouseofveynor.uk" as VerificationField,
  vatNumber: "REQUIRES_VERIFICATION" as VerificationField,
  websiteDomain: "thehouseofveynor.uk" as VerificationField,
  /** Company that owns and operates the CleanProof product */
  operatorName: "The House Of Veynor Ltd" as const,
  billingCurrency: "GBP" as const,
  legalEffectiveDate: "2026-11-06",
  legalLastUpdated: "2026-11-06",
} as const;

export function formatBusinessField(value: VerificationField): string {
  return value === "REQUIRES_VERIFICATION" ? "[Pending verification before launch]" : value;
}

export function getRequiredVerificationFields(): string[] {
  return Object.entries(businessIdentity)
    .filter(([, v]) => v === "REQUIRES_VERIFICATION")
    .map(([k]) => k);
}

export function validateBusinessIdentityForLaunch(): { ok: boolean; missing: string[] } {
  const missing = getRequiredVerificationFields();
  return { ok: missing.length === 0, missing };
}

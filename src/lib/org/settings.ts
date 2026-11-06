import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { organizations } from "@/db/schema";

export type PaperSize = "A4" | "Letter";

export type OrgBrandingSettings = {
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  logoObjectKey?: string;
  logoMimeType?: "image/png" | "image/jpeg";
  paperSize?: PaperSize;
  dateFormat?: "DMY" | "MDY" | "YMD";
};

export function parseOrgSettings(raw: Record<string, unknown> | null | undefined): OrgBrandingSettings {
  if (!raw) return {};
  return {
    contactEmail: typeof raw.contactEmail === "string" ? raw.contactEmail : undefined,
    contactPhone: typeof raw.contactPhone === "string" ? raw.contactPhone : undefined,
    contactAddress: typeof raw.contactAddress === "string" ? raw.contactAddress : undefined,
    logoObjectKey: typeof raw.logoObjectKey === "string" ? raw.logoObjectKey : undefined,
    logoMimeType:
      raw.logoMimeType === "image/png" || raw.logoMimeType === "image/jpeg"
        ? raw.logoMimeType
        : undefined,
    paperSize: raw.paperSize === "Letter" ? "Letter" : raw.paperSize === "A4" ? "A4" : undefined,
    dateFormat:
      raw.dateFormat === "MDY" || raw.dateFormat === "YMD" || raw.dateFormat === "DMY"
        ? raw.dateFormat
        : undefined,
  };
}

export async function getOrgBranding(organizationId: string) {
  const db = getDb();
  const [org] = await db.select().from(organizations).where(eq(organizations.id, organizationId)).limit(1);
  if (!org) return null;
  return {
    org,
    branding: parseOrgSettings(org.settingsJson ?? {}),
  };
}

export async function updateOrgBranding(
  organizationId: string,
  patch: OrgBrandingSettings,
) {
  const db = getDb();
  const [org] = await db.select().from(organizations).where(eq(organizations.id, organizationId)).limit(1);
  if (!org) throw new Error("Organization not found");
  const current = parseOrgSettings(org.settingsJson ?? {});
  const next = { ...org.settingsJson, ...current, ...patch };
  await db
    .update(organizations)
    .set({ settingsJson: next, updatedAt: new Date() })
    .where(eq(organizations.id, organizationId));
}

export function formatOrgDate(iso: string, timeZone: string, dateFormat: OrgBrandingSettings["dateFormat"]) {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(d);
  const map = Object.fromEntries(parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value]));
  const fmt = dateFormat ?? "DMY";
  if (fmt === "MDY") return `${map.month}/${map.day}/${map.year} ${map.hour}:${map.minute}`;
  if (fmt === "YMD") return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}`;
  return `${map.day}/${map.month}/${map.year} ${map.hour}:${map.minute}`;
}

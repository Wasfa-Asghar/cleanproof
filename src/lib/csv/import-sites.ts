import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { clients, csvImportRuns, sites } from "@/db/schema";
import { escapeCsvField } from "@/lib/csv/sanitize";
import { parseCsvText, rowsToObjects } from "@/lib/csv/parse-csv";

export type ParsedSiteRow = {
  rowNumber: number;
  name: string;
  clientRef: string;
  addressLine1?: string;
  city?: string;
  postcode?: string;
  country?: string;
  errors: string[];
};

const DEFAULT_MAP = {
  name: "name",
  clientRef: "client_name",
  addressLine1: "address_line1",
  city: "city",
  postcode: "postcode",
  country: "country",
};

export function sitesCsvTemplate() {
  return (
    ["name", "client_name", "address_line1", "city", "postcode", "country"].map((c) => escapeCsvField(c)).join(",") +
    "\n"
  );
}

export function parseSitesCsv(text: string, columnMap: Record<string, string> = DEFAULT_MAP): ParsedSiteRow[] {
  const rows = parseCsvText(text);
  const objects = rowsToObjects(rows, columnMap);
  return objects.map((o) => {
    const errors: string[] = [];
    const name = o.name ?? "";
    const clientRef = o.clientRef ?? "";
    if (!name) errors.push("name is required");
    if (!clientRef) errors.push("client_name is required");
    return {
      rowNumber: Number(o.__rowNumber),
      name,
      clientRef,
      addressLine1: o.addressLine1 || undefined,
      city: o.city || undefined,
      postcode: o.postcode || undefined,
      country: o.country || "GB",
      errors,
    };
  });
}

export async function importSitesConfirmed(
  organizationId: string,
  userId: string,
  rows: ParsedSiteRow[],
) {
  const db = getDb();
  const valid = rows.filter((r) => r.errors.length === 0);
  const failed = rows.filter((r) => r.errors.length > 0);
  let success = 0;

  const { getEntitlementSnapshot } = await import("@/lib/billing/entitlements");
  const { EntitlementError } = await import("@/lib/billing/errors");
  const snap = await getEntitlementSnapshot(organizationId);
  if (snap.access !== "full") {
    throw new EntitlementError("Cannot import sites while subscription is read-only.");
  }
  const projectedSites = snap.usage.activeSites + valid.length;
  if (projectedSites > snap.limits.activeSites) {
    throw new EntitlementError(
      `Import would exceed active site limit (${snap.limits.activeSites}). Upgrade or remove rows.`,
    );
  }

  await db.transaction(async (tx) => {
    const clientRows = await tx.select().from(clients).where(eq(clients.organizationId, organizationId));
    const clientByName = new Map(clientRows.map((c) => [c.displayName.toLowerCase(), c.id]));
    const existingSites = await tx.select().from(sites).where(eq(sites.organizationId, organizationId));
    const siteKeys = new Set(existingSites.map((s) => `${s.clientId}:${s.name.toLowerCase()}`));

    for (const row of valid) {
      const clientId = clientByName.get(row.clientRef.toLowerCase());
      if (!clientId) {
        failed.push({ ...row, errors: ["client_name not found in organisation"] });
        continue;
      }
      const key = `${clientId}:${row.name.toLowerCase()}`;
      if (siteKeys.has(key)) {
        failed.push({ ...row, errors: ["duplicate site name for client"] });
        continue;
      }
      await tx.insert(sites).values({
        organizationId,
        clientId,
        name: row.name,
        addressLine1: row.addressLine1 ?? "—",
        city: row.city ?? "—",
        postcode: row.postcode ?? "—",
        country: row.country ?? "GB",
        timeZone: "Europe/London",
        accessSensitivity: "standard",
      });
      siteKeys.add(key);
      success += 1;
    }

    await tx.insert(csvImportRuns).values({
      organizationId,
      importedBy: userId,
      recordType: "sites",
      totalRows: rows.length,
      successRows: success,
      failedRows: failed.length,
      failureSummary: failed.map((f) => ({ row: f.rowNumber, reason: f.errors.join("; ") })),
    });
  });

  return { success, failed: failed.length, failures: failed };
}

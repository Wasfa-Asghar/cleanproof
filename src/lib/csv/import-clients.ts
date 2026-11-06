import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { clients, csvImportRuns } from "@/db/schema";
import { escapeCsvField } from "@/lib/csv/sanitize";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ParsedClientRow = {
  rowNumber: number;
  displayName: string;
  contactEmail?: string;
  errors: string[];
};

export function parseClientsCsv(text: string): ParsedClientRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const nameIdx = header.indexOf("display_name");
  const emailIdx = header.indexOf("contact_email");
  if (nameIdx === -1) {
    return [{ rowNumber: 1, displayName: "", errors: ["Missing required column display_name"] }];
  }

  const out: ParsedClientRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    const displayName = cols[nameIdx] ?? "";
    const contactEmail = emailIdx >= 0 ? cols[emailIdx] : undefined;
    const errors: string[] = [];
    if (!displayName) errors.push("display_name is required");
    if (contactEmail && !EMAIL_RE.test(contactEmail)) errors.push("invalid contact_email");
    out.push({ rowNumber: i + 1, displayName, contactEmail, errors });
  }
  return out;
}

export async function importClientsConfirmed(
  organizationId: string,
  userId: string,
  rows: ParsedClientRow[],
) {
  const db = getDb();
  const valid = rows.filter((r) => r.errors.length === 0);
  const failed = rows.filter((r) => r.errors.length > 0);
  let success = 0;

  await db.transaction(async (tx) => {
    const existing = await tx.select().from(clients).where(eq(clients.organizationId, organizationId));
    const names = new Set(existing.map((c) => c.displayName.toLowerCase()));

    for (const row of valid) {
      if (names.has(row.displayName.toLowerCase())) {
        failed.push({ ...row, errors: ["duplicate display_name in organisation"] });
        continue;
      }
      await tx.insert(clients).values({
        organizationId,
        displayName: row.displayName,
        contactsJson: row.contactEmail ? [{ name: row.displayName, email: row.contactEmail }] : [],
      });
      names.add(row.displayName.toLowerCase());
      success += 1;
    }

    await tx.insert(csvImportRuns).values({
      organizationId,
      importedBy: userId,
      recordType: "clients",
      totalRows: rows.length,
      successRows: success,
      failedRows: failed.length,
      failureSummary: failed.map((f) => ({ row: f.rowNumber, reason: f.errors.join("; ") })),
    });
  });

  return { success, failed: failed.length, failures: failed };
}

export function clientsCsvTemplate() {
  return toCsvHeader(["display_name", "contact_email"]);
}

function toCsvHeader(cols: string[]) {
  return cols.map((c) => escapeCsvField(c)).join(",") + "\n";
}

import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { csvImportRuns } from "@/db/schema";
import { escapeCsvField } from "@/lib/csv/sanitize";

export async function listCsvImportRuns(organizationId: string, limit = 20) {
  const db = getDb();
  return db
    .select()
    .from(csvImportRuns)
    .where(eq(csvImportRuns.organizationId, organizationId))
    .orderBy(desc(csvImportRuns.createdAt))
    .limit(limit);
}

export function failureSummaryToCsv(
  run: { recordType: string; failureSummary: unknown },
): string {
  const failures = Array.isArray(run.failureSummary)
    ? (run.failureSummary as { row: number; reason: string }[])
    : [];
  const lines = ["row,reason", ...failures.map((f) => `${escapeCsvField(String(f.row))},${escapeCsvField(f.reason)}`)];
  return lines.join("\n");
}

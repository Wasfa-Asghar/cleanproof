"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { requireValidSession } from "@/lib/auth/rbac";
import { ForbiddenError } from "@/lib/errors";
import { parseClientsCsv, importClientsConfirmed, clientsCsvTemplate } from "@/lib/csv/import-clients";
import { parseSitesCsv, importSitesConfirmed, sitesCsvTemplate } from "@/lib/csv/import-sites";
import { parseTeamCsv, importTeamConfirmed, teamCsvTemplate } from "@/lib/csv/import-team";
import { parseCsvText } from "@/lib/csv/parse-csv";

export type ImportRecordType = "clients" | "sites" | "team";

function assertOwner(role: string) {
  if (role !== "owner" && role !== "manager") throw new ForbiddenError("Only owners and managers can import data");
}

export async function previewCsvImportAction(input: {
  recordType: ImportRecordType;
  csv: string;
  columnMapJson?: string;
}) {
  const session = await requireValidSession(await getSession());
  assertOwner(session.role);
  const columnMap = input.columnMapJson ? (JSON.parse(input.columnMapJson) as Record<string, string>) : undefined;
  const parsedRows = parseCsvText(input.csv);
  const headers = parsedRows[0]?.map((h) => h.trim()) ?? [];

  if (input.recordType === "clients") {
    const rows = parseClientsCsv(input.csv);
    return { headers, rows, recordType: input.recordType };
  }
  if (input.recordType === "sites") {
    const rows = parseSitesCsv(input.csv, columnMap);
    return { headers, rows, recordType: input.recordType };
  }
  const rows = parseTeamCsv(input.csv, columnMap);
  return { headers, rows, recordType: input.recordType };
}

export async function confirmCsvImportAction(input: {
  recordType: ImportRecordType;
  csv: string;
  columnMapJson?: string;
}) {
  const session = await requireValidSession(await getSession());
  assertOwner(session.role);
  const columnMap = input.columnMapJson ? (JSON.parse(input.columnMapJson) as Record<string, string>) : undefined;

  let result;
  if (input.recordType === "clients") {
    const rows = parseClientsCsv(input.csv);
    result = await importClientsConfirmed(session.organizationId, session.userId, rows);
  } else if (input.recordType === "sites") {
    const rows = parseSitesCsv(input.csv, columnMap);
    result = await importSitesConfirmed(session.organizationId, session.userId, rows);
  } else {
    const rows = parseTeamCsv(input.csv, columnMap);
    result = await importTeamConfirmed(session.organizationId, session.userId, rows);
  }

  revalidatePath("/app/settings/import");
  revalidatePath("/app/sites");
  return result;
}

export async function downloadCsvTemplateAction(recordType: ImportRecordType) {
  if (recordType === "clients") return clientsCsvTemplate();
  if (recordType === "sites") return sitesCsvTemplate();
  return teamCsvTemplate();
}

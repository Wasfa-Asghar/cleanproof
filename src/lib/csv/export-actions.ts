"use server";

import { getSession } from "@/lib/auth/session";
import { requireValidSession } from "@/lib/auth/rbac";
import {
  exportClientsCsv,
  exportIssuesCsv,
  exportJobsCsv,
  exportSitesCsv,
  exportTeamCsv,
} from "@/lib/csv/export-data";

export async function exportCsvAction(type: string) {
  const session = await requireValidSession(await getSession());
  switch (type) {
    case "clients":
      return exportClientsCsv(session);
    case "sites":
      return exportSitesCsv(session);
    case "jobs":
      return exportJobsCsv(session);
    case "issues":
      return exportIssuesCsv(session);
    case "team":
      return exportTeamCsv(session);
    default:
      throw new Error("Unknown export type");
  }
}

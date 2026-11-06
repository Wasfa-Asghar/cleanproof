"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { requireValidSession } from "@/lib/auth/rbac";
import { importClientsConfirmed, parseClientsCsv } from "@/lib/csv/import-clients";

export async function importClientsCsvAction(formData: FormData) {
  const session = await requireValidSession(await getSession());
  if (session.role !== "owner") throw new Error("Only owners can import data");
  const csv = String(formData.get("csv") ?? "");
  const rows = parseClientsCsv(csv);
  const result = await importClientsConfirmed(session.organizationId, session.userId, rows);
  revalidatePath("/app/sites");
  return result;
}

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { csvImportRuns, teamInvitations, users } from "@/db/schema";
import { escapeCsvField } from "@/lib/csv/sanitize";
import { parseCsvText, rowsToObjects } from "@/lib/csv/parse-csv";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = new Set(["owner", "manager", "cleaner"]);

export type ParsedTeamRow = {
  rowNumber: number;
  email: string;
  name: string;
  role: "owner" | "manager" | "cleaner";
  errors: string[];
};

const DEFAULT_MAP = {
  email: "email",
  name: "name",
  role: "role",
};

export function teamCsvTemplate() {
  return ["email", "name", "role"].map((c) => escapeCsvField(c)).join(",") + "\n";
}

export function parseTeamCsv(text: string, columnMap: Record<string, string> = DEFAULT_MAP): ParsedTeamRow[] {
  const rows = parseCsvText(text);
  const objects = rowsToObjects(rows, columnMap);
  return objects.map((o) => {
    const errors: string[] = [];
    const email = (o.email ?? "").toLowerCase();
    const name = o.name ?? "";
    const roleRaw = (o.role ?? "cleaner").toLowerCase();
    if (!email) errors.push("email is required");
    else if (!EMAIL_RE.test(email)) errors.push("invalid email");
    if (!name) errors.push("name is required");
    if (!ROLES.has(roleRaw)) errors.push("role must be owner, manager, or cleaner");
    return {
      rowNumber: Number(o.__rowNumber),
      email,
      name,
      role: (ROLES.has(roleRaw) ? roleRaw : "cleaner") as ParsedTeamRow["role"],
      errors,
    };
  });
}

export async function importTeamConfirmed(
  organizationId: string,
  userId: string,
  rows: ParsedTeamRow[],
) {
  const db = getDb();
  const valid = rows.filter((r) => r.errors.length === 0);
  const failed = rows.filter((r) => r.errors.length > 0);
  let success = 0;

  await db.transaction(async (tx) => {
    const existingInvites = await tx
      .select()
      .from(teamInvitations)
      .where(eq(teamInvitations.organizationId, organizationId));
    const inviteEmails = new Set(existingInvites.map((i) => i.email.toLowerCase()));

    const allUsers = await tx.select({ email: users.email }).from(users);
    const userEmails = new Set(allUsers.map((u) => u.email.toLowerCase()));

    for (const row of valid) {
      if (inviteEmails.has(row.email)) {
        failed.push({ ...row, errors: ["invitation already pending for email"] });
        continue;
      }
      if (userEmails.has(row.email)) {
        failed.push({ ...row, errors: ["user with email already exists — use membership invite flow"] });
        continue;
      }
      await tx.insert(teamInvitations).values({
        organizationId,
        email: row.email,
        name: row.name,
        role: row.role,
        status: "pending",
        invitedBy: userId,
      });
      inviteEmails.add(row.email);
      success += 1;
    }

    await tx.insert(csvImportRuns).values({
      organizationId,
      importedBy: userId,
      recordType: "team",
      totalRows: rows.length,
      successRows: success,
      failedRows: failed.length,
      failureSummary: failed.map((f) => ({ row: f.rowNumber, reason: f.errors.join("; ") })),
    });
  });

  return { success, failed: failed.length, failures: failed };
}

import { eq, and } from "drizzle-orm";
import { getDb } from "@/db";
import { csvImportRuns } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { requireValidSession } from "@/lib/auth/rbac";
import { failureSummaryToCsv } from "@/lib/csv/import-history";
import { NotFoundError, AppError, publicErrorMessage } from "@/lib/errors";

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireValidSession(await getSession());
    const { id } = await ctx.params;
    const db = getDb();
    const [run] = await db
      .select()
      .from(csvImportRuns)
      .where(and(eq(csvImportRuns.id, id), eq(csvImportRuns.organizationId, session.organizationId)))
      .limit(1);
    if (!run) throw new NotFoundError();
    const csv = failureSummaryToCsv(run);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="import-errors-${run.recordType}-${id.slice(0, 8)}.csv"`,
      },
    });
  } catch (err) {
    const status = err instanceof AppError ? err.status : 400;
    return Response.json({ error: publicErrorMessage(err) }, { status });
  }
}

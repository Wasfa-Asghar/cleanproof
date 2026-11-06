import { getSession } from "@/lib/auth/session";
import { requireValidSession } from "@/lib/auth/rbac";
import { canReviewJobs } from "@/lib/constants/roles";
import { buildInternalReportPdf } from "@/lib/reports/pdf-access";
import { AppError, ForbiddenError, publicErrorMessage } from "@/lib/errors";

export async function GET(request: Request) {
  try {
    const session = await requireValidSession(await getSession());
    if (!canReviewJobs(session.role)) throw new ForbiddenError();
    const jobId = new URL(request.url).searchParams.get("jobId");
    if (!jobId) return Response.json({ error: "jobId required" }, { status: 400 });
    const pdf = await buildInternalReportPdf(session.organizationId, jobId, true);
    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="cleanproof-${jobId.slice(0, 8)}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    const status = err instanceof AppError ? err.status : 500;
    return Response.json({ error: publicErrorMessage(err) }, { status });
  }
}

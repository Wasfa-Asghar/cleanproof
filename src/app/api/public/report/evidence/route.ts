import { getPublicReportEvidence } from "@/lib/reports/public-evidence";
import { AppError, publicErrorMessage } from "@/lib/errors";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const evidenceId = url.searchParams.get("evidenceId");
    if (!token || !evidenceId) {
      return Response.json({ error: "Missing token or evidenceId" }, { status: 400 });
    }
    const file = await getPublicReportEvidence(token, evidenceId);
    return new Response(new Uint8Array(file.body), {
      headers: {
        "Content-Type": file.mimeType,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    const status = err instanceof AppError ? err.status : 404;
    return Response.json({ error: publicErrorMessage(err) }, { status });
  }
}

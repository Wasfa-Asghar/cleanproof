import { buildPublicReportPdf } from "@/lib/reports/pdf-access";
import { AppError, publicErrorMessage } from "@/lib/errors";

export async function GET(request: Request) {
  try {
    const token = new URL(request.url).searchParams.get("token");
    if (!token) return Response.json({ error: "token required" }, { status: 400 });
    const pdf = await buildPublicReportPdf(token);
    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="cleanproof-report.pdf"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    const status = err instanceof AppError ? err.status : 404;
    return Response.json({ error: publicErrorMessage(err) }, { status });
  }
}

import { createClientIssueFromReportToken } from "@/lib/issues/service";
import { AppError, publicErrorMessage } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      description?: string;
      contactName?: string;
    };
    if (!body.token || !body.description?.trim()) {
      return Response.json({ error: "Token and description are required" }, { status: 400 });
    }
    const result = await createClientIssueFromReportToken(body.token, {
      description: body.description.trim(),
      contactName: body.contactName?.trim(),
    });
    return Response.json(result);
  } catch (err) {
    const status = err instanceof AppError ? err.status : 400;
    return Response.json({ error: publicErrorMessage(err) }, { status });
  }
}

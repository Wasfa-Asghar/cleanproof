import { getSession } from "@/lib/auth/session";
import { requireValidSession } from "@/lib/auth/rbac";
import { uploadOrgLogo } from "@/lib/org/logo";
import { AppError, ForbiddenError, publicErrorMessage } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const session = await requireValidSession(await getSession());
    if (session.role !== "owner" && session.role !== "manager") throw new ForbiddenError();
    const form = await request.formData();
    const file = form.get("logo");
    if (!file || !(file instanceof File)) {
      return Response.json({ error: "logo file required" }, { status: 400 });
    }
    const mimeType = file.type || "image/jpeg";
    const body = Buffer.from(await file.arrayBuffer());
    await uploadOrgLogo({ organizationId: session.organizationId, body, mimeType });
    return Response.json({ ok: true });
  } catch (err) {
    const status = err instanceof AppError ? err.status : 400;
    return Response.json({ error: publicErrorMessage(err) }, { status });
  }
}

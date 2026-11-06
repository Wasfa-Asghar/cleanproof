import { isDevToolsEnabled } from "@/lib/env-devtools";
import { processOverdueIssues } from "@/lib/notifications/overdue-processor";
import { getSession } from "@/lib/auth/session";
import { requireValidSession } from "@/lib/auth/rbac";

export async function POST() {
  if (!isDevToolsEnabled()) {
    return Response.json({ error: "Not available" }, { status: 404 });
  }
  const session = await requireValidSession(await getSession());
  const result = await processOverdueIssues(session.organizationId);
  return Response.json(result);
}

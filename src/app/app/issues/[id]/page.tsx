import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ISSUE_CATEGORY_LABELS } from "@/lib/issues/categories";
import type { IssueCategory } from "@/lib/issues/categories";
import { assignIssueAction, updateIssueStatusAction } from "@/lib/issues/actions";
import { listIssueActivities } from "@/lib/issues/service";
import { getIssueForOrganization, listTeamMembersForOrg } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";
import { canManageIssues } from "@/lib/constants/roles";
import type { IssueStatus } from "@/lib/data/types";

export default async function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) notFound();
  const issue = await getIssueForOrganization(id, session.organizationId);
  if (!issue) notFound();
  const activities = await listIssueActivities(id, session.organizationId, true);
  const team = await listTeamMembersForOrg(session.organizationId);
  const canManage = canManageIssues(session.role);

  return (
    <>
      <PageHeader title={issue.title} description={issue.description ?? undefined} />
      <div className="flex flex-wrap gap-2">
        <Badge tone="info">{ISSUE_CATEGORY_LABELS[issue.category as IssueCategory] ?? issue.category}</Badge>
        <Badge tone={issue.severity === "high" ? "danger" : "warning"}>{issue.severity}</Badge>
        <Badge tone="neutral">{issue.status.replace(/_/g, " ")}</Badge>
      </div>

      {canManage ? (
        <section className="mt-6 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold">Actions</h2>
          <form action={assignIssueAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="issueId" value={id} />
            <select name="assigneeId" className="rounded-lg border border-slate-300 px-2 py-1 text-sm">
              {team.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <Button type="submit" variant="secondary">
              Assign
            </Button>
          </form>
          <form action={updateIssueStatusAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="issueId" value={id} />
            <select name="status" className="rounded-lg border border-slate-300 px-2 py-1 text-sm">
              {(
                [
                  "open",
                  "assigned",
                  "work_in_progress",
                  "ready_for_review",
                  "resolved",
                  "closed",
                ] as IssueStatus[]
              ).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input name="resolutionNotes" placeholder="Resolution notes" className="rounded-lg border px-2 py-1 text-sm" />
            <Button type="submit">Update status</Button>
          </form>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Activity</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {activities.map((a) => (
            <li key={a.id} className="border-b border-slate-50 pb-2">
              <p className="font-medium">{a.action}</p>
              {a.body ? <p className="text-slate-600">{a.body}</p> : null}
              <p className="text-xs text-slate-500">{new Date(a.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

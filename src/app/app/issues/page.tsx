import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { ISSUE_KANBAN_COLUMNS, ISSUE_STATUS_LABELS, ISSUE_CATEGORY_LABELS } from "@/lib/issues/categories";
import type { IssueCategory } from "@/lib/issues/categories";
import { listIssuesForOrg } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Issues" };
export const instant = false;

export default async function IssuesPage() {
  const session = await getSession();
  if (!session) return null;
  const issues = await listIssuesForOrg(session.organizationId);

  return (
    <>
      <PageHeader title="Issues & complaints" description="Kanban remediation board with priority indicators." />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {ISSUE_KANBAN_COLUMNS.map((col) => (
          <div key={col} className="min-w-[220px] flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">{ISSUE_STATUS_LABELS[col]}</h2>
            <ul className="mt-2 space-y-2">
              {issues
                .filter((i) => i.status === col)
                .map((issue) => (
                  <li key={issue.id}>
                    <Link
                      href={`/app/issues/${issue.id}`}
                      className="block rounded-lg border border-slate-200 bg-white p-3 text-sm hover:border-sky-300"
                    >
                      <p className="font-medium">{issue.title}</p>
                      <p className="text-xs text-slate-500">
                        {ISSUE_CATEGORY_LABELS[issue.category as IssueCategory] ?? issue.category}
                      </p>
                      <Badge tone={issue.severity === "high" ? "danger" : "warning"} className="mt-2">
                        {issue.severity}
                      </Badge>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}

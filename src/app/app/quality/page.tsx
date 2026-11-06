import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { listQualityQueueJobs } from "@/lib/analytics/metrics";
import { listSitesForOrg, listTeamMembersForOrg } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";
import { JOB_STATUS_LABELS, jobStatusTone } from "@/lib/constants/job-status";

export const metadata = { title: "Quality queue" };
export const instant = false;

export default async function QualityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  if (!session) return null;
  const sp = await searchParams;
  const siteId = typeof sp.site === "string" ? sp.site : undefined;
  const assignedUserId = typeof sp.cleaner === "string" ? sp.cleaner : undefined;
  const priority = typeof sp.priority === "string" ? sp.priority : undefined;

  const jobs = await listQualityQueueJobs(session.organizationId, {
    siteId,
    assignedUserId,
    priority,
  });
  const sites = await listSitesForOrg(session.organizationId);
  const team = await listTeamMembersForOrg(session.organizationId);

  return (
    <>
      <PageHeader title="Quality queue" description="Submitted jobs awaiting supervisor review." />
      <form method="get" action="/app/quality" className="mb-4 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm">
        <select name="site" defaultValue={siteId ?? ""} className="rounded-lg border border-slate-300 px-2 py-1">
          <option value="">All sites</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select name="cleaner" defaultValue={assignedUserId ?? ""} className="rounded-lg border border-slate-300 px-2 py-1">
          <option value="">All cleaners</option>
          {team
            .filter((m) => m.role === "cleaner")
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
        </select>
        <select name="priority" defaultValue={priority ?? ""} className="rounded-lg border border-slate-300 px-2 py-1">
          <option value="">Any priority</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>
        <button type="submit" className="rounded-lg bg-sky-800 px-3 py-1 text-white">
          Filter
        </button>
      </form>
      <ul className="space-y-3">
        {jobs.length === 0 ? (
          <li className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-600">
            No jobs match your filters.
          </li>
        ) : (
          jobs.map((job) => (
            <li key={job.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <div>
                <Link href={`/app/jobs/${job.id}`} className="font-medium text-sky-900 hover:underline">
                  {job.title}
                </Link>
                <p className="text-sm text-slate-600">{new Date(job.startAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                {job.reviewPriority === "high" ? <Badge tone="danger">High priority</Badge> : null}
                <Badge tone={jobStatusTone(job.status as never)}>{JOB_STATUS_LABELS[job.status as never]}</Badge>
              </div>
            </li>
          ))
        )}
      </ul>
    </>
  );
}

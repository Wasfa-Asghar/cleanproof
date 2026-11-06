import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { listJobsForOrg, listSitesForOrg, listTeamMembersForOrg } from "@/lib/db/queries";
import { CreateJobForm } from "@/components/app/create-job-form";
import { getSession } from "@/lib/auth/session";
import { canManageJobs } from "@/lib/constants/roles";
import { JOB_STATUS_LABELS, jobStatusTone } from "@/lib/constants/job-status";

export const metadata = { title: "Jobs" };
export const instant = false;

export default async function JobsPage() {
  const session = await getSession();
  if (!session) return null;
  const jobs = await listJobsForOrg(session.organizationId);
  const sites = await listSitesForOrg(session.organizationId);
  const team = await listTeamMembersForOrg(session.organizationId);
  const siteNames = new Map(sites.map((s) => [s.id, s.name]));
  const cleaners = team.filter((m) => m.role === "cleaner" || m.role === "manager");
  const defaultStart = new Date();
  defaultStart.setUTCDate(defaultStart.getUTCDate() + 1);
  defaultStart.setUTCMinutes(0, 0, 0);
  const defaultStartIso = defaultStart.toISOString();

  return (
    <>
      <PageHeader title="Jobs" description="List and calendar views — recurring series and assignments." />
      {canManageJobs(session.role) && sites.length > 0 && cleaners.length > 0 ? (
        <CreateJobForm
          sites={sites.map((s) => ({ id: s.id, name: s.name }))}
          cleaners={cleaners}
          defaultStartIso={defaultStartIso}
        />
      ) : null}
      <div className="-mx-4 overflow-x-auto rounded-2xl border border-[var(--cp-border)] bg-[var(--cp-surface)] shadow-sm sm:mx-0">
        <table className="min-w-[min(100%,720px)] text-left text-sm md:min-w-full">
          <thead className="border-b border-[var(--cp-border)] bg-[var(--cp-section-muted)] text-[var(--cp-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Job</th>
              <th className="px-4 py-3 font-medium">Site</th>
              <th className="px-4 py-3 font-medium">Scheduled</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-b border-[var(--cp-border)]/80 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/app/jobs/${job.id}`} className="font-medium text-[var(--cp-navy)] hover:text-[var(--cp-teal)] hover:underline">
                    {job.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--cp-muted)]">{siteNames.get(job.siteId) ?? "—"}</td>
                <td className="px-4 py-3 text-[var(--cp-muted)]">{new Date(job.startAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <Badge tone={jobStatusTone(job.status)}>{JOB_STATUS_LABELS[job.status]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

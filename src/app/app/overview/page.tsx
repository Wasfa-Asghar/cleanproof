import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPhase3Metrics } from "@/lib/analytics/metrics";
import { listJobsForOrg } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";
import { JOB_STATUS_LABELS, jobStatusTone } from "@/lib/constants/job-status";

export const metadata = { title: "Overview" };
export const instant = false;

const statToneClass: Record<string, string> = {
  warning: "border-amber-200/80 bg-amber-50/50",
  success: "border-emerald-200/80 bg-emerald-50/40",
  danger: "border-rose-200/80 bg-rose-50/50",
  info: "border-sky-200/80 bg-sky-50/40",
  neutral: "border-[var(--cp-border)] bg-[var(--cp-surface)]",
};

export default async function OverviewPage() {
  const session = await getSession();
  if (!session) return null;
  const metrics = await getPhase3Metrics(session.organizationId);
  const jobs = await listJobsForOrg(session.organizationId);
  const recent = [...jobs].sort((a, b) => b.startAt.localeCompare(a.startAt)).slice(0, 5);
  const needsReview = jobs.filter((j) => j.status === "needs_review").slice(0, 5);
  const openIssues = metrics.openComplaints;

  const statBlocks: [string, string | number, "warning" | "success" | "danger" | "info" | "neutral"][] = [
    ["Awaiting review", metrics.awaitingReview, "warning"],
    ["Approved jobs", metrics.approvedJobs, "success"],
    ["Need correction", metrics.needingCorrection, "danger"],
    ["Open complaints", metrics.openComplaints, "warning"],
    ["Overdue issues", metrics.overdueIssues, "danger"],
    ["Re-clean jobs", metrics.recleanCount, "info"],
    ["Quality approval rate", `${metrics.qualityApprovalRate}%`, "success"],
    ["Avg resolution (hrs)", metrics.avgResolutionHours, "neutral"],
  ];

  return (
    <>
      <PageHeader
        title="Overview"
        description="Live quality backlog, jobs, and issues from your organisation — no mock figures."
        actions={
          <>
            <Button href="/app/quality" variant="secondary" className="border-[var(--cp-border-strong)] text-[var(--cp-navy)]">
              Quality queue
            </Button>
            <Button href="/app/jobs" className="border-[var(--cp-teal)] bg-[var(--cp-teal)] hover:bg-[var(--cp-teal-600)]">
              Create job
            </Button>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statBlocks.map(([label, value, tone]) => (
          <div
            key={label}
            className={`rounded-2xl border p-4 shadow-sm ${statToneClass[tone]}`}
          >
            <p className="text-sm font-medium text-[var(--cp-muted)]">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--cp-navy)]">{value}</p>
            <Badge tone={tone === "neutral" ? "info" : (tone as "warning" | "success" | "danger" | "info")} className="mt-2">
              Live data
            </Badge>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--cp-border)] bg-[var(--cp-surface)] shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--cp-border)] px-4 py-3">
            <h2 className="font-semibold text-[var(--cp-navy)]">Recent jobs</h2>
            <Link href="/app/jobs" className="text-sm font-medium text-[var(--cp-teal)] hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-[var(--cp-border)]">
            {recent.map((job) => (
              <li key={job.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <Link href={`/app/jobs/${job.id}`} className="font-medium text-[var(--cp-navy)] hover:text-[var(--cp-teal)]">
                    {job.title}
                  </Link>
                  <p className="text-[var(--cp-muted)]">{new Date(job.startAt).toLocaleString()}</p>
                </div>
                <Badge tone={jobStatusTone(job.status)}>{JOB_STATUS_LABELS[job.status]}</Badge>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--cp-border)] bg-[var(--cp-surface)] shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--cp-border)] px-4 py-3">
            <h2 className="font-semibold text-[var(--cp-navy)]">Jobs requiring review</h2>
            <Link href="/app/quality" className="text-sm font-medium text-[var(--cp-teal)] hover:underline">
              Open queue
            </Link>
          </div>
          {needsReview.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--cp-muted)]">Nothing waiting for review.</p>
          ) : (
            <ul className="divide-y divide-[var(--cp-border)]">
              {needsReview.map((job) => (
                <li key={job.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                  <Link href={`/app/jobs/${job.id}`} className="font-medium text-[var(--cp-navy)] hover:text-[var(--cp-teal)]">
                    {job.title}
                  </Link>
                  <Badge tone="warning">Needs review</Badge>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-[var(--cp-border)] px-4 py-3">
            <p className="text-xs text-[var(--cp-muted)]">
              Open complaints (tracked): <span className="font-semibold text-[var(--cp-navy)]">{openIssues}</span>
              {" · "}
              <Link href="/app/issues" className="font-medium text-[var(--cp-teal)] hover:underline">
                Issues board
              </Link>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

import { PageHeader } from "@/components/app/page-header";
import { getPhase3Metrics } from "@/lib/analytics/metrics";
import { countJobResultsWithExceptions } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session) return null;
  const metrics = await getPhase3Metrics(session.organizationId);
  const exceptions = await countJobResultsWithExceptions(session.organizationId);

  return (
    <>
      <PageHeader title="Analytics" description="Operational KPIs with explicit calculation definitions." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Jobs awaiting review", metrics.awaitingReview, "Count of jobs in submitted or needs_review"],
          ["Approved jobs", metrics.approvedJobs, "Jobs with status approved"],
          ["Jobs needing correction", metrics.needingCorrection, "Jobs with status rejected"],
          ["Open customer complaints", metrics.openComplaints, "Issues category customer_complaint not closed"],
          ["Overdue issues", metrics.overdueIssues, "Open issues past due_at"],
          ["Re-clean count", metrics.recleanCount, "Jobs with job_kind reclean"],
          [
            "Quality approval rate",
            `${metrics.qualityApprovalRate}%`,
            "approved / (submitted pipeline jobs)",
          ],
          [
            "Avg issue resolution",
            `${metrics.avgResolutionHours}h`,
            "Mean time from issue created to resolved/closed audit",
          ],
          ["Checklist exceptions", exceptions, "Fail or exception results across all jobs"],
        ].map(([label, value, def]) => (
          <div key={label as string} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">{label as string}</p>
            <p className="mt-2 text-2xl font-semibold">{value as string | number}</p>
            <p className="mt-2 text-xs text-slate-500">{def as string}</p>
          </div>
        ))}
      </div>
    </>
  );
}

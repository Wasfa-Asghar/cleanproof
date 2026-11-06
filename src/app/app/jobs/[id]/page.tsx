import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { EvidenceGallery } from "@/components/app/evidence-gallery";
import { DownloadJobPdf } from "@/components/app/download-job-pdf";
import { JobReviewPanel } from "@/components/app/job-review-panel";
import { getJobForSession, listAuditForJob, listTeamMembersForOrg } from "@/lib/db/queries";
import { listReviewsForJob } from "@/lib/quality/review-service";
import { getSession } from "@/lib/auth/session";
import { JOB_STATUS_LABELS, jobStatusTone } from "@/lib/constants/job-status";
import { canReviewJobs, canManageJobs } from "@/lib/constants/roles";
import { JobScheduleForm } from "@/components/app/job-schedule-form";

export const instant = false;

export default async function JobDetailPage({ params }: PageProps<"/app/jobs/[id]">) {
  const { id } = await params;
  const session = await getSession();
  if (!session) notFound();
  const bundle = await getJobForSession(id, session);
  if (!bundle) notFound();

  const { job, site, template, results } = bundle;
  const resultMap = new Map(results.map((r) => [r.itemId, r]));
  const team = await listTeamMembersForOrg(session.organizationId);
  const reviews = await listReviewsForJob(id, session.organizationId);
  const audit = await listAuditForJob(id, session.organizationId);
  const failedItems = template?.items.filter((item) => {
    const r = resultMap.get(item.id);
    return !r || r.result === "fail" || r.result === "exception";
  });

  return (
    <>
      <PageHeader
        title={job.title}
        description={site ? `${site.name} — ${site.addressLine1}, ${site.city}` : undefined}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge tone={jobStatusTone(job.status)}>{JOB_STATUS_LABELS[job.status]}</Badge>
        <DownloadJobPdf jobId={id} approved={job.status === "approved"} />
        {job.jobKind === "reclean" ? <Badge tone="warning">Re-clean job</Badge> : null}
        {job.recleanSourceJobId ? (
          <Link href={`/app/jobs/${job.recleanSourceJobId}`} className="text-sm text-sky-800 hover:underline">
            View original job
          </Link>
        ) : null}
      </div>

      {site?.instructions ? (
        <section className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <h2 className="font-semibold text-amber-950">Site instructions</h2>
          <p className="mt-2 text-amber-900">{site.instructions}</p>
        </section>
      ) : null}

      {canManageJobs(session.role) ? <JobScheduleForm jobId={id} startAt={new Date(job.startAt)} /> : null}

      <JobReviewPanel
        jobId={id}
        canReview={canReviewJobs(session.role)}
        status={job.status}
        team={team.filter((m) => m.role === "cleaner" || m.role === "manager")}
        defaultAssigneeId={job.assignedUserId}
      />

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Photo evidence</h2>
        <div className="mt-3">
          <EvidenceGallery jobId={id} organizationId={session.organizationId} />
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white">
        <h2 className="border-b border-slate-200 px-4 py-3 font-semibold">Checklist snapshot</h2>
        <ul className="divide-y divide-slate-100">
          {template?.items.map((item) => {
            const r = resultMap.get(item.id);
            const tone =
              !r || r.result === "fail" || r.result === "exception"
                ? "text-red-700"
                : r.result === "pass"
                  ? "text-slate-700"
                  : "text-amber-700";
            return (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-slate-500">{item.section}</p>
                  {r?.exceptionReason ? <p className="text-xs text-slate-600">Reason: {r.exceptionReason}</p> : null}
                </div>
                <span className={tone}>{r?.result ?? "Incomplete"}</span>
              </li>
            );
          })}
        </ul>
        {failedItems && failedItems.length > 0 ? (
          <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
            {failedItems.length} item(s) failed or incomplete
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Review history</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {reviews.length === 0 ? <li className="text-slate-500">No reviews yet.</li> : null}
          {reviews.map((rev) => (
            <li key={rev.id} className="rounded-lg border border-slate-100 p-3">
              <p className="font-medium capitalize">{rev.verdict}</p>
              {rev.notes ? <p className="text-slate-600">{rev.notes}</p> : null}
              <p className="text-xs text-slate-500">{new Date(rev.reviewedAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Audit trail</h2>
        <ul className="mt-3 space-y-1 text-xs text-slate-600">
          {audit.map((ev) => (
            <li key={ev.id}>
              {new Date(ev.createdAt).toLocaleString()} — {ev.action}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

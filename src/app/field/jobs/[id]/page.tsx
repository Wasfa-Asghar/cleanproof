import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { FieldJobWorkspace } from "@/components/field/field-job-workspace";
import { listEvidenceForJob } from "@/lib/db/evidence-queries";
import { getJobForSession } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";
import { JOB_STATUS_LABELS, jobStatusTone } from "@/lib/constants/job-status";

export const instant = false;

export default async function FieldJobPage({ params }: PageProps<"/field/jobs/[id]">) {
  const { id } = await params;
  const session = await getSession();
  if (!session) notFound();
  const bundle = await getJobForSession(id, session);
  if (!bundle) notFound();

  const { job, site, template } = bundle;
  const evidenceRows = await listEvidenceForJob(id, session.organizationId);
  const syncedEvidence = evidenceRows
    .filter((row) => row.scanState === "ready")
    .map((row) => ({
      id: row.id,
      kind: row.kind as "before" | "after" | "during",
      itemId: row.itemId ?? undefined,
    }));

  return (
    <div>
      <Badge tone={jobStatusTone(job.status)}>{JOB_STATUS_LABELS[job.status]}</Badge>
      <h1 className="mt-2 text-xl font-semibold">{job.title}</h1>
      {site ? <p className="text-sm text-slate-600">{site.name}</p> : null}
      {site?.instructions ? (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-950">{site.instructions}</p>
      ) : null}

      <div className="mt-6">
        <FieldJobWorkspace
          jobId={id}
          jobStatus={job.status}
          syncedEvidence={syncedEvidence}
          templateItems={
            template?.items.map((item) => ({
              id: item.id,
              section: item.section,
              label: item.label,
              evidencePolicy: item.evidencePolicy,
            })) ?? []
          }
        />
      </div>
    </div>
  );
}

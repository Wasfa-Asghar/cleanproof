import { PageHeader } from "@/components/app/page-header";
import { ReportShareForm } from "@/components/app/report-share-form";
import { listJobsForOrg, listReportSharesForOrg } from "@/lib/db/queries";
import { revokeReportShareAction } from "@/lib/reports/actions";
import { getSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) return null;
  const shares = await listReportSharesForOrg(session.organizationId);
  const approvedJobs = (await listJobsForOrg(session.organizationId)).filter((j) => j.status === "approved");

  return (
    <>
      <PageHeader
        title="Client reports"
        description="Secure share links for approved jobs only. Tokens are hashed at rest."
      />
      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Create share link</h2>
        <p className="mt-1 text-sm text-slate-600">Select an approved job and generate a one-time visible token.</p>
        <ul className="mt-3 space-y-2 text-sm">
          {approvedJobs.length === 0 ? (
            <li className="text-slate-500">No approved jobs yet.</li>
          ) : (
            approvedJobs.slice(0, 10).map((job) => (
              <li key={job.id} className="rounded-lg border border-slate-100 p-3">
                <p className="font-medium">{job.title}</p>
                <ReportShareForm jobId={job.id} />
              </li>
            ))
          )}
        </ul>
      </section>
      <ul className="space-y-3">
        {shares.map((share) => (
          <li key={share.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <div>
              <p className="font-medium">Job {share.jobId.slice(0, 8)}…</p>
              <p className="text-slate-600">
                Expires {new Date(share.expiresAt).toLocaleDateString()}
                {share.revokedAt ? " · Revoked" : ""}
              </p>
            </div>
            {!share.revokedAt ? (
              <form
                action={async () => {
                  "use server";
                  await revokeReportShareAction(share.id);
                }}
              >
                <Button type="submit" variant="secondary">
                  Revoke
                </Button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  );
}

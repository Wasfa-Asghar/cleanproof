import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { listJobsForCleaner } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";
import { JOB_STATUS_LABELS, jobStatusTone } from "@/lib/constants/job-status";

export const metadata = { title: "My jobs" };

export default async function MyJobsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  const jobs = await listJobsForCleaner(session);

  return (
    <>
      <PageHeader
        title="My jobs"
        description="Mobile-friendly queue — open Field mode for checklists and photo capture."
        actions={
          <Link href="/field/today" className="text-sm font-medium text-sky-800 underline">
            Open field app
          </Link>
        }
      />
      <ul className="space-y-3">
        {jobs.map((job) => (
          <li key={job.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{job.title}</p>
                <p className="text-sm text-slate-600">{new Date(job.startAt).toLocaleString()}</p>
              </div>
              <Badge tone={jobStatusTone(job.status)}>{JOB_STATUS_LABELS[job.status]}</Badge>
            </div>
            <Link href={`/field/jobs/${job.id}`} className="mt-3 inline-block text-sm text-sky-800 underline">
              Continue in field view
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

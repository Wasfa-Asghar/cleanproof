import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { listJobsForCleaner } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";
import { JOB_STATUS_LABELS, jobStatusTone } from "@/lib/constants/job-status";

export const metadata = { title: "Today" };
export const instant = false;

export default async function FieldTodayPage() {
  const session = await getSession();
  if (!session) return null;
  const jobs = await listJobsForCleaner(session);

  return (
    <div>
      <h1 className="text-xl font-semibold">Today&apos;s jobs</h1>
      <p className="mt-1 text-sm text-slate-600">Tap a job to start checklist and capture evidence.</p>
      <ul className="mt-6 space-y-3">
        {jobs.map((job) => (
          <li key={job.id}>
            <Link
              href={`/field/jobs/${job.id}`}
              className="block rounded-xl border border-slate-200 p-4 active:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-slate-600">{new Date(job.startAt).toLocaleString()}</p>
                </div>
                <Badge tone={jobStatusTone(job.status)}>{JOB_STATUS_LABELS[job.status]}</Badge>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

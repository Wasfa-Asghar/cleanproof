import { updateJobScheduleAction } from "@/lib/jobs/actions";
import { Button } from "@/components/ui/button";

export function JobScheduleForm({ jobId, startAt }: { jobId: string; startAt: Date }) {
  const local = new Date(startAt.getTime() - startAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  return (
    <form action={updateJobScheduleAction} className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
      <input type="hidden" name="jobId" value={jobId} />
      <label className="text-sm">
        Reschedule
        <input name="startAt" type="datetime-local" defaultValue={local} className="mt-1 block rounded border px-2 py-1" />
      </label>
      <Button type="submit" variant="secondary">
        Update schedule
      </Button>
    </form>
  );
}

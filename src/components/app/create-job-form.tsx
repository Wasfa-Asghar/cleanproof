import { createJobAction } from "@/lib/jobs/actions";
import { Button } from "@/components/ui/button";

type Site = { id: string; name: string };
type Member = { id: string; name: string; role: string };

export function CreateJobForm({
  sites,
  cleaners,
  defaultStartIso,
}: {
  sites: Site[];
  cleaners: Member[];
  defaultStartIso: string;
}) {
  const defaultStartLocal = defaultStartIso.slice(0, 16);

  return (
    <form action={createJobAction} className="mb-6 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="font-semibold">Create job</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Site
          <select name="siteId" required className="mt-1 w-full rounded-lg border px-3 py-2">
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Assign cleaner
          <select name="assignedUserId" required className="mt-1 w-full rounded-lg border px-3 py-2">
            {cleaners.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm sm:col-span-2">
          Title
          <input name="title" defaultValue="Cleaning visit" className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="text-sm">
          Scheduled start
          <input
            name="startAt"
            type="datetime-local"
            required
            defaultValue={defaultStartLocal}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </label>
      </div>
      <Button type="submit">Create & notify assignee</Button>
    </form>
  );
}

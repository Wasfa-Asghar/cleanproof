import { listEvidenceForJob } from "@/lib/db/evidence-queries";

export async function EvidenceGallery({ jobId, organizationId }: { jobId: string; organizationId: string }) {
  const rows = await listEvidenceForJob(jobId, organizationId);
  const ready = rows.filter((r) => r.scanState === "ready");
  if (ready.length === 0) {
    return <p className="text-sm text-slate-500">No photo evidence uploaded yet.</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {ready.map((ev) => (
        <li key={ev.id} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/evidence/file?id=${ev.id}`}
            alt={`${ev.kind} evidence`}
            className="h-32 w-full object-cover"
          />
          <p className="px-2 py-1 text-xs capitalize text-slate-600">
            {ev.kind}
            {ev.itemId ? " · task" : " · site"}
          </p>
        </li>
      ))}
    </ul>
  );
}

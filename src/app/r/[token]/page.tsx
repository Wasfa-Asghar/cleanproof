import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ClientReportIssueForm } from "@/components/client/client-report-issue-form";
import { ClientReportPdfDownload } from "@/components/client/client-report-pdf";
import { getReportByToken } from "@/lib/db/queries";
import { listPublicReportEvidenceMeta } from "@/lib/reports/public-evidence";

export const instant = false;

export default async function ClientReportPage({ params }: PageProps<"/r/[token]">) {
  const { token } = await params;
  const report = await getReportByToken(token);
  if (!report?.org || !report.job || !report.site) notFound();

  const photos = await listPublicReportEvidenceMeta(token);
  const completed = report.results.filter((r) => r.result === "pass").length;
  const flagged = report.results.filter((r) => r.result !== "pass").length;

  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-slate-50 px-4 py-10">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Completion report</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">{report.org.displayName}</h1>
        <p className="mt-2 text-slate-600">
          {report.client?.displayName ?? "Client"} · {report.site.name} ·{" "}
          {new Date(report.job.startAt).toLocaleString()}
        </p>
        <Badge tone="success" className="mt-4">
          Quality approved
        </Badge>
        <ClientReportPdfDownload token={token} />
      </header>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Checklist summary</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-500">Tasks completed</dt>
            <dd className="text-lg font-semibold">{completed}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Flagged / exceptions</dt>
            <dd className="text-lg font-semibold">{flagged}</dd>
          </div>
        </dl>
        <ul className="mt-4 divide-y divide-slate-100 text-sm">
          {report.template?.items.map((item) => {
            const r = report.results.find((x) => x.itemId === item.id);
            return (
              <li key={item.id} className="flex justify-between py-2">
                <span>{item.label}</span>
                <span>{r?.result ?? "—"}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {photos.length > 0 ? (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold">Before &amp; after photos</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {photos.map((p) => (
              <figure key={p.id} className="overflow-hidden rounded-lg border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/public/report/evidence?token=${encodeURIComponent(token)}&evidenceId=${p.id}`}
                  alt={`${p.kind} evidence`}
                  className="h-40 w-full object-cover"
                />
                <figcaption className="px-2 py-1 text-xs capitalize text-slate-600">{p.kind}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Report a concern</h2>
        <p className="mt-2 text-sm text-slate-600">
          Your message is sent to the cleaning provider. Internal notes are never shown here.
        </p>
        <ClientReportIssueForm token={token} />
      </section>
    </div>
  );
}

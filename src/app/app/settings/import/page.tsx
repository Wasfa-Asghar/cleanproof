import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { CsvImportWizard } from "@/components/app/csv-import-wizard";
import { clientsCsvTemplate } from "@/lib/csv/import-clients";
import { sitesCsvTemplate } from "@/lib/csv/import-sites";
import { teamCsvTemplate } from "@/lib/csv/import-team";
import { listCsvImportRuns } from "@/lib/csv/import-history";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Import CSV" };
export const instant = false;

export default async function ImportSettingsPage() {
  const session = await getSession();
  if (!session) return null;
  const history = await listCsvImportRuns(session.organizationId);

  return (
    <>
      <PageHeader
        title="Import CSV"
        description="Wizard for clients, sites, and team invitations. Duplicates are blocked unless you use a dedicated merge flow (not included)."
      />
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <h2 className="font-semibold">Clients template</h2>
          <pre className="mt-2 overflow-x-auto rounded bg-slate-50 p-2 text-xs">{clientsCsvTemplate()}</pre>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <h2 className="font-semibold">Sites template</h2>
          <pre className="mt-2 overflow-x-auto rounded bg-slate-50 p-2 text-xs">{sitesCsvTemplate()}</pre>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <h2 className="font-semibold">Team template</h2>
          <pre className="mt-2 overflow-x-auto rounded bg-slate-50 p-2 text-xs">{teamCsvTemplate()}</pre>
        </div>
      </section>
      <CsvImportWizard />
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Import history</h2>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">No imports yet.</p>
        ) : (
          <ul className="mt-3 divide-y text-sm">
            {history.map((run) => (
              <li key={run.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  {run.recordType} · {run.successRows}/{run.totalRows} ok ·{" "}
                  {new Date(run.createdAt).toLocaleString()}
                </span>
                {run.failedRows > 0 ? (
                  <Link
                    href={`/api/csv/import-runs/${run.id}/errors`}
                    className="text-sky-800 hover:underline"
                  >
                    Download error report
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

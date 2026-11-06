import { PageHeader } from "@/components/app/page-header";
import { listTemplatesForOrg } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Checklist templates" };
export const instant = false;

export default async function TemplatesPage() {
  const session = await getSession();
  if (!session) return null;
  const templates = await listTemplatesForOrg(session.organizationId);

  return (
    <>
      <PageHeader
        title="Checklist templates"
        description="Versioned templates with sections, task types, and evidence policies."
      />
      {templates.map((t) => (
        <article key={t.id} className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">
            {t.name} <span className="text-sm font-normal text-slate-500">v{t.version}</span>
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {t.items.map((item) => (
              <li key={item.id} className="flex justify-between border-b border-slate-100 py-2 last:border-0">
                <span>
                  {item.label} <span className="text-slate-500">({item.section})</span>
                </span>
                <span className="text-slate-600">
                  {item.required ? "Required" : "Optional"} · {item.evidencePolicy}
                </span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </>
  );
}

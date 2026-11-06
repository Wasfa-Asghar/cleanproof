import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { getSiteForOrganization } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";

export default async function SiteDetailPage({ params }: PageProps<"/app/sites/[id]">) {
  const { id } = await params;
  const session = await getSession();
  if (!session) notFound();
  const site = await getSiteForOrganization(id, session.organizationId);
  if (!site) notFound();

  return (
    <>
      <PageHeader title={site.name} description={`${site.addressLine1}, ${site.city} ${site.postcode}`} />
      <dl className="grid max-w-2xl gap-4 rounded-xl border border-slate-200 bg-white p-6 text-sm">
        <div>
          <dt className="font-medium text-slate-900">Time zone</dt>
          <dd className="text-slate-600">{site.timeZone}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">Access sensitivity</dt>
          <dd className="text-slate-600">{site.accessSensitivity}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">Instructions</dt>
          <dd className="text-slate-600">{site.instructions ?? "—"}</dd>
        </div>
      </dl>
    </>
  );
}

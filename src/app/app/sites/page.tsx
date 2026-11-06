import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { listClientsForOrg, listSitesForOrg } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Clients & sites" };
export const instant = false;

export default async function SitesPage() {
  const session = await getSession();
  if (!session) return null;
  const clients = await listClientsForOrg(session.organizationId);
  const sites = await listSitesForOrg(session.organizationId);

  return (
    <>
      <PageHeader title="Clients & sites" description="Contacts, access notes, checklist defaults, and retention." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold">Clients</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {clients.map((c) => (
              <li key={c.id} className="rounded-lg bg-slate-50 p-3">
                <p className="font-medium">{c.displayName}</p>
                <p className="text-slate-600">{c.contactsJson?.[0]?.email ?? "No contact email"}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold">Sites</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {sites.map((s) => (
              <li key={s.id}>
                <Link href={`/app/sites/${s.id}`} className="block rounded-lg bg-slate-50 p-3 hover:bg-slate-100">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-slate-600">
                    {s.addressLine1}, {s.city} · {s.accessSensitivity}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

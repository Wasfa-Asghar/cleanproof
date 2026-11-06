import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { getUserById, listMembershipsForOrg } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const session = await getSession();
  if (!session) return null;
  const members = await listMembershipsForOrg(session.organizationId);
  const users = await Promise.all(members.map((m) => getUserById(m.userId)));

  return (
    <>
      <PageHeader title="Team" description="Invites, roles, and access revocation with audit history." />
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {members.map((m, idx) => {
          const user = users[idx];
          return (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{user?.name ?? "Unknown"}</p>
                <p className="text-slate-600">{user?.email}</p>
              </div>
              <Badge tone="info">{ROLE_LABELS[m.role]}</Badge>
            </li>
          );
        })}
      </ul>
    </>
  );
}

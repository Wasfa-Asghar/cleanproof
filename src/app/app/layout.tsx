import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app/sidebar";
import { AppTopBar } from "@/components/app/app-top-bar";
import { NotificationCenter } from "@/components/app/notification-center";
import { getMembershipForUser } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";

export const instant = false;

export default async function AppShellLayout({ children }: LayoutProps<"/app">) {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  const membership = await getMembershipForUser(session.userId, session.organizationId);
  if (!membership) redirect("/auth/login");

  return (
    <div className="app-shell flex min-h-screen bg-[var(--cp-bg)]">
      <AppSidebar orgName={membership.organization.displayName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopBar orgName={membership.organization.displayName} roleLabel={membership.role}>
          <NotificationCenter userId={session.userId} organizationId={session.organizationId} />
        </AppTopBar>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

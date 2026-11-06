import Link from "next/link";
import { markNotificationReadAction } from "@/lib/notifications/actions";
import { listNotificationsForUser, countUnreadNotifications } from "@/lib/notifications/service";

export async function NotificationCenter({
  userId,
  organizationId,
}: {
  userId: string;
  organizationId: string;
}) {
  const [items, unread] = await Promise.all([
    listNotificationsForUser(userId, organizationId, 15),
    countUnreadNotifications(userId, organizationId),
  ]);

  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-lg border border-[var(--cp-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--cp-navy)] shadow-sm">
        Notifications {unread > 0 ? <span className="font-semibold text-[var(--cp-teal)]">({unread})</span> : null}
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,20rem)] rounded-xl border border-[var(--cp-border)] bg-white shadow-lg">
        <ul className="max-h-80 overflow-y-auto divide-y divide-[var(--cp-border)] text-sm">
          {items.length === 0 ? (
            <li className="p-4 text-[var(--cp-muted)]">No notifications yet.</li>
          ) : (
            items.map((n) => (
              <li key={n.id} className={`p-3 ${n.readAt ? "opacity-70" : "bg-[var(--cp-teal)]/[0.06]"}`}>
                <p className="font-medium text-[var(--cp-navy)]">{n.title}</p>
                <p className="text-[var(--cp-muted)]">{n.body}</p>
                <div className="mt-2 flex gap-2 text-xs">
                  {n.linkPath ? (
                    <Link href={n.linkPath} className="font-medium text-[var(--cp-teal)] hover:underline">
                      Open
                    </Link>
                  ) : null}
                  {!n.readAt ? (
                    <form action={markNotificationReadAction}>
                      <input type="hidden" name="notificationId" value={n.id} />
                      <button type="submit" className="text-[var(--cp-muted)] hover:underline">
                        Mark read
                      </button>
                    </form>
                  ) : null}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </details>
  );
}

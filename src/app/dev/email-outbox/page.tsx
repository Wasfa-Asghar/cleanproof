import { notFound } from "next/navigation";
import { isDevToolsEnabled } from "@/lib/env-devtools";
import { listEmailOutbox } from "@/lib/notifications/service";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Email outbox (dev)" };

export default async function DevEmailOutboxPage() {
  if (!isDevToolsEnabled()) notFound();
  const session = await getSession();
  if (!session) notFound();
  const rows = await listEmailOutbox(session.organizationId, 100);

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-semibold">Local email outbox</h1>
      <p className="mt-2 text-sm text-slate-600">Development only — inspect rendered workflow emails and delivery status.</p>
      <ul className="mt-6 space-y-4">
        {rows.length === 0 ? (
          <li className="text-slate-500">No emails queued yet. Trigger workflow events to populate the outbox.</li>
        ) : (
          rows.map((row) => (
            <li key={row.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <p className="font-medium">{row.subject}</p>
              <p className="text-slate-600">
                To: {row.recipientEmail} · {row.notificationType} · {row.status}
                {row.failureReason ? ` · ${row.failureReason}` : ""}
              </p>
              <details className="mt-2">
                <summary className="cursor-pointer text-sky-800">HTML preview</summary>
                <iframe title={row.id} srcDoc={row.htmlBody} className="mt-2 h-64 w-full rounded border" />
              </details>
              <pre className="mt-2 max-h-32 overflow-auto rounded bg-slate-50 p-2 text-xs">{row.textBody}</pre>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

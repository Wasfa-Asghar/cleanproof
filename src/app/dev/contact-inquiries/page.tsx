import { notFound } from "next/navigation";
import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { contactInquiries } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { isDevToolsEnabled } from "@/lib/env-devtools";
import { MarkInquiryButton } from "./mark-inquiry-button";

export const metadata = {
  title: "Contact enquiries (dev)",
  robots: { index: false, follow: false },
};

export default async function DevContactInquiriesPage() {
  if (!isDevToolsEnabled()) notFound();
  const session = await getSession();
  if (!session || session.role !== "owner") notFound();

  const db = getDb();
  const rows = await db.select().from(contactInquiries).orderBy(desc(contactInquiries.createdAt)).limit(200);

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-semibold text-slate-900">Website contact enquiries</h1>
      <p className="mt-2 text-sm text-slate-600">
        Development and staging only. Persisted in <code className="rounded bg-slate-100 px-1">contact_inquiries</code> — not
        tenant-scoped. Owners can review and update status. Email is not sent until a mail provider is configured.
      </p>
      <ul className="mt-8 space-y-4">
        {rows.length === 0 ? (
          <li className="text-slate-500">No enquiries yet.</li>
        ) : (
          rows.map((row) => (
            <li key={row.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">{row.name}</p>
                  <p className="text-slate-600">
                    {row.email} · {row.enquiryType} · {row.country || "—"}
                  </p>
                  {row.company ? <p className="text-slate-500">Company: {row.company}</p> : null}
                </div>
                <div className="text-right text-xs text-slate-500">
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-medium uppercase tracking-wide">{row.status}</span>
                  <p className="mt-1">{row.createdAt.toISOString()}</p>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-slate-700">{row.message}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {row.status !== "reviewed" ? (
                  <MarkInquiryButton id={row.id} label="Mark reviewed" nextStatus="reviewed" />
                ) : null}
                {row.status !== "archived" ? (
                  <MarkInquiryButton id={row.id} label="Archive" nextStatus="archived" />
                ) : null}
                {row.status === "archived" ? (
                  <MarkInquiryButton id={row.id} label="Restore to new" nextStatus="new" />
                ) : null}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

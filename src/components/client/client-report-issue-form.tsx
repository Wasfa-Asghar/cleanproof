"use client";

import { useState } from "react";
export function ClientReportIssueForm({ token }: { token: string }) {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [reference, setReference] = useState<string | null>(null);

  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const res = await fetch("/api/public/report/issue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            description: fd.get("description"),
            contactName: fd.get("contactName"),
          }),
        });
        if (!res.ok) {
          setStatus("error");
          return;
        }
        const data = (await res.json()) as { reference?: string };
        setReference(data.reference ?? null);
        setStatus("ok");
      }}
    >
      <input
        name="contactName"
        placeholder="Your name (optional)"
        className="w-full rounded-lg border border-slate-300 p-3 text-sm"
      />
      <textarea
        name="description"
        required
        rows={4}
        placeholder="Describe what was missed or damaged…"
        className="w-full rounded-lg border border-slate-300 p-3 text-sm"
      />
      <button type="submit" className="rounded-lg bg-sky-800 px-4 py-2 text-sm font-medium text-white">
        Submit concern
      </button>
      {status === "ok" ? (
        <p className="text-sm text-green-800">Received — reference {reference}</p>
      ) : null}
      {status === "error" ? <p className="text-sm text-red-700">Could not submit. Report may be unavailable.</p> : null}
    </form>
  );
}

"use client";

import { useState } from "react";

export function ClientReportPdfDownload({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="mt-4">
      <button
        type="button"
        disabled={loading}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-sky-900 hover:bg-slate-50"
        onClick={async () => {
          setLoading(true);
          setError(null);
          try {
            const res = await fetch(`/api/public/report/pdf?token=${encodeURIComponent(token)}`);
            if (!res.ok) throw new Error("PDF unavailable");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "cleanproof-report.pdf";
            a.click();
            URL.revokeObjectURL(url);
          } catch {
            setError("Could not generate PDF. The link may be revoked or expired.");
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? "Preparing PDF…" : "Download PDF report"}
      </button>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

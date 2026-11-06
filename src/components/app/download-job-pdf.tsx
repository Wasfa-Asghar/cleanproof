"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DownloadJobPdf({ jobId, approved }: { jobId: string; approved: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!approved) return null;

  return (
    <div>
      <Button
        type="button"
        variant="secondary"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setError(null);
          try {
            const res = await fetch(`/api/reports/pdf?jobId=${encodeURIComponent(jobId)}`);
            if (!res.ok) {
              const data = (await res.json().catch(() => ({}))) as { error?: string };
              throw new Error(data.error ?? "PDF generation failed");
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `cleanproof-${jobId.slice(0, 8)}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Failed");
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? "Generating PDF…" : "Download PDF"}
      </Button>
      {error ? <p className="mt-1 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}

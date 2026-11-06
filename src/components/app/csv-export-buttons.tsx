"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exportCsvAction } from "@/lib/csv/export-actions";

const types = [
  ["clients", "Clients"],
  ["sites", "Sites"],
  ["jobs", "Jobs"],
  ["issues", "Issues & complaints"],
  ["team", "Team directory"],
] as const;

export function CsvExportButtons() {
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="space-y-2">
      {types.map(([type, label]) => (
        <Button
          key={type}
          type="button"
          variant="secondary"
          onClick={async () => {
            setError(null);
            try {
              const csv = await exportCsvAction(type);
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `cleanproof-${type}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            } catch {
              setError("Export not allowed or failed.");
            }
          }}
        >
          Export {label}
        </Button>
      ))}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

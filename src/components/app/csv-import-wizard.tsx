"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  confirmCsvImportAction,
  previewCsvImportAction,
  type ImportRecordType,
} from "@/lib/csv/wizard-actions";

type PreviewRow = { rowNumber: number; errors: string[] } & Record<string, unknown>;

const RECORD_LABELS: Record<ImportRecordType, string> = {
  clients: "Clients",
  sites: "Cleaning sites",
  team: "Team invitations",
};

const SITE_FIELDS = ["name", "clientRef", "addressLine1", "city", "postcode", "country"] as const;
const TEAM_FIELDS = ["email", "name", "role"] as const;

export function CsvImportWizard() {
  const [recordType, setRecordType] = useState<ImportRecordType>("clients");
  const [csv, setCsv] = useState("");
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onPreview = () => {
    setError(null);
    startTransition(async () => {
      try {
        const preview = await previewCsvImportAction({
          recordType,
          csv,
          columnMapJson: recordType !== "clients" ? JSON.stringify(columnMap) : undefined,
        });
        setHeaders(preview.headers);
        setRows(preview.rows as PreviewRow[]);
        if (recordType === "sites" && Object.keys(columnMap).length === 0) {
          setColumnMap({
            name: preview.headers.find((h) => h.toLowerCase() === "name") ?? "name",
            clientRef: preview.headers.find((h) => h.toLowerCase() === "client_name") ?? "client_name",
            addressLine1: preview.headers.find((h) => h.toLowerCase() === "address_line1") ?? "",
            city: preview.headers.find((h) => h.toLowerCase() === "city") ?? "",
            postcode: preview.headers.find((h) => h.toLowerCase() === "postcode") ?? "",
            country: preview.headers.find((h) => h.toLowerCase() === "country") ?? "",
          });
        }
        if (recordType === "team" && Object.keys(columnMap).length === 0) {
          setColumnMap({
            email: preview.headers.find((h) => h.toLowerCase() === "email") ?? "email",
            name: preview.headers.find((h) => h.toLowerCase() === "name") ?? "name",
            role: preview.headers.find((h) => h.toLowerCase() === "role") ?? "role",
          });
        }
        setStep("preview");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Preview failed");
      }
    });
  };

  const onConfirm = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await confirmCsvImportAction({
          recordType,
          csv,
          columnMapJson: recordType !== "clients" ? JSON.stringify(columnMap) : undefined,
        });
        setResult({ success: res.success, failed: res.failed });
        setStep("done");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Import failed");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(RECORD_LABELS) as ImportRecordType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setRecordType(t);
              setStep("upload");
              setResult(null);
            }}
            className={`rounded-lg border px-3 py-1.5 text-sm ${recordType === t ? "border-sky-800 bg-sky-50 font-medium" : "border-slate-200"}`}
          >
            {RECORD_LABELS[t]}
          </button>
        ))}
      </div>

      {step === "upload" ? (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-600">
            Upload a CSV file or paste rows. Team import creates pending invitations only — never passwords.
          </p>
          <label className="block text-sm">
            CSV file
            <input
              type="file"
              accept=".csv,text/csv"
              className="mt-1 block text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                void file.text().then(setCsv);
              }}
            />
          </label>
          <label className="block text-sm">
            Or paste CSV (header row required)
            <textarea
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              rows={10}
              className="mt-1 w-full rounded-lg border px-3 py-2 font-mono text-xs"
            />
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <Button type="button" disabled={!csv.trim() || pending} onClick={onPreview}>
            Preview import
          </Button>
        </div>
      ) : null}

      {step === "preview" ? (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          {(recordType === "sites" || recordType === "team") && (
            <div className="grid gap-2 sm:grid-cols-2">
              {(recordType === "sites" ? SITE_FIELDS : TEAM_FIELDS).map((field) => (
                <label key={field} className="text-sm">
                  Map “{field}” to column
                  <select
                    className="mt-1 w-full rounded border px-2 py-1"
                    value={columnMap[field] ?? ""}
                    onChange={(e) => setColumnMap((m) => ({ ...m, [field]: e.target.value }))}
                  >
                    <option value="">—</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              <Button type="button" variant="secondary" className="sm:col-span-2" onClick={onPreview} disabled={pending}>
                Re-run preview with mapping
              </Button>
            </div>
          )}
          <p className="text-sm text-slate-600">
            {rows.filter((r) => r.errors.length === 0).length} valid ·{" "}
            {rows.filter((r) => r.errors.length > 0).length} with errors
          </p>
          <div className="max-h-64 overflow-auto rounded border text-xs">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-2 py-1">Row</th>
                  <th className="px-2 py-1">Status</th>
                  <th className="px-2 py-1">Detail</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 50).map((r) => (
                  <tr key={r.rowNumber} className="border-t">
                    <td className="px-2 py-1">{r.rowNumber}</td>
                    <td className="px-2 py-1">{r.errors.length ? "Error" : "OK"}</td>
                    <td className="px-2 py-1">
                      {r.errors.length ? r.errors.join("; ") : JSON.stringify(r).slice(0, 120)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setStep("upload")}>
              Back
            </Button>
            <Button type="button" disabled={pending || rows.every((r) => r.errors.length > 0)} onClick={onConfirm}>
              Confirm import
            </Button>
          </div>
        </div>
      ) : null}

      {step === "done" && result ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-sm">
          <p className="font-semibold">Import complete</p>
          <p className="mt-1">
            {result.success} row(s) imported · {result.failed} failed (see import history for error report)
          </p>
          <Button type="button" className="mt-3" variant="secondary" onClick={() => setStep("upload")}>
            Import another file
          </Button>
        </div>
      ) : null}
    </div>
  );
}

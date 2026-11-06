import { PageHeader } from "@/components/app/page-header";
import { CsvExportButtons } from "@/components/app/csv-export-buttons";

export const metadata = { title: "Export CSV" };

export default function ExportSettingsPage() {
  return (
    <>
      <PageHeader
        title="Export CSV"
        description="Download organisation data you are authorised to access. Formula injection prefixes are applied."
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <CsvExportButtons />
      </div>
    </>
  );
}

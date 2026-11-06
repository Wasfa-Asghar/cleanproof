import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { getOrgBranding } from "@/lib/org/settings";
import { updateOrgSettingsAction } from "@/lib/settings/actions";
import { OrgLogoUpload } from "@/components/app/org-logo-upload";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Organisation settings" };
export const instant = false;

export default async function GeneralSettingsPage() {
  const session = await getSession();
  if (!session) return null;
  const pack = await getOrgBranding(session.organizationId);
  const b = pack?.branding ?? {};

  return (
    <>
      <PageHeader title="Organisation settings" description="Branding and report defaults for your workspace." />
      <OrgLogoUpload hasLogo={Boolean(b.logoObjectKey)} />
      <form action={updateOrgSettingsAction} className="mt-6 max-w-lg space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <label className="block text-sm">
          Contact email
          <input name="contactEmail" defaultValue={b.contactEmail ?? ""} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm">
          Contact phone
          <input name="contactPhone" defaultValue={b.contactPhone ?? ""} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm">
          Business address
          <textarea name="contactAddress" defaultValue={b.contactAddress ?? ""} rows={2} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm">
          Report paper size
          <select name="paperSize" defaultValue={b.paperSize ?? "A4"} className="mt-1 w-full rounded-lg border px-3 py-2">
            <option value="A4">A4 (UK/EU)</option>
            <option value="Letter">Letter (US/Canada)</option>
          </select>
        </label>
        <label className="block text-sm">
          Date format
          <select name="dateFormat" defaultValue={b.dateFormat ?? "DMY"} className="mt-1 w-full rounded-lg border px-3 py-2">
            <option value="DMY">DD/MM/YYYY</option>
            <option value="MDY">MM/DD/YYYY</option>
            <option value="YMD">YYYY-MM-DD</option>
          </select>
        </label>
        <Button type="submit">Save settings</Button>
      </form>
    </>
  );
}

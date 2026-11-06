"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { requireValidSession } from "@/lib/auth/rbac";
import { updateOrgBranding, type OrgBrandingSettings } from "@/lib/org/settings";

export async function updateOrgSettingsAction(formData: FormData) {
  const session = await requireValidSession(await getSession());
  if (session.role !== "owner" && session.role !== "manager") return;
  const patch: OrgBrandingSettings = {
    contactEmail: String(formData.get("contactEmail") ?? "") || undefined,
    contactPhone: String(formData.get("contactPhone") ?? "") || undefined,
    contactAddress: String(formData.get("contactAddress") ?? "") || undefined,
    paperSize: formData.get("paperSize") === "Letter" ? "Letter" : "A4",
    dateFormat:
      formData.get("dateFormat") === "MDY"
        ? "MDY"
        : formData.get("dateFormat") === "YMD"
          ? "YMD"
          : "DMY",
  };
  await updateOrgBranding(session.organizationId, patch);
  revalidatePath("/app/settings/general");
}

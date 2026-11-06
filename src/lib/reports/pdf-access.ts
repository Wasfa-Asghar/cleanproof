import { getReportByToken } from "@/lib/db/queries";
import { buildJobReportPdf } from "@/lib/pdf/job-report";
import { getOrgBranding } from "@/lib/org/settings";
import { NotFoundError } from "@/lib/errors";

export async function buildPublicReportPdf(token: string) {
  const report = await getReportByToken(token);
  if (!report?.job || !report.org) throw new NotFoundError();
  const branding = await getOrgBranding(report.org.id);
  return buildJobReportPdf({
    organizationId: report.org.id,
    jobId: report.job.id,
    paperSize: branding?.branding.paperSize,
    includeInternalNotes: false,
  });
}

export async function buildInternalReportPdf(organizationId: string, jobId: string, includeInternalNotes: boolean) {
  return buildJobReportPdf({
    organizationId,
    jobId,
    includeInternalNotes,
  });
}

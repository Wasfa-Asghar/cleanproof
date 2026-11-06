import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { clients, jobItemResults, reviews, users } from "@/db/schema";
import { getJobForOrganization, getSiteForOrganization, getTemplateBundleByVersionId } from "@/lib/db/queries";
import { listEvidenceForJob } from "@/lib/db/evidence-queries";
import { getOrgBranding, formatOrgDate, type PaperSize } from "@/lib/org/settings";
import { getStorageAdapter } from "@/lib/storage";
import { ForbiddenError, NotFoundError } from "@/lib/errors";

export type JobReportContext = {
  organizationId: string;
  jobId: string;
  paperSize?: PaperSize;
  includeInternalNotes: boolean;
};

const PAGE_SIZES: Record<PaperSize, [number, number]> = {
  A4: [595.28, 841.89],
  Letter: [612, 792],
};

export async function buildJobReportPdf(ctx: JobReportContext): Promise<Uint8Array> {
  const jobRow = await getJobForOrganization(ctx.jobId, ctx.organizationId);
  if (!jobRow) throw new NotFoundError();
  if (jobRow.status !== "approved") throw new ForbiddenError("PDF reports require an approved job");

  const brandingPack = await getOrgBranding(ctx.organizationId);
  if (!brandingPack) throw new NotFoundError();
  const { org, branding } = brandingPack;
  const paper = ctx.paperSize ?? branding.paperSize ?? "A4";

  const db = getDb();
  const siteData = await getSiteForOrganization(jobRow.siteId, ctx.organizationId);
  const clientRow = siteData
    ? (
        await db
          .select()
          .from(clients)
          .where(and(eq(clients.id, siteData.clientId), eq(clients.organizationId, ctx.organizationId)))
          .limit(1)
      )[0]
    : undefined;

  const template = await getTemplateBundleByVersionId(jobRow.templateVersionId, ctx.organizationId);

  const reviewRows = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.jobId, ctx.jobId), eq(reviews.organizationId, ctx.organizationId)))
    .orderBy(asc(reviews.reviewedAt));

  const approvedReview = reviewRows.find((r) => r.verdict === "approved");
  const assignee = jobRow.assignedUserId
    ? (await db.select().from(users).where(eq(users.id, jobRow.assignedUserId)).limit(1))[0]
    : undefined;
  const reviewer = approvedReview
    ? (await db.select().from(users).where(eq(users.id, approvedReview.reviewerId)).limit(1))[0]
    : undefined;

  const itemResults = await db.select().from(jobItemResults).where(eq(jobItemResults.jobId, ctx.jobId));
  const evidenceRows = await listEvidenceForJob(ctx.jobId, ctx.organizationId);
  const photos = evidenceRows.filter(
    (e) => e.scanState === "ready" && (e.kind === "before" || e.kind === "after"),
  );

  const storage = getStorageAdapter();
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const [width, height] = PAGE_SIZES[paper];
  let page = pdf.addPage([width, height]);
  let y = height - 48;
  const margin = 48;
  const ref = ctx.jobId.slice(0, 8).toUpperCase();

  let logoHeight = 0;
  if (branding.logoObjectKey) {
    try {
      const logoObj = await storage.getObject(branding.logoObjectKey);
      if (logoObj) {
        const mime = branding.logoMimeType ?? logoObj.contentType;
        const logoImg =
          mime === "image/png" ? await pdf.embedPng(logoObj.body) : await pdf.embedJpg(logoObj.body);
        const maxW = 140;
        const maxH = 48;
        const scale = Math.min(maxW / logoImg.width, maxH / logoImg.height, 1);
        const lw = logoImg.width * scale;
        const lh = logoImg.height * scale;
        page.drawImage(logoImg, { x: width - margin - lw, y: height - margin - lh + 8, width: lw, height: lh });
        logoHeight = lh + 8;
      }
    } catch {
      /* missing or corrupt logo — report still generates */
    }
  }
  if (logoHeight > 0) y = Math.min(y, height - margin - logoHeight);

  const drawText = (text: string, opts?: { bold?: boolean; size?: number }) => {
    const size = opts?.size ?? 11;
    const f = opts?.bold ? fontBold : font;
    if (y < 72) {
      page = pdf.addPage([width, height]);
      y = height - 48;
    }
    page.drawText(text, {
      x: margin,
      y,
      size,
      font: f,
      color: rgb(0.1, 0.1, 0.15),
      maxWidth: width - margin * 2,
    });
    y -= size + 6;
  };

  drawText(org.displayName, { bold: true, size: 18 });
  if (branding.contactEmail) drawText(`Email: ${branding.contactEmail}`, { size: 10 });
  if (branding.contactPhone) drawText(`Tel: ${branding.contactPhone}`, { size: 10 });
  drawText(`Report reference: CP-${ref}`, { size: 10 });
  y -= 8;
  drawText("Completion report", { bold: true, size: 14 });

  drawText(`Job ID: ${ctx.jobId}`);
  drawText(`Client: ${clientRow?.displayName ?? "—"}`);
  drawText(`Site: ${siteData?.name ?? "—"}`);
  drawText(`Service: ${jobRow.title}`);
  drawText(`Scheduled: ${formatOrgDate(jobRow.startAt, org.timeZone, branding.dateFormat)}`);
  const submitted = itemResults.find((r) => r.submittedAt);
  if (submitted?.submittedAt) {
    drawText(
      `Completed: ${formatOrgDate(submitted.submittedAt.toISOString(), org.timeZone, branding.dateFormat)}`,
    );
  }
  drawText(`Cleaner: ${assignee?.name ?? "—"}`);
  drawText(`Supervisor: ${reviewer?.name ?? "—"}`);
  if (approvedReview) {
    drawText(
      `Approved: ${formatOrgDate(approvedReview.reviewedAt.toISOString(), org.timeZone, branding.dateFormat)}`,
    );
  }
  if (jobRow.jobKind === "reclean") drawText("Re-clean job (corrective action)");

  y -= 8;
  drawText("Checklist", { bold: true, size: 13 });
  const resultMap = new Map(itemResults.map((r) => [r.itemId, r]));
  for (const item of template?.items ?? []) {
    const r = resultMap.get(item.id);
    drawText(`• ${item.label} — ${r?.result ?? "pending"}${r?.exceptionReason ? ` (${r.exceptionReason})` : ""}`);
  }

  const passed = itemResults.filter((r) => r.result === "pass").length;
  drawText(`Summary: ${passed}/${template?.items.length ?? 0} tasks marked pass`);

  y -= 8;
  drawText("Quality review", { bold: true, size: 13 });
  for (const rev of reviewRows) {
    if (rev.verdict === "approved" && rev.notes) drawText(`Customer-visible note: ${rev.notes}`);
    if (ctx.includeInternalNotes && rev.internalNotes) drawText(`Internal: ${rev.internalNotes}`);
    drawText(`${rev.verdict} — ${formatOrgDate(rev.reviewedAt.toISOString(), org.timeZone, branding.dateFormat)}`);
  }

  y -= 8;
  drawText("Evidence photographs", { bold: true, size: 13 });
  for (const ev of photos) {
    const obj = await storage.getObject(ev.objectKey);
    if (!obj) continue;
    try {
      const img =
        ev.mimeType === "image/png" ? await pdf.embedPng(obj.body) : await pdf.embedJpg(obj.body);
      if (y < 200) {
        page = pdf.addPage([width, height]);
        y = height - 48;
      }
      const scale = Math.min(220 / img.width, 160 / img.height, 1);
      const w = img.width * scale;
      const h = img.height * scale;
      page.drawText(
        `${ev.kind} — ${formatOrgDate(ev.createdAt.toISOString(), org.timeZone, branding.dateFormat)}`,
        { x: margin, y, size: 9, font },
      );
      y -= 12;
      page.drawImage(img, { x: margin, y: y - h, width: w, height: h });
      y -= h + 16;
    } catch {
      drawText(`(${ev.kind} image unavailable)`);
    }
  }

  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawText(
      `${org.displayName} · Generated ${formatOrgDate(new Date().toISOString(), org.timeZone, branding.dateFormat)} · Page ${i + 1}`,
      { x: margin, y: 24, size: 8, font, color: rgb(0.4, 0.4, 0.45) },
    );
    p.drawText(`CP-${ref}`, { x: width - margin - 40, y: 24, size: 8, font });
  });

  return pdf.save();
}

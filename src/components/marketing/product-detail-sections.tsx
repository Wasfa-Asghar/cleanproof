import { ProductScreenshot } from "@/components/marketing/product-screenshot";
import type { ProductScreenshotKey } from "@/lib/marketing/image-manifest";

type ProductSection = { title: string; body: string };
type SectionPair = readonly [ProductSection, ProductSection];

export const FEATURE_DETAILS: Record<string, SectionPair> = {
  "cleaning-checklists": [
    { title: "Start with one site", body: "Pick a recurring visit and write one checklist item per area. Publish the template before scheduling the next visit so the cleaner receives the current instructions." },
    { title: "Review exceptions at handover", body: "Ask the cleaner to record a reason when a task cannot be completed. The supervisor can review that reason alongside the submitted checklist and evidence." },
  ],
  "photo-evidence": [
    { title: "Decide what needs a photo", body: "Use before and after photos for work that is hard to judge from a tick alone. Give cleaners a clear instruction about the area and angle to capture." },
    { title: "Review the evidence with the job", body: "Open the submitted visit and check that the photos match the task and site. Request clarification if the reviewer needs more detail." },
  ],
  "quality-inspections": [
    { title: "Set a review routine", body: "Give supervisors a regular time to check the quality queue. Open each submission to compare its checklist answers, notes and photos." },
    { title: "Explain the next action", body: "When a submission needs work, describe the specific task or evidence the cleaner should revisit. Keep the instruction on the job record for the next review." },
  ],
  "reclean-management": [
    { title: "Give the re-clean a clear scope", body: "Identify the affected area and the expected result. Use that scope to assign corrective work the cleaner can complete and document." },
    { title: "Verify the corrective visit", body: "Review the linked re-clean record alongside the original issue to confirm the follow-up addressed the reported problem." },
  ],
  "complaint-management": [
    { title: "Record the client’s concern", body: "Capture the site, the affected area and what the client observed. Link the relevant visit when you can identify it." },
    { title: "Keep the resolution traceable", body: "Use the issue record to track the response. If a re-clean is needed, link the corrective job so the team can find its result later." },
  ],
  "client-reports": [
    { title: "Check the report before sharing", body: "Open the approved report and confirm the site, visit date and evidence are appropriate for the recipient." },
    { title: "Share a record for that visit", body: "Send the report link to the intended client contact so they can open the completion view for the approved job." },
  ],
  "offline-field-workflow": [
    { title: "Prepare before entering a low-signal site", body: "Open the assigned job while connected so the field workspace can load the visit and its checklist." },
    { title: "Confirm pending work has synced", body: "After reconnecting, check the status of pending changes and uploads before assuming the supervisor can review the visit." },
  ],
  "team-management": [
    { title: "Match access to responsibilities", body: "Choose the role that matches the person’s work. Assign field visits to cleaners and route submitted jobs to supervisors for review." },
    { title: "Check the first assignment", body: "After inviting a cleaner, assign a visit and confirm they can see the job and its checklist in the field workspace." },
  ],
  "quality-analytics": [
    { title: "Review a consistent time window", body: "Use comparable periods when looking for changes in completion and quality. Check the underlying jobs for context before acting on a trend." },
    { title: "Turn patterns into a follow-up", body: "If the same area repeatedly needs attention, review the visit records and decide whether the checklist or site instructions need updating." },
  ],
};

export function ProductDetailSections({
  sections,
  screenshots,
}: {
  sections?: SectionPair;
  screenshots?: readonly [ProductScreenshotKey, ProductScreenshotKey];
}) {
  if (!sections) return null;

  if (screenshots) {
    return sections.map(({ title, body }, index) => (
      <section key={title} className="marketing-product-detail-section">
        <div className={`marketing-product-detail-grid mx-auto max-w-[1216px] px-4 ${index % 2 ? "is-reversed" : ""}`}>
          <div className="marketing-product-detail-copy">
            <span className="marketing-feature-proof-index">{String(index + 1).padStart(2, "0")}</span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--cp-navy)] md:text-3xl">{title}</h2>
            <p className="mt-4 max-w-xl leading-relaxed text-[var(--cp-muted)]">{body}</p>
          </div>
          <div className="marketing-product-detail-image">
            <ProductScreenshot screenshotKey={screenshots[index]} variant="default" showCaption={false} />
          </div>
        </div>
      </section>
    ));
  }

  return sections.map(({ title, body }) => (
    <section key={title} className="border-t border-[var(--cp-border)] py-10 sm:py-12">
      <div className="mx-auto grid max-w-[1216px] gap-3 px-4 md:grid-cols-2 md:gap-10">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--cp-navy)]">{title}</h2>
        <p className="max-w-xl leading-relaxed text-[var(--cp-muted)]">{body}</p>
      </div>
    </section>
  ));
}

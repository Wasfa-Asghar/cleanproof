import bcrypt from "bcryptjs";
import { addDays } from "date-fns";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  checklistTemplateVersions,
  checklistTemplates,
  clients,
  evidence,
  issues,
  jobs,
  memberships,
  organizations,
  reportShares,
  sites,
  subscriptions,
  templateItems,
  users,
} from "@/db/schema";
import { hashToken } from "@/lib/crypto/tokens";

export async function createMinimalOrg(label: string) {
  const db = getDb();
  const passwordHash = await bcrypt.hash("password12345", 12);

  const [org] = await db
    .insert(organizations)
    .values({
      legalName: `${label} Ltd`,
      displayName: label,
      region: "UK",
      currency: "GBP",
      timeZone: "Europe/London",
    })
    .returning();

  const [owner] = await db
    .insert(users)
    .values({ email: `${label.toLowerCase()}-owner@test.cleanproof`, passwordHash, name: `${label} Owner` })
    .returning();

  await db.insert(memberships).values({
    organizationId: org.id,
    userId: owner.id,
    role: "owner",
    status: "active",
  });

  const trialStart = new Date();
  const trialEnd = addDays(trialStart, 14);
  await db.insert(subscriptions).values({
    organizationId: org.id,
    plan: "starter",
    status: "trialing",
    trialStartsAt: trialStart,
    trialEndsAt: trialEnd,
    currentPeriodStart: trialStart,
    currentPeriodEnd: trialEnd,
  });

  const [client] = await db
    .insert(clients)
    .values({ organizationId: org.id, displayName: `${label} Client`, contactsJson: [] })
    .returning();

  const [site] = await db
    .insert(sites)
    .values({
      organizationId: org.id,
      clientId: client.id,
      name: `${label} Site`,
      addressLine1: "1 Test Street",
      city: "London",
      postcode: "E1 1AA",
      country: "GB",
      timeZone: "Europe/London",
      accessSensitivity: "standard",
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({ organizationId: org.id, name: "Test template", status: "published" })
    .returning();

  const [version] = await db
    .insert(checklistTemplateVersions)
    .values({ templateId: template.id, version: 1 })
    .returning();

  await db.insert(templateItems).values({
    templateVersionId: version.id,
    section: "General",
    label: "Task 1",
    taskType: "checkbox",
    required: true,
    evidencePolicy: "none",
    sortOrder: 0,
  });

  const [cleaner] = await db
    .insert(users)
    .values({
      email: `${label.toLowerCase()}-cleaner@test.cleanproof`,
      passwordHash,
      name: `${label} Cleaner`,
    })
    .returning();

  await db.insert(memberships).values({
    organizationId: org.id,
    userId: cleaner.id,
    role: "cleaner",
    status: "active",
  });

  const [job] = await db
    .insert(jobs)
    .values({
      organizationId: org.id,
      siteId: site.id,
      templateVersionId: version.id,
      title: `${label} Job`,
      startAt: new Date(),
      status: "assigned",
      assignedUserId: cleaner.id,
    })
    .returning();

  const [ev] = await db
    .insert(evidence)
    .values({
      organizationId: org.id,
      jobId: job.id,
      kind: "during",
      objectKey: `${org.id}/${job.id}/photo.jpg`,
      mimeType: "image/jpeg",
      sizeBytes: 1024,
      scanState: "ready",
    })
    .returning();

  const [issue] = await db
    .insert(issues)
    .values({
      organizationId: org.id,
      siteId: site.id,
      jobId: job.id,
      title: `${label} issue`,
      category: "quality",
      severity: "low",
      status: "open",
    })
    .returning();

  const [share] = await db
    .insert(reportShares)
    .values({
      organizationId: org.id,
      jobId: job.id,
      tokenHash: hashToken(`${label}-report-token`),
      expiresAt: new Date(Date.now() + 86400000),
    })
    .returning();

  const membershipRows = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.organizationId, org.id), eq(memberships.userId, owner.id)))
    .limit(1);

  return {
    org,
    owner,
    cleaner,
    site,
    job,
    ev,
    issue,
    share,
    membership: membershipRows[0],
    templateVersionId: version.id,
  };
}

export async function truncateAll() {
  const db = getDb();
  await db.execute(sql`
    TRUNCATE TABLE
      provider_event_log,
      billing_events,
      subscription_change_requests,
      billing_transactions,
      payment_attempts,
      billing_customers,
      audit_events,
      email_outbox,
      notifications,
      notification_preferences,
      csv_import_runs,
      team_invitations,
      issue_evidence,
      issue_activities,
      job_submissions,
      password_reset_tokens,
      report_shares,
      subscriptions,
      issues,
      reviews,
      evidence,
      job_item_results,
      jobs,
      template_items,
      checklist_template_versions,
      checklist_templates,
      sites,
      clients,
      memberships,
      users,
      organizations
    RESTART IDENTITY CASCADE
  `);
}

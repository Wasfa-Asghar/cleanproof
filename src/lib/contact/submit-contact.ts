import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { auditEvents, contactInquiries, memberships, users } from "@/db/schema";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { businessIdentity } from "@/lib/config/business-identity";
import { getContactMailProvider } from "@/lib/notifications/contact-mail";

export type ContactPayload = {
  name: string;
  email: string;
  company: string;
  country: string;
  enquiryType: string;
  message: string;
  website?: string;
  clientIpHash?: string;
};

const DEMO_OWNER_EMAIL = "owner@demo.cleanproof.app";

export async function submitContactInquiry(
  payload: ContactPayload,
): Promise<{ status: "stored" | "rejected"; reason?: string; inquiryId?: string }> {
  if (payload.website) {
    return { status: "rejected", reason: "spam" };
  }
  const ipKey = rateLimitKey("contact", payload.email);
  if (!checkRateLimit(ipKey, 5, 60 * 60 * 1000)) {
    return { status: "rejected", reason: "rate_limit" };
  }

  const db = getDb();

  const [inserted] = await db
    .insert(contactInquiries)
    .values({
      name: payload.name,
      email: payload.email,
      company: payload.company,
      country: payload.country,
      enquiryType: payload.enquiryType,
      message: payload.message,
      status: "new",
      sourceIpHash: payload.clientIpHash,
    })
    .returning({ id: contactInquiries.id });

  const inquiryId = inserted?.id;
  if (!inquiryId) {
    return { status: "rejected", reason: "storage_failed" };
  }

  /** Optional duplicate log line for demo org audit trail (local debugging). Never required for routing. */
  try {
    let membership = null as { organizationId: string } | null;
    const [owner] = await db.select().from(users).where(eq(users.email, DEMO_OWNER_EMAIL)).limit(1);
    if (owner) {
      const [m] = await db.select().from(memberships).where(eq(memberships.userId, owner.id)).limit(1);
      membership = m ?? null;
    }
    if (membership) {
      await db.insert(auditEvents).values({
        organizationId: membership.organizationId,
        action: "contact.inquiry",
        objectType: "contact_inquiry",
        objectId: inquiryId,
        payload: {
          inquiryId,
          supportEmailTarget: businessIdentity.supportEmail,
          receivedAt: new Date().toISOString(),
        },
      });
    }
  } catch {
    // Best-effort — primary record is contact_inquiries
  }

  const support = businessIdentity.supportEmail;
  if (typeof support === "string" && support !== "REQUIRES_VERIFICATION") {
    const mail = getContactMailProvider();
    const sent = await mail.sendContactNotification({
      toSupport: support,
      inquiryId,
      replyTo: payload.email,
      subject: `[CleanProof contact] ${payload.enquiryType} from ${payload.name}`,
      textBody: [
        `Enquiry ID: ${inquiryId}`,
        `From: ${payload.name} <${payload.email}>`,
        `Company: ${payload.company || "not given"}`,
        `Country: ${payload.country || "not given"}`,
        `Type: ${payload.enquiryType}`,
        "",
        payload.message,
      ].join("\n"),
    });
    if (!sent.ok) console.error("[contact] notification email not delivered:", sent.error);
  }

  return { status: "stored", inquiryId };
}

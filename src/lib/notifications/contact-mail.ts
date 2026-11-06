import { escapeHtml } from "@/lib/notifications/escape";
import { getEmailProvider, isSmtpConfigured } from "@/lib/notifications/email-provider";

export type ContactMailPayload = {
  toSupport: string;
  subject: string;
  textBody: string;
  inquiryId: string;
  /** Visitor email, used as Reply-To so support can answer directly. */
  replyTo?: string;
};

export interface ContactMailProvider {
  sendContactNotification(payload: ContactMailPayload): Promise<{ ok: true } | { ok: false; error: string }>;
}

/** Used when SMTP is not configured: callers must not claim delivery succeeded. */
export class NoopContactMailProvider implements ContactMailProvider {
  async sendContactNotification(): Promise<{ ok: false; error: string }> {
    return { ok: false, error: "contact_email_provider_not_configured" };
  }
}

export class SmtpContactMailProvider implements ContactMailProvider {
  async sendContactNotification(payload: ContactMailPayload): Promise<{ ok: true } | { ok: false; error: string }> {
    const result = await getEmailProvider().send({
      to: payload.toSupport,
      subject: payload.subject,
      text: payload.textBody,
      html: `<pre style="font-family:system-ui,sans-serif;white-space:pre-wrap">${escapeHtml(payload.textBody)}</pre>`,
      replyTo: payload.replyTo,
    });
    return result.ok ? { ok: true } : { ok: false, error: result.reason };
  }
}

export function getContactMailProvider(): ContactMailProvider {
  return isSmtpConfigured() ? new SmtpContactMailProvider() : new NoopContactMailProvider();
}

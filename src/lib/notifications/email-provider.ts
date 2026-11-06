import nodemailer, { type Transporter } from "nodemailer";

export type EmailDeliveryResult = { ok: true } | { ok: false; reason: string };

export type OutgoingEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export interface EmailProvider {
  send(input: OutgoingEmail): Promise<EmailDeliveryResult>;
}

/** Development: always succeeds; message stored in outbox for inspection. Never used on a production deployment. */
export class DevEmailProvider implements EmailProvider {
  async send() {
    return { ok: true as const };
  }
}

export type SmtpSettings = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
};

/** Reads SMTP settings from the environment. Returns null when email is not configured. */
export function readSmtpSettings(env: NodeJS.ProcessEnv = process.env): SmtpSettings | null {
  const host = env.SMTP_HOST?.trim();
  const from = env.EMAIL_FROM?.trim();
  if (!host || !from) return null;
  const port = Number(env.SMTP_PORT ?? 587);
  const secure = env.SMTP_SECURE ? env.SMTP_SECURE === "true" : port === 465;
  return {
    host,
    port: Number.isFinite(port) ? port : 587,
    secure,
    user: env.SMTP_USER?.trim() || undefined,
    pass: env.SMTP_PASS || undefined,
    from,
  };
}

export function isSmtpConfigured(): boolean {
  return readSmtpSettings() !== null;
}

/** Real delivery over SMTP (works with Google Workspace, Zoho, Microsoft 365, Resend, Postmark, Brevo, etc.). */
export class SmtpEmailProvider implements EmailProvider {
  private transporter: Transporter | null = null;

  constructor(private readonly settings: SmtpSettings) {}

  private getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: this.settings.host,
        port: this.settings.port,
        secure: this.settings.secure,
        auth: this.settings.user ? { user: this.settings.user, pass: this.settings.pass } : undefined,
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000,
      });
    }
    return this.transporter;
  }

  async send(input: OutgoingEmail): Promise<EmailDeliveryResult> {
    try {
      await this.getTransporter().sendMail({
        from: this.settings.from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        replyTo: input.replyTo,
      });
      return { ok: true };
    } catch (err) {
      const reason = err instanceof Error ? err.message : "SMTP send failed";
      console.error("[email] SMTP send failed:", reason);
      return { ok: false, reason };
    }
  }
}

/** Used on production deployments when SMTP is missing: fails loudly instead of pretending to send. */
export class UnconfiguredEmailProvider implements EmailProvider {
  async send(): Promise<EmailDeliveryResult> {
    return { ok: false, reason: "Email is not configured (set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and EMAIL_FROM)." };
  }
}

export function getEmailProvider(): EmailProvider {
  const settings = readSmtpSettings();
  if (settings) return new SmtpEmailProvider(settings);
  if (process.env.CLEANPROOF_DEPLOYMENT === "production") return new UnconfiguredEmailProvider();
  return new DevEmailProvider();
}

import { afterEach, describe, expect, it } from "vitest";
import { getEmailProvider, readSmtpSettings, DevEmailProvider, SmtpEmailProvider, UnconfiguredEmailProvider } from "@/lib/notifications/email-provider";

const KEYS = ["SMTP_HOST", "SMTP_PORT", "SMTP_SECURE", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM", "CLEANPROOF_DEPLOYMENT"] as const;

afterEach(() => {
  for (const k of KEYS) delete process.env[k];
});

describe("email provider selection", () => {
  it("needs both a host and a from address", () => {
    expect(readSmtpSettings({ SMTP_HOST: "smtp.example.com" } as unknown as NodeJS.ProcessEnv)).toBeNull();
    expect(readSmtpSettings({ EMAIL_FROM: "a@b.co" } as unknown as NodeJS.ProcessEnv)).toBeNull();
  });

  it("reads port, TLS mode and credentials", () => {
    const s = readSmtpSettings({ SMTP_HOST: "smtp.example.com", SMTP_PORT: "465", SMTP_USER: "u", SMTP_PASS: "p", EMAIL_FROM: "CleanProof <a@b.co>" } as unknown as NodeJS.ProcessEnv);
    expect(s).toMatchObject({ host: "smtp.example.com", port: 465, secure: true, user: "u", pass: "p" });
    const s2 = readSmtpSettings({ SMTP_HOST: "h", EMAIL_FROM: "a@b.co" } as unknown as NodeJS.ProcessEnv);
    expect(s2).toMatchObject({ port: 587, secure: false });
  });

  it("uses SMTP when configured, the dev stub locally, and fails loudly in production without SMTP", async () => {
    expect(getEmailProvider()).toBeInstanceOf(DevEmailProvider);
    process.env.CLEANPROOF_DEPLOYMENT = "production";
    const unconfigured = getEmailProvider();
    expect(unconfigured).toBeInstanceOf(UnconfiguredEmailProvider);
    expect((await unconfigured.send({ to: "x@y.co", subject: "s", html: "h", text: "t" })).ok).toBe(false);
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.EMAIL_FROM = "CleanProof <sales@thehouseofveynor.uk>";
    expect(getEmailProvider()).toBeInstanceOf(SmtpEmailProvider);
  });

  it("reports a send failure instead of pretending it worked", async () => {
    const p = new SmtpEmailProvider({ host: "127.0.0.1", port: 1, secure: false, from: "a@b.co" });
    const r = await p.send({ to: "x@y.co", subject: "s", html: "<p>h</p>", text: "t" });
    expect(r.ok).toBe(false);
  });
});

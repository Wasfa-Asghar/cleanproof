import { getEmailProvider } from "@/lib/notifications/email-provider";
import { emailPlain, wrapEmailHtml } from "@/lib/notifications/templates";
import { getEnv } from "@/lib/env";

export async function sendPasswordResetEmail(to: string, token: string) {
  const base = (getEnv().APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const link = `${base}/auth/reset?token=${encodeURIComponent(token)}`;
  const title = "Reset your CleanProof password";
  const body = "We received a request to reset your password. This link works for one hour. If you did not ask for this, you can ignore this email and your password will stay the same.";
  const result = await getEmailProvider().send({
    to,
    subject: title,
    html: wrapEmailHtml({
      companyName: "CleanProof",
      title,
      bodyHtml: `<p>${body}</p>`,
      actionUrl: link,
      actionLabel: "Choose a new password",
    }),
    text: emailPlain(title, body, link),
  });
  if (!result.ok) console.error("[auth] password reset email not delivered:", result.reason);
}

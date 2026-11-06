import { escapeHtml } from "@/lib/notifications/escape";

export function wrapEmailHtml(input: {
  companyName: string;
  title: string;
  bodyHtml: string;
  actionUrl?: string;
  actionLabel?: string;
}) {
  const action = input.actionUrl
    ? `<p style="margin-top:24px"><a href="${escapeHtml(input.actionUrl)}" style="background:#0c4a6e;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">${escapeHtml(input.actionLabel ?? "Open in CleanProof")}</a></p>`
    : "";
  return `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;color:#0f172a;line-height:1.5">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em">${escapeHtml(input.companyName)}</p>
    <h1 style="font-size:20px;margin:8px 0 16px">${escapeHtml(input.title)}</h1>
    <div>${input.bodyHtml}</div>
    ${action}
    <p style="margin-top:32px;font-size:12px;color:#94a3b8">You received this because of your CleanProof notification settings.</p>
  </div></body></html>`;
}

export function emailPlain(title: string, body: string, actionUrl?: string) {
  return `${title}\n\n${body}${actionUrl ? `\n\nOpen: ${actionUrl}` : ""}`;
}

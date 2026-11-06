"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getMembershipForUser, getUserByEmail, getDemoUserByRole } from "@/lib/db/queries";
import { createOrganizationWithOwner } from "@/lib/db/mutations";
import { isSmtpConfigured } from "@/lib/notifications/email-provider";
import { sendPasswordResetEmail } from "@/lib/auth/reset-email";
import { createPasswordResetToken, resetPasswordWithToken } from "@/lib/db/password-reset";
import { isDemoModeEnabled } from "@/lib/env";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { clearSession, createSession } from "./session";

const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (process.env.DISABLE_AUTH_RATE_LIMIT !== "true") {
    if (!checkRateLimit(rateLimitKey("login", email || "unknown"), LOGIN_LIMIT, LOGIN_WINDOW_MS)) {
      redirect("/auth/login?error=rate");
    }
  }
  const user = await getUserByEmail(email);
  if (!user) redirect("/auth/login?error=invalid");
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) redirect("/auth/login?error=invalid");

  const membership = await getMembershipForUser(user.id);
  if (!membership) redirect("/auth/login?error=no_org");

  await createSession({
    userId: user.id,
    organizationId: membership.organizationId,
    role: membership.role,
  });

  if (membership.role === "cleaner") redirect("/field/today");
  redirect("/app/overview");
}

export async function signupAction(formData: FormData) {
  const company = String(formData.get("company") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!company || !name || !email || password.length < 8) {
    redirect("/auth/signup?error=invalid");
  }
  const existing = await getUserByEmail(email);
  if (existing) redirect("/auth/signup?error=exists");

  const passwordHash = await bcrypt.hash(password, 12);
  const { org, user } = await createOrganizationWithOwner({ company, name, email, passwordHash });

  await createSession({ userId: user.id, organizationId: org.id, role: "owner" });
  redirect("/onboarding");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!checkRateLimit(rateLimitKey("reset", email || "unknown"), 5, LOGIN_WINDOW_MS)) {
    redirect("/auth/reset?sent=1");
  }
  const token = await createPasswordResetToken(email);
  if (token) {
    if (isSmtpConfigured()) {
      await sendPasswordResetEmail(email, token);
    } else if (process.env.NODE_ENV !== "production" && process.env.CLEANPROOF_DEPLOYMENT !== "production") {
      /* Local development only: no mail server, so show the link directly. */
      redirect(`/auth/reset?token=${encodeURIComponent(token)}`);
    }
  }
  redirect("/auth/reset?sent=1");
}

export async function completePasswordResetAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  try {
    await resetPasswordWithToken(token, password);
    redirect("/auth/login?reset=success");
  } catch {
    redirect("/auth/reset?error=invalid");
  }
}

export async function demoLoginOwnerAction() {
  return demoLoginAction("owner");
}

export async function demoLoginManagerAction() {
  return demoLoginAction("manager");
}

export async function demoLoginCleanerAction() {
  return demoLoginAction("cleaner");
}

async function demoLoginAction(role: "owner" | "manager" | "cleaner") {
  if (!isDemoModeEnabled()) redirect("/auth/login?error=demo_disabled");
  const user = await getDemoUserByRole(role);
  if (!user) redirect("/auth/login?error=demo");
  const membership = await getMembershipForUser(user.id);
  if (!membership) redirect("/auth/login?error=demo");

  await createSession({
    userId: user.id,
    organizationId: membership.organizationId,
    role: membership.role,
  });
  if (role === "cleaner") redirect("/field/today");
  redirect("/app/overview");
}

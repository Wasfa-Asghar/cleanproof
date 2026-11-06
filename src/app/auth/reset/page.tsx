import Link from "next/link";
import { completePasswordResetAction, requestPasswordResetAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Reset password" };

export default async function ResetPage({ searchParams }: PageProps<"/auth/reset">) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : undefined;
  const sent = params.sent;
  const error = params.error;

  if (token) {
    return (
      <div className="mx-auto w-full max-w-[440px]">
        <h1 className="text-[clamp(1.6rem,3vw,1.85rem)] font-semibold tracking-tight text-[var(--cp-navy)]">Choose a new password</h1>
        {error ? (
          <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
            This reset link is invalid or expired.
          </p>
        ) : null}
        <form action={completePasswordResetAction} className="mt-8 space-y-4">
          <input type="hidden" name="token" value={token} />
          <label className="block text-sm" htmlFor="auth-reset-new-password">
            <span className="font-medium text-[var(--cp-navy)]">New password</span>
            <input
              id="auth-reset-new-password"
              name="password"
              type="password"
              minLength={8}
              required
              autoComplete="new-password"
              className="mt-1.5 w-full rounded-lg border border-[var(--cp-border)] bg-white px-3 py-2.5 text-[15px] focus:border-[var(--cp-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--cp-teal)]/25"
            />
          </label>
          <Button type="submit" className="w-full bg-[var(--cp-teal)] py-3 font-semibold hover:bg-[var(--cp-teal-600)]">
            Update password
          </Button>
        </form>
        <p className="mt-4 text-sm">
          <Link href="/auth/login" className="font-semibold text-[#07878a] hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[440px]">
      <h1 className="text-[clamp(1.6rem,3vw,1.85rem)] font-semibold tracking-tight text-[var(--cp-navy)]">Reset password</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-[var(--cp-muted)]">
        Enter the email address you use for CleanProof and we will send you a link to choose a new password.
      </p>
      {sent ? (
        <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          If an account exists for that address, we have sent a reset link. It works for one hour. Check your spam folder if it does not arrive within a few minutes.
        </p>
      ) : null}
      <form action={requestPasswordResetAction} className="mt-8 space-y-4">
        <label className="block text-sm" htmlFor="auth-reset-email">
          <span className="font-medium text-[var(--cp-navy)]">Email</span>
          <input
            id="auth-reset-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1.5 w-full rounded-lg border border-[var(--cp-border)] bg-white px-3 py-2.5 text-[15px] focus:border-[var(--cp-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--cp-teal)]/25"
          />
        </label>
        <Button type="submit" className="w-full bg-[var(--cp-teal)] py-3 font-semibold hover:bg-[var(--cp-teal-600)]">
          Request reset link
        </Button>
      </form>
      <p className="mt-4 text-sm">
        <Link href="/auth/login" className="font-semibold text-[#07878a] hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

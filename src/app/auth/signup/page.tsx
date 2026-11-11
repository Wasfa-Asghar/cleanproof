import Link from "next/link";
import { signupAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { TRIAL_COPY } from "@/lib/marketing/plans-display";

export const metadata = { title: "Sign up" };
export const instant = false;

export default async function SignupPage({ searchParams }: PageProps<"/auth/signup">) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto w-full max-w-[440px]">
      <h1 className="text-[clamp(1.6rem,3vw,1.85rem)] font-semibold tracking-tight text-[var(--cp-navy)]">Create your organisation</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-[var(--cp-muted)]">
        Start a {TRIAL_COPY.days}-day trial on Starter entitlements. No card needed to start.
      </p>
      {error ? (
        <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
          Please check your details (password at least 8 characters).
        </p>
      ) : null}
      <form action={signupAction} className="mt-8 space-y-4">
        <label className="block text-sm" htmlFor="signup-company">
          <span className="font-medium text-[var(--cp-navy)]">Company name</span>
          <input
            id="signup-company"
            name="company"
            required
            className="mt-1.5 w-full rounded-lg border border-[var(--cp-border)] bg-white px-3 py-2.5 text-[15px] focus:border-[var(--cp-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--cp-teal)]/25"
          />
        </label>
        <label className="block text-sm" htmlFor="signup-name">
          <span className="font-medium text-[var(--cp-navy)]">Your name</span>
          <input
            id="signup-name"
            name="name"
            required
            className="mt-1.5 w-full rounded-lg border border-[var(--cp-border)] bg-white px-3 py-2.5 text-[15px] focus:border-[var(--cp-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--cp-teal)]/25"
          />
        </label>
        <label className="block text-sm" htmlFor="signup-email">
          <span className="font-medium text-[var(--cp-navy)]">Work email</span>
          <input
            id="signup-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1.5 w-full rounded-lg border border-[var(--cp-border)] bg-white px-3 py-2.5 text-[15px] focus:border-[var(--cp-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--cp-teal)]/25"
          />
        </label>
        <label className="block text-sm" htmlFor="signup-password">
          <span className="font-medium text-[var(--cp-navy)]">Password</span>
          <PasswordInput
            id="signup-password"
            name="password"
            minLength={8}
            required
            autoComplete="new-password"
            className="mt-1.5"
          />
          <span className="mt-1.5 block text-xs text-[var(--cp-muted)]">At least 8 characters. Use the eye icon to check what you typed.</span>
        </label>
        <Button type="submit" className="w-full bg-[var(--cp-teal)] py-3 font-semibold hover:bg-[var(--cp-teal-600)]">
          Continue
        </Button>
      </form>
      <p className="mt-6 text-sm text-[var(--cp-muted)]">{TRIAL_COPY.note}</p>
      <p className="mt-4 text-sm">
        <Link href="/auth/login" className="font-semibold text-[#07878a] hover:underline">
          Already have an account?
        </Link>
      </p>
    </div>
  );
}

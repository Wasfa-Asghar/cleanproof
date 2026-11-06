import Link from "next/link";
import { Suspense } from "react";
import { loginAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { isDemoModeEnabled } from "@/lib/env";
import { LoginMessages } from "./login-messages";

export const metadata = { title: "Sign in" };
export const instant = false;

async function LoginAlerts({ searchParams }: { searchParams: Promise<{ error?: string; reset?: string }> }) {
  const params = await searchParams;
  return <LoginMessages error={params.error} reset={params.reset} />;
}

export default function LoginPage({ searchParams }: PageProps<"/auth/login">) {
  const demoAvailable = isDemoModeEnabled();

  return (
    <div className="mx-auto w-full max-w-[440px]">
      <h1 className="text-[clamp(1.6rem,3vw,1.85rem)] font-semibold tracking-tight text-[var(--cp-navy)]">Sign in</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-[var(--cp-muted)]">Use your work email and password. Sessions use secure HTTP-only cookies.</p>
      <Suspense fallback={null}>
        <LoginAlerts searchParams={searchParams} />
      </Suspense>
      <form action={loginAction} className="mt-8 space-y-4">
        <label className="block text-sm" htmlFor="auth-email">
          <span className="font-medium text-[var(--cp-navy)]">Email</span>
          <input
            id="auth-email"
            name="email"
            type="email"
            required
            className="mt-1.5 w-full rounded-lg border border-[var(--cp-border)] bg-white px-3 py-2.5 text-[15px] focus:border-[var(--cp-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--cp-teal)]/25"
            autoComplete="email"
          />
        </label>
        <label className="block text-sm" htmlFor="auth-password">
          <span className="font-medium text-[var(--cp-navy)]">Password</span>
          <input
            id="auth-password"
            name="password"
            type="password"
            required
            className="mt-1.5 w-full rounded-lg border border-[var(--cp-border)] bg-white px-3 py-2.5 text-[15px] focus:border-[var(--cp-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--cp-teal)]/25"
            autoComplete="current-password"
          />
        </label>
        <Button type="submit" className="w-full bg-[var(--cp-teal)] py-3 font-semibold hover:bg-[var(--cp-teal-600)]">
          Sign in
        </Button>
      </form>
      <p className="mt-4 text-sm">
        <Link href="/auth/reset" className="font-semibold text-[#07878a] hover:underline">
          Forgot password?
        </Link>
      </p>
      {demoAvailable ? (
        <p className="mt-4 rounded-lg bg-[var(--cp-section-muted)] px-3 py-2 text-sm text-[var(--cp-muted)]">
          Local demo accounts: open{" "}
          <Link href="/demo" className="font-semibold text-[#07878a] hover:underline">
            /demo
          </Link>{" "}
         , do not share demo credentials in production builds.
        </p>
      ) : null}
      <p className="mt-4 text-sm">
        <Link href="/auth/signup" className="font-semibold text-[#07878a] hover:underline">
          Create organisation
        </Link>
      </p>
    </div>
  );
}

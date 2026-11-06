import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Onboarding" };
export const instant = false;

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const steps = [
    "Company profile and time zone",
    "First client site with access notes",
    "Pick office or end-of-tenancy checklist template",
    "Invite cleaner and assign first job",
    "Preview branded client report",
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold">Welcome to CleanProof</h1>
      <p className="mt-2 text-slate-600">Target: complete setup in under 15 minutes.</p>
      <ol className="mt-8 list-decimal space-y-3 pl-5 text-slate-800">
        {steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button href="/app/sites">Add first site</Button>
        <Button href="/app/templates" variant="secondary">
          Templates
        </Button>
        <Link href="/app/overview" className="text-sm text-sky-800 underline self-center">
          Skip to dashboard
        </Link>
      </div>
    </div>
  );
}

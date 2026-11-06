import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { getPaymentProvider } from "@/lib/payments/provider";
import { getMockPaymentProvider } from "@/lib/payments/mock-provider";
import { isMockBillingAllowed } from "@/lib/billing/guards";
import { getPlan, isPlanId } from "@/lib/billing/plans";
import { redirect } from "next/navigation";

export const metadata = { title: "Checkout (simulated)" };
export const instant = false;

export default async function BillingCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  if (session.role !== "owner") redirect("/app/settings/billing");

  const params = await searchParams;
  const checkoutSessionRef = params.session ?? "";
  if (!checkoutSessionRef || !isMockBillingAllowed()) {
    redirect("/app/settings/billing");
  }

  const provider = getPaymentProvider();
  const payment = await provider.retrievePayment(checkoutSessionRef);
  const mockMeta = getMockPaymentProvider().getSessionPlan(checkoutSessionRef);
  if (!payment || !mockMeta || mockMeta.organizationId !== session.organizationId) {
    redirect("/app/settings/billing");
  }
  const plan = isPlanId(mockMeta.planId) ? getPlan(mockMeta.planId) : null;

  return (
    <>
      <PageHeader
        title="Development checkout"
        description="Simulated payment — no real funds are collected. Choose an outcome to test billing."
      />
      <div className="max-w-lg space-y-4 rounded-xl border border-amber-200 bg-amber-50 p-6">
        <p className="text-sm font-medium text-amber-900">Mock payment simulation</p>
        {plan ? (
          <p className="text-slate-800">
            {plan.name} — £{(payment.amountMinor / 100).toFixed(2)}/mo ({payment.currency})
          </p>
        ) : null}
        <p className="text-sm text-slate-600">Status: {payment.status}</p>
        <div className="flex flex-wrap gap-2">
          <form action="/api/billing/mock/complete" method="post">
            <input type="hidden" name="session" value={checkoutSessionRef} />
            <input type="hidden" name="outcome" value="success" />
            <Button type="submit">Simulate successful payment</Button>
          </form>
          <form action="/api/billing/mock/complete" method="post">
            <input type="hidden" name="session" value={checkoutSessionRef} />
            <input type="hidden" name="outcome" value="failure" />
            <Button type="submit" variant="secondary">
              Simulate failed payment
            </Button>
          </form>
          <form action="/api/billing/mock/complete" method="post">
            <input type="hidden" name="session" value={checkoutSessionRef} />
            <input type="hidden" name="outcome" value="canceled" />
            <Button type="submit" variant="secondary">
              Simulate canceled checkout
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

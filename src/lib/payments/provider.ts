import { getMockPaymentProvider } from "@/lib/payments/mock-provider";
import { getMolliePaymentProvider, isMollieConfigured } from "@/lib/payments/mollie-provider";
import { isProductionDeployment } from "@/lib/billing/guards";
import type { PaymentProvider } from "@/lib/payments/types";

/**
 * Production deployments always use Mollie and refuse to start checkout without a key.
 * Elsewhere, set CLEANPROOF_PAYMENT_PROVIDER=mollie (with a test_ key) to try the real flow; the default is the mock.
 */
export function getPaymentProvider(): PaymentProvider {
  const configured = process.env.CLEANPROOF_PAYMENT_PROVIDER ?? (isProductionDeployment() ? "mollie" : "mock");
  if (configured === "mollie") {
    if (!isMollieConfigured()) {
      throw new Error("Mollie is selected but MOLLIE_API_KEY is not set.");
    }
    return getMolliePaymentProvider();
  }
  return getMockPaymentProvider();
}

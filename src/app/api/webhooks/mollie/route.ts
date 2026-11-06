import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { paymentAttempts } from "@/db/schema";
import { applyRecurringPayment, ensureRecurringBilling, reconcileCheckoutSession } from "@/lib/billing/subscription-service";
import { getMolliePaymentProvider, isMollieConfigured } from "@/lib/payments/mollie-provider";

/**
 * Mollie webhook. The body only carries a payment id (`id=tr_xxx`), so we never trust it:
 * the payment is fetched from the Mollie API with our key before anything changes.
 * Always answers 200 for ids we cannot match, so Mollie does not retry forever and nothing leaks.
 */
export async function POST(request: Request) {
  if (!isMollieConfigured()) return NextResponse.json({ received: true });

  let paymentId = "";
  try {
    const raw = await request.text();
    paymentId = new URLSearchParams(raw).get("id") ?? "";
    if (!paymentId) {
      try {
        paymentId = String((JSON.parse(raw) as { id?: string }).id ?? "");
      } catch {
        paymentId = "";
      }
    }
  } catch {
    return NextResponse.json({ received: true });
  }
  if (!/^tr_[A-Za-z0-9]+$/.test(paymentId)) return NextResponse.json({ received: true });

  try {
    const mollie = getMolliePaymentProvider();
    const payment = await mollie.getPaymentDetails(paymentId);
    if (!payment) return NextResponse.json({ received: true });

    if (payment.sequenceType === "recurring" || payment.subscriptionId) {
      await applyRecurringPayment(payment);
      return NextResponse.json({ received: true });
    }

    const db = getDb();
    const [attempt] = await db
      .select()
      .from(paymentAttempts)
      .where(and(eq(paymentAttempts.checkoutSessionRef, paymentId), eq(paymentAttempts.provider, "mollie")))
      .limit(1);
    if (!attempt) return NextResponse.json({ received: true });

    if (payment.status !== "pending") {
      await reconcileCheckoutSession(attempt.organizationId, paymentId, `mollie:${paymentId}:${payment.status}`);
    }
    await ensureRecurringBilling(attempt.organizationId);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[mollie webhook]", err);
    // 500 makes Mollie retry later, which is what we want for a temporary failure.
    return NextResponse.json({ error: "processing_failed" }, { status: 500 });
  }
}

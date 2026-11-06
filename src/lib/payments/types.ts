import type { PlanId } from "@/lib/billing/plans";

export type PaymentProviderId = "mock" | "mollie";

export type CheckoutSessionInput = {
  organizationId: string;
  planId: PlanId;
  amountMinor: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
  customerEmail?: string;
  customerName?: string;
};

export type CheckoutSessionResult = {
  provider: PaymentProviderId;
  checkoutSessionRef: string;
  checkoutUrl: string;
  simulated: boolean;
};

export type ProviderPaymentStatus = "pending" | "paid" | "failed" | "canceled" | "expired";

export type ProviderPayment = {
  checkoutSessionRef: string;
  status: ProviderPaymentStatus;
  amountMinor: number;
  currency: string;
  failureReason?: string;
};

export type ProviderSubscription = {
  externalRef: string;
  status: "active" | "canceled" | "past_due" | "expired";
  currentPeriodEnd?: Date;
};

export type ProviderEvent = {
  provider: PaymentProviderId;
  externalEventId: string;
  type: string;
  checkoutSessionRef?: string;
  payload: Record<string, unknown>;
};

export type RecurringSubscriptionInput = {
  organizationId: string;
  customerId: string;
  planId: PlanId;
  amountMinor: number;
  currency: string;
  /** First recurring charge, YYYY-MM-DD (the first month is already paid at checkout). */
  startDate: string;
};

export interface PaymentProvider {
  id: PaymentProviderId;
  simulated: boolean;
  createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult>;
  retrievePayment(checkoutSessionRef: string): Promise<ProviderPayment | null>;
  retrieveSubscription(externalRef: string): Promise<ProviderSubscription | null>;
  cancelSubscription(externalRef: string): Promise<void>;
  handleProviderEvent(event: ProviderEvent): Promise<{ handled: boolean; checkoutSessionRef?: string }>;
  getCustomerBillingReference(organizationId: string): Promise<string | null>;
  /** Real providers only: monthly recurring charges after the first payment. */
  createRecurringSubscription?(input: RecurringSubscriptionInput): Promise<{ subscriptionId: string }>;
  cancelRecurringSubscription?(customerId: string, subscriptionId: string): Promise<void>;
  updateRecurringAmount?(customerId: string, subscriptionId: string, amountMinor: number, currency: string, planId: string): Promise<void>;
}

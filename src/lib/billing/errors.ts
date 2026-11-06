import { AppError, publicErrorMessage } from "@/lib/errors";

export class EntitlementError extends AppError {
  constructor(message: string) {
    super("ENTITLEMENT", message, 403, true);
  }
}

export class BillingError extends AppError {
  constructor(message: string) {
    super("BILLING", message, 400, true);
  }
}

export function billingPublicMessage(err: unknown): string {
  if (err instanceof EntitlementError || err instanceof BillingError) return err.message;
  return publicErrorMessage(err);
}

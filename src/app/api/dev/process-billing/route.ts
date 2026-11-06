import { NextResponse } from "next/server";
import { isBillingDevProcessorAllowed } from "@/lib/billing/guards";
import { processBillingCycle } from "@/lib/billing/scheduler";

export async function POST() {
  if (!isBillingDevProcessorAllowed()) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  const result = await processBillingCycle();
  return NextResponse.json({ ok: true, result });
}

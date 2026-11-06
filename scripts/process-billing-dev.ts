import { processBillingCycle } from "../src/lib/billing/scheduler";
import { isBillingDevProcessorAllowed } from "../src/lib/billing/guards";

async function main() {
  if (!isBillingDevProcessorAllowed()) {
    console.error("Billing processor is disabled for this deployment.");
    process.exit(1);
  }
  const result = await processBillingCycle();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

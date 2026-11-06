import { isDemoModeEnabled } from "@/lib/env";

export function isDevToolsEnabled() {
  if (process.env.CLEANPROOF_DEPLOYMENT === "production") return false;
  if (process.env.NODE_ENV === "production" && !isDemoModeEnabled()) return false;
  return true;
}

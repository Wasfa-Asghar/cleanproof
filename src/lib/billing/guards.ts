/** True only for explicitly configured production deployments (not CI/local NODE_ENV alone). */
export function isProductionDeployment(): boolean {
  return process.env.CLEANPROOF_DEPLOYMENT === "production";
}

/** Mock/simulated billing operations are never allowed in production deployment. */
export function isMockBillingAllowed(): boolean {
  if (process.env.CLEANPROOF_DEPLOYMENT === "production") return false;
  if (process.env.CLEANPROOF_DEV_PGLITE === "true" || process.env.USE_PGLITE === "true") {
    return true;
  }
  return process.env.NODE_ENV !== "production";
}

export function isBillingDevProcessorAllowed(): boolean {
  if (isProductionDeployment()) return false;
  return process.env.CLEANPROOF_DEV_PGLITE === "true" || process.env.USE_PGLITE === "true" || process.env.NODE_ENV !== "production";
}

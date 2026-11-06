import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(1),
  APP_URL: z.string().url().optional(),
  /** Explicit opt-in for demo org + /demo one-click login — never on deployed production. */
  ALLOW_DEMO_MODE: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
  /** Set to `production` on live deployments to enforce stricter checks. */
  CLEANPROOF_DEPLOYMENT: z.enum(["production", "staging", "local"]).optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

/** Test-only: reset cached env between unit tests. */
export function resetEnvCacheForTests() {
  cached = null;
}

export function getEnv(): AppEnv {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid environment: ${message}`);
  }
  if (parsed.data.CLEANPROOF_DEPLOYMENT === "production") {
    if (parsed.data.AUTH_SECRET.length < 32) {
      throw new Error("Invalid environment: AUTH_SECRET must be at least 32 characters in production deployment");
    }
    if (parsed.data.ALLOW_DEMO_MODE) {
      throw new Error("Invalid environment: ALLOW_DEMO_MODE cannot be enabled on production deployment");
    }
  }
  cached = parsed.data;
  return cached;
}

export function isDemoModeEnabled(): boolean {
  if (process.env.CLEANPROOF_DEPLOYMENT === "production") return false;
  const env = getEnv();
  if (env.CLEANPROOF_DEPLOYMENT === "production") return false;
  if (env.NODE_ENV === "production") return false;
  return env.ALLOW_DEMO_MODE === true;
}

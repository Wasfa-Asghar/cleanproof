import { and, eq, isNull, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getDb } from "@/db";
import { passwordResetTokens, users } from "@/db/schema";
import { generateToken, hashToken } from "@/lib/crypto/tokens";
import { NotFoundError } from "@/lib/errors";

const RESET_TTL_MS = 60 * 60 * 1000;

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  if (!user) return null;

  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  return token;
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  if (newPassword.length < 8) throw new Error("INVALID_PASSWORD");
  const db = getDb();
  const tokenHash = hashToken(token);
  const now = new Date();

  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(eq(passwordResetTokens.tokenHash, tokenHash), isNull(passwordResetTokens.usedAt), gt(passwordResetTokens.expiresAt, now)),
    )
    .limit(1);

  if (!row) throw new NotFoundError("Invalid or expired reset link");

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await db.transaction(async (tx) => {
    await tx.update(users).set({ passwordHash }).where(eq(users.id, row.userId));
    await tx.update(passwordResetTokens).set({ usedAt: now }).where(eq(passwordResetTokens.id, row.id));
  });
}

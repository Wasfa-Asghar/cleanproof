"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { contactInquiries } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { isDevToolsEnabled } from "@/lib/env-devtools";

export async function markContactInquiryStatus(id: string, status: "new" | "reviewed" | "archived") {
  if (!isDevToolsEnabled()) return { ok: false as const, error: "forbidden" };
  const session = await getSession();
  if (!session || session.role !== "owner") return { ok: false as const, error: "unauthorized" };

  const db = getDb();
  await db
    .update(contactInquiries)
    .set({ status, updatedAt: new Date() })
    .where(eq(contactInquiries.id, id));

  revalidatePath("/dev/contact-inquiries");
  return { ok: true as const };
}

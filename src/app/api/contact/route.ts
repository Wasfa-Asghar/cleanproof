import { NextResponse } from "next/server";
import { submitContactInquiry } from "@/lib/contact/submit-contact";
import { getRequestClientIp, hashClientIp } from "@/lib/contact/client-ip";

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const company = String(body.company ?? "").trim();
  const country = String(body.country ?? "").trim();
  const enquiryType = String(body.enquiryType ?? "").trim();
  const message = String(body.message ?? "").trim();
  const website = String(body.website ?? "").trim();

  if (!name || !email || !message || !enquiryType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (message.length > 8000) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  const ip = getRequestClientIp(request);
  const clientIpHash = ip === "unknown" ? undefined : hashClientIp(ip);

  const result = await submitContactInquiry({
    name,
    email,
    company,
    country,
    enquiryType,
    message,
    website: website || undefined,
    clientIpHash,
  });

  if (result.status === "rejected") {
    const status =
      result.reason === "rate_limit" ? 429 : result.reason === "spam" ? 400 : result.reason === "storage_failed" ? 503 : 503;
    return NextResponse.json({ error: result.reason ?? "rejected" }, { status });
  }

  return NextResponse.json({
    ok: true,
    status: "stored",
    inquiryId: result.inquiryId,
    message:
      "Your enquiry was received and stored securely. We have not sent email yet — transactional email is not configured. An owner can review entries in the development contact inbox when signed in.",
  });
}

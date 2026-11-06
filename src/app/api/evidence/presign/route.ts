import { NextResponse } from "next/server";

/** @deprecated Use POST /api/evidence/init — kept for route map compatibility */
export async function POST() {
  return NextResponse.json({
    message: "Use POST /api/evidence/init then POST /api/evidence/upload?evidenceId=…",
  });
}

"use client";

import { useTransition } from "react";
import { markContactInquiryStatus } from "./actions";

export function MarkInquiryButton({
  id,
  label,
  nextStatus,
}: {
  id: string;
  label: string;
  nextStatus: "new" | "reviewed" | "archived";
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
      onClick={() => startTransition(() => void markContactInquiryStatus(id, nextStatus))}
    >
      {pending ? "…" : label}
    </button>
  );
}

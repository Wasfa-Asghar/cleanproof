"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createReportShareAction } from "@/lib/reports/actions";

export function ReportShareForm({ jobId }: { jobId: string }) {
  const [token, setToken] = useState<string | null>(null);
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      action={async (fd) => {
        fd.set("jobId", jobId);
        const result = await createReportShareAction(fd);
        setToken(result.token);
      }}
    >
      <label className="text-sm">
        Expires (days)
        <input type="number" name="expiresInDays" defaultValue={30} min={1} className="ml-2 rounded border px-2 py-1" />
      </label>
      <Button type="submit">Create share link</Button>
      {token ? (
        <p className="w-full text-sm text-slate-700">
          Copy now — token shown once:{" "}
          <code className="rounded bg-slate-100 px-1">{token}</code> → /r/{token.slice(0, 12)}…
        </p>
      ) : null}
    </form>
  );
}

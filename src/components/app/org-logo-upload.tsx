"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function OrgLogoUpload({ hasLogo }: { hasLogo: boolean }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="font-semibold">Company logo</h2>
      <p className="mt-1 text-sm text-slate-600">PNG or JPEG, max 512 KB. Shown on PDF completion reports.</p>
      {hasLogo ? <p className="mt-2 text-sm text-emerald-800">Logo uploaded.</p> : null}
      <form
        className="mt-3 flex flex-wrap items-end gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          setMessage(null);
          const fd = new FormData(e.currentTarget);
          try {
            const res = await fetch("/api/org/logo", { method: "POST", body: fd });
            const json = (await res.json()) as { error?: string; ok?: boolean };
            if (!res.ok) setMessage(json.error ?? "Upload failed");
            else setMessage("Logo saved.");
          } catch {
            setMessage("Upload failed");
          } finally {
            setPending(false);
          }
        }}
      >
        <label className="text-sm">
          Choose file
          <input type="file" name="logo" accept="image/png,image/jpeg" required className="mt-1 block text-sm" />
        </label>
        <Button type="submit" disabled={pending}>
          Upload logo
        </Button>
      </form>
      {message ? <p className="mt-2 text-sm text-slate-700">{message}</p> : null}
    </div>
  );
}

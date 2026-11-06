"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatBusinessField, businessIdentity } from "@/lib/config/business-identity";

const ENQUIRY_TYPES = [
  "Sales question",
  "Product demo",
  "Billing question",
  "Technical support",
  "Privacy request",
  "General enquiry",
];

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "stored" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = (await res.json()) as { ok?: boolean; message?: string; error?: string; status?: string };
    if (!res.ok) {
      setStatus("error");
      setError(json.error ?? "Submission failed");
      return;
    }
    setStatus("stored");
    form.reset();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-[#e3ebed] bg-white p-7 shadow-[0_8px_28px_rgba(35,60,74,0.04)]">
      <div className="hidden" aria-hidden>
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-[var(--cp-navy)]" htmlFor="contact-name">
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            required
            className="mt-1.5 w-full rounded-lg border border-[var(--cp-border)] bg-[var(--cp-bg)] px-3 py-2.5 text-[15px] text-[var(--cp-navy)] placeholder:text-[#8fa4a8] focus:border-[var(--cp-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--cp-teal)]/25"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--cp-navy)]" htmlFor="contact-email">
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1.5 w-full rounded-lg border border-[var(--cp-border)] bg-[var(--cp-bg)] px-3 py-2.5 text-[15px] text-[var(--cp-navy)] placeholder:text-[#8fa4a8] focus:border-[var(--cp-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--cp-teal)]/25"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-[var(--cp-navy)]" htmlFor="contact-company">
            Company name
          </label>
          <input
            id="contact-company"
            name="company"
            className="mt-1.5 w-full rounded-lg border border-[var(--cp-border)] bg-[var(--cp-bg)] px-3 py-2.5 text-[15px] text-[var(--cp-navy)] focus:border-[var(--cp-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--cp-teal)]/25"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--cp-navy)]" htmlFor="contact-country">
            Country
          </label>
          <input
            id="contact-country"
            name="country"
            className="mt-1.5 w-full rounded-lg border border-[var(--cp-border)] bg-[var(--cp-bg)] px-3 py-2.5 text-[15px] text-[var(--cp-navy)] focus:border-[var(--cp-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--cp-teal)]/25"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--cp-navy)]" htmlFor="contact-type">
          Enquiry type
        </label>
        <select
          id="contact-type"
          name="enquiryType"
          required
          className="mt-1.5 w-full rounded-lg border border-[var(--cp-border)] bg-[var(--cp-bg)] px-3 py-2.5 text-[15px] text-[var(--cp-navy)] focus:border-[var(--cp-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--cp-teal)]/25"
        >
          {ENQUIRY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--cp-navy)]" htmlFor="contact-message">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          className="mt-1.5 w-full rounded-lg border border-[var(--cp-border)] bg-[var(--cp-bg)] px-3 py-2.5 text-[15px] leading-relaxed text-[var(--cp-navy)] placeholder:text-[#8fa4a8] focus:border-[var(--cp-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--cp-teal)]/25"
        />
      </div>
      <Button type="submit" disabled={status === "loading"} className="w-full bg-[var(--cp-teal)] py-3 text-[15px] font-semibold hover:bg-[var(--cp-teal-600)]">
        {status === "loading" ? "Sending…" : "Submit enquiry"}
      </Button>
      {status === "stored" ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          <span className="font-medium">Thanks, your enquiry has been received.</span> We will reply to the email address you gave us.</p>
      ) : null}
      {status === "error" ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
          {error}
        </p>
      ) : null}
      <p className="text-xs leading-relaxed text-[var(--cp-ink-subtle)]">
        You can also email us at {formatBusinessField(businessIdentity.supportEmail)} or call {formatBusinessField(businessIdentity.supportPhone)}.
      </p>
    </form>
  );
}

export function ContactSidebar() {
  return (
    <div>
      <h1 className="text-[clamp(1.85rem,3vw,2.5rem)] font-semibold tracking-tight text-[var(--cp-navy)]">Talk to CleanProof</h1>
      <p className="mt-4 text-[17px] leading-relaxed text-[var(--cp-muted)]">
        Ask us about the product, billing or your data. Send the form below or email us directly and we will get back to you.
      </p>
      <dl className="mt-10 space-y-6 text-sm">
        <div>
          <dt className="font-semibold text-[var(--cp-navy)]">Support email</dt>
          <dd className="mt-1 text-[var(--cp-muted)]"><a className="hover:text-[var(--cp-teal)]" href={`mailto:${businessIdentity.supportEmail}`}>{formatBusinessField(businessIdentity.supportEmail)}</a></dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--cp-navy)]">Privacy</dt>
          <dd className="mt-1 text-[var(--cp-muted)]"><a className="hover:text-[var(--cp-teal)]" href={`mailto:${businessIdentity.privacyEmail}`}>{formatBusinessField(businessIdentity.privacyEmail)}</a></dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--cp-navy)]">Phone</dt>
          <dd className="mt-1 text-[var(--cp-muted)]"><a className="hover:text-[var(--cp-teal)]" href={`tel:${businessIdentity.supportPhone.replace(/\s/g, "")}`}>{formatBusinessField(businessIdentity.supportPhone)}</a></dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--cp-navy)]">Registered address</dt>
          <dd className="mt-1 text-[var(--cp-muted)]">{formatBusinessField(businessIdentity.registeredAddress)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--cp-navy)]">Operated by</dt>
          <dd className="mt-1 text-[var(--cp-muted)]">{formatBusinessField(businessIdentity.legalEntityName)}, company number {formatBusinessField(businessIdentity.companyRegistrationNumber)}</dd>
        </div>
      </dl>
    </div>
  );
}

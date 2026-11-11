"use client";

import { useState, type SVGProps } from "react";
import Link from "next/link";
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

function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-semibold text-[var(--cp-navy)]" htmlFor={htmlFor}>
      {children}
      {required ? <span className="text-rose-600"> *</span> : null}
    </label>
  );
}

const fieldClass =
  "mt-1.5 w-full rounded-md border border-[var(--cp-border)] bg-white px-3 py-2.5 text-[15px] text-[var(--cp-navy)] placeholder:text-[#8fa4a8] focus:border-[var(--cp-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--cp-teal)]/25";

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
    <form
      onSubmit={onSubmit}
      className="marketing-contact-form space-y-5 rounded-[16px] border border-[var(--cp-border)] bg-[var(--cp-surface)] p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] sm:p-8"
    >
      <div className="hidden" aria-hidden>
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="contact-name" required>
            Name
          </FieldLabel>
          <input id="contact-name" name="name" required className={fieldClass} />
        </div>
        <div>
          <FieldLabel htmlFor="contact-email" required>
            Email
          </FieldLabel>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="contact-company">Company name</FieldLabel>
          <input id="contact-company" name="company" className={fieldClass} />
        </div>
        <div>
          <FieldLabel htmlFor="contact-country">Country</FieldLabel>
          <input id="contact-country" name="country" className={fieldClass} />
        </div>
      </div>
      <div>
        <FieldLabel htmlFor="contact-type" required>
          Enquiry type
        </FieldLabel>
        <select id="contact-type" name="enquiryType" required className={fieldClass}>
          {ENQUIRY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <FieldLabel htmlFor="contact-message" required>
          Message
        </FieldLabel>
        <textarea id="contact-message" name="message" required rows={6} className={`${fieldClass} leading-relaxed`} />
      </div>
      <Button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-md bg-[var(--cp-teal)] py-3 text-[15px] font-semibold hover:bg-[var(--cp-teal-600)]"
      >
        {status === "loading" ? "Sending…" : "Submit enquiry"}
      </Button>
      {status === "stored" ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          <span className="font-medium">Thanks, your enquiry has been received.</span> We will reply to the email
          address you gave us.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
          {error}
        </p>
      ) : null}
      <p className="text-xs leading-relaxed text-[var(--cp-ink-subtle)]">
        You can also email us at {formatBusinessField(businessIdentity.supportEmail)} or call{" "}
        {formatBusinessField(businessIdentity.supportPhone)}.
      </p>
    </form>
  );
}

function IconMail(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 7.5L12 12.5L19.5 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconShield(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M12 3.5l7 2.5v5.2c0 4.2-2.9 7.6-7 8.8-4.1-1.2-7-4.6-7-8.8V6L12 3.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPhone(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M8.2 4.8h2.3l1.1 3.2-1.5 1.1a11.5 11.5 0 005.3 5.3l1.1-1.5 3.2 1.1v2.3c0 .7-.5 1.3-1.2 1.4A14.7 14.7 0 014.4 6c.1-.7.7-1.2 1.4-1.2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M12 21s6.5-5.1 6.5-10.2A6.5 6.5 0 0012 4.3a6.5 6.5 0 00-6.5 6.5C5.5 15.9 12 21 12 21z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.8" r="2.1" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconBuilding(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M5 20V7.5L12 4l7 3.5V20" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9.5 20v-6h5v6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 10h1.5M13.5 10H15M9 13h1.5M13.5 13H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const CONTACT_ROWS = [
  {
    label: "Support email",
    Icon: IconMail,
    value: (
      <a className="hover:text-[var(--cp-teal)]" href={`mailto:${businessIdentity.supportEmail}`}>
        {formatBusinessField(businessIdentity.supportEmail)}
      </a>
    ),
  },
  {
    label: "Privacy",
    Icon: IconShield,
    value: (
      <a className="hover:text-[var(--cp-teal)]" href={`mailto:${businessIdentity.privacyEmail}`}>
        {formatBusinessField(businessIdentity.privacyEmail)}
      </a>
    ),
  },
  {
    label: "Phone",
    Icon: IconPhone,
    value: (
      <a className="hover:text-[var(--cp-teal)]" href={`tel:${businessIdentity.supportPhone.replace(/\s/g, "")}`}>
        {formatBusinessField(businessIdentity.supportPhone)}
      </a>
    ),
  },
  {
    label: "Registered address",
    Icon: IconPin,
    value: formatBusinessField(businessIdentity.registeredAddress),
  },
  {
    label: "Operated by",
    Icon: IconBuilding,
    value: `${formatBusinessField(businessIdentity.legalEntityName)}, company number ${formatBusinessField(businessIdentity.companyRegistrationNumber)}`,
  },
] as const;

export function ContactSidebar() {
  return (
    <div className="marketing-contact-sidebar">
      <p className="marketing-section-badge">Contact us</p>
      <h1 className="mt-4 text-[clamp(2rem,3.6vw,2.75rem)] font-semibold tracking-[-0.03em] text-[var(--cp-navy)]">
        Talk to CleanProof
      </h1>
      <p className="mt-4 max-w-[40ch] text-[17px] leading-relaxed text-[var(--cp-muted)]">
        Ask us about the product, billing or your data. Send the form below or email us directly and we will get back
        to you.
      </p>
      <ul className="mt-9 space-y-5">
        {CONTACT_ROWS.map((row) => (
          <li key={row.label} className="flex gap-3.5">
            <span className="marketing-contact-icon" aria-hidden>
              <row.Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-[var(--cp-navy)]">{row.label}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-[var(--cp-muted)]">{row.value}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-[var(--cp-muted)]">
        Looking for self-serve answers first?{" "}
        <Link href="/help" className="font-semibold text-[var(--cp-teal)] hover:underline">
          Browse the help centre →
        </Link>
      </p>
    </div>
  );
}

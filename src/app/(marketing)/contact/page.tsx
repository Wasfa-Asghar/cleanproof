import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm, ContactSidebar } from "@/components/marketing/contact-form";
import { SectionIntro } from "@/components/marketing/section-intro";
import { CapabilityRail } from "@/components/marketing/capability-rail";
import { IconChecklist, IconStatus, IconTokenLink, IconShieldUser } from "@/components/marketing/marketing-icons";
import "./contact.css";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact CleanProof for sales, demos, billing, support, and privacy requests.",
};

const TOPICS = [
  {
    key: "sales",
    title: "Sales & demos",
    body: "Ask how CleanProof fits your sites, cleaners, and review workflow before you roll it out.",
    Icon: IconStatus,
  },
  {
    key: "billing",
    title: "Billing & plans",
    body: "Questions about trial limits, upgrades, invoices, or cancelling from the billing page.",
    Icon: IconChecklist,
  },
  {
    key: "support",
    title: "Product support",
    body: "Help with field submissions, quality review, reports, or access for your team roles.",
    Icon: IconTokenLink,
  },
  {
    key: "privacy",
    title: "Privacy & data",
    body: "Requests about personal data, retention, or how client report links are shared securely.",
    Icon: IconShieldUser,
  },
] as const;

export default function ContactPage() {
  return (
    <div className="marketing-contact-page">
      <section data-design="contact-hero" className="marketing-contact-hero">
        <div className="marketing-contact-hero__wash" aria-hidden />
        <div className="mx-auto grid max-w-[1216px] gap-10 px-4 py-[clamp(1.75rem,4vw,3rem)] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-14">
          <ContactSidebar />
          <ContactForm />
        </div>
      </section>

      <section data-design="topics" className="marketing-feature-cards-section py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <SectionIntro
            tone="badge"
            eyebrow="How we can help"
            title="Tell us what you need and we will route it"
            underlinePhrase="what you need"
            description="Use the form for sales, demos, billing, support, or privacy. Pick the enquiry type that matches so the right person sees it first."
          />
          <div className="mt-10">
            <CapabilityRail
              columns={4}
              items={TOPICS.map((topic) => ({
                key: topic.key,
                title: topic.title,
                body: topic.body,
                Icon: topic.Icon,
              }))}
            />
          </div>
        </div>
      </section>

      <section data-design="expectations" className="border-y border-[var(--cp-border)] bg-[var(--cp-surface)] py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-14">
            <SectionIntro
              tone="badge"
              eyebrow="What happens next"
              title="Clear handoff after you submit"
              underlinePhrase="Clear handoff"
              description="Your enquiry is stored against CleanProof support. We reply to the email address you enter on the form."
            />
            <ol className="marketing-contact-steps">
              <li>
                <span>01</span>
                <div>
                  <h3>We receive your enquiry</h3>
                  <p>Sales, demo, billing, support, and privacy requests are logged with the details you submit.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <h3>We reply by email</h3>
                  <p>Expect a response to the address on the form. For urgent access issues, include your organisation name.</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <h3>Or explore while you wait</h3>
                  <p>
                    Open the{" "}
                    <Link href="/demo" className="font-semibold text-[var(--cp-teal)] hover:underline">
                      interactive demo
                    </Link>
                    , compare{" "}
                    <Link href="/pricing" className="font-semibold text-[var(--cp-teal)] hover:underline">
                      plans
                    </Link>
                    , or browse the{" "}
                    <Link href="/help" className="font-semibold text-[var(--cp-teal)] hover:underline">
                      help centre
                    </Link>
                    .
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}

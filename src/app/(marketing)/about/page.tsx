import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { businessIdentity } from "@/lib/config/business-identity";
import { CtaBand } from "@/components/marketing/cta-band";
import { MarketingInteriorHeroSplit } from "@/components/marketing/marketing-interior-hero";
import { MarketingFeatureIcon } from "@/components/marketing/marketing-feature-icon";

export const metadata: Metadata = {
  title: "About",
  description: "CleanProof is cleaning quality software from The House Of Veynor Ltd. Verify jobs with checklists, photos, and client reports.",
};

const FEATURE_ROWS = [
  {
    title: "Structured proof, not loose chats",
    body: "Checklist lines, timestamps, and photo evidence sit on the job record so supervisors review the same facts cleaners captured.",
  },
  {
    title: "Supervisor queue before clients see anything",
    body: "Quality review happens inside CleanProof; client-facing links only expose approved output.",
  },
  {
    title: "Honest field tooling",
    body: "The field app runs in the mobile browser with explicit offline behaviour, we do not promise capabilities the network cannot support.",
  },
];

export default function AboutPage() {
  return (
    <>
      <MarketingInteriorHeroSplit
        eyebrow="About CleanProof"
        title="Operational software for cleaning quality."
        lead="CleanProof is a SaaS product built and operated by The House Of Veynor Ltd. It connects assignment, field completion, supervisor review, and client-visible reporting so proof of service is traceable, without fabricating metrics or testimonials on this page."
        aside={
          <div className="overflow-hidden rounded-2xl border border-[var(--cp-border)] shadow-lg">
            <Image
              src="/marketing/photos/commercial-office-clean.jpg"
              alt="Professional commercial cleaning in a bright office space"
              width={1200}
              height={800}
              className="h-auto w-full object-cover"
              sizes="(max-width: 1024px) 100vw, 45vw"
              priority
            />
          </div>
        }
      />

      <section className="border-b border-[var(--cp-border)] py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--cp-navy)]">Why cleaning-quality management matters</h2>
              <p className="mt-4 text-[17px] leading-relaxed text-[var(--cp-muted)]">
                When checklists live on paper and photos sit in personal camera rolls, disputes default to whoever had the loudest voice in the thread. CleanProof keeps the record on the job: who was assigned,
                what was completed, what evidence was attached, and what a supervisor approved before any client summary is shared.
              </p>
              <p className="mt-4 text-[17px] leading-relaxed text-[var(--cp-muted)]">
                We built for owners and operations managers who need defensible proof of service, not another generic CRM bolted onto messaging.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[var(--cp-navy)]">Product philosophy</h2>
              <ul className="mt-4 space-y-4">
                {FEATURE_ROWS.map((row) => (
                  <li key={row.title} className="flex gap-3">
                    <MarketingFeatureIcon glyph="✓" className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-[var(--cp-navy)]">{row.title}</p>
                      <p className="mt-1 text-[15px] leading-relaxed text-[var(--cp-muted)]">{row.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--cp-section-muted)] py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-semibold text-[var(--cp-navy)]">Who runs CleanProof</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--cp-muted)]">
            CleanProof is owned and operated by {businessIdentity.operatorName}, a company registered in {businessIdentity.registrationCountry} (company number {businessIdentity.companyRegistrationNumber}).
            Registered office: {businessIdentity.registeredAddress}.
          </p>
          <p className="mt-2 text-[15px] text-[var(--cp-muted)]">
            <a className="font-semibold text-[var(--cp-teal)]" href={`mailto:${businessIdentity.supportEmail}`}>{businessIdentity.supportEmail}</a> ·{" "}
            <a className="font-semibold text-[var(--cp-teal)]" href={`tel:${businessIdentity.supportPhone.replace(/\s/g, "")}`}>{businessIdentity.supportPhone}</a>
          </p>
          <p className="mt-6 text-sm text-[var(--cp-muted)]">
            We do not publish unverified founding stories, headcount, or customer logos on this site. For product questions,{" "}
            <Link href="/contact" className="font-semibold text-[var(--cp-teal)] underline decoration-teal-200/80 underline-offset-[5px] hover:decoration-[var(--cp-teal)]">
              contact us
            </Link>{" "}
            or{" "}
            <Link href="/demo" className="font-semibold text-[var(--cp-teal)] underline decoration-teal-200/80 underline-offset-[5px] hover:decoration-[var(--cp-teal)]">
              open the demo
            </Link>
            .
          </p>
        </div>
      </section>

      <CtaBand />
    </>
  );
}

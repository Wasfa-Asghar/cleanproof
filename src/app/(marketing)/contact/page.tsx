import type { Metadata } from "next";
import { ContactForm, ContactSidebar } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact CleanProof for sales, demos, billing, support, and privacy requests.",
};

export default function ContactPage() {
  return (
    <section className="border-b border-[var(--cp-border)] bg-[var(--cp-bg)] py-[clamp(2.5rem,6vw,4rem)]">
      <div className="mx-auto max-w-[1216px] px-4">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-16">
          <ContactSidebar />
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

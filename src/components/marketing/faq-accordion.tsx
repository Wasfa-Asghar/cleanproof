"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

type FaqItem = { q: string; a: string };

const sharedFaqs: Array<{ topic: RegExp; item: FaqItem }> = [
  {
    topic: /app|install|mobile|offline/i,
    item: {
      q: "Do cleaners need to install an app?",
      a: "No. Cleaners use the mobile-friendly field workspace in a browser; there is no app-store install requirement.",
    },
  },
  {
    topic: /supervisor|review|approv|inspection|quality/i,
    item: {
      q: "Can supervisors review work before it is shared?",
      a: "Yes. Submitted jobs go to the quality queue, where supervisors can review checklist answers and evidence before approval.",
    },
  },
  {
    topic: /client|report|pdf|share|token/i,
    item: {
      q: "Can clients view reports without a dashboard login?",
      a: "Approved completion reports can be shared through secure links, so clients can see proof without staff dashboard access.",
    },
  },
  {
    topic: /site|template|organisation|organization/i,
    item: {
      q: "Can I manage more than one site?",
      a: "Yes. Sites and jobs stay organised within your account. Active-site limits depend on the subscription plan.",
    },
  },
  {
    topic: /trial|pricing|plan|subscription|payment|billing|card/i,
    item: {
      q: "Can I try CleanProof before choosing a paid plan?",
      a: "Yes. New organisations can start a 14-day trial and explore the interactive demo before choosing a paid plan.",
    },
  },
  {
    topic: /team|role|cleaner|user|access/i,
    item: {
      q: "Can my whole team use CleanProof?",
      a: "Owners, managers, and cleaners can use role-specific workspaces. The number of active users depends on your plan.",
    },
  },
];

export function FaqAccordion({ items }: { items: Array<{ q: string; a: string }> }) {
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(0);
  const existingTopics = new Set(
    items.flatMap(({ q }) => sharedFaqs.filter(({ topic }) => topic.test(q)).map(({ topic }) => topic)),
  );
  const visibleItems = [
    ...items,
    ...sharedFaqs.filter(({ topic }) => !existingTopics.has(topic)).map(({ item }) => item),
  ].slice(0, 5);

  return (
    <div className="marketing-faq">
      {visibleItems.map((item, i) => {
        const panelId = `${baseId}-${i}`;
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-6 text-left font-medium text-[var(--cp-navy)]"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                {item.q}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[var(--cp-muted)] transition-transform motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              hidden={!isOpen}
              className="px-5 pb-4 text-sm leading-relaxed text-[var(--cp-muted)]"
            >
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}

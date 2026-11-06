"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

export function FaqAccordion({ items }: { items: Array<{ q: string; a: string }> }) {
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-[var(--cp-border)] rounded-xl border border-[var(--cp-border)] bg-white">
      {items.map((item, i) => {
        const panelId = `${baseId}-${i}`;
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-[var(--cp-navy)] hover:bg-slate-50"
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

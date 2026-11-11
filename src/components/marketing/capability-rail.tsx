import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils/cn";

export type CapabilityRailItem = {
  key: string;
  title: string;
  body: string;
  href?: string;
  glyph?: string;
  Icon?: ComponentType<SVGProps<SVGSVGElement>>;
};

function RailIcon({ item }: { item: CapabilityRailItem }) {
  return (
    <span className="marketing-capability-rail-icon" aria-hidden>
      {item.Icon ? <item.Icon className="marketing-capability-rail-svg h-5 w-5" /> : null}
      {!item.Icon && item.glyph ? (
        <span className="text-base font-semibold leading-none text-[var(--cp-teal)]">{item.glyph}</span>
      ) : null}
      {!item.Icon && !item.glyph ? (
        <span className="text-base font-semibold leading-none text-[var(--cp-teal)]">✓</span>
      ) : null}
    </span>
  );
}

function RailCard({ item }: { item: CapabilityRailItem }) {
  const inner = (
    <>
      <RailIcon item={item} />
      <h3 className="mt-5 text-[1.08rem] font-semibold tracking-tight text-[var(--cp-navy)]">{item.title}</h3>
      <p className="marketing-prose mt-2.5 flex-1 text-sm leading-relaxed text-[var(--cp-muted)] md:text-[0.98rem]">
        {item.body}
      </p>
      {item.href ? (
        <span className="mt-5 inline-flex text-sm font-medium text-[var(--cp-teal)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          Explore →
        </span>
      ) : null}
    </>
  );

  if (item.href) {
    return (
      <Link href={item.href} className="marketing-capability-rail-item group flex h-full flex-col outline-none">
        {inner}
      </Link>
    );
  }

  return <div className="marketing-capability-rail-item group flex h-full flex-col">{inner}</div>;
}

/** Divider-grid capability rail — reference layout, CleanProof colors/content. */
export function CapabilityRail({
  items,
  columns = 4,
  footerLabels,
  className,
}: {
  items: CapabilityRailItem[];
  columns?: 2 | 3 | 4;
  footerLabels?: string[];
  className?: string;
}) {
  return (
    <div className={cn("marketing-capability-rail", className)} data-cols={columns}>
      <div className="marketing-capability-rail-grid">
        {items.map((item) => (
          <RailCard key={item.key} item={item} />
        ))}
      </div>
      {footerLabels?.length ? (
        <div className="marketing-capability-rail-footer" aria-label="Workflow highlights">
          {footerLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

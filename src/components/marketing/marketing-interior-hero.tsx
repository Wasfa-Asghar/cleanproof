import type { ReactNode } from "react";

/** Centered marketing interior hero, matches reference `.interior-hero.center`. */
export function MarketingInteriorHeroCenter({
  eyebrow,
  title,
  lead,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`border-b border-[var(--cp-border)] bg-[var(--cp-hero-gradient)] py-[clamp(3.25rem,7.5vw,4.75rem)] text-center ${className ?? ""}`}
    >
      <div className="mx-auto max-w-[1216px] px-4">
        <p className="inline-flex items-center justify-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.11em] text-[var(--cp-teal)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0c9897]" aria-hidden />
          {eyebrow}
        </p>
        <h1 className="mx-auto mt-5 max-w-[min(100%,52rem)] text-[clamp(2.25rem,4.2vw,3.65rem)] font-semibold leading-[1.1] tracking-[-0.045em] text-[var(--cp-navy)]">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-[1.67] text-[var(--cp-muted)] sm:text-lg">{lead}</p>
        {children}
      </div>
    </section>
  );
}

/** Two-column interior hero, matches reference `.interior-hero` + `.two-col`. */
export function MarketingInteriorHeroSplit({
  eyebrow,
  title,
  lead,
  aside,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  aside: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`border-b border-[var(--cp-border)] bg-[var(--cp-hero-gradient)] py-[clamp(3rem,7vw,5.25rem)] ${className ?? ""}`}>
      <div className="mx-auto grid max-w-[1216px] gap-10 px-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:items-center lg:gap-16 xl:gap-[4.5rem]">
        <div>
          <p className="inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.11em] text-[var(--cp-teal)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0c9897]" aria-hidden />
            {eyebrow}
          </p>
          <h1 className="mt-5 text-[clamp(2.25rem,4vw,3.15rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-[var(--cp-navy)]">{title}</h1>
          <p className="mt-5 max-w-xl text-[17px] leading-[1.67] text-[var(--cp-muted)] sm:text-lg">{lead}</p>
          {children}
        </div>
        <div className="min-w-0">{aside}</div>
      </div>
    </section>
  );
}

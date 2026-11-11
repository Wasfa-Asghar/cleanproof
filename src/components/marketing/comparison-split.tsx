import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export type ComparisonSplitProps = {
  withoutLabel?: string;
  withLabel?: string;
  withoutTitle: string;
  withTitle: string;
  withoutItems: string[];
  withItems: string[];
  withoutCta?: { href: string; label: string };
  withCta?: { href: string; label: string };
  className?: string;
};

function CrossIcon() {
  return (
    <span
      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--cp-navy)_8%,transparent)] text-[11px] font-bold text-[var(--cp-navy)]"
      aria-hidden
    >
      ×
    </span>
  );
}

function CheckIcon() {
  return (
    <span
      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-[11px] font-bold text-white"
      aria-hidden
    >
      ✓
    </span>
  );
}

/** Two-card before/after comparison — reference layout, CleanProof palette. */
export function ComparisonSplit({
  withoutLabel = "Without CleanProof",
  withLabel = "With CleanProof",
  withoutTitle,
  withTitle,
  withoutItems,
  withItems,
  withoutCta = { href: "/contact", label: "Talk to us" },
  withCta = { href: "/auth/signup", label: "Start free trial" },
  className,
}: ComparisonSplitProps) {
  return (
    <div className={cn("marketing-comparison-split", className)}>
      <article className="marketing-comparison-card marketing-comparison-card--without">
        <p className="marketing-comparison-eyebrow">{withoutLabel}</p>
        <h3 className="marketing-comparison-title">{withoutTitle}</h3>
        <ul className="marketing-comparison-list">
          {withoutItems.map((item) => (
            <li key={item}>
              <CrossIcon />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        {withoutCta ? (
          <Button href={withoutCta.href} variant="secondary" className="marketing-comparison-cta marketing-comparison-cta--light mt-auto">
            {withoutCta.label}
          </Button>
        ) : null}
      </article>

      <article className="marketing-comparison-card marketing-comparison-card--with">
        <div className="marketing-comparison-glow" aria-hidden />
        <p className="marketing-comparison-eyebrow marketing-comparison-eyebrow--on-dark">{withLabel}</p>
        <h3 className="marketing-comparison-title marketing-comparison-title--on-dark">{withTitle}</h3>
        <ul className="marketing-comparison-list marketing-comparison-list--on-dark">
          {withItems.map((item) => (
            <li key={item}>
              <CheckIcon />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        {withCta ? (
          <Button href={withCta.href} className="marketing-comparison-cta marketing-comparison-cta--dark mt-auto">
            {withCta.label}
          </Button>
        ) : null}
      </article>
    </div>
  );
}

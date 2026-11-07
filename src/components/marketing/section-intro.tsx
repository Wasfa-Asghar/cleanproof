/** Section titles, default is quiet (real SaaS), not loud teal all-caps. */
export function SectionIntro({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "quiet",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  /** quiet = slate subtle label; brand = small teal emphasis */
  tone?: "quiet" | "brand";
  className?: string;
}) {
  const wrap = align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl";
  const eyebrowClass =
    tone === "brand"
      ? "text-xs font-semibold uppercase tracking-[0.1em] text-[var(--cp-teal)]"
      : "text-sm font-medium text-[var(--cp-muted)]";
  return (
    <div className={`marketing-section-intro ${wrap} ${className ?? ""}`}>
      {eyebrow ? <p className={eyebrowClass}>{eyebrow}</p> : null}
      <h2 className={`text-pretty text-2xl font-semibold tracking-tight text-[var(--cp-navy)] md:text-[1.75rem] md:leading-snug ${eyebrow ? "mt-2" : ""}`}>
        {title}
      </h2>
      {description ? (
        <p className="marketing-prose mt-3 max-w-prose text-pretty text-base text-[var(--cp-muted)]">{description}</p>
      ) : null}
    </div>
  );
}

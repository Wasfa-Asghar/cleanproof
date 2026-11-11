/** Section titles, default is quiet (real SaaS), not loud teal all-caps. */
export function SectionIntro({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "quiet",
  underlinePhrase,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  /** quiet = slate subtle label; brand = small teal emphasis; badge = pill label */
  tone?: "quiet" | "brand" | "badge";
  /** Optional phrase inside title that gets a hand-drawn teal underline */
  underlinePhrase?: string;
  className?: string;
}) {
  const wrap =
    align === "center"
      ? "mx-auto max-w-2xl text-center"
      : tone === "badge"
        ? "max-w-3xl"
        : "max-w-2xl";

  const eyebrowClass =
    tone === "badge"
      ? "marketing-section-badge"
      : tone === "brand"
        ? "text-xs font-semibold uppercase tracking-[0.1em] text-[var(--cp-teal)]"
        : "text-sm font-medium text-[var(--cp-muted)]";

  const renderedTitle =
    underlinePhrase && title.includes(underlinePhrase) ? (
      <>
        {title.slice(0, title.indexOf(underlinePhrase))}
        <span className="marketing-section-underline">{underlinePhrase}</span>
        {title.slice(title.indexOf(underlinePhrase) + underlinePhrase.length)}
      </>
    ) : (
      title
    );

  return (
    <div className={`marketing-section-intro marketing-section-intro--${tone} ${wrap} ${className ?? ""}`}>
      {eyebrow ? <p className={eyebrowClass}>{eyebrow}</p> : null}
      <h2
        className={`text-pretty tracking-tight text-[var(--cp-navy)] ${
          tone === "badge"
            ? "mt-4 text-3xl font-semibold md:text-[2.15rem] md:leading-snug"
            : `text-2xl font-semibold md:text-[1.75rem] md:leading-snug ${eyebrow ? "mt-2" : ""}`
        }`}
      >
        {renderedTitle}
      </h2>
      {description ? (
        <p className="marketing-prose mt-3 max-w-prose text-pretty text-base text-[var(--cp-muted)]">{description}</p>
      ) : null}
    </div>
  );
}

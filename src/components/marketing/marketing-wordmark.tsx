import Link from "next/link";

type MarketingWordmarkProps = {
  href?: string;
  variant?: "dark" | "light";
  className?: string;
};

/** Reference-aligned wordmark, check badge + name */
export function MarketingWordmark({ href = "/", variant = "dark", className }: MarketingWordmarkProps) {
  const isLight = variant === "light";
  const textClass = isLight ? "text-white" : "text-[var(--cp-navy)]";

  const inner = (
    <>
      <span
        className="inline-flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-lg text-[17px] font-semibold leading-none text-white shadow-sm"
        style={{ background: "var(--cp-brand-symbol)" }}
        aria-hidden
      >
        ✓
      </span>
      <span className={`text-[1.35rem] font-semibold tracking-[-0.07em] ${textClass}`}>CleanProof</span>
    </>
  );

  const wrap = `inline-flex items-center gap-1.5 ${className ?? ""}`;

  if (href) {
    return (
      <Link href={href} className={wrap}>
        {inner}
      </Link>
    );
  }

  return <span className={wrap}>{inner}</span>;
}

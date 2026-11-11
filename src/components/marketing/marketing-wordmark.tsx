import Link from "next/link";
import { businessIdentity } from "@/lib/config/business-identity";

type MarketingWordmarkProps = {
  href?: string;
  variant?: "dark" | "light";
  className?: string;
};

/** Reference-aligned wordmark: check badge + House of Veynor presents CleanProof */
export function MarketingWordmark({ href = "/", variant = "dark", className }: MarketingWordmarkProps) {
  const isLight = variant === "light";
  const titleClass = isLight ? "text-white" : "text-[var(--cp-navy)]";
  const presenterClass = isLight ? "text-white/70" : "text-[var(--cp-muted)]";

  const inner = (
    <>
      <span
        className="inline-flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-lg text-[17px] font-semibold leading-none text-white shadow-sm"
        style={{ background: "var(--cp-brand-symbol)" }}
        aria-hidden
      >
        ✓
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span className={`text-[0.62rem] font-semibold uppercase tracking-[0.08em] ${presenterClass}`}>
          {businessIdentity.brandPresenter}
        </span>
        <span className={`mt-0.5 text-[1.2rem] font-semibold tracking-[-0.07em] ${titleClass}`}>
          {businessIdentity.tradingName}
        </span>
      </span>
    </>
  );

  const wrap = `inline-flex items-center gap-1.5 ${className ?? ""}`;
  const label = businessIdentity.brandPresentation;

  if (href) {
    return (
      <Link href={href} className={wrap} aria-label={label}>
        {inner}
      </Link>
    );
  }

  return (
    <span className={wrap} aria-label={label}>
      {inner}
    </span>
  );
}

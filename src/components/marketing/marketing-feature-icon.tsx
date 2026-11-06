import { cn } from "@/lib/utils/cn";

/** Decorative feature-card glyph, aligns with reference `.feature-icon .icon` */
export function MarketingFeatureIcon({ glyph, className }: { glyph: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl bg-[#e6f7f3] text-[27px] font-semibold text-[var(--cp-teal)]",
        className,
      )}
    >
      <span aria-hidden>{glyph}</span>
    </div>
  );
}

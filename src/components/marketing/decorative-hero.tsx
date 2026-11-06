/** Minimal hero wash, avoids generic “grid + orbs” AI look */
export function DecorativeHeroBackdrop({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--cp-surface)_40%,transparent)_0%,transparent_52%,color-mix(in_srgb,var(--cp-teal)_4%,transparent)_100%)]" />
      <div className="absolute -right-24 top-0 h-[420px] w-[420px] rounded-full bg-[color-mix(in_srgb,var(--cp-teal)_7%,transparent)] blur-3xl" />
      <div className="absolute -left-32 bottom-0 h-[280px] w-[280px] rounded-full bg-[color-mix(in_srgb,var(--cp-navy)_6%,transparent)] blur-3xl" />
    </div>
  );
}

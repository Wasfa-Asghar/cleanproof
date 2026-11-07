import type { ReactNode } from "react";

/** Gradient shell around product screenshots, reference `.glassframe`. */
export function MarketingGlassFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`marketing-media-frame rounded-[23px] border border-[color-mix(in_srgb,var(--cp-teal)_22%,#d2e7e6)] p-4 sm:p-6 lg:p-8 ${className ?? ""}`}
      style={{
        background: "linear-gradient(130deg, #d9eeed 0%, #f5f9f8 55%, #bddcda 100%)",
      }}
    >
      {children}
    </div>
  );
}

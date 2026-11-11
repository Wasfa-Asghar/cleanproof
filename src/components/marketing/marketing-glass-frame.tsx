import type { ReactNode } from "react";

/** Plain media wrapper — image only, no gradient plate behind screenshots. */
export function MarketingGlassFrame({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`marketing-media-frame ${className ?? ""}`.trim()}>{children}</div>;
}

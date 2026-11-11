import type { ReactNode } from "react";
import "./interior-reference.css";

/** Shared Concourse-style body shell for interior marketing pages (hero/footer stay outside). */
export function MarketingInteriorShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`marketing-interior ${className ?? ""}`.trim()}>{children}</div>;
}

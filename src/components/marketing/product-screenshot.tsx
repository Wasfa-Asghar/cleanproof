import Image from "next/image";
import { PRODUCT_SCREENSHOTS } from "@/lib/marketing/image-manifest";

export function ProductScreenshot({
  screenshotKey,
  className,
  variant = "default",
  showCaption = true,
}: {
  screenshotKey: keyof typeof PRODUCT_SCREENSHOTS;
  className?: string;
  variant?: "default" | "hero";
  /** Set false when grouping multiple shots under one line of copy (e.g. homepage hero). */
  showCaption?: boolean;
}) {
  const shot = PRODUCT_SCREENSHOTS[screenshotKey];
  /* No fake browser chrome, reads as product UI art, not a “screenshot of a screenshot”. */
  const frame =
    variant === "hero"
      ? "overflow-hidden rounded-2xl border border-[var(--cp-border-strong)]/50 bg-[var(--cp-surface)] shadow-xl shadow-slate-900/[0.07] ring-1 ring-[var(--cp-ring)]"
      : "overflow-hidden rounded-xl border border-[var(--cp-border)] bg-[var(--cp-surface)] shadow-md shadow-slate-900/5 ring-1 ring-[var(--cp-ring)]";
  return (
    <figure className={className}>
      <div className={frame}>
        <Image
          src={shot.file}
          alt={shot.alt}
          width={1280}
          height={800}
          className="h-auto w-full bg-[var(--cp-bg)]"
          sizes={variant === "hero" ? "(max-width: 1024px) 100vw, min(720px, 55vw)" : "(max-width: 1024px) 100vw, 640px"}
        />
      </div>
      {showCaption ? (
        <figcaption className="mt-3 text-sm leading-relaxed text-[var(--cp-muted)]">{shot.caption}</figcaption>
      ) : null}
    </figure>
  );
}

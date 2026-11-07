import Image from "next/image";
import { CompactProductImage } from "./compact-product-image";
import { PRODUCT_SCREENSHOTS } from "@/lib/marketing/image-manifest";

const compactPreviews: Record<string, { file: string; width: number; height: number } | undefined> = {
  "field-workspace": { file: "field-checklist-preview.png", width: 416, height: 474 },
  "field-workspace-mobile": { file: "field-jobs-preview.png", width: 390, height: 424 },
  "quality-queue": { file: "quality-queue-preview.png", width: 1025, height: 470 },
  "client-report": { file: "client-report-preview.png", width: 672, height: 616 },
};

export function ProductScreenshot({
  screenshotKey,
  className,
  variant = "default",
  showCaption = true,
}: {
  screenshotKey: keyof typeof PRODUCT_SCREENSHOTS;
  className?: string;
  variant?: "default" | "hero" | "compact";
  /** Set false when grouping multiple shots under one line of copy (e.g. homepage hero). */
  showCaption?: boolean;
}) {
  const shot = PRODUCT_SCREENSHOTS[screenshotKey];
  if (!shot) return null;
  const preview = compactPreviews[screenshotKey];
  const narrow = preview && preview.width < preview.height;
  const compact = variant === "compact" || narrow || screenshotKey === "client-report";
  const src = preview ? `/marketing/screenshots/${preview.file}` : shot.file;
  const maxWidth = narrow ? "max-w-[22rem]" : screenshotKey === "client-report" ? "max-w-[26rem]" : undefined;
  /* No fake browser chrome, reads as product UI art, not a “screenshot of a screenshot”. */
  const frame =
    variant === "hero"
      ? "overflow-hidden rounded-2xl border border-[var(--cp-border-strong)]/50 bg-[var(--cp-surface)] shadow-xl shadow-slate-900/[0.07] ring-1 ring-[var(--cp-ring)]"
      : "overflow-hidden rounded-xl border border-[var(--cp-border)] bg-[var(--cp-surface)] shadow-md shadow-slate-900/5 ring-1 ring-[var(--cp-ring)]";
  return (
    <figure className={maxWidth ? `mx-auto w-full ${maxWidth} ${className ?? ""}` : className}>
      {compact ? (
        <CompactProductImage key={src} src={src} alt={shot.alt} width={preview?.width ?? 1280} height={preview?.height ?? 800} />
      ) : (
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
      )}
      {showCaption ? (
        <figcaption className="mt-3 text-sm leading-relaxed text-[var(--cp-muted)]">{shot.caption}</figcaption>
      ) : null}
    </figure>
  );
}

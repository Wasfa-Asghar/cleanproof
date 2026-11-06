import type { JSX, SVGProps } from "react";
import type { IndustrySlug } from "@/lib/marketing/industries-content";
import { IconBuilding, IconHome, IconKey, IconOffice } from "@/components/marketing/marketing-icons";

type IconComp = (props: SVGProps<SVGSVGElement>) => JSX.Element;

const MAP: Record<IndustrySlug, IconComp> = {
  "commercial-cleaning": IconBuilding,
  "office-cleaning": IconOffice,
  "end-of-tenancy-cleaning": IconKey,
  "residential-cleaning": IconHome,
};

export function IndustryVisual({
  slug,
  size = "lg",
}: {
  slug: IndustrySlug;
  size?: "md" | "lg" | "xl";
}) {
  const Icon = MAP[slug];
  const dim =
    size === "xl" ? "h-28 w-28 md:h-36 md:w-36" : size === "lg" ? "h-20 w-20 md:h-24 md:w-24" : "h-14 w-14";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl border border-teal-200/60 bg-gradient-to-br from-teal-50/90 to-white shadow-sm ${dim}`}
    >
      <Icon className={`${size === "xl" ? "h-14 w-14 md:h-16 md:w-16" : size === "lg" ? "h-10 w-10 md:h-12 md:w-12" : "h-8 w-8"} text-[var(--cp-teal)]`} />
    </div>
  );
}

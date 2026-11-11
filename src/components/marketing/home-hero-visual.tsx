import Image from "next/image";

/** Bump when replacing `public/marketing/photos/hero-cleaning-cutout.png` (avoids stale Next/image cache). */
const HERO_CUTOUT_VERSION = "3";
const HERO_CUTOUT_SRC = `/marketing/photos/hero-cleaning-cutout.png?v=${HERO_CUTOUT_VERSION}`;

/**
 * Homepage hero — wide team cutout on the right (reference-style), no frame or card.
 */
export function HomeHeroVisual() {
  return (
    <figure className="marketing-hero-visual m-0 w-full">
      <Image
        src={HERO_CUTOUT_SRC}
        alt="Commercial cleaning team capturing checklists and photos for job proof"
        width={1024}
        height={440}
        priority
        unoptimized
        className="marketing-hero-cutout-img block h-auto w-full object-contain object-right"
        sizes="(max-width: 1023px) 94vw, (max-width: 1536px) 58vw, 920px"
      />
    </figure>
  );
}

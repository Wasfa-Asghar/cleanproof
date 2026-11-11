import Image from "next/image";
import type { LicensedPhotoKey } from "@/lib/marketing/industries-content";

export const LICENSED_PHOTO_PATH: Record<LicensedPhotoKey, string> = {
  "commercial-team": "/marketing/photos/commercial-team.jpg",
  "commercial-office-clean": "/marketing/photos/commercial-office-clean.jpg",
  "end-of-tenancy": "/marketing/photos/end-of-tenancy.jpg",
  "residential-clean": "/marketing/photos/residential-clean.jpg",
  "supervisor-inspection": "/marketing/photos/supervisor-inspection.jpg",
  "mobile-cleaning-team": "/marketing/photos/mobile-cleaning-team.jpg",
  "kitchen-sanitize": "/marketing/photos/kitchen-sanitize.jpg",
  "window-cleaning": "/marketing/photos/window-cleaning.jpg",
  "hero-dining": "/marketing/photos/hero-dining.jpg",
  "hero-cleaning-team": "/marketing/photos/hero-cleaning-team.jpg",
};

/** Pexels-attributed captions live in IMAGE_MANIFEST.json / verify script */
export function MarketingLicensedPhoto({
  photoKey,
  alt,
  className,
  showCaption = true,
}: {
  photoKey: LicensedPhotoKey;
  alt: string;
  className?: string;
  showCaption?: boolean;
}) {
  return (
    <div className={`relative h-[min(456px,55vw)] overflow-hidden rounded-[20px] shadow-[0_23px_55px_rgba(18,53,75,0.11)] sm:h-[min(420px,48vw)] lg:h-[456px] ${className ?? ""}`}>
      <Image src={LICENSED_PHOTO_PATH[photoKey]} alt={alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 42vw" />
      {showCaption ? (
        <span className="absolute bottom-4 left-4 max-w-[min(100%,240px)] rounded bg-[#fffdf5]/92 px-2 py-1 text-[10px] leading-snug text-[#557077] shadow-sm">
          Licensed stock photography (Pexels), not a customer site
        </span>
      ) : null}
    </div>
  );
}

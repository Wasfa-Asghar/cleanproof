import Image from "next/image";

/**
 * Homepage hero visual, reference layout: licensed photography + floating status card.
 * Avoids numeric “live” metrics; uses demo scenario naming consistent with the page body.
 */
export function HomeHeroVisual() {
  return (
    <div className="relative mx-auto min-h-[300px] w-full max-w-xl select-none sm:min-h-[380px] lg:ml-auto lg:mr-0 lg:h-[min(510px,65vh)] lg:max-w-none lg:w-[87%]">
      <div className="relative h-[min(380px,55vw)] overflow-hidden rounded-[20px] bg-[color-mix(in_srgb,var(--cp-teal)_12%,var(--cp-bg))] shadow-[0_22px_44px_rgba(18,44,53,0.13)] sm:h-[min(420px,52vw)] lg:h-full">
        <Image
          src="/marketing/photos/end-of-tenancy.jpg"
          alt="Cleaning team vacuuming and wiping down a bright open-plan room"
          fill
          priority
          className="object-cover object-[50%_60%]"
          sizes="(max-width: 1024px) 100vw, 42vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(24,63,72,0.22)_0%,transparent_52%)]" aria-hidden />
        <p className="absolute bottom-4 right-4 max-w-[min(100%,220px)] text-right text-[11px] leading-snug text-white drop-shadow-sm">
          Licensed stock photography (Pexels)
        </p>
      </div>

      <div
        className="absolute bottom-8 left-0 z-10 flex w-[min(100%,320px)] flex-col gap-2 rounded-[17px] border border-[#e0eaeb] bg-white p-5 shadow-[0_24px_60px_rgba(22,51,66,0.19)] sm:bottom-10"
        aria-hidden
      >
        <div className="text-xs font-semibold text-[#527079]">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#0c9c8b]" />
          Job verification
        </div>
        <strong className="text-lg font-semibold tracking-tight text-[var(--cp-navy)]">Riverside Office</strong>
        <small className="text-[13px] text-[#60747d]">Checklist completed · Evidence received</small>
        <span className="mt-1 inline-flex w-max rounded-full bg-[#e2f5e9] px-2.5 py-1.5 text-[11px] font-semibold text-[#148047]">
          ✓ Ready for supervisor review
        </span>
      </div>
    </div>
  );
}

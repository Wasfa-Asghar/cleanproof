import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="marketing-cta marketing-footer-cta text-white">
      <div className="marketing-footer-cta-inner mx-auto flex w-full max-w-[1920px] flex-col gap-7 px-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl md:text-[2.45rem]">Make quality easier to prove.</h2>
          <p className="mt-3 text-base leading-relaxed text-[#d2e1e3] sm:text-[17px]">
            Start a 14-day trial or explore the interactive demo with seeded sample data.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:shrink-0">
          <Button href="/auth/signup" className="border-transparent bg-[var(--cp-teal)] px-6 shadow-[0_7px_16px_rgba(4,123,132,0.25)] hover:bg-[var(--cp-teal-600)]">
            Start free trial →
          </Button>
          <Button href="/demo" variant="secondary" className="border-white/40 bg-white px-6 text-[#173848] hover:bg-[color-mix(in_srgb,white_92%,#c4d8dc)]">
            Explore demo ↗
          </Button>
        </div>
      </div>
    </section>
  );
}

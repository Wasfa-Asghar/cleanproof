import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="border-t border-white/10 bg-[var(--cp-footer-cta)] text-center text-white">
      <div className="mx-auto max-w-3xl px-4 py-[clamp(3.5rem,8vw,5rem)]">
        <h2 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl md:text-[2.45rem]">Make quality easier to prove.</h2>
        <p className="mt-4 text-base leading-relaxed text-[#bfd5db] sm:text-[17px]">
          Start a 14-day trial or explore the interactive demo with seeded sample data.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/auth/signup" className="border-transparent bg-[var(--cp-teal)] px-6 shadow-[0_7px_16px_rgba(4,123,132,0.25)] hover:bg-[var(--cp-teal-600)]">
            Start free trial →
          </Button>
          <Button href="/demo" variant="secondary" className="border-[#c4d8dc] bg-white px-6 text-[#173848] hover:bg-[color-mix(in_srgb,white_92%,#c4d8dc)]">
            Explore demo ↗
          </Button>
        </div>
      </div>
    </section>
  );
}

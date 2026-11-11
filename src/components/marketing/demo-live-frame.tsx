"use client";

/** Same-origin iframe of the live owner app for the marketing /demo page only. */
export function DemoLiveFrame() {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[var(--cp-border)] bg-[var(--cp-surface)] shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]">
      <iframe
        title="Live CleanProof owner demo"
        src="/embed/demo"
        className="block h-[min(78vh,820px)] w-full border-0 bg-[var(--cp-bg)]"
        loading="eager"
        referrerPolicy="same-origin"
      />
      <p className="border-t border-[var(--cp-border)] bg-[var(--cp-surface)] px-4 py-3 text-sm text-[var(--cp-muted)]">
        <span className="font-semibold text-[var(--cp-navy)]">Live demo</span>
        {" — "}
        click the sidebar and buttons inside this frame. The rest of the page stays put.
      </p>
    </div>
  );
}

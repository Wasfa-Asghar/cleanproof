/**
 * Stylised phone frame for marketing, not a raster of the real app.
 * Avoids numeric “live” metrics; aligns with reference phone hero layouts.
 */
export function MarketingFieldPhoneMock() {
  return (
    <div
      className="mx-auto w-full max-w-[260px] rounded-[38px] border-[9px] border-[#163344] bg-white px-[18px] pb-5 pt-[18px] text-[12px] shadow-[0_20px_42px_rgba(17,43,60,0.19)]"
      aria-hidden
    >
      <div className="flex justify-between text-[11px] font-extrabold text-[var(--cp-navy)]">
        <span>9:41</span>
        <span className="text-[var(--cp-ink-subtle)]">● ▬</span>
      </div>
      <div className="mt-7">
        <p className="text-[11px] font-extrabold text-[var(--cp-teal)]">Field workspace</p>
        <p className="mt-2 text-[19px] font-semibold leading-tight text-[var(--cp-navy)]">Assigned visit</p>
        <p className="mt-1.5 text-[10px] leading-snug text-[var(--cp-muted)]">Demo site · checklist tasks</p>
      </div>
      <div className="mt-5">
        <div className="flex justify-between text-[10px] font-semibold text-[var(--cp-navy)]">
          <span>Checklist</span>
          <span className="font-medium text-[var(--cp-ink-subtle)]">In progress</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-md bg-[#e6f0ef]">
          <div className="h-full w-2/3 rounded-md bg-[#27a69b]" />
        </div>
      </div>
      <div className="mt-4 space-y-0 border-t border-[#e6eded]">
        {["Reception", "Washrooms", "Kitchen"].map((line) => (
          <div key={line} className="flex items-center justify-between border-b border-[#e6eded] py-2.5 text-[10px] font-semibold text-[var(--cp-navy)]">
            <span>✓ {line}</span>
            <span className="text-[9px] font-semibold text-[#11886e]">Done</span>
          </div>
        ))}
        <div className="flex items-center justify-between py-2.5 text-[10px] font-semibold text-[var(--cp-muted)]">
          <span>○ Meeting rooms</span>
          <span className="text-[9px] text-[var(--cp-ink-subtle)]">Pending</span>
        </div>
      </div>
      <div className="mt-3 flex gap-1.5">
        <span className="flex-1 rounded-md border border-dashed border-[#b7dad4] bg-[#edf7f5] px-1.5 py-2.5 text-center text-[9px] font-medium text-[#4b8785]">
          Before photo
        </span>
        <span className="flex-1 rounded-md border border-dashed border-[#b7dad4] bg-[#edf7f5] px-1.5 py-2.5 text-center text-[9px] font-medium text-[#4b8785]">
          After photo
        </span>
      </div>
      <div className="mt-3 rounded-lg bg-[#09878b] py-2.5 text-center text-[11px] font-bold text-white">Add evidence</div>
    </div>
  );
}

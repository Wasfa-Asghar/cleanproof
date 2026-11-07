"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function CompactProductImage({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) {
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(false);
  const preview = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!preview.current || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    observer.observe(preview.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={preview} className="product-preview" data-visible={visible}>
        <div className="relative overflow-hidden rounded-xl border border-[var(--cp-border)] shadow-md shadow-slate-900/5" style={{ aspectRatio: width / height }}>
          {failed ? (
            <p className="absolute inset-0 grid place-content-center p-4 text-center text-sm text-[var(--cp-muted)]">
              Preview unavailable. {alt}
            </p>
          ) : (
            <button type="button" className="absolute inset-0 cursor-zoom-in rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700" aria-label={`Enlarge preview: ${alt}`} onClick={() => dialog.current?.showModal()}>
              <Image src={src} alt={alt} fill unoptimized className="object-contain" onError={() => setFailed(true)} />
            </button>
          )}
        </div>
        {!failed && <p className="mt-2 text-center text-xs font-medium text-[var(--cp-teal)]">Select image to enlarge</p>}
      </div>
      <dialog ref={dialog} aria-label={alt} className="product-preview-dialog" onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}>
        <div className="sticky top-0 z-10 flex justify-end border-b border-slate-200 bg-white p-3">
          <button type="button" autoFocus onClick={() => dialog.current?.close()} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 focus-visible:outline-2 focus-visible:outline-teal-700">Close preview ×</button>
        </div>
        <div className="overflow-auto bg-white p-3">
          <Image src={src} alt={alt} width={width} height={height} unoptimized className="h-auto max-w-none" style={{ width, maxWidth: "none" }} />
        </div>
      </dialog>
    </>
  );
}

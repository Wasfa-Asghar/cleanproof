"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PRODUCT_SCREENSHOTS, type ProductScreenshotKey } from "@/lib/marketing/image-manifest";

export type ProductDetailStep = {
  title: string;
  body: string;
  points?: readonly string[];
};

export function ProductDetailScroller({
  steps,
  screenshots,
}: {
  steps: readonly [ProductDetailStep, ProductDetailStep];
  screenshots: readonly [ProductScreenshotKey, ProductScreenshotKey];
}) {
  const [active, setActive] = useState(0);
  const pinRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const nodes = pinRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = Number((visible.target as HTMLElement).dataset.stepIndex);
        if (!Number.isNaN(index)) setActive(index);
      },
      {
        root: null,
        threshold: [0.35, 0.55, 0.75],
        rootMargin: "-20% 0px -35% 0px",
      },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const step = steps[active] ?? steps[0];
  const shot = PRODUCT_SCREENSHOTS[screenshots[active]];

  return (
    <section className="marketing-detail-scroller" data-design="detail-scroller">
      <div className="marketing-detail-scroller__shell">
        <div className="marketing-detail-scroller__sticky">
          <div className="marketing-detail-scroller__panel">
            <div className="marketing-detail-scroller__copy">
              <div className="marketing-detail-scroller__meta">
                <span className="marketing-detail-scroller__index">{String(active + 1).padStart(2, "0")}</span>
                <div className="marketing-detail-scroller__tabs" aria-hidden>
                  {steps.map((_, index) => (
                    <span
                      key={index}
                      className={`marketing-detail-scroller__tab${index === active ? " is-active" : ""}`}
                    />
                  ))}
                </div>
              </div>
              <h2 key={`title-${active}`} className="marketing-detail-scroller__title">
                {step.title}
              </h2>
              <p key={`body-${active}`} className="marketing-detail-scroller__body">
                {step.body}
              </p>
              {step.points?.length ? (
                <ul key={`points-${active}`} className="marketing-detail-scroller__points">
                  {step.points.map((point) => (
                    <li key={point}>
                      <span aria-hidden>✓</span>
                      {point}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="marketing-detail-scroller__visual">
              <div key={`shot-${active}`} className="marketing-detail-scroller__shot">
                {shot ? (
                  <Image
                    src={shot.file}
                    alt={shot.alt}
                    fill
                    className="marketing-detail-scroller__img"
                    sizes="(max-width: 980px) 100vw, 48vw"
                    priority={active === 0}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="marketing-detail-scroller__track" aria-hidden>
          {steps.map((item, index) => (
            <div
              key={item.title}
              className="marketing-detail-scroller__pin"
              data-step-index={index}
              ref={(el) => {
                pinRefs.current[index] = el;
              }}
            />
          ))}
        </div>
      </div>

      <div className="marketing-detail-scroller__mobile">
        {steps.map((item, index) => {
          const mobileShot = PRODUCT_SCREENSHOTS[screenshots[index]];
          return (
            <article key={item.title} className="marketing-detail-scroller__mobile-card">
              <span className="marketing-detail-scroller__index">{String(index + 1).padStart(2, "0")}</span>
              <h2 className="marketing-detail-scroller__title">{item.title}</h2>
              <p className="marketing-detail-scroller__body">{item.body}</p>
              {item.points?.length ? (
                <ul className="marketing-detail-scroller__points">
                  {item.points.map((point) => (
                    <li key={point}>
                      <span aria-hidden>✓</span>
                      {point}
                    </li>
                  ))}
                </ul>
              ) : null}
              {mobileShot ? (
                <div className="marketing-detail-scroller__shot">
                  <Image
                    src={mobileShot.file}
                    alt={mobileShot.alt}
                    width={1280}
                    height={800}
                    className="marketing-detail-scroller__img"
                    sizes="100vw"
                  />
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

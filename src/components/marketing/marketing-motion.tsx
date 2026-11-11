"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SECTION_SELECTOR = ".marketing-shell main section";
const STAGGER_SELECTOR = [
  ".marketing-interior-focus-card",
  ".marketing-interior-unified-grid > *",
  ".marketing-interior-outcomes-grid > *",
  ".marketing-interior-compare-grid > *",
  ".marketing-interior-catalog-grid > a",
  ".marketing-security-card",
  ".marketing-price-card",
  "[data-design='gaps'] .grid > *",
  "[data-design='platform'] .marketing-capability-rail-item",
  ".marketing-capability-rail-item",
  ".marketing-comparison-card",
  "[data-design='industries'] .grid > a",
  "[data-design='preview'] .marketing-product-tabs",
  "[data-design='report'] .grid > *",
  "[data-design='example'] ol > li",
  "[data-design='related'] .marketing-related-feature-card",
  "[data-design='focus'] .marketing-capability-rail-item",
  "[data-design='workflow'] .marketing-workflow-copy > *",
  ".marketing-detail-scroller__mobile-card",
  ".marketing-faq [data-faq-item], .marketing-faq details, .marketing-faq h3",
].join(", ");

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function markTree(root: ParentNode) {
  const sections = root.querySelectorAll<HTMLElement>(SECTION_SELECTOR);
  sections.forEach((section) => {
    if (!section.classList.contains("marketing-reveal")) {
      section.classList.add("marketing-reveal");
    }

    const isHero =
      section.matches('[data-design="hero"], .marketing-interior-hero, .marketing-industry-hero') ||
      section.classList.contains("marketing-interior-hero") ||
      section.classList.contains("marketing-industry-hero");

    if (isHero) {
      section.classList.add("marketing-reveal--hero", "is-inview");
    }

    const staggerTargets = section.querySelectorAll<HTMLElement>(STAGGER_SELECTOR);
    staggerTargets.forEach((el, index) => {
      if (!el.classList.contains("marketing-reveal-child")) {
        el.classList.add("marketing-reveal-child");
      }
      el.style.setProperty("--reveal-delay", `${Math.min(index * 70, 420)}ms`);
    });
  });
}

/**
 * Site-wide marketing motion: scroll reveals + staggered children.
 * Runs only after hydration/commit — never mutates during React hydrate
 * (MutationObserver on React trees caused SSR/client className mismatches).
 */
export function MarketingMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const main = document.querySelector(".marketing-shell main");
    if (!main) return;

    let observer: IntersectionObserver | null = null;
    let cancelled = false;
    let raf1 = 0;
    let raf2 = 0;

    const observeNew = () => {
      if (!observer) return;
      main.querySelectorAll<HTMLElement>(".marketing-reveal").forEach((el) => {
        if (el.classList.contains("is-inview")) return;
        observer.observe(el);
      });
    };

    // Double rAF: wait until after browser paint + React hydration commit.
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        if (cancelled) return;

        markTree(main);

        observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              const el = entry.target as HTMLElement;
              el.classList.add("is-inview");
              observer?.unobserve(el);
            }
          },
          { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
        );

        observeNew();
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      observer?.disconnect();
    };
  }, [pathname]);

  return null;
}

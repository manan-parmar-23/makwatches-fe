"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { useInViewOnce, usePrefersReducedMotion } from "../hooks";

/**
 * Motion primitives.
 *
 * Every one of these checks `prefers-reduced-motion` and, when set, renders the
 * final state directly rather than animating to it at zero duration. That
 * matters: a marquee or a parallax listener left running still costs work even
 * when the movement is imperceptible.
 *
 * House rules from the reference:
 *   - one easing, cubic-bezier(.16,1,.3,1)
 *   - reveals are one-shot; they never replay on scroll-back
 *   - no scroll-jacking, no bounce, nothing that blocks interaction
 */

// ── Reveal ──────────────────────────────────────────────────────────────────

export interface RevealProps {
  children: ReactNode;
  /** Stagger index. Each step adds 80ms, matching the reference hero cadence. */
  delay?: 0 | 1 | 2 | 3 | 4 | 5;
  /** Travel distance in px. */
  distance?: number;
  className?: string;
  /**
   * Semantic element to render.
   *
   * Typed as the intrinsic tag names this is used with rather than a fully
   * generic polymorphic component: the ref would otherwise have to satisfy
   * every element type at once, which no single ref can.
   */
  as?: "div" | "section" | "article" | "li";
}

const DELAY_MS = [0, 80, 160, 240, 320, 400] as const;

/**
 * Fade and rise an element the first time it enters the viewport.
 */
export function Reveal({
  children,
  delay = 0,
  distance = 28,
  className,
  as: Tag = "div",
}: RevealProps) {
  const reducedMotion = usePrefersReducedMotion();
  // Passing `enabled: false` marks it seen immediately, so reduced-motion users
  // never see a hidden element and no observer is created.
  const [ref, seen] = useInViewOnce<HTMLElement>(undefined, !reducedMotion);

  // The tag is dynamic, so its ref type is the union of every element it could
  // be. HTMLElement is the common supertype the observer actually needs.
  const Component = Tag as "div";

  return (
    <Component
      ref={ref as React.RefObject<HTMLDivElement | null>}
      className={cn("transition-[opacity,transform] duration-700 ease-mak", className)}
      style={
        reducedMotion
          ? undefined
          : {
              opacity: seen ? 1 : 0,
              transform: seen ? "none" : `translateY(${distance}px)`,
              transitionDelay: `${DELAY_MS[delay]}ms`,
            }
      }
    >
      {children}
    </Component>
  );
}

// ── Marquee ─────────────────────────────────────────────────────────────────

export interface MarqueeProps {
  /** The phrase to scroll. Repeated to fill the track. */
  children: ReactNode;
  /** Seconds for one full pass. */
  duration?: number;
  tone?: "ink" | "accent" | "default";
  className?: string;
}

/**
 * A continuously scrolling band.
 *
 * The content is rendered twice and translated by exactly -50%, which makes the
 * loop seamless. The duplicate is aria-hidden so the phrase is announced once.
 *
 * Under reduced motion the track is rendered static and centred rather than
 * scrolling.
 */
export function Marquee({
  children,
  duration = 26,
  tone = "ink",
  className,
}: MarqueeProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div
      className={cn(
        "overflow-hidden border-y-2",
        tone === "ink" && "border-mak-line bg-mak-ink text-mak-on-ink",
        tone === "accent" && "border-mak-line bg-mak-accent text-mak-on-accent",
        tone === "default" && "border-mak-line bg-mak-bg text-mak-ink",
        className
      )}
    >
      <div
        className={cn(
          "flex whitespace-nowrap py-3.5",
          "font-display text-xl font-extrabold tracking-[-0.01em]",
          reducedMotion ? "justify-center overflow-hidden" : "w-max"
        )}
        style={
          reducedMotion
            ? undefined
            : {
                animation: `mak-marquee ${duration}s linear infinite`,
              }
        }
      >
        <span className="flex shrink-0 gap-7 pr-7">{children}</span>
        {!reducedMotion && (
          <span aria-hidden="true" className="flex shrink-0 gap-7 pr-7">
            {children}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Parallax ────────────────────────────────────────────────────────────────

export interface ParallaxProps {
  children: ReactNode;
  /** Movement factor. 0.14 matches the reference story section. */
  factor?: number;
  className?: string;
}

/**
 * Translate a background layer more slowly than the page scrolls.
 *
 * Reads scroll position inside requestAnimationFrame and writes a transform,
 * which stays on the compositor. The listener is passive and is never attached
 * at all under reduced motion.
 */
export function Parallax({ children, factor = 0.14, className }: ParallaxProps) {
  const reducedMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;

    const element = ref.current;
    if (!element) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();

      // Skip work entirely while off-screen.
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      // Distance of the element's centre from the viewport centre.
      const centreDelta = rect.top + rect.height / 2 - window.innerHeight / 2;
      setOffset(-centreDelta * factor);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [factor, reducedMotion]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      <div
        style={
          reducedMotion ? undefined : { transform: `translate3d(0, ${offset}px, 0)` }
        }
      >
        {children}
      </div>
    </div>
  );
}

// ── StickyScroller ──────────────────────────────────────────────────────────

export interface StickyScrollerPanel {
  id: string;
  content: ReactNode;
}

export interface StickyScrollerProps {
  /** Rendered once and pinned while the panels scroll past. */
  media: (activeIndex: number) => ReactNode;
  panels: StickyScrollerPanel[];
  className?: string;
}

/**
 * The reference's Craft section: a pinned visual on the left, numbered panels
 * scrolling past on the right, with the visual reacting to the active panel.
 *
 * This is scroll-*driven*, not scroll-*jacking*: the page scrolls at its normal
 * rate and nothing is intercepted. On mobile the layout collapses to a plain
 * sequence with no pinning, because a sticky half-screen on a small viewport
 * leaves too little room for either half.
 */
export function StickyScroller({
  media,
  panels,
  className,
}: StickyScrollerProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = panelRefs.current.indexOf(entry.target as HTMLDivElement);
          if (index >= 0) setActive(index);
        }
      },
      // A narrow band across the viewport middle, so the active panel is the
      // one the reader is actually looking at.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    for (const el of panelRefs.current) {
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [panels.length]);

  return (
    <div className={cn("grid gap-0 lg:grid-cols-2", className)}>
      {/* Pinned media. Hidden from the a11y tree on mobile where it is a
          decorative duplicate of the panel content. */}
      <div className="relative hidden lg:block">
        <div className="sticky top-0 flex h-screen items-center justify-center">
          {media(active)}
        </div>
      </div>

      <div>
        {panels.map((panel, index) => (
          <div
            key={panel.id}
            ref={(el) => {
              panelRefs.current[index] = el;
            }}
            // Inactive panels dim and sit slightly lower, so the active one
            // reads as the subject rather than one of three equal columns.
            style={
              reducedMotion
                ? undefined
                : {
                    opacity: index === active ? 1 : 0.22,
                    transform: index === active ? "none" : "translateY(14px)",
                  }
            }
            className="flex min-h-[70vh] flex-col justify-center py-14 transition-[opacity,transform] duration-500 ease-mak lg:min-h-screen lg:py-16 lg:pl-14"
          >
            {panel.content}
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { RuleGrid, useInViewOnce, usePrefersReducedMotion } from "@/design-system";

/**
 * A row of headline figures on the hairline grid, as the reference's stats band.
 *
 * Values are strings and are rendered exactly as given. The component supplies
 * no defaults and invents nothing: every figure of this kind — customers
 * served, countries shipped, ratings — is a factual claim about the business
 * and must come from src/content/home.ts.
 *
 * `countUp` animates a numeric value in when the row scrolls into view, which
 * is the reference's behaviour. Non-numeric values (including the placeholder
 * em dash) render statically regardless, so an unconfigured stat never tries to
 * count up to nothing.
 */

export interface Stat {
  /** The figure, pre-formatted. */
  value: string;
  /** What it counts. */
  label: string;
  /** Animate the number in on first view. Ignored for non-numeric values. */
  countUp?: boolean;
}

export interface StatGridProps {
  stats: readonly Stat[];
  tone?: "default" | "ink";
  className?: string;
}

/**
 * Split a formatted figure into a countable number and its decoration.
 *
 * "52,000+" -> { number: 52000, suffix: "+", decimals: 0 }
 * "4.9"     -> { number: 4.9,   suffix: "",  decimals: 1 }
 * "—"       -> null (not countable)
 */
function parseFigure(
  value: string
): { number: number; prefix: string; suffix: string; decimals: number } | null {
  const match = value.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) return null;

  const [, prefix, digits, suffix] = match;
  const numeric = Number(digits.replace(/,/g, ""));
  if (!Number.isFinite(numeric)) return null;

  const decimals = digits.includes(".") ? digits.split(".")[1].length : 0;
  return { number: numeric, prefix, suffix, decimals };
}

function CountUp({ value, active }: { value: string; active: boolean }) {
  const figure = parseFigure(value);
  const reducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(() => (figure && !reducedMotion ? null : value));
  const frame = useRef(0);

  useEffect(() => {
    // Not countable, motion suppressed, or not yet on screen: show the final
    // value and do no work at all.
    if (!figure || reducedMotion || !active) {
      setDisplay(value);
      return;
    }

    const duration = 1400;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      // Cubic ease-out, matching the reference's count.
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = figure.number * eased;

      setDisplay(
        figure.prefix +
          (figure.decimals
            ? current.toFixed(figure.decimals)
            : Math.round(current).toLocaleString("en-IN")) +
          figure.suffix
      );

      if (progress < 1) frame.current = requestAnimationFrame(step);
      else setDisplay(value);
    };

    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
    // `figure` is derived from `value`; depending on it directly would restart
    // the animation on every render because it is a fresh object each time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, active, reducedMotion]);

  return <>{display ?? value}</>;
}

export function StatGrid({ stats, tone = "default", className }: StatGridProps) {
  const [ref, seen] = useInViewOnce<HTMLDivElement>({ threshold: 0.4 });

  if (stats.length === 0) return null;

  // Match the column count to the number of stats so a row of three does not
  // leave a fourth cell empty.
  const columns = Math.min(stats.length, 4) as 1 | 2 | 3 | 4;

  return (
    <div ref={ref}>
      <RuleGrid
        cols={{ base: columns > 2 ? 2 : 1, md: columns, lg: columns }}
        className={cn(
          tone === "ink" && "border-mak-on-ink/40 bg-mak-on-ink/20",
          className
        )}
      >
        {stats.map((stat, index) => (
          <div
            // Labels come from the admin's storefront config and are not
            // guaranteed unique, so position is part of the identity.
            key={`${stat.label}-${index}`}
            className={cn("p-7 md:p-8", tone === "ink" && "bg-mak-ink")}
          >
            <div
              className={cn(
                "font-display text-[clamp(2.375rem,4vw,3.625rem)] font-extrabold leading-none tracking-[-0.03em]",
                tone === "ink" ? "text-mak-on-ink" : "text-mak-ink"
              )}
            >
              {stat.countUp ? (
                <CountUp value={stat.value} active={seen} />
              ) : (
                stat.value
              )}
            </div>
            <div
              className={cn(
                "mt-2 text-mak-label font-normal uppercase tracking-[0.14em]",
                tone === "ink" ? "text-mak-on-ink/60" : "text-mak-muted"
              )}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </RuleGrid>
    </div>
  );
}

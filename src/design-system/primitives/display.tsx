import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Small display primitives: badges, tags and prices.
 */

// ── Badge ───────────────────────────────────────────────────────────────────

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "ink" | "accent" | "surface" | "success" | "warning" | "error";
  children?: ReactNode;
}

const BADGE_TONE = {
  ink: "bg-mak-bg text-mak-ink border-mak-line",
  accent: "bg-mak-accent text-mak-on-accent border-mak-accent",
  surface: "bg-mak-surface text-mak-ink border-mak-divider",
  success: "bg-mak-bg text-mak-success border-mak-success",
  warning: "bg-mak-bg text-mak-warning border-mak-warning",
  error: "bg-mak-bg text-mak-error border-mak-error",
} as const;

/**
 * A bordered uppercase label, as used for the category chip on a product card.
 * Square corners and a visible rule -- never a rounded pill.
 */
export function Badge({
  tone = "ink",
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border-2 px-2 py-1",
        "font-display text-mak-micro font-extrabold uppercase tracking-[0.1em] leading-none",
        BADGE_TONE[tone],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

// ── Tag ─────────────────────────────────────────────────────────────────────

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "accent" | "outline";
  children?: ReactNode;
}

const TAG_TONE = {
  neutral: "bg-mak-neutral-100 text-mak-neutral-800 border-transparent",
  accent: "bg-mak-accent-100 text-mak-accent-800 border-transparent",
  outline: "bg-transparent text-mak-accent border-mak-accent",
} as const;

/** A softer, tinted label for metadata that is not a hard status. */
export function Tag({ tone = "neutral", className, children, ...rest }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2.5 py-1 text-[11px] leading-none tracking-[0.02em]",
        TAG_TONE[tone],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

// ── Price ───────────────────────────────────────────────────────────────────

/**
 * Format a number as INR.
 *
 * `en-IN` gives the lakh/crore grouping Indian shoppers expect (₹2,49,000, not
 * ₹249,000). Fractional paise are dropped: catalogue prices are whole rupees.
 */
export function formatPrice(value: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export interface PriceProps extends HTMLAttributes<HTMLSpanElement> {
  /** The price actually charged. */
  value: number;
  /**
   * The struck-through reference price. Rendered only when it is genuinely
   * higher than `value` -- a compare-at price equal to or below the real price
   * is a data error, and showing it would imply a discount that does not exist.
   */
  compareAt?: number | null;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "ink" | "inverse";
  currency?: string;
}

const PRICE_SIZE = {
  sm: "text-mak-small",
  md: "text-lg",
  lg: "text-2xl",
  xl: "text-3xl",
} as const;

/** A price, with optional strike-through comparison. */
export function Price({
  value,
  compareAt,
  size = "md",
  tone = "ink",
  currency = "INR",
  className,
  ...rest
}: PriceProps) {
  const showCompare = typeof compareAt === "number" && compareAt > value;

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-2 font-display font-extrabold tracking-[-0.01em]",
        PRICE_SIZE[size],
        tone === "ink" ? "text-mak-ink" : "text-mak-on-ink",
        className
      )}
      {...rest}
    >
      <span>{formatPrice(value, currency)}</span>
      {showCompare && (
        <span
          className={cn(
            "text-mak-small font-normal line-through",
            tone === "ink" ? "text-mak-subtle" : "text-mak-on-ink/50"
          )}
        >
          {formatPrice(compareAt, currency)}
        </span>
      )}
    </span>
  );
}

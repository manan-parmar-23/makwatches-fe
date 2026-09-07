import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Buttons and icon buttons.
 *
 * One implementation, several variants. The reference is emphatic that the
 * system should not accumulate parallel button styles, and that the accent is
 * reserved for the primary action.
 *
 * These render as <button> or, when `href` is given, as a Next <Link>. Never
 * fake one with the other: a navigation must be a link so it can be opened in a
 * new tab, and an action must be a button so it is reachable by keyboard as one.
 */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "inverse";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
  // The single accent-filled action. At most one per view.
  primary:
    "bg-mak-accent text-mak-on-accent border-2 border-mak-accent " +
    "hover:bg-mak-accent-600 hover:border-mak-accent-600 " +
    "active:bg-mak-accent-700 active:border-mak-accent-700",
  // The default action: ink rule on the ground.
  secondary:
    "bg-transparent text-mak-ink border-2 border-mak-line " +
    "hover:bg-mak-ink hover:text-mak-bg " +
    "active:bg-mak-neutral-900 active:text-mak-bg",
  // Text-level action, for tertiary placement.
  ghost:
    "bg-transparent text-mak-ink border-2 border-transparent px-1 " +
    "hover:text-mak-accent active:text-mak-accent-700",
  // For use on the ink ground.
  inverse:
    "bg-transparent text-mak-on-ink border-2 border-mak-on-ink/40 " +
    "hover:bg-mak-on-ink hover:text-mak-ink hover:border-mak-on-ink " +
    "active:bg-mak-neutral-200",
};

const SIZE: Record<ButtonSize, string> = {
  // min-h keeps every size at or above the 44px touch target.
  sm: "min-h-11 px-4 py-2 text-mak-small",
  md: "min-h-12 px-6 py-3 text-mak-small",
  lg: "min-h-14 px-7 py-4 text-mak-body",
};

const BASE =
  "inline-flex items-center justify-center gap-2 " +
  "font-display font-extrabold tracking-[0.04em] " +
  "rounded-none no-underline cursor-pointer " +
  "transition-colors duration-200 ease-mak " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent " +
  "disabled:opacity-45 disabled:pointer-events-none";

interface CommonButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to the container width. */
  block?: boolean;
  /** Trailing icon slot, typically an arrow. */
  iconRight?: ReactNode;
  iconLeft?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export type ButtonProps = CommonButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">;

export type ButtonLinkProps = CommonButtonProps & {
  href: string;
  /** Open in a new tab. Adds the required rel for security. */
  external?: boolean;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className" | "href">;

function classesFor({
  variant = "primary",
  size = "md",
  block,
  className,
}: CommonButtonProps) {
  return cn(BASE, VARIANT[variant], SIZE[size], block && "w-full", className);
}

/** An action. Use ButtonLink for navigation. */
export function Button({
  variant,
  size,
  block,
  iconLeft,
  iconRight,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classesFor({ variant, size, block, className })}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}

/** A navigation styled as a button. */
export function ButtonLink({
  href,
  external = false,
  variant,
  size,
  block,
  iconLeft,
  iconRight,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const classes = classesFor({ variant, size, block, className });

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        {...rest}
      >
        {iconLeft}
        {children}
        {iconRight}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {iconLeft}
      {children}
      {iconRight}
    </Link>
  );
}

// ── IconButton ──────────────────────────────────────────────────────────────

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /**
   * Required. An icon-only control carries no visible text, so it must always
   * name itself for assistive technology.
   */
  label: string;
  children: ReactNode;
  variant?: "outline" | "solid" | "bare" | "inverse";
  size?: "sm" | "md";
  /** Renders a count bubble, as the header wishlist and bag actions do. */
  badge?: number;
  badgeTone?: "ink" | "accent";
}

const ICON_VARIANT = {
  outline:
    "border-2 border-mak-divider bg-transparent text-mak-ink " +
    "hover:bg-mak-ink hover:text-mak-bg hover:border-mak-ink",
  solid:
    "border-2 border-mak-accent bg-mak-accent text-mak-on-accent " +
    "hover:bg-mak-accent-600 hover:border-mak-accent-600",
  bare: "border-2 border-transparent bg-transparent text-mak-ink hover:text-mak-accent",
  inverse:
    "border-2 border-mak-on-ink/40 bg-transparent text-mak-on-ink " +
    "hover:bg-mak-on-ink hover:text-mak-ink",
} as const;

/**
 * A square icon-only control.
 *
 * Both sizes meet the 44px minimum touch target: the `sm` variant is 44px on
 * touch and tightens to 36px only where a fine pointer is present.
 */
export function IconButton({
  label,
  children,
  variant = "outline",
  size = "md",
  badge,
  badgeTone = "ink",
  className,
  type = "button",
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        "relative inline-flex items-center justify-center rounded-none",
        "transition-colors duration-200 ease-mak cursor-pointer",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent",
        "disabled:opacity-45 disabled:pointer-events-none",
        size === "md" ? "size-11" : "size-11 [@media(pointer:fine)]:size-9",
        ICON_VARIANT[variant],
        className
      )}
      {...rest}
    >
      {children}
      {typeof badge === "number" && badge > 0 && (
        <span
          // aria-hidden: the count is already announced through the button's
          // accessible name, which callers compose (e.g. "Bag, 2 items").
          aria-hidden="true"
          className={cn(
            "absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center",
            "px-1 text-[10px] font-extrabold leading-none font-display",
            badgeTone === "accent"
              ? "bg-mak-accent text-mak-on-accent"
              : "bg-mak-ink text-mak-bg"
          )}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}

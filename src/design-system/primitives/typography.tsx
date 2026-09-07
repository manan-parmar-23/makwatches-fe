import type { ElementType, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Typographic primitives.
 *
 * The scale is fixed and responsive; components choose a *role*, never a raw
 * size. That is what keeps hierarchy consistent across pages, and it is why
 * none of these accept a `size` in px.
 */

// ── Heading ─────────────────────────────────────────────────────────────────

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /**
   * Visual role, independent of heading level.
   *
   * `hero` is reserved for the one dominant statement on a page -- typically
   * the homepage hero. Using it twice destroys the hierarchy.
   */
  level?: "hero" | "display" | "title" | "heading" | "subheading";
  /** Semantic tag. Choose by document outline, not by size. */
  as?: ElementType;
  tone?: "ink" | "inverse" | "accent";
  children?: ReactNode;
}

const HEADING_LEVEL = {
  hero: "text-mak-hero leading-[0.92] tracking-[-0.035em]",
  display: "text-mak-display leading-[0.98] tracking-[-0.03em]",
  title: "text-mak-title leading-[1.05] tracking-[-0.025em]",
  heading: "text-mak-heading leading-[1.15] tracking-[-0.015em]",
  subheading: "text-mak-body leading-[1.3] tracking-[-0.01em]",
} as const;

const TEXT_TONE = {
  ink: "text-mak-ink",
  inverse: "text-mak-on-ink",
  accent: "text-mak-accent",
  muted: "text-mak-muted",
  subtle: "text-mak-subtle",
  onAccent: "text-mak-on-accent",
} as const;

/** An editorial heading at weight 800. */
export function Heading({
  level = "display",
  as,
  tone = "ink",
  className,
  children,
  ...rest
}: HeadingProps) {
  // Default the tag to a sensible level, but let callers override for outline
  // correctness -- a visually large heading is often an <h2>.
  const Tag: ElementType =
    as ?? (level === "hero" ? "h1" : level === "display" ? "h2" : "h3");

  return (
    <Tag
      className={cn(
        "font-display font-extrabold text-balance",
        HEADING_LEVEL[level],
        TEXT_TONE[tone],
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ── Eyebrow ─────────────────────────────────────────────────────────────────

export interface EyebrowProps extends HTMLAttributes<HTMLElement> {
  /** Show the short accent rule before the label, as the reference hero does. */
  withRule?: boolean;
  tone?: "accent" | "ink" | "inverse";
  as?: ElementType;
  children?: ReactNode;
}

/**
 * The uppercase micro-label that sits above a heading.
 *
 * Wide tracking (0.26em) is the reference's signature here; it is what makes a
 * 12px label read as deliberate rather than small.
 */
export function Eyebrow({
  withRule = false,
  tone = "accent",
  as: Tag = "div",
  className,
  children,
  ...rest
}: EyebrowProps) {
  return (
    <Tag
      className={cn(
        "flex items-center gap-3 text-mak-label font-semibold uppercase tracking-[0.26em]",
        tone === "accent" && "text-mak-accent",
        tone === "ink" && "text-mak-ink",
        tone === "inverse" && "text-mak-on-ink",
        className
      )}
      {...rest}
    >
      {withRule && (
        <span
          aria-hidden="true"
          className={cn(
            "h-0.5 w-11 shrink-0",
            tone === "accent" && "bg-mak-accent",
            tone === "ink" && "bg-mak-ink",
            tone === "inverse" && "bg-mak-on-ink"
          )}
        />
      )}
      <span>{children}</span>
    </Tag>
  );
}

// ── Text ────────────────────────────────────────────────────────────────────

export interface TextProps extends HTMLAttributes<HTMLElement> {
  size?: "lead" | "body" | "small" | "label" | "micro";
  tone?: keyof typeof TEXT_TONE;
  as?: ElementType;
  children?: ReactNode;
}

const TEXT_SIZE = {
  lead: "text-lg leading-[1.55] md:text-xl",
  body: "text-mak-body leading-[1.6]",
  small: "text-mak-small leading-[1.55]",
  label: "text-mak-label uppercase tracking-[0.14em] font-semibold",
  micro: "text-mak-micro uppercase tracking-[0.18em] font-semibold",
} as const;

/** Body copy and labels. */
export function Text({
  size = "body",
  tone = "ink",
  as: Tag = "p",
  className,
  children,
  ...rest
}: TextProps) {
  return (
    <Tag
      className={cn("font-body", TEXT_SIZE[size], TEXT_TONE[tone], className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ── SectionHeader ───────────────────────────────────────────────────────────

export interface SectionHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  /** Optional right-hand slot: a count, a link, a control. */
  aside?: ReactNode;
  tone?: "ink" | "inverse";
  /** Draw the 2px rule beneath the header, as most reference sections do. */
  ruled?: boolean;
  className?: string;
  headingAs?: ElementType;
}

/**
 * The standard section opening: eyebrow, display heading, optional aside,
 * and the rule beneath.
 *
 * Everything is flush left. The reference is explicit that headings and copy
 * are never centered.
 */
export function SectionHeader({
  eyebrow,
  title,
  aside,
  tone = "ink",
  ruled = true,
  className,
  headingAs = "h2",
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-end justify-between gap-5",
        ruled && "border-b-2 pb-5",
        ruled && (tone === "ink" ? "border-mak-line" : "border-mak-on-ink/40"),
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <Eyebrow
            tone={tone === "ink" ? "accent" : "accent"}
            className="mb-3"
          >
            {eyebrow}
          </Eyebrow>
        ) : null}
        <Heading
          level="display"
          as={headingAs}
          tone={tone === "ink" ? "ink" : "inverse"}
        >
          {title}
        </Heading>
      </div>

      {aside ? (
        <div
          className={cn(
            "shrink-0 pb-1.5 text-mak-small",
            tone === "ink" ? "text-mak-muted" : "text-mak-on-ink/60"
          )}
        >
          {aside}
        </div>
      ) : null}
    </header>
  );
}

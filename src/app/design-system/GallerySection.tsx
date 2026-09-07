import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Container, Text } from "@/design-system";

/**
 * Chrome for one gallery section: an anchored heading, a note, and the
 * specimens beneath.
 */

export interface GallerySectionProps {
  id: string;
  title: string;
  /** What to look at, or what rule the specimens demonstrate. */
  note?: string;
  children: ReactNode;
  /** Render on the dark ground, for inverse-tone specimens. */
  tone?: "default" | "ink";
  /** Skip the container, for full-bleed specimens. */
  bleed?: boolean;
  className?: string;
}

export function GallerySection({
  id,
  title,
  note,
  children,
  tone = "default",
  bleed = false,
  className,
}: GallerySectionProps) {
  const body = (
    <>
      <header className="mb-8 border-b-2 border-mak-line pb-4">
        <h2
          className={cn(
            "font-display text-mak-title font-extrabold tracking-[-0.025em]",
            tone === "ink" ? "text-mak-on-ink" : "text-mak-ink"
          )}
        >
          {title}
        </h2>
        {note ? (
          <Text
            size="small"
            tone={tone === "ink" ? "inverse" : "muted"}
            className="mt-2 max-w-2xl"
          >
            {note}
          </Text>
        ) : null}
      </header>
      {children}
    </>
  );

  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 py-14",
        tone === "ink" && "bg-mak-ink text-mak-on-ink",
        className
      )}
    >
      {bleed ? body : <Container>{body}</Container>}
    </section>
  );
}

/** A labelled row of specimens. */
export function Specimen({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8", className)}>
      <div className="mb-3 text-mak-micro font-semibold uppercase tracking-[0.16em] text-mak-subtle">
        {label}
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

import Link from "next/link";

import { cn } from "@/lib/utils";
import { Container } from "@/design-system";

/**
 * The thin band above the header.
 *
 * Content is passed in rather than hardcoded. There is deliberately no default
 * message: the reference's "Free 2-day shipping / 5-year warranty / 30-day
 * returns" strip is demo copy, and shipping and warranty terms are commercial
 * claims that must come from real MAK policy, not from a component default.
 *
 * Renders nothing when given nothing, so it can sit in the layout permanently.
 */

export interface AnnouncementBarProps {
  /** The message. Omit to render nothing. */
  message?: string;
  /** Optional call to action at the end of the message. */
  action?: { label: string; href: string };
  tone?: "ink" | "accent";
  className?: string;
}

export function AnnouncementBar({
  message,
  action,
  tone = "ink",
  className,
}: AnnouncementBarProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "border-b-2 border-mak-line",
        tone === "ink"
          ? "bg-mak-ink text-mak-on-ink"
          : "bg-mak-accent text-mak-on-accent",
        className
      )}
    >
      <Container>
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2.5 text-center text-mak-micro font-semibold uppercase tracking-[0.18em]">
          <span>{message}</span>
          {action ? (
            <Link
              href={action.href}
              className="underline underline-offset-4 transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            >
              {action.label}
            </Link>
          ) : null}
        </p>
      </Container>
    </div>
  );
}

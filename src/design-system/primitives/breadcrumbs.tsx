import Link from "next/link";

import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "../icons";

/**
 * A breadcrumb trail.
 *
 * Rendered as an ordered list inside a labelled nav, which is what lets a
 * screen reader announce the position in the hierarchy. The final crumb is the
 * current page and is not a link.
 *
 * Structured data is emitted separately by the page, from the same array, so
 * the visible trail and the BreadcrumbList can never disagree.
 */

export interface Crumb {
  label: string;
  /** Omitted on the current page. */
  href?: string;
}

export interface BreadcrumbsProps {
  items: Crumb[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((crumb, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? (
                <ChevronRightIcon
                  size={12}
                  className="shrink-0 text-mak-subtle"
                />
              ) : null}

              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className={cn(
                    "text-mak-label font-normal uppercase tracking-[0.12em] no-underline",
                    "text-mak-muted transition-colors hover:text-mak-accent",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent"
                  )}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="max-w-[60vw] truncate text-mak-label font-normal uppercase tracking-[0.12em] text-mak-ink"
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

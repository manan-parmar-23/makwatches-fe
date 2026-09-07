import Link from "next/link";

import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons";

/**
 * Page navigation.
 *
 * Rendered as links, not buttons: each page is a real, shareable URL, so it
 * must be openable in a new tab and crawlable. That also keeps the surrounding
 * page a server component.
 *
 * The window of page numbers is truncated with ellipses so a 641-page catalog
 * does not render 641 links.
 */

export interface PaginationProps {
  page: number;
  totalPages: number;
  /** Builds the href for a page number. */
  hrefFor: (page: number) => string;
  className?: string;
}

/**
 * The page numbers to show: always first and last, plus a window around the
 * current page, with `null` marking an elided run.
 */
export function paginationRange(
  page: number,
  totalPages: number,
  window = 1
): (number | null)[] {
  if (totalPages <= 1) return [1];

  const pages = new Set<number>([1, totalPages]);
  for (let p = page - window; p <= page + window; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const out: (number | null)[] = [];

  let previous = 0;
  for (const current of sorted) {
    // A gap of exactly one is filled rather than elided -- "1 … 3" wastes more
    // space than "1 2 3".
    if (current - previous === 2) out.push(previous + 1);
    else if (current - previous > 2) out.push(null);
    out.push(current);
    previous = current;
  }

  return out;
}

const CELL =
  "inline-flex min-h-11 min-w-11 items-center justify-center border-2 px-3 " +
  "font-display text-mak-small font-extrabold no-underline transition-colors duration-200 ease-mak " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent";

export function Pagination({
  page,
  totalPages,
  hrefFor,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const range = paginationRange(page, totalPages);
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center justify-center gap-2", className)}
    >
      {hasPrevious ? (
        <Link
          href={hrefFor(page - 1)}
          rel="prev"
          aria-label="Previous page"
          className={cn(CELL, "border-mak-line text-mak-ink hover:bg-mak-ink hover:text-mak-bg")}
        >
          <ChevronLeftIcon size={16} />
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className={cn(CELL, "border-mak-divider text-mak-subtle opacity-45")}
        >
          <ChevronLeftIcon size={16} />
        </span>
      )}

      {range.map((entry, index) =>
        entry === null ? (
          <span
            key={`gap-${index}`}
            aria-hidden="true"
            className="px-1 text-mak-small text-mak-subtle"
          >
            …
          </span>
        ) : entry === page ? (
          <span
            key={entry}
            aria-current="page"
            className={cn(CELL, "border-mak-accent bg-mak-accent text-mak-on-accent")}
          >
            {entry}
          </span>
        ) : (
          <Link
            key={entry}
            href={hrefFor(entry)}
            aria-label={`Page ${entry}`}
            className={cn(CELL, "border-mak-divider text-mak-ink hover:border-mak-line")}
          >
            {entry}
          </Link>
        )
      )}

      {hasNext ? (
        <Link
          href={hrefFor(page + 1)}
          rel="next"
          aria-label="Next page"
          className={cn(CELL, "border-mak-line text-mak-ink hover:bg-mak-ink hover:text-mak-bg")}
        >
          <ChevronRightIcon size={16} />
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className={cn(CELL, "border-mak-divider text-mak-subtle opacity-45")}
        >
          <ChevronRightIcon size={16} />
        </span>
      )}
    </nav>
  );
}

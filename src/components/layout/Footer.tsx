import Link from "next/link";

import { cn } from "@/lib/utils";
import { Container, Text } from "@/design-system";

import type { FooterColumn, SocialLink } from "@/lib/api/storefront";

/**
 * The site footer.
 *
 * Wordmark and a short positioning line on the left, four link columns on the
 * right, with the 2px rule separating the legal strip beneath.
 *
 * Every string here is a prop with no default. Tagline, social links and the
 * link columns are all admin-managed: anything describing the house is a brand
 * claim and must come from real MAK copy, not a component fallback.
 *
 * A server component: nothing here is interactive.
 */

export interface FooterProps {
  /** One-line positioning statement, shown under the wordmark. */
  tagline?: string;
  /** Social destinations. Omitted entirely when not supplied. */
  social?: SocialLink[];
  /** Admin-configured link columns, already filtered and ordered. */
  columns?: FooterColumn[];
  className?: string;
}

export function Footer({
  tagline,
  social = [],
  columns = [],
  className,
}: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn("border-t-2 border-mak-line bg-mak-bg", className)}>
      <Container>
        <div className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:gap-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-baseline gap-2 no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent"
            >
              <span className="font-display text-2xl font-extrabold tracking-[-0.02em] text-mak-ink">
                MAK
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.42em] text-mak-accent">
                Watches
              </span>
            </Link>

            {tagline ? (
              <Text size="small" tone="muted" className="mt-4 max-w-[280px]">
                {tagline}
              </Text>
            ) : null}
          </div>

          {columns.map((column) => {
            const items = column.items;
            if (items.length === 0) return null;

            return (
              <nav key={column.id} aria-labelledby={`footer-${column.id}`}>
                <h2
                  id={`footer-${column.id}`}
                  className="mb-4 font-display text-mak-label font-extrabold uppercase tracking-[0.14em] text-mak-ink"
                >
                  {column.heading}
                </h2>
                <ul className="flex flex-col gap-1">
                  {items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="flex min-h-9 items-center text-mak-small text-mak-muted no-underline transition-colors duration-200 ease-mak hover:text-mak-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            );
          })}
        </div>
      </Container>

      <div className="border-t-2 border-mak-line">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-3 py-5 text-mak-label font-normal normal-case tracking-[0.04em] text-mak-muted">
            <span>© {year} MAK Watches. All rights reserved.</span>
            {social.length > 0 && (
              <span className="flex gap-5">
                {social.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline transition-colors hover:text-mak-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent"
                  >
                    {item.label}
                  </a>
                ))}
              </span>
            )}
          </div>
        </Container>
      </div>
    </footer>
  );
}

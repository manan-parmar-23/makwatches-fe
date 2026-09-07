import Link from "next/link";

import { cn } from "@/lib/utils";
import { ArrowRightIcon, Reveal, RuleGrid } from "@/design-system";
import { IMAGE_SIZES, type MediaRef } from "@/lib/media";
import { ProductImage } from "@/components/commerce/ProductImage";

/**
 * Square category tiles with a gradient scrim and an accent arrow.
 *
 * Density follows the approved responsive strategy: 1-up mobile, 2-up tablet,
 * 3-up desktop.
 *
 * A server component. The hover zoom is CSS and needs no client boundary.
 */

export interface CategoryTile {
  label: string;
  href: string;
  image?: MediaRef | null;
  /** Optional count, e.g. "12 pieces". Omitted when not known. */
  count?: number;
}

export interface CategoryTilesProps {
  tiles: CategoryTile[];
  className?: string;
}

export function CategoryTiles({ tiles, className }: CategoryTilesProps) {
  if (tiles.length === 0) return null;

  // A trailing partial row would leave the grid's own divider colour showing
  // through where no cell paints, which reads as a grey hole rather than a
  // rule. Filler cells complete the row on the ground colour.
  //
  // Counted against the widest breakpoint (3-up); at 1-up and 2-up the count
  // divides evenly anyway, and an extra empty cell there is invisible because
  // it collapses to zero height.
  const fillers = (3 - (tiles.length % 3)) % 3;

  return (
    <RuleGrid cols={{ base: 1, md: 2, lg: 3 }} className={className}>
      {tiles.map((tile, index) => (
        // Two curated tiles may point at the same destination with
        // different labels, so the href alone is not an identity.
        <Reveal key={`${tile.href}-${index}`} delay={Math.min(index, 3) as 0 | 1 | 2 | 3}>
          <Link
            href={tile.href}
            className={cn(
              "group relative block aspect-square overflow-hidden no-underline",
              "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mak-accent"
            )}
          >
            <ProductImage
              media={tile.image ?? null}
              alt=""
              sizes={IMAGE_SIZES.categoryTile}
              ratio="auto"
              hoverZoom
              className="absolute inset-0 size-full"
            />

            {/* Scrim, so the label stays legible over any photograph. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-b from-transparent from-40% to-[rgba(20,18,17,0.82)]"
            />

            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <div className="font-display text-2xl font-extrabold tracking-[-0.02em] text-white">
                  {tile.label}
                </div>
                {typeof tile.count === "number" ? (
                  <div className="text-mak-label font-normal uppercase tracking-[0.1em] text-white/80">
                    {tile.count} {tile.count === 1 ? "piece" : "pieces"}
                  </div>
                ) : null}
              </div>

              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center bg-mak-accent text-mak-on-accent"
              >
                <ArrowRightIcon size={18} />
              </span>
            </div>
          </Link>
        </Reveal>
      ))}

      {Array.from({ length: fillers }, (_, i) => (
        <div key={`filler-${i}`} aria-hidden="true" className="hidden lg:block" />
      ))}
    </RuleGrid>
  );
}

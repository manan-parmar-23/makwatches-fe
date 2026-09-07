"use client";

import Link from "next/link";

import {
  Badge,
  Button,
  ButtonLink,
  EmptyState,
  LoadingState,
  Price,
  RuleGrid,
  Text,
  TrashIcon,
} from "@/design-system";
import { ProductImage } from "@/components/commerce";
import { IMAGE_SIZES } from "@/lib/media";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { useWishlistStore, type WishlistLine } from "@/store/wishlist";

/**
 * The wishlist page body.
 *
 * Each saved piece can be moved straight to the bag. A line whose stock has
 * since run out shows as unavailable rather than offering an action that would
 * fail — availability is recorded when the piece is saved and refreshed
 * whenever the list is fetched from the API.
 *
 * The page heading lives in the server component, not here, so the page always
 * has an <h1> even before this hydrates.
 */
export function WishlistPageContent() {
  const hydrated = useWishlistStore((state) => state.hydrated);
  const lines = useWishlistStore((state) => state.lines);
  const remove = useWishlistStore((state) => state.remove);
  const clear = useWishlistStore((state) => state.clear);

  const addLine = useCartStore((state) => state.addLine);
  const openCart = useUIStore((state) => state.openCart);

  if (!hydrated) {
    return <LoadingState label="Loading your saved pieces" />;
  }

  if (lines.length === 0) {
    return (
      <>
        <EmptyState
          title="Your wishlist is empty."
          description="Tap the heart on any piece to save it here."
          action={
            <ButtonLink href="/shop" variant="primary" size="lg">
              Browse the collection
            </ButtonLink>
          }
        />
      </>
    );
  }

  /**
   * Move a saved line into the bag.
   *
   * The wishlist stores a denormalized snapshot, not a full Product, so this
   * reconstructs the minimum the cart needs. Stock is set to 1 rather than
   * guessed: the cart only uses it as an upper bound, and claiming more than is
   * known would let the shopper over-order.
   */
  const moveToBag = (line: WishlistLine) => {
    addLine(
      {
        id: line.productId,
        name: line.name,
        price: line.price,
        description: "",
        category: line.meta ?? "",
        stock: line.inStock ? 1 : 0,
        slug: line.slug,
        media: line.image ? [line.image] : [],
      },
      1
    );
    remove(line.productId);
    openCart();
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Text size="lead" tone="muted" aria-live="polite">
          {lines.length} saved {lines.length === 1 ? "piece" : "pieces"}.
        </Text>
        <button
          type="button"
          onClick={clear}
          className="pb-2 text-mak-small text-mak-subtle underline underline-offset-4 transition-colors hover:text-mak-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent"
        >
          Clear all
        </button>
      </div>

      <RuleGrid cols={{ base: 1, md: 2, lg: 3 }} className="mt-9">
        {lines.map((line) => {
          const href = line.slug
            ? `/product/${line.slug}`
            : `/product/id/${line.productId}`;

          return (
            <div key={line.productId} className="flex min-w-0 flex-col">
              <Link
                href={href}
                className="block focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mak-accent"
              >
                <span className="sr-only">{line.name}</span>
                <ProductImage
                  media={line.image}
                  alt={line.name}
                  sizes={IMAGE_SIZES.categoryTile}
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-2 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-mak-heading font-extrabold leading-tight tracking-[-0.01em] text-mak-ink break-words">
                    <Link
                      href={href}
                      className="transition-colors hover:text-mak-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent"
                    >
                      {line.name}
                    </Link>
                  </h2>
                  <button
                    type="button"
                    aria-label={`Remove ${line.name} from wishlist`}
                    onClick={() => remove(line.productId)}
                    className="-mr-2 -mt-1 inline-flex size-11 shrink-0 items-center justify-center text-mak-subtle transition-colors hover:text-mak-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>

                {line.meta ? (
                  <Text size="small" tone="muted">
                    {line.meta}
                  </Text>
                ) : null}

                <Price value={line.price} size="md" className="mt-auto pt-3" />

                {line.inStock ? (
                  <Button
                    variant="primary"
                    size="md"
                    block
                    className="mt-3"
                    onClick={() => moveToBag(line)}
                  >
                    Move to bag
                  </Button>
                ) : (
                  <div className="mt-3 flex items-center gap-3">
                    <Badge tone="error">Sold out</Badge>
                    <Text size="small" tone="muted">
                      Unavailable right now.
                    </Text>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </RuleGrid>
    </>
  );
}

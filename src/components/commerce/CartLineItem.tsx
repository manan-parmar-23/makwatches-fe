"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import { MinusIcon, PlusIcon, Text, TrashIcon, formatPrice } from "@/design-system";
import { IMAGE_SIZES } from "@/lib/media";
import { lineTotal, useCartStore, type CartLine } from "@/store/cart";

import { ProductImage } from "./ProductImage";

/**
 * One row in the cart.
 *
 * The quantity stepper is two buttons around a live-region count rather than a
 * number input: it is faster on touch, and it cannot be put into an invalid
 * state. At quantity 1 the minus button removes the line, which is the
 * behaviour the reference drawer has.
 */

export interface CartLineItemProps {
  line: CartLine;
  className?: string;
}

export function CartLineItem({ line, className }: CartLineItemProps) {
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const removeLine = useCartStore((state) => state.removeLine);

  const atMax =
    typeof line.maxQuantity === "number" && line.quantity >= line.maxQuantity;

  return (
    <div
      className={cn(
        "flex gap-4 border-b-[1.5px] border-mak-divider px-6 py-5",
        className
      )}
    >
      <div className="size-[74px] shrink-0 border-[1.5px] border-mak-line">
        <ProductImage
          media={line.image}
          alt={line.name}
          sizes={IMAGE_SIZES.thumbnail}
          grayscale={false}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-3">
          <h3 className="font-display text-mak-small font-extrabold leading-snug text-mak-ink">
            {line.slug ? (
              <Link
                href={`/product/${line.slug}`}
                className="hover:text-mak-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent"
              >
                {line.name}
              </Link>
            ) : (
              line.name
            )}
          </h3>

          <button
            type="button"
            aria-label={`Remove ${line.name} from bag`}
            onClick={() => removeLine(line.productId, line.size)}
            className="size-11 shrink-0 -mr-2 -mt-2 inline-flex items-center justify-center text-mak-subtle transition-colors hover:text-mak-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent"
          >
            <TrashIcon size={16} />
          </button>
        </div>

        {line.meta || line.size ? (
          <Text size="small" tone="subtle" className="mt-0.5 text-mak-label normal-case tracking-normal font-normal">
            {[line.meta, line.size].filter(Boolean).join(" · ")}
          </Text>
        ) : null}

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center border-[1.5px] border-mak-line">
            <button
              type="button"
              aria-label={
                line.quantity <= 1
                  ? `Remove ${line.name} from bag`
                  : `Decrease quantity of ${line.name}`
              }
              onClick={() => decrement(line.productId, line.size)}
              className="inline-flex size-9 items-center justify-center text-mak-ink transition-colors hover:bg-mak-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mak-accent"
            >
              <MinusIcon size={14} />
            </button>

            {/*
              Announced on change so a screen-reader user hears the new quantity
              without having to navigate back to it.
            */}
            <span
              aria-live="polite"
              aria-atomic="true"
              className="w-9 text-center font-display text-mak-small font-extrabold text-mak-ink"
            >
              <span className="sr-only">Quantity: </span>
              {line.quantity}
            </span>

            <button
              type="button"
              aria-label={`Increase quantity of ${line.name}`}
              onClick={() => increment(line.productId, line.size)}
              disabled={atMax}
              className="inline-flex size-9 items-center justify-center text-mak-ink transition-colors hover:bg-mak-surface disabled:opacity-40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mak-accent"
            >
              <PlusIcon size={14} />
            </button>
          </div>

          <span className="font-display text-mak-small font-extrabold text-mak-ink">
            {formatPrice(lineTotal(line))}
          </span>
        </div>

        {atMax ? (
          <Text size="small" tone="muted" className="mt-2 text-mak-micro normal-case tracking-normal font-normal">
            All available stock is in your bag.
          </Text>
        ) : null}
      </div>
    </div>
  );
}

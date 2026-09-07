"use client";

import { useState } from "react";

import { Button, type ButtonSize, type ButtonVariant } from "@/design-system";
import type { Product } from "@/lib/api/types";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";

/**
 * Add a product to the bag.
 *
 * Writes to the cart store and, by default, opens the cart drawer so the
 * shopper sees what happened. Out-of-stock products render a disabled control
 * that says why rather than a button that fails on click.
 */

export interface AddToBagButtonProps {
  product: Product;
  quantity?: number;
  size?: string;
  /** Open the cart drawer after adding. */
  openCartOnAdd?: boolean;
  buttonSize?: ButtonSize;
  variant?: ButtonVariant;
  block?: boolean;
  label?: string;
  className?: string;
}

export function AddToBagButton({
  product,
  quantity = 1,
  size,
  openCartOnAdd = true,
  buttonSize = "md",
  variant = "primary",
  block = false,
  label = "Add to bag",
  className,
}: AddToBagButtonProps) {
  const addLine = useCartStore((state) => state.addLine);
  const openCart = useUIStore((state) => state.openCart);
  const [justAdded, setJustAdded] = useState(false);

  const soldOut = product.stock <= 0;

  if (soldOut) {
    return (
      <Button
        variant="secondary"
        size={buttonSize}
        block={block}
        disabled
        className={className}
      >
        Sold out
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={buttonSize}
      block={block}
      className={className}
      onClick={(event) => {
        // Cards wrap the tile in a link; keep the click from navigating.
        event.preventDefault();
        event.stopPropagation();

        addLine(product, quantity, size);

        if (openCartOnAdd) {
          openCart();
          return;
        }

        // Without the drawer opening there is no other feedback, so the label
        // confirms briefly instead.
        setJustAdded(true);
        window.setTimeout(() => setJustAdded(false), 1800);
      }}
    >
      {justAdded ? "Added" : label}
    </Button>
  );
}

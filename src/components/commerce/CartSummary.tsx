"use client";

import { cn } from "@/lib/utils";
import { ButtonLink, Divider, formatPrice } from "@/design-system";

/**
 * Cart totals and the checkout call to action.
 *
 * Shipping is shown as "Calculated at checkout" rather than as a number.
 * Quoting a shipping cost here would be a claim the storefront cannot yet
 * substantiate -- rates come from Delhivery against a real pincode, and the
 * free-shipping threshold is a commercial decision that has not been set.
 */

export interface CartSummaryProps {
  subtotal: number;
  /** Set once a real shipping rate is available. */
  shipping?: number | null;
  className?: string;
}

export function CartSummary({
  subtotal,
  shipping = null,
  className,
}: CartSummaryProps) {
  const total = subtotal + (shipping ?? 0);

  return (
    <div className={cn(className)}>
      <dl className="flex flex-col gap-1.5">
        <div className="flex justify-between text-mak-small text-mak-muted">
          <dt>Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between text-mak-small text-mak-muted">
          <dt>Shipping</dt>
          <dd>
            {shipping === null ? "Calculated at checkout" : formatPrice(shipping)}
          </dd>
        </div>
      </dl>

      <Divider weight="hairline" className="my-3.5" />

      <div className="flex items-baseline justify-between">
        <span className="font-display text-base font-extrabold text-mak-ink">
          Total
        </span>
        <span className="font-display text-2xl font-extrabold tracking-[-0.01em] text-mak-ink">
          {formatPrice(total)}
        </span>
      </div>

      <ButtonLink href="/checkout" variant="primary" size="lg" block className="mt-4">
        Checkout
      </ButtonLink>
    </div>
  );
}

/**
 * Reconciling the client-side bag with the server cart.
 *
 * The storefront keeps the bag in a Zustand store so a signed-out visitor can
 * shop without an account. Checkout, though, is built entirely from the server
 * cart: `/checkout` prices the order from it and `/payments/razorpay/order`
 * takes the payable amount from it. Neither trusts a client total.
 *
 * So before an order can be placed the two have to be made to agree, and this
 * is the one place that does it. It is deliberately a push, not a merge: the
 * bag the customer is looking at is what they intend to buy.
 */

import { replaceCart, type CartAdjustment } from "@/lib/api/cart";
import type { CartLine } from "@/store/cart";

export interface CartSyncOutcome {
  /** The cart the server now holds, priced by the server. */
  total: number;
  /** Lines the server could not store as sent. Empty when nothing changed. */
  adjustments: CartAdjustment[];
  /** The lines the bag should hold after applying the server's corrections. */
  lines: CartLine[];
}

/**
 * Push the local bag to the server and fold any corrections back into it.
 *
 * The server clamps quantities to stock and drops products that are no longer
 * for sale. Those decisions are authoritative, so they are applied to the local
 * bag rather than argued with -- and returned, so the customer can be told what
 * changed before they are asked to pay.
 */
export async function syncCartToServer(
  lines: CartLine[]
): Promise<CartSyncOutcome> {
  const result = await replaceCart(
    lines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      size: line.size,
    }))
  );

  return {
    total: result.total,
    adjustments: result.adjustments ?? [],
    lines: applyAdjustments(lines, result.adjustments ?? []),
  };
}

/**
 * Apply the server's corrections to the local bag.
 *
 * Exported for its own sake because the mapping from adjustment to bag is the
 * part worth getting right: an "unavailable" line leaves the bag entirely, a
 * clamped one stays at the quantity that was actually reserved.
 */
export function applyAdjustments(
  lines: CartLine[],
  adjustments: CartAdjustment[]
): CartLine[] {
  if (adjustments.length === 0) return lines;

  const byKey = new Map<string, CartAdjustment>();
  for (const adjustment of adjustments) {
    byKey.set(keyOf(adjustment.productId, adjustment.size), adjustment);
  }

  const next: CartLine[] = [];
  for (const line of lines) {
    const adjustment = byKey.get(keyOf(line.productId, line.size));
    if (!adjustment) {
      next.push(line);
      continue;
    }
    if (adjustment.applied <= 0) continue; // withdrawn or sold out
    next.push({ ...line, quantity: adjustment.applied });
  }
  return next;
}

/**
 * A sentence a customer can act on, describing what the server changed.
 *
 * Deliberately names the product rather than reporting a count: "2 items were
 * adjusted" tells someone about to pay nothing useful.
 */
export function describeAdjustments(
  adjustments: CartAdjustment[],
  nameFor: (productId: string, size?: string) => string | undefined
): string[] {
  return adjustments.map((adjustment) => {
    const name = nameFor(adjustment.productId, adjustment.size) ?? "An item";
    if (adjustment.applied <= 0) {
      return `${name} is no longer available and has been removed from your bag.`;
    }
    return `Only ${adjustment.applied} of ${name} ${
      adjustment.applied === 1 ? "is" : "are"
    } left, so the quantity was reduced from ${adjustment.requested}.`;
  });
}

/** Lines are identified by product *and* variant, matching the cart store. */
function keyOf(productId: string, size?: string): string {
  return size ? `${productId}::${size}` : productId;
}

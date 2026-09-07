/**
 * Cart reads and writes for the authenticated shopper.
 *
 * Guest carts are held client-side in the Zustand store (src/store/cart.ts).
 * They reach the server through `replaceCart`, which checkout calls before
 * pricing an order -- see src/lib/cart-sync.ts.
 */

import { http } from "./client";
import type { Cart } from "./types";

/**
 * Fetch the signed-in user's cart.
 *
 * No user id is passed: the backend derives identity from the token. The older
 * `GET /cart/:userID` form still exists for compatibility but the id is now
 * verified against the token rather than trusted, so there is nothing to gain
 * by sending it.
 */
export function getCart(): Promise<Cart> {
  return http.get<Cart>("/cart");
}

export interface AddToCartInput {
  productId: string;
  quantity: number;
  size?: string;
}

/** Add a product to the cart, or increase its quantity if already present. */
export function addToCart(input: AddToCartInput): Promise<void> {
  return http.post<void>("/cart", input);
}

/** Remove one product line from the cart. */
export function removeFromCart(
  userId: string,
  productId: string
): Promise<void> {
  return http.delete<void>(
    `/cart/${encodeURIComponent(userId)}/${encodeURIComponent(productId)}`
  );
}

export interface CartSyncLine {
  productId: string;
  quantity: number;
  size?: string;
}

/** Why a submitted line could not be stored exactly as sent. */
export type CartAdjustmentReason = "unavailable" | "stock";

export interface CartAdjustment {
  productId: string;
  size?: string;
  requested: number;
  applied: number;
  reason: CartAdjustmentReason;
}

export interface CartSyncResult {
  items: Cart["items"];
  total: number;
  adjustments: CartAdjustment[];
}

/**
 * Replace the server cart with exactly these lines.
 *
 * Distinct from `addToCart`, which *increases* the quantity already held --
 * correct for an "add to bag" button, and wrong for synchronising, where
 * sending the same state twice would double the cart. This is idempotent.
 *
 * Lines the server cannot honour (sold out, withdrawn) come back as
 * `adjustments` instead of failing the request: one item selling out must not
 * cost the customer the rest of their bag.
 */
export function replaceCart(lines: CartSyncLine[]): Promise<CartSyncResult> {
  return http.put<CartSyncResult>("/cart", { items: lines });
}

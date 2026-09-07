/**
 * Wishlist reads and writes for the authenticated shopper.
 *
 * As with the cart, a guest wishlist lives in the Zustand store and is not sent
 * to the API until the shopper signs in.
 */

import { http } from "./client";
import type { WishlistEntry } from "./types";

/** The signed-in user's wishlist. */
export function getWishlist(): Promise<WishlistEntry[]> {
  return http.get<WishlistEntry[]>("/wishlist");
}

/** Add a product to the wishlist. */
export function addToWishlist(productId: string): Promise<void> {
  return http.post<void>("/wishlist", { productId });
}

/** Remove one wishlist entry by its entry id. */
export function removeFromWishlist(entryId: string): Promise<void> {
  return http.delete<void>(`/wishlist/${encodeURIComponent(entryId)}`);
}

/** Empty the wishlist. */
export function clearWishlist(): Promise<void> {
  return http.delete<void>("/wishlist");
}

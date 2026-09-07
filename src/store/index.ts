/**
 * Client state stores.
 *
 * Three stores, each with one clear responsibility: what is in the bag, what is
 * saved, and which overlay is open. State is never duplicated across them -- a
 * component that needs both reads both.
 */

export {
  useCartStore,
  selectCartCount,
  selectCartSubtotal,
  selectCartIsEmpty,
  lineTotal,
  type CartLine,
} from "./cart";

export {
  useWishlistStore,
  selectWishlistCount,
  selectIsWishlisted,
  type WishlistLine,
} from "./wishlist";

export {
  useUIStore,
  selectCartOpen,
  selectSearchOpen,
  selectMobileNavOpen,
  selectFiltersOpen,
  type Overlay,
} from "./ui";

"use client";

import { create } from "zustand";

/**
 * Transient UI state: which overlay is open.
 *
 * Deliberately not persisted -- reopening the cart drawer on a fresh page load
 * because it was open yesterday would be wrong.
 *
 * Kept in one store rather than three so the overlays can enforce mutual
 * exclusion: opening the search overlay while the cart drawer is open would
 * otherwise stack two focus traps, and neither would work correctly.
 */

export type Overlay = "cart" | "search" | "mobileNav" | "filters" | null;

interface UIState {
  overlay: Overlay;

  openCart: () => void;
  openSearch: () => void;
  openMobileNav: () => void;
  openFilters: () => void;
  close: () => void;
  toggle: (overlay: NonNullable<Overlay>) => void;

  /** The id of the product showing in quick view, or null. */
  quickViewProductId: string | null;
  openQuickView: (productId: string) => void;
  closeQuickView: () => void;
}

export const useUIStore = create<UIState>()((set, get) => ({
  overlay: null,

  openCart: () => set({ overlay: "cart" }),
  openSearch: () => set({ overlay: "search" }),
  openMobileNav: () => set({ overlay: "mobileNav" }),
  openFilters: () => set({ overlay: "filters" }),
  close: () => set({ overlay: null }),

  toggle: (overlay) =>
    set({ overlay: get().overlay === overlay ? null : overlay }),

  quickViewProductId: null,
  // Quick view is tracked separately: it can sit above the collection grid
  // without dismissing a cart drawer opened from within it.
  openQuickView: (productId) => set({ quickViewProductId: productId }),
  closeQuickView: () => set({ quickViewProductId: null }),
}));

// ── Selectors ───────────────────────────────────────────────────────────────

export const selectCartOpen = (state: UIState) => state.overlay === "cart";
export const selectSearchOpen = (state: UIState) => state.overlay === "search";
export const selectMobileNavOpen = (state: UIState) => state.overlay === "mobileNav";
export const selectFiltersOpen = (state: UIState) => state.overlay === "filters";

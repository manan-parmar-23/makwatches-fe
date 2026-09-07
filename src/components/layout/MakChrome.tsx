"use client";

import { useEffect } from "react";

import { CartDrawer, QuickView, SearchOverlay } from "@/components/commerce";
import { useUIStore } from "@/store/ui";
import { getProductById } from "@/lib/api/catalog";
import { useState } from "react";
import type { Product } from "@/lib/api/types";

import type { NavigationContent } from "@/lib/api/storefront";

import { Header } from "./Header";
import { MobileNav } from "./MobileNav";

/**
 * The interactive chrome for rebuilt storefront routes: header, mobile nav,
 * cart drawer, search overlay and quick view.
 *
 * Mounted once per rebuilt route rather than in the root layout, because the
 * legacy storefront still renders its own Navbar through NavGuard and mounting
 * both would give the page two headers.
 *
 * Quick view resolves its product here rather than in ProductCard. A card only
 * publishes an id to the UI store, so the modal's data fetch happens once for
 * the page instead of every card holding a copy of its own product ready to
 * open.
 */
export function MakChrome({
  navigation,
  children,
}: {
  /** Admin-configured menus, already filtered and ordered by the API. */
  navigation: NavigationContent;
  children?: React.ReactNode;
}) {
  return (
    <>
      <Header nav={navigation.primary} />
      <MobileNav nav={navigation.primary} support={navigation.support} />
      {children}
      <CartDrawer />
      <SearchOverlay />
      <QuickViewHost />
    </>
  );
}

/**
 * Resolves the quick-view product from the id held in the UI store.
 *
 * Requests are sequenced so a slow response for a dismissed product cannot
 * land after a later one and swap the modal's contents.
 */
function QuickViewHost() {
  const productId = useUIStore((state) => state.quickViewProductId);
  const closeQuickView = useUIStore((state) => state.closeQuickView);

  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!productId) return;

    let active = true;
    setProduct(null);

    getProductById(productId)
      .then((next) => {
        if (active) setProduct(next);
      })
      .catch(() => {
        // The modal stays in its loading state rather than showing a broken
        // shell; dismissing it is always available.
        if (active) setProduct(null);
      });

    return () => {
      active = false;
    };
  }, [productId]);

  return (
    <QuickView
      product={product}
      open={Boolean(productId && product)}
      onClose={closeQuickView}
    />
  );
}

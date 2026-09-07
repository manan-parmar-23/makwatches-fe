"use client";

import { usePathname } from "next/navigation";

import type { NavigationContent } from "@/lib/api/storefront";

import Navbar from "./navbar";
import { MakChrome } from "./layout/MakChrome";
import { isChromelessRoute, isRebuiltRoute } from "./layout/rebuilt-routes";

/**
 * Chooses the site header for the current route.
 *
 * Routes rebuilt onto the MAK design system get the new header plus its
 * interactive chrome (mobile nav, cart drawer, search overlay, quick view).
 * Everything else keeps the legacy Navbar until its own phase rebuilds it.
 *
 * Keeping this decision in one place is what lets the reconstruction proceed
 * route by route without either running two headers at once or leaving a page
 * with none.
 */
export default function NavGuard({
  navigation,
}: {
  /** Admin-configured menus, fetched on the server and passed in. */
  navigation: NavigationContent;
}) {
  const pathname = usePathname() || "";

  if (isChromelessRoute(pathname)) return null;
  if (isRebuiltRoute(pathname)) return <MakChrome navigation={navigation} />;

  return <Navbar />;
}

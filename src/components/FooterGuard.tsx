"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import Footer from "./footer";
import { isChromelessRoute, isRebuiltRoute } from "./layout/rebuilt-routes";

/**
 * Chooses the site footer for the current route. Mirrors NavGuard.
 *
 * The MAK footer arrives as a prop rather than being constructed here. This is
 * a client component -- it needs the pathname to decide -- but the footer's
 * copy is admin-managed and must be fetched on the server. So the layout
 * renders it and passes it in; React allows a server component to be handed to
 * a client component as a prop.
 */
export default function FooterGuard({ makFooter }: { makFooter?: ReactNode }) {
  const pathname = usePathname() || "";

  if (isChromelessRoute(pathname)) return null;
  if (isRebuiltRoute(pathname)) {
    return <div className="mak bg-mak-bg">{makFooter}</div>;
  }

  return <Footer />;
}

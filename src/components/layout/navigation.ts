/**
 * Navigation helpers.
 *
 * The menus themselves are NOT here any more — they live in the admin-managed
 * storefront document (`navigation`), so labels, destinations, order and
 * visibility change without a frontend deploy. See src/lib/api/storefront.ts.
 *
 * What remains is the small amount of logic for turning a configured item into
 * something the header can render.
 */

import type { NavItem } from "@/lib/api/storefront";

export type { NavItem };

/**
 * Whether a nav item should be treated as the current page.
 *
 * A hash or query-only destination ("/shop?sort=newest") is matched on its
 * path, so a filtered link does not light up as active on the unfiltered page
 * and vice versa.
 */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  const path = item.href.split(/[?#]/)[0];
  if (!path || path === "#") return false;
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}

/** Whether a link leaves the site and needs target/rel handling. */
export function isExternalNavItem(item: NavItem): boolean {
  return (
    item.external === true ||
    item.kind === "external" ||
    /^https?:\/\//i.test(item.href)
  );
}

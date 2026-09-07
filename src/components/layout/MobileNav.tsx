"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { cn } from "@/lib/utils";
import {
  BagIcon,
  Divider,
  HeartIcon,
  SearchIcon,
  Text,
  UserIcon,
} from "@/design-system";
import { Drawer } from "@/design-system";
import { selectCartCount, useCartStore } from "@/store/cart";
import { selectWishlistCount, useWishlistStore } from "@/store/wishlist";
import { selectMobileNavOpen, useUIStore } from "@/store/ui";

import type { NavItem } from "@/lib/api/storefront";
import { isExternalNavItem, isNavItemActive } from "./navigation";

/**
 * The mobile navigation panel.
 *
 * Intentionally designed for mobile rather than being the desktop nav at a
 * smaller size: large tap targets, the account/wishlist/bag actions promoted to
 * their own row, and support links given their own section at the bottom.
 *
 * Closes itself on navigation -- Next keeps the component mounted across a
 * client-side route change, so without this the panel would stay open over the
 * new page.
 */

export interface MobileNavProps {
  /** Admin-configured primary navigation, already filtered and ordered. */
  nav: NavItem[];
  /** Admin-configured customer-care links. */
  support: NavItem[];
}

export function MobileNav({ nav, support }: MobileNavProps) {
  const pathname = usePathname();

  const open = useUIStore(selectMobileNavOpen);
  const close = useUIStore((state) => state.close);
  const openSearch = useUIStore((state) => state.openSearch);
  const openCart = useUIStore((state) => state.openCart);

  const cartCount = useCartStore(selectCartCount);
  const wishlistCount = useWishlistStore(selectWishlistCount);

  useEffect(() => {
    if (open) close();
    // Only pathname should trigger this: including `open` would close the panel
    // the moment it opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Drawer open={open} onClose={close} title="Menu" side="left">
      <nav aria-label="Mobile" className="flex flex-col">
        {nav.map((item) => {
          const active = isNavItemActive(item, pathname);
          const external = isExternalNavItem(item);

          return (
            <Link
              key={item.id}
              href={item.href}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 items-center border-b-[1.5px] border-mak-divider px-6",
                "font-display text-2xl font-extrabold tracking-[-0.02em] no-underline",
                "transition-colors duration-200 ease-mak",
                "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mak-accent",
                active ? "text-mak-accent" : "text-mak-ink hover:text-mak-accent"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="grid grid-cols-3 border-b-[1.5px] border-mak-divider">
        <button
          type="button"
          onClick={() => {
            close();
            openSearch();
          }}
          className="flex min-h-20 flex-col items-center justify-center gap-1.5 border-r-[1.5px] border-mak-divider text-mak-ink transition-colors hover:bg-mak-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mak-accent"
        >
          <SearchIcon size={20} />
          <span className="text-mak-micro uppercase tracking-[0.14em]">Search</span>
        </button>

        <Link
          href="/wishlist"
          className="flex min-h-20 flex-col items-center justify-center gap-1.5 border-r-[1.5px] border-mak-divider text-mak-ink no-underline transition-colors hover:bg-mak-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mak-accent"
        >
          <HeartIcon size={20} />
          <span className="text-mak-micro uppercase tracking-[0.14em]">
            Saved{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
          </span>
        </Link>

        <button
          type="button"
          onClick={() => {
            close();
            openCart();
          }}
          className="flex min-h-20 flex-col items-center justify-center gap-1.5 text-mak-ink transition-colors hover:bg-mak-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mak-accent"
        >
          <BagIcon size={20} />
          <span className="text-mak-micro uppercase tracking-[0.14em]">
            Bag{cartCount > 0 ? ` (${cartCount})` : ""}
          </span>
        </button>
      </div>

      <div className="px-6 py-6">
        <Link
          href="/account"
          className="inline-flex min-h-11 items-center gap-2.5 text-mak-ink no-underline hover:text-mak-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent"
        >
          <UserIcon size={18} />
          <span className="font-display text-mak-small font-extrabold tracking-[0.04em]">
            Account &amp; orders
          </span>
        </Link>

        <Divider weight="hairline" className="my-5" />

        <Text size="label" tone="subtle" className="mb-3">
          Customer care
        </Text>
        <ul className="flex flex-col gap-1">
          {support.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex min-h-11 items-center text-mak-small text-mak-muted no-underline transition-colors hover:text-mak-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Drawer>
  );
}

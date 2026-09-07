/**
 * Layout chrome for the rebuilt storefront.
 *
 * Not yet mounted in the root layout: the legacy Navbar and Footer still serve
 * the live storefront through NavGuard/FooterGuard, and swapping them is Phase
 * 2 work. These are exercised in the /design-system gallery meanwhile.
 */

export { AnnouncementBar, type AnnouncementBarProps } from "./AnnouncementBar";
export { Header, type HeaderProps } from "./Header";
export { MobileNav, type MobileNavProps } from "./MobileNav";
export { Footer, type FooterProps } from "./Footer";
export {
  isNavItemActive,
  isExternalNavItem,
  type NavItem,
} from "./navigation";

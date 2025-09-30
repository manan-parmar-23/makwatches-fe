"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const linkClass =
  "uppercase font-bold text-xl tracking-wide text-black transition duration-200 ease-in-out hover:text-primary hover:underline underline-offset-4 hover:scale-105";

// Mobile Navbar Component
const MobileNavbar = () => {
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, role, logout } = useAuth();

  // refs to detect outside clicks
  const menuRef = useRef<HTMLDivElement | null>(null);
  const burgerRef = useRef<HTMLButtonElement | null>(null);

  // Handle scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        // Always show at top of page
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold - hide
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // close menu when clicking outside the menu or hamburger
  useEffect(() => {
    if (!open) return;

    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as Node | null;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        burgerRef.current &&
        !burgerRef.current.contains(target)
      ) {
        setOpen(false);
        setExpandedMenu(null);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  return (
    <motion.nav
      className="fixed top-0 left-0 w-full bg-secondary md:hidden shadow z-9999"
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex items-center justify-between px-4 py-2">
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/logo-1.png"
            alt="Logo"
            width={32}
            height={32}
            className="h-12 w-auto transition duration-200 ease-in-out hover:scale-110 drop-shadow-gold"
          />
        </div>
        {/* Hamburger */}
        <motion.button
          ref={burgerRef}
          className="text-gray-700 focus:outline-none"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          initial={false}
          animate={open ? "open" : "closed"}
          variants={{
            closed: { rotate: 0, transition: { duration: 0.3 } },
            open: { rotate: 90, transition: { duration: 0.3 } },
          }}
          style={{ originX: 0.5, originY: 0.5 }}
        >
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16"
              animate={open ? { d: "M6 18L18 6" } : { d: "M4 8h16" }}
              transition={{ duration: 0.3 }}
            />
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16h16"
              animate={open ? { d: "M6 6l12 12" } : { d: "M4 16h16" }}
              transition={{ duration: 0.3 }}
            />
          </svg>
        </motion.button>
      </div>
      {/* Search Bar (Mobile) */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            key="mobile-search"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 pb-2 pt-2 bg-secondary shadow-md flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 border rounded px-3 py-2 focus:outline-none bg-secondary text-primary"
              autoFocus
            />
            <button
              className="text-accent font-bold px-3 py-2"
              onClick={() => setShowSearch(false)}
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20, pointerEvents: "none" }}
            animate={{ opacity: 1, y: 0, pointerEvents: "auto" }}
            exit={{ opacity: 0, y: -20, pointerEvents: "none" }}
            transition={{ duration: 0.35 }}
            className="fixed top-14 left-0 w-full h-100px px-4 pb-4 pt-12 space-y-2 bg-secondary shadow-md z-40 rounded-b-lg overflow-y-hidden"
            ref={menuRef}
          >
            <Link
              href="/"
              className={linkClass + " block py-2"}
              onClick={() => {
                setOpen(false);
                setExpandedMenu(null);
              }}
            >
              Home
            </Link>

            <Link
              href="/men"
              className={linkClass + " block py-2"}
              onClick={() => {
                setOpen(false);
                setExpandedMenu(null);
              }}
            >
              Men
            </Link>

            <Link
              href="/women"
              className={linkClass + " block py-2"}
              onClick={() => {
                setOpen(false);
                setExpandedMenu(null);
              }}
            >
              Women
            </Link>

            <hr className="border-accent/20" />
            <button
              className={linkClass + " block py-2 text-left w-full"}
              onClick={() => {
                setShowSearch(true);
                setOpen(false);
                setExpandedMenu(null);
              }}
            >
              Search
            </button>
            <Link
              href="/cart"
              className={linkClass + " block py-2"}
              onClick={() => setOpen(false)}
            >
              Cart
            </Link>
            {/* Account Button Logic */}
            <div>
              <button
                className={linkClass + " block py-2 text-left w-full"}
                onClick={() =>
                  setExpandedMenu(expandedMenu === "account" ? null : "account")
                }
              >
                {role === "customer" && user
                  ? "Account"
                  : role === "admin" && user
                  ? "Dashboard"
                  : "Login"}
              </button>
              <AnimatePresence>
                {expandedMenu === "account" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="pl-4"
                  >
                    {(!user || !role) && (
                      <div className="py-1">
                        <Link
                          href="/login"
                          className="block py-2 text-accent"
                          onClick={() => setOpen(false)}
                        >
                          Customer Login
                        </Link>
                        <Link
                          href="/admin/login"
                          className="block py-2 text-accent"
                          onClick={() => setOpen(false)}
                        >
                          Admin Login
                        </Link>
                        <Link
                          href="/"
                          className="block py-2 text-accent"
                          onClick={() => setOpen(false)}
                        >
                          Explore as Guest
                        </Link>
                      </div>
                    )}
                    {role === "customer" && user && (
                      <div className="py-1">
                        <Link
                          href="/account"
                          className="block py-2 text-accent"
                          onClick={() => setOpen(false)}
                        >
                          Account
                        </Link>
                        {/* Orders link visible only to logged-in customers */}
                        <Link
                          href="/orders"
                          className="block py-2 text-accent"
                          onClick={() => setOpen(false)}
                        >
                          Orders
                        </Link>
                        <button
                          className="block w-full text-left py-2 text-accent"
                          onClick={() => {
                            logout();
                            setOpen(false);
                            setExpandedMenu(null);
                          }}
                        >
                          Logout
                        </button>
                      </div>
                    )}
                    {role === "admin" && user && (
                      <div className="py-1">
                        <Link
                          href="/admin/dashboard"
                          className="block py-2 text-accent"
                          onClick={() => setOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <button
                          className="block w-full text-left py-2 text-accent"
                          onClick={() => {
                            logout();
                            setOpen(false);
                            setExpandedMenu(null);
                          }}
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, role, logout } = useAuth();
  const pathname = usePathname();

  // Handle scroll visibility for desktop
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        // Always show at top of page
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold - hide
        setIsVisible(false);
        setShowAccountMenu(false); // Close account menu when hiding
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Check if current route is admin
  const isAdminRoute = pathname?.startsWith("/admin");

  // Don't render navbar for admin routes
  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        className="fixed w-full bg-secondary hidden md:block shadow z-40"
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="max-w-screen-xl mx-auto flex items-center justify-between py-2 px-6">
          {/* Left menu */}
          <div className="flex gap-10">
            <Link href="/" className={linkClass}>
              Home
            </Link>
            <Link href="/men" className={linkClass}>
              Men
            </Link>
            <Link href="/women" className={linkClass}>
              Women
            </Link>
          </div>
          {/* Center logo */}
          <div className="flex-1 flex justify-center">
            <Image
              src="/logo-1.png"
              alt="Logo"
              width={36}
              height={36}
              className="h-18 w-auto transition duration-200 ease-in-out hover:scale-110 drop-shadow-gold"
            />
          </div>
          {/* Right menu */}
          <div className="flex gap-10 items-center">
            <button className={linkClass} onClick={() => setShowSearch(true)}>
              Search
            </button>
            <Link href="/cart" className={linkClass}>
              Cart
            </Link>
            {/* Account Button Logic */}
            <div className="relative">
              <button
                className={linkClass}
                onClick={() => setShowAccountMenu((v) => !v)}
              >
                {role === "customer" && user
                  ? "Account"
                  : role === "admin" && user
                  ? "Dashboard"
                  : "Login"}
              </button>
              <AnimatePresence>
                {showAccountMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50 overflow-hidden"
                  >
                    {(!user || !role) && (
                      <div className="py-1">
                        <Link
                          href="/login"
                          className="block px-4 py-2 hover:bg-accent/10 text-accent transition duration-150"
                          onClick={() => setShowAccountMenu(false)}
                        >
                          Customer Login
                        </Link>
                        <Link
                          href="/admin/login"
                          className="block px-4 py-2 hover:bg-accent/10 text-accent transition duration-150"
                          onClick={() => setShowAccountMenu(false)}
                        >
                          Admin Login
                        </Link>
                        <Link
                          href="/"
                          className="block px-4 py-2 hover:bg-accent/10 text-accent transition duration-150"
                          onClick={() => setShowAccountMenu(false)}
                        >
                          Explore as Guest
                        </Link>
                      </div>
                    )}
                    {role === "customer" && user && (
                      <div className="py-1">
                        <Link
                          href="/account"
                          className="block px-4 py-2 hover:bg-accent/10 text-accent transition duration-150"
                          onClick={() => setShowAccountMenu(false)}
                        >
                          Account
                        </Link>
                        {/* Orders link visible only to logged-in customers */}
                        <Link
                          href="/orders"
                          className="block px-4 py-2 hover:bg-accent/10 text-accent transition duration-150"
                          onClick={() => setShowAccountMenu(false)}
                        >
                          Orders
                        </Link>
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-accent/10 text-accent transition duration-150"
                          onClick={() => {
                            logout();
                            setShowAccountMenu(false);
                          }}
                        >
                          Logout
                        </button>
                      </div>
                    )}
                    {role === "admin" && user && (
                      <div className="py-1">
                        <Link
                          href="/admin/dashboard"
                          className="block px-4 py-2 hover:bg-accent/10 text-accent transition duration-150"
                          onClick={() => setShowAccountMenu(false)}
                        >
                          Dashboard
                        </Link>
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-accent/10 text-accent transition duration-150"
                          onClick={() => {
                            logout();
                            setShowAccountMenu(false);
                          }}
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        {/* Search Bar (Desktop) */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              key="desktop-search"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-screen-xl mx-auto px-6 pb-4 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 border rounded px-3 py-2 focus:outline-none bg-secondary text-primary"
                autoFocus
              />
              <button
                className="text-accent font-bold px-3 py-2"
                onClick={() => setShowSearch(false)}
              >
                Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      {/* Mobile Navbar */}
      <MobileNavbar />
    </>
  );
};

export default Navbar;

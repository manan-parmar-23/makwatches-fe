"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const linkClass =
  "uppercase font-bold text-xl tracking-wide text-[#531A1A] transition duration-200 ease-in-out hover:text-primary hover:underline underline-offset-4 hover:scale-105";

// Mobile Navbar Component
const MobileNavbar = () => {
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const { user, role, logout } = useAuth();

  // refs to detect outside clicks
  const menuRef = useRef<HTMLDivElement | null>(null);
  const burgerRef = useRef<HTMLButtonElement | null>(null);

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
    <nav className="fixed top-0 left-0 w-full bg-white md:hidden shadow z-9999">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/p.png"
            alt="Logo"
            width={32}
            height={32}
            className="h-8 w-auto transition duration-200 ease-in-out hover:scale-110"
          />
        </div>
        {/* Hamburger */}
        <motion.button
          ref={burgerRef}
          className="text-[#531A1A] focus:outline-none"
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
            className="px-4 pb-2 pt-2 bg-white shadow-md flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 border rounded px-3 py-2 focus:outline-none"
              autoFocus
            />
            <button
              className="text-[#531A1A] font-bold px-3 py-2"
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
            className="fixed top-12 left-0 w-full h-100px px-4 pb-4 pt-12 space-y-2 bg-white shadow-md z-40 rounded-b-lg overflow-y-hidden"
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

            <button
              className={linkClass + " block py-2 text-left w-full"}
              onClick={() =>
                setExpandedMenu(expandedMenu === "men" ? null : "men")
              }
            >
              Men
            </button>
            <AnimatePresence>
              {expandedMenu === "men" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pl-4"
                >
                  {/* Only show All Men (removed sub-links) */}
                  <Link
                    href="/men"
                    className="block py-2 text-[#531A1A]"
                    onClick={() => {
                      setOpen(false);
                      setExpandedMenu(null);
                    }}
                  >
                    All Men
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              className={linkClass + " block py-2 text-left w-full"}
              onClick={() =>
                setExpandedMenu(expandedMenu === "women" ? null : "women")
              }
            >
              Women
            </button>
            <AnimatePresence>
              {expandedMenu === "women" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pl-4"
                >
                  {/* Only show All Women (removed sub-links) */}
                  <Link
                    href="/women"
                    className="block py-2 text-[#531A1A]"
                    onClick={() => {
                      setOpen(false);
                      setExpandedMenu(null);
                    }}
                  >
                    All Women
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            <hr className="border-[#531A1A]/20" />
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
                          className="block py-2 text-[#531A1A]"
                          onClick={() => setOpen(false)}
                        >
                          Customer Login
                        </Link>
                        <Link
                          href="/admin/login"
                          className="block py-2 text-[#531A1A]"
                          onClick={() => setOpen(false)}
                        >
                          Admin Login
                        </Link>
                        <Link
                          href="/"
                          className="block py-2 text-[#531A1A]"
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
                          className="block py-2 text-[#531A1A]"
                          onClick={() => setOpen(false)}
                        >
                          Account
                        </Link>
                        {/* Orders link visible only to logged-in customers */}
                        <Link
                          href="/orders"
                          className="block py-2 text-[#531A1A]"
                          onClick={() => setOpen(false)}
                        >
                          Orders
                        </Link>
                        <button
                          className="block w-full text-left py-2 text-[#531A1A]"
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
                          className="block py-2 text-[#531A1A]"
                          onClick={() => setOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <button
                          className="block w-full text-left py-2 text-[#531A1A]"
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
    </nav>
  );
};

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const { user, role, logout } = useAuth();
  const pathname = usePathname();

  // Check if current route is admin
  const isAdminRoute = pathname?.startsWith("/admin");

  // Don't render navbar for admin routes
  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="w-full bg-white hidden md:block">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between py-6 px-6">
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
              src="/p.png"
              alt="Logo"
              width={36}
              height={36}
              className="h-10 w-auto transition duration-200 ease-in-out hover:scale-110"
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
                          className="block px-4 py-2 hover:bg-gray-100 text-[#531A1A] transition duration-150"
                          onClick={() => setShowAccountMenu(false)}
                        >
                          Customer Login
                        </Link>
                        <Link
                          href="/admin/login"
                          className="block px-4 py-2 hover:bg-gray-100 text-[#531A1A] transition duration-150"
                          onClick={() => setShowAccountMenu(false)}
                        >
                          Admin Login
                        </Link>
                        <Link
                          href="/"
                          className="block px-4 py-2 hover:bg-gray-100 text-[#531A1A] transition duration-150"
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
                          className="block px-4 py-2 hover:bg-gray-100 text-[#531A1A] transition duration-150"
                          onClick={() => setShowAccountMenu(false)}
                        >
                          Account
                        </Link>
                        {/* Orders link visible only to logged-in customers */}
                        <Link
                          href="/orders"
                          className="block px-4 py-2 hover:bg-gray-100 text-[#531A1A] transition duration-150"
                          onClick={() => setShowAccountMenu(false)}
                        >
                          Orders
                        </Link>
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-[#531A1A] transition duration-150"
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
                          className="block px-4 py-2 hover:bg-gray-100 text-[#531A1A] transition duration-150"
                          onClick={() => setShowAccountMenu(false)}
                        >
                          Dashboard
                        </Link>
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-[#531A1A] transition duration-150"
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
                className="flex-1 border rounded px-3 py-2 focus:outline-none"
                autoFocus
              />
              <button
                className="text-[#531A1A] font-bold px-3 py-2"
                onClick={() => setShowSearch(false)}
              >
                Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      {/* Mobile Navbar */}
      <MobileNavbar />
    </>
  );
};

export default Navbar;

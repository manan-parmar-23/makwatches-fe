"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const linkClass =
  "uppercase font-bold text-xl tracking-wide text-[#531A1A] transition duration-200 ease-in-out hover:text-primary hover:underline underline-offset-4 hover:scale-105";

const hamburgerVariants = {
  closed: { rotate: 0, transition: { duration: 0.3 } },
  open: { rotate: 90, transition: { duration: 0.3 } },
};

const menuVariants = {
  closed: {
    opacity: 0,
    y: -20,
    pointerEvents: "none",
    transition: { duration: 0.25 },
  },
  open: {
    opacity: 1,
    y: 0,
    pointerEvents: "auto",
    transition: { duration: 0.35 },
  },
};

// Mobile Navbar Component
const MobileNavbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-screen bg-white md:hidden shadow">
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
          className="text-[#531A1A] focus:outline-none"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          initial={false}
          animate={open ? "open" : "closed"}
          variants={hamburgerVariants}
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
      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="px-4 pb-4 pt-2 space-y-2 bg-white shadow-md rounded-b-lg"
          >
            <a href="#" className={linkClass + " block py-2"}>
              Home
            </a>
            <a href="#" className={linkClass + " block py-2"}>
              Men
            </a>
            <a href="#" className={linkClass + " block py-2"}>
              Women
            </a>
            <hr className="border-[#531A1A]/20" />
            <a href="#" className={linkClass + " block py-2"}>
              Cart
            </a>
            <a href="#" className={linkClass + " block py-2"}>
              Account
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Navbar = () => {
  return (
    <>
      {/* Desktop Navbar */}
      <nav className="w-full bg-white hidden md:block">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between py-6 px-6">
          {/* Left menu */}
          <div className="flex gap-10">
            <a href="#" className={linkClass}>
              Home
            </a>
            <a href="#" className={linkClass}>
              Men
            </a>
            <a href="#" className={linkClass}>
              Women
            </a>
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
          <div className="flex gap-10">
            <a href="#" className={linkClass}>
              Cart
            </a>
            <a href="#" className={linkClass}>
              Account
            </a>
          </div>
        </div>
      </nav>
      {/* Mobile Navbar */}
      <MobileNavbar />
    </>
  );
};

export default Navbar;

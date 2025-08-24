"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            type: "tween",
            ease: [0.25, 0.1, 0.25, 1.0],
          },
        }}
        exit={{
          opacity: 0,
          y: -20,
          transition: {
            duration: 0.3,
            type: "tween",
            ease: [0.25, 0.1, 0.25, 1.0],
          },
        }}
        className="min-h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

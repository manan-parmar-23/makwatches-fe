"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative w-full md:w-screen max-w-7xl md:h-[420px] mx-auto aspect-[16/9] overflow-hidden rounded-2xl shadow-2xl mt-20 md:mt-28"
    >
      <Image
        src="/categories/men.png"
        alt="Men's luxury watch collection"
        fill
        priority
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 1200px"
      />

      {/* Sophisticated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-gray-900/50 to-transparent" />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-12">
        {/* Top section with brand accent */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex items-center gap-2 text-amber-400"
        >
          <div className="w-8 h-0.5 bg-amber-400"></div>
          <span className="text-sm font-medium tracking-widest uppercase">
            MAK WATCHES
          </span>
        </motion.div>

        {/* Main content */}
        <div className="flex flex-col md:flex-row justify-between items-end">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="space-y-4 mb-6 md:mb-0"
          >
            <h1 className="text-4xl md:text-7xl font-black uppercase text-white tracking-wider">
              MEN&apos;S
              <span className="block text-amber-400 text-3xl md:text-6xl">
                COLLECTION
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-light max-w-md leading-relaxed">
              Sophisticated timepieces crafted for the modern gentleman.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Link
              href="/shop"
              className="group inline-flex items-center gap-3 bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all duration-300 font-semibold text-sm md:text-base tracking-wide uppercase"
            >
              <span>Explore ALL Collection</span>
              <motion.svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </motion.svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

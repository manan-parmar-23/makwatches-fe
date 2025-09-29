"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface CategoryCardProps {
  title: string;
  subtitle: string;
  href: string;
  imageSrc: string;
  bgGradient: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  subtitle,
  href,
  imageSrc,
  bgGradient,
}) => {
  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl shadow-2xl bg-white"
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Link href={href} className="block">
        <div className="relative h-80 sm:h-96 lg:h-[28rem] overflow-hidden">
          {/* Background Gradient */}
          <div className={`absolute inset-0 ${bgGradient} opacity-90 z-10`} />

          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={imageSrc}
              alt={`${title} Watches Collection`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/categories/image.png"; // Fallback image
              }}
            />
          </div>

          {/* Content Overlay */}
          <div className="relative z-20 h-full flex flex-col justify-end p-6 sm:p-8 lg:p-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h3 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-white mb-2 tracking-wider">
                {title}
              </h3>
              <p className="text-lg sm:text-xl text-white/90 font-medium mb-4">
                {subtitle}
              </p>

              {/* Call to Action */}
              <motion.div
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 text-white font-semibold transition-all duration-300 group-hover:bg-white group-hover:text-black"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Explore Collection</span>
                <motion.svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
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
              </motion.div>
            </motion.div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 z-20">
            <motion.div
              className="w-12 h-12 border-2 border-white/30 rounded-full backdrop-blur-sm"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const Category: React.FC = () => {
  const categories = [
    {
      title: "MEN",
      subtitle: "Sophisticated Timepieces for Modern Gentlemen",
      href: "/men",
      imageSrc: "/categories/men.png",
      bgGradient:
        "bg-gradient-to-br from-slate-900/70 via-gray-800/50 to-black/80",
    },
    {
      title: "WOMEN",
      subtitle: "Elegant Designs for the Contemporary Woman",
      href: "/women",
      imageSrc: "/categories/image.png",
      bgGradient:
        "bg-gradient-to-br from-rose-800/70 via-pink-800/50 to-purple-900/70",
    },
  ];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header Section */}
      <motion.section
        className="relative py-16 sm:py-20 lg:py-24"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-7xl font-bold uppercase tracking-wider text-gray-700 mb-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Choose Your
              <span className="block text-accent">Collection</span>
            </motion.h1>

            <motion.p
              className="text-xl sm:text-2xl text-gray-500 font-normal leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Discover our premium watch collections designed for every style
              and occasion.
              <br className="hidden sm:block" />
              Crafted with precision, built to last.
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Categories Grid */}
      <motion.section
        className="pb-16"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.8 + index * 0.2,
                  duration: 0.8,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                <CategoryCard {...category} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Category;

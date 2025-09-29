"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

type ShopBannerProps = {
  title?: string;
  subtitle?: string;
  imageSrc?: string;
};

const ShopBanner: React.FC<ShopBannerProps> = ({
  title = "Premium Watch Collection",
  subtitle = "Discover luxury timepieces crafted for excellence",
  imageSrc = "/hero-watch.png",
}) => {
  return (
    <div className="w-full py-12 bg-gradient-to-b from-gray-900 to-black mt-10 md:mt-0">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="relative rounded-3xl overflow-hidden h-[300px] md:h-[480px] flex items-center justify-center shadow-2xl">
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src={imageSrc}
              alt="Shop Banner"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center w-full h-full"
            />
            {/* Elegant gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                {title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
                {subtitle}
              </p>

              {/* Decorative element */}
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-yellow-400" />
                <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-lg" />
                <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-yellow-400" />
              </div>

              {/* Call to action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-8"
              >
                <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-4 rounded-full font-semibold text-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105">
                  Explore Collection
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopBanner;

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
  imageSrc = "/hero-image.png", // Default image path, replace with actual
}) => {
  return (
    <div className="w-full py-8 bg-transparent mt-10 md:mt-0">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="relative rounded-2xl overflow-hidden h-[260px] md:h-[420px] flex items-center justify-center bg-gray-100 shadow-lg">
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src={imageSrc || "/hero-main.png"}
              alt="Shop Banner"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center w-full h-full"
            />
          </div>

          {/* Content (no black overlay) */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            ></motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopBanner;

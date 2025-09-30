"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type {
  TechShowcaseCard,
  TechShowcaseHighlight,
} from "@/types/home-content";

interface ProductCard {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  color?: "amber" | "blue" | "gray";
}

const fallbackCards: ProductCard[] = [
  {
    id: "1",
    title: "MAK Classic",
    subtitle: "Elegantly engineered timepiece",
    image: "/hero-watch.png", // Using existing watch image
    color: "amber",
  },
  {
    id: "2",
    title: "Lux Quartz",
    subtitle: "Reliable quartz movement",
    image: "/hero-watch.png",
    color: "gray",
  },
  {
    id: "3",
    title: "Signature Automatic",
    subtitle: "Flagship automatic movement",
    image: "/hero-watch.png",
    rating: 4.9,
    reviewCount: 1000,
    badge: "Editor's Pick",
    color: "blue",
  },
];

interface TechShowcaseProps {
  cards?: TechShowcaseCard[];
  highlight?: TechShowcaseHighlight;
}

export default function TechShowcase({ cards, highlight }: TechShowcaseProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const toProductColor = (
    color?: TechShowcaseCard["color"]
  ): ProductCard["color"] => {
    switch (color) {
      case "amber":
      case "blue":
      case "gray":
        return color;
      case "slate":
        return "gray";
      default:
        return "amber";
    }
  };

  const productCards: ProductCard[] =
    cards && cards.length
      ? cards
          .slice()
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
          .map((c) => ({
            id: c.id,
            title: c.title,
            subtitle: c.subtitle,
            image: c.image,
            rating: c.rating,
            reviewCount: c.reviewCount,
            badge: c.badge,
            color: toProductColor(c.color),
          }))
      : fallbackCards;

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
            Precision. Craftsmanship. Time.
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
            {highlight?.title ||
              "MAK watches blend traditional watchmaking with modern materials and engineering to deliver reliable performance and timeless style."}
          </p>
        </motion.div>

        {/* New layout: separate grids/columns for top cards, tall right card (with clock below), and wide 8D card */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left area: top two cards grid + 8D card below */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Top-left small card */}
              {productCards[0] && (
                <motion.div
                  key={productCards[0].id}
                  className={`relative rounded-2xl overflow-hidden p-5 h-44 md:h-88 bg-cover bg-center`}
                  style={{ backgroundImage: `url(${"/watch-banner.png"})` }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* dark overlay for readability */}
                  <div className="absolute inset-0 bg-black/45 pointer-events-none rounded-2xl"></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-sm">
                      {productCards[0].title}
                    </h3>
                    <p className="text-white text-sm opacity-90">
                      {productCards[0].subtitle}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Top-center small card */}
              {productCards[1] && (
                <motion.div
                  key={productCards[1].id}
                  className={`relative rounded-2xl overflow-hidden p-5 h-44 md:h-88 bg-cover bg-center`}
                  style={{ backgroundImage: `url(${"/watch-banner-1.png"})` }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  {/* dark overlay for readability */}
                  <div className="absolute inset-0 bg-black/45 pointer-events-none rounded-2xl"></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-sm">
                      {productCards[1].title}
                    </h3>
                    <p className="text-white text-sm opacity-90">
                      {productCards[1].subtitle}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Wide 8D card below top two */}
            <motion.div
              className="relative rounded-2xl overflow-hidden bg-rose-50 p-6 h-36 md:h-58 flex items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="text-5xl md:text-7xl font-bold text-orange-500 mr-8">
                {highlight?.value || "8ATM"}
              </div>
              <div>
                <div className="text-xl md:text-2xl font-semibold text-orange-500">
                  {highlight?.title || "Water Resistant"}
                </div>
                <div className="text-lg text-orange-400">
                  {highlight?.subtitle || "Up to 80 meters"}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right area: tall product card and live clock below it */}
          <div className="lg:col-span-1 space-y-6">
            {productCards[2] && (
              <motion.div
                key={productCards[2].id}
                className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-600 to-gray-800 p-6 h-96 md:h-[520px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    {productCards[2].badge && (
                      <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {productCards[2].badge}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-54 h-54 md:w-64 md:h-64 relative">
                      <Image
                        src={productCards[2].image}
                        alt={productCards[2].title}
                        fill
                        className="object-contain drop-shadow-2xl"
                      />
                    </div>
                  </div>

                  <div className="text-white mt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">
                        {productCards[2].rating ?? ""}
                      </span>
                      <div className="flex text-yellow-400">
                        {"★".repeat(5)}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Live time below tall card */}
            <motion.div
              className="bg-slate-900 rounded-2xl p-4 w-full"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-400 text-sm uppercase tracking-wider">
                    Time
                  </span>
                </div>
                <div className="text-white text-lg md:text-xl font-mono font-bold">
                  {formatTime(currentTime)}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

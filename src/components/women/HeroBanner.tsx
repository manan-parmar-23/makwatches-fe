"use client";
import Link from "next/link";
import Image from "next/image";

export default function HeroBanner() {
  return (
    <div className="relative w-full md:w-7xl aspect-[9/4] md:aspect-[9/4] overflow-hidden rounded-2xl shadow-lg">
      <Image
        src="/women-hero.png"
        alt="Women's collection"
        fill
        priority
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 1200px"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      <div className="absolute bottom-0 w-full p-4 md:p-6 flex justify-between items-center">
        <h2 className="text-white text-sm md:text-lg font-medium tracking-wide">
          WOMEN
        </h2>

        <Link
          href="/women/all"
          className="bg-white/10 backdrop-blur-sm text-white text-xs md:text-sm px-4 py-1.5 md:px-6 md:py-2 rounded-2xl border border-white/20 shadow-sm hover:bg-white/20 transition-colors duration-300"
        >
          SHOP NOW
        </Link>
      </div>
    </div>
  );
}

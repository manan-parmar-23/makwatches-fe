"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CategoryHome = () => {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-2 md:px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Women Category */}
        <div
          className="relative rounded-2xl overflow-hidden cursor-pointer group"
          onClick={() => handleNavigate("/women")}
        >
          <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
            <Image
              src="/women.png"
              alt="Women's Collection"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 536px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent">
              <div className="flex justify-between items-start p-6">
                <h2 className="text-white text-4xl md:text-5xl font-bold">
                  WOMEN
                </h2>
                <div className="bg-white/80 rounded-full w-10 h-10 flex items-center justify-center group-hover:bg-white transition-colors">
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="group-hover:translate-x-1 transition-transform"
                  >
                    <path
                      stroke="#531A1A"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Men Category */}
        <div
          className="relative rounded-2xl overflow-hidden cursor-pointer group"
          onClick={() => handleNavigate("/men")}
        >
          <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
            <Image
              src="/men.png"
              alt="Men's Collection"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 536px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent">
              <div className="flex justify-between items-start p-6">
                <h2 className="text-white text-4xl md:text-5xl font-bold">
                  MEN
                </h2>
                <div className="bg-white/80 rounded-full w-10 h-10 flex items-center justify-center group-hover:bg-white transition-colors">
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="group-hover:translate-x-1 transition-transform"
                  >
                    <path
                      stroke="#531A1A"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Now Button */}
      <div className="flex justify-center pt-12">
        <Link
          href="/shop"
          className="bg-[#531A1A] text-white rounded-full px-12 py-3 text-xl font-semibold shadow-md transition hover:bg-[#3a1010]"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
};

export default CategoryHome;

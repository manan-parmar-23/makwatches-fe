"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Collection = () => {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-12 md:px-8 md:py-16">
      <div className="space-y-20">
        {/* Luxury Collection */}
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div className="w-full lg:w-1/2">
            <Image
              src="/categories/luxury.png"
              alt="Mak Harmony X"
              width={500}
              height={500}
              className="rounded-lg object-cover w-full h-auto"
            />
          </div>
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="text-sm uppercase tracking-wider text-gray-600">
              Immerse yourself in luxury
            </div>
            <h2 className="text-4xl font-bold">Mak Harmony X</h2>
            <p className="text-lg text-gray-700">
              The Harmony X features a sophisticated noise reduction system that
              delivers crystal-clear timekeeping. Designed for clarity and
              precision, it lets you feel every second pass with unparalleled
              accuracy.
            </p>
            <p className="text-gray-600">
              Available in platinum, rose gold, gray, and black.
            </p>
            <button
              onClick={() => handleNavigate("/collection/luxury")}
              className="mt-4 bg-white border border-gray-300 text-gray-800 rounded-full px-8 py-2.5 
              flex items-center justify-center gap-2 hover:bg-gray-100 transition group"
            >
              <span>Pre-order</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="group-hover:translate-x-1 transition-transform"
              >
                <path
                  d="M9 5L16 12L9 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Sport Collection */}
        <div className="flex flex-col-reverse lg:flex-row gap-8 items-center">
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="text-sm uppercase tracking-wider text-gray-600">
              Hear every detail
            </div>
            <h2 className="text-4xl font-bold">Mak ProSport</h2>
            <p className="text-lg text-gray-700">
              The ProSport brings powerful precision and crisp design for a
              truly immersive experience. Precision-tuned for athletes who
              demand more. Waterproof to 300 meters with built-in fitness
              tracking capabilities.
            </p>
            <p className="text-gray-600">
              Available in light blue, black, and silver.
            </p>
            <button
              onClick={() => handleNavigate("/collection/sport")}
              className="mt-4 bg-white border border-gray-300 text-gray-800 rounded-full px-8 py-2.5 
              flex items-center justify-center gap-2 hover:bg-gray-100 transition group"
            >
              <span>Pre-order</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="group-hover:translate-x-1 transition-transform"
              >
                <path
                  d="M9 5L16 12L9 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="w-full lg:w-1/2">
            <Image
              src="/categories/sports.png"
              alt="Mak ProSport"
              width={500}
              height={500}
              className="rounded-lg object-cover w-full h-auto"
            />
          </div>
        </div>

        {/* Classic Collection - Control Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div className="w-full lg:w-1/2">
            <Image
              src="/categories/casual.png"
              alt="Mak Classic Control"
              width={500}
              height={500}
              className="rounded-lg object-cover w-full h-auto"
            />
          </div>
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="text-sm uppercase tracking-wider text-gray-600">
              Timeless elegance
            </div>
            <h2 className="text-4xl font-bold">Mak Classic Control</h2>
            <p className="text-lg text-gray-700">
              Our Classic Control series offers timeless design with modern
              functionality. Featuring Swiss movement with a minimalist
              interface that delivers maximum impact. Perfect for both formal
              occasions and everyday wear.
            </p>
            <p className="text-gray-600">
              Available in white, black, and brown leather options.
            </p>
            <button
              onClick={() => handleNavigate("/collection/classic")}
              className="mt-4 bg-white border border-gray-300 text-gray-800 rounded-full px-8 py-2.5 
              flex items-center justify-center gap-2 hover:bg-gray-100 transition group"
            >
              <span>Pre-order</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="group-hover:translate-x-1 transition-transform"
              >
                <path
                  d="M9 5L16 12L9 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Shop All Button */}
      <div className="flex justify-center pt-16 mt-10">
        <Link
          href="/shop"
          className="bg-gray-900 text-white rounded-full px-12 py-4 text-lg font-medium shadow-md 
          transition hover:bg-gray-800 inline-flex items-center gap-2"
        >
          Shop All Collections
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="group-hover:translate-x-1 transition-transform"
          >
            <path
              d="M9 5L16 12L9 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
};

export default Collection;

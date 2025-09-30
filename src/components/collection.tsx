"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { HomeCollectionFeature } from "@/types/home-content";
import {
  fetchPublicProductById,
  fetchPublicProducts,
  ProductQueryParams,
} from "@/utils/api";

interface CollectionProps {
  features?: HomeCollectionFeature[];
}

const Collection: React.FC<CollectionProps> = ({ features }) => {
  const router = useRouter();

  const handlePreOrder = async (ctaHref?: string) => {
    // Try to honor an explicit /product_details?id=... link if admin set it
    const tryPushCtaIfProduct = async (href: string) => {
      try {
        const url = new URL(
          href,
          typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost"
        );
        const id = url.searchParams.get("id");
        if (id) {
          try {
            await fetchPublicProductById(id);
            router.push(`/product_details?id=${encodeURIComponent(id)}`);
            return true;
          } catch {
            // not a valid product id, fall through
          }
        }
        // If it's already a product_details path without id, just open it
        if (url.pathname.startsWith("/product_details")) {
          router.push(url.pathname + (url.search || ""));
          return true;
        }
      } catch {
        // ignore malformed URLs
      }
      return false;
    };

    // 1) If ctaHref points to product_details with id, use it
    if (ctaHref) {
      const ok = await tryPushCtaIfProduct(ctaHref);
      if (ok) return;
    }

    // 2) Fallback: fetch first public product and navigate there
    try {
      const params: ProductQueryParams = { page: 1, limit: 1 };
      const { data } = await fetchPublicProducts(params);
      const list = Array.isArray(data?.data)
        ? (data.data as Array<{ id?: string }>)
        : [];
      const firstId = list.find((p) => typeof p?.id === "string")?.id;
      if (firstId) {
        router.push(`/product_details?id=${encodeURIComponent(firstId)}`);
        return;
      }
    } catch {
      // ignore and use generic page
    }

    // 3) Final fallback: open generic product details page
    router.push("/product_details");
  };

  // Map incoming features into the 3-section layout used currently.
  const mapped = (
    features && features.length
      ? features.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      : []
  ).slice(0, 3);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-12 md:px-8 md:py-16">
      <div className="space-y-20">
        {/* Luxury Collection */}
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div className="w-full lg:w-1/2">
            <Image
              src={mapped[0]?.image || "/categories/luxury.png"}
              alt={mapped[0]?.imageAlt || "Mak Harmony X"}
              width={500}
              height={500}
              className="rounded-lg object-cover w-full h-auto"
            />
          </div>
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="text-sm uppercase tracking-wider text-gray-600">
              {mapped[0]?.tagline || "Immerse yourself in luxury"}
            </div>
            <h2 className="text-4xl font-bold">
              {mapped[0]?.title || "Mak Harmony X"}
            </h2>
            <p className="text-lg text-gray-700">
              {mapped[0]?.description ||
                "The Harmony X features a sophisticated noise reduction system that delivers crystal-clear timekeeping. Designed for clarity and precision, it lets you feel every second pass with unparalleled accuracy."}
            </p>
            <p className="text-gray-600">
              {mapped[0]?.availability ||
                "Available in platinum, rose gold, gray, and black."}
            </p>
            <button
              onClick={() => handlePreOrder(mapped[0]?.ctaHref)}
              className="mt-4 bg-white border border-gray-300 text-gray-800 rounded-full px-8 py-2.5 
              flex items-center justify-center gap-2 hover:bg-gray-100 transition group"
            >
              <span>{mapped[0]?.ctaLabel || "Pre-order"}</span>
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
              {mapped[1]?.tagline || "Hear every detail"}
            </div>
            <h2 className="text-4xl font-bold">
              {mapped[1]?.title || "Mak ProSport"}
            </h2>
            <p className="text-lg text-gray-700">
              {mapped[1]?.description ||
                "The ProSport brings powerful precision and crisp design for a truly immersive experience. Precision-tuned for athletes who demand more. Waterproof to 300 meters with built-in fitness tracking capabilities."}
            </p>
            <p className="text-gray-600">
              {mapped[1]?.availability ||
                "Available in light blue, black, and silver."}
            </p>
            <button
              onClick={() => handlePreOrder(mapped[1]?.ctaHref)}
              className="mt-4 bg-white border border-gray-300 text-gray-800 rounded-full px-8 py-2.5 
              flex items-center justify-center gap-2 hover:bg-gray-100 transition group"
            >
              <span>{mapped[1]?.ctaLabel || "Pre-order"}</span>
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
              src={mapped[1]?.image || "/categories/sports.png"}
              alt={mapped[1]?.imageAlt || "Mak ProSport"}
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
              src={mapped[2]?.image || "/categories/casual.png"}
              alt={mapped[2]?.imageAlt || "Mak Classic Control"}
              width={500}
              height={500}
              className="rounded-lg object-cover w-full h-auto"
            />
          </div>
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="text-sm uppercase tracking-wider text-gray-600">
              {mapped[2]?.tagline || "Timeless elegance"}
            </div>
            <h2 className="text-4xl font-bold">
              {mapped[2]?.title || "Mak Classic Control"}
            </h2>
            <p className="text-lg text-gray-700">
              {mapped[2]?.description ||
                "Our Classic Control series offers timeless design with modern functionality. Featuring Swiss movement with a minimalist interface that delivers maximum impact. Perfect for both formal occasions and everyday wear."}
            </p>
            <p className="text-gray-600">
              {mapped[2]?.availability ||
                "Available in white, black, and brown leather options."}
            </p>
            <button
              onClick={() => handlePreOrder(mapped[2]?.ctaHref)}
              className="mt-4 bg-white border border-gray-300 text-gray-800 rounded-full px-8 py-2.5 
              flex items-center justify-center gap-2 hover:bg-gray-100 transition group"
            >
              <span>{mapped[2]?.ctaLabel || "Pre-order"}</span>
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

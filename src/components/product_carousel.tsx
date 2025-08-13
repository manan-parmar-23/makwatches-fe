"use client";
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";

// Example product data
const PRODUCTS = [
  {
    name: "Black-blue T-shirt for men",
    price: "1799/-",
    image: "/tshirt1.png",
  },
  {
    name: "Black-blue T-shirt for men",
    price: "1799/-",
    image: "/tshirt2.png",
  },
  {
    name: "Black-blue T-shirt for men",
    price: "1799/-",
    image: "/tshirt3.png",
  },
  // ...add more products as needed
  {
    name: "Black-blue T-shirt for men",
    price: "1799/-",
    image: "/tshirt3.png",
  },
  {
    name: "Black-blue T-shirt for men",
    price: "1799/-",
    image: "/tshirt3.png",
  },
];

const COLORS = {
  primary: "#531A1A",
  primaryLight: "#A45A5A",
  surface: "#FFFFFF",
  text: "#2D1B1B",
  textMuted: "#7C5C5C",
  badgeBg: "#fff",
  badgeBorder: "#531A1A",
  progressBg: "#E5E5E5",
  progressActive: "#531A1A",
};

function ProductCard({ product }: { product: (typeof PRODUCTS)[0] }) {
  return (
    <div
      className="flex flex-col items-center px-2 md:px-6"
      style={{
        minWidth: `calc(100%/3)`,
        transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
      }}
    >
      <div className="relative flex flex-col items-center group w-full">
        {/* Price badge at top-left */}
        <div
          className="absolute top-2 left-2 px-4 py-1 rounded-full border text-sm font-semibold z-10 bg-white"
          style={{
            border: `1.5px solid ${COLORS.badgeBorder}`,
            color: COLORS.primary,
            boxShadow: "0 1px 4px #531A1A10",
            whiteSpace: "nowrap",
          }}
        >
          {product.price}
        </div>
        {/* Product image */}
        <Image
          src={product.image}
          alt={product.name}
          width={360}
          height={360}
          className="mt-6 mb-2 w-[260px] h-[260px] object-contain transition-transform duration-300 group-hover:scale-105"
          style={{
            display: "block",
            background: "none",
            border: "none",
          }}
        />
      </div>
      {/* Product name */}
      <div
        className="mt-2 text-center font-medium w-full"
        style={{
          color: COLORS.text,
          fontSize: "1rem",
          letterSpacing: "0.01em",
        }}
      >
        {product.name}
      </div>
    </div>
  );
}

function ProductCardMobile({ product }: { product: (typeof PRODUCTS)[0] }) {
  return (
    <div
      className="flex flex-col items-center px-2"
      style={{
        minWidth: "80vw",
        transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
      }}
    >
      <div className="relative flex flex-col items-center group w-full">
        {/* Price badge at top-left */}
        <div
          className="absolute top-2 left-2 px-3 py-1 rounded-full border text-xs font-semibold z-10 bg-white"
          style={{
            border: `1.5px solid ${COLORS.badgeBorder}`,
            color: COLORS.primary,
            boxShadow: "0 1px 4px #531A1A10",
            whiteSpace: "nowrap",
          }}
        >
          {product.price}
        </div>
        {/* Product image */}
        <Image
          src={product.image}
          alt={product.name}
          width={160}
          height={160}
          className="mt-6 mb-2 w-[160px] h-[160px] object-contain transition-transform duration-300 group-hover:scale-105"
          style={{
            display: "block",
            background: "none",
            border: "none",
          }}
        />
      </div>
      {/* Product name */}
      <div
        className="mt-2 text-center font-medium w-full"
        style={{
          color: COLORS.text,
          fontSize: "0.95rem",
          letterSpacing: "0.01em",
        }}
      >
        {product.name}
      </div>
    </div>
  );
}

export default function ProductCarousel() {
  const [scrollIndex, setScrollIndex] = useState(0);
  const visibleCount = 3;
  const carouselRef = useRef<HTMLDivElement>(null);

  // Autoscroll logic
  useEffect(() => {
    const interval = setInterval(() => {
      setScrollIndex((prev) => (prev + 1 >= PRODUCTS.length ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to item when scrollIndex changes
  useEffect(() => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth / visibleCount;
      carouselRef.current.scrollTo({
        left: scrollIndex * cardWidth,
        behavior: "smooth",
      });
    }
  }, [scrollIndex]);

  // Progress bar calculation
  const progress = ((scrollIndex + visibleCount) / PRODUCTS.length) * 100;

  // Responsive check
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full flex flex-col items-center py-8">
      <div
        ref={carouselRef}
        className={`flex overflow-x-hidden ${
          isMobile ? "w-full max-w-full" : "w-full max-w-[1800px]"
        }`}
        style={{
          scrollBehavior: "smooth",
        }}
      >
        {PRODUCTS.map((product, idx) =>
          isMobile ? (
            <ProductCardMobile key={idx} product={product} />
          ) : (
            <ProductCard key={idx} product={product} />
          )
        )}
      </div>

      {/* Progress bar */}
      <div
        className="w-full max-w-md mt-8 mb-6 h-1 rounded-full overflow-hidden"
        style={{ background: COLORS.progressBg }}
      >
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: COLORS.progressActive,
          }}
        />
      </div>

      {/* View More button */}
      <button
        className="px-8 py-2 rounded-full font-semibold text-white shadow transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: COLORS.primary,
          fontWeight: 600,
          fontSize: "1.1rem",
        }}
        onClick={() => {
          setScrollIndex(PRODUCTS.length - visibleCount);
        }}
      >
        View More
      </button>

      <style jsx>{`
        .group:hover {
          transform: translateY(-4px);
        }
      `}</style>
    </div>
  );
}

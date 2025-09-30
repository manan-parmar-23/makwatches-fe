"use client";
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { fetchPublicProducts, ProductQueryParams } from "@/utils/api";
import { useRouter } from "next/navigation";

const PRODUCTS: Array<{
  id?: string;
  name: string;
  price: string;
  image: string;
}> = [
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
  primary: "#1a1a1a",
  primaryLight: "#333333",
  accent: "#d4af37",
  surface: "#FFFFFF",
  surfaceElevated: "#FAFAFA",
  text: "#1a1a1a",
  textSecondary: "#666666",
  textMuted: "#999999",
  border: "#e5e5e5",
  shadow: "rgba(0, 0, 0, 0.1)",
  progressBg: "#f0f0f0",
  progressActive: "#1a1a1a",
};

function ProductCard({
  product,
  onOpen,
}: {
  product: (typeof PRODUCTS)[0];
  onOpen: (id?: string) => void;
}) {
  return (
    <div
      className="flex flex-col items-center px-3 md:px-4"
      style={{
        minWidth: `calc(100%/3)`,
      }}
    >
      <div
        className="relative flex flex-col items-center group w-full max-w-[320px] cursor-pointer"
        onClick={() => onOpen(product.id)}
      >
        {/* Modern card container */}
        <div
          className="relative w-full rounded-2xl overflow-hidden transition-all duration-500 ease-out group-hover:shadow-2xl"
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            boxShadow: `0 4px 12px ${COLORS.shadow}`,
          }}
        >
          {/* Price badge */}
          <div
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold z-10 backdrop-blur-sm transition-all duration-300"
            style={{
              background: `${COLORS.accent}15`,
              border: `1px solid ${COLORS.accent}`,
              color: COLORS.primary,
              boxShadow: `0 2px 8px ${COLORS.accent}25`,
            }}
          >
            ₹{product.price}
          </div>

          {/* Product image container */}
          <div className="relative p-6 pt-12 pb-4 bg-gradient-to-br from-gray-50 to-white">
            <Image
              src={product.image}
              alt={product.name}
              width={280}
              height={280}
              className="w-full h-[240px] object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-2"
              style={{
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.1))",
              }}
            />

            {/* Subtle overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Product info section */}
          <div className="p-4 pt-2 bg-white">
            <h3
              className="text-center font-semibold leading-tight mb-2 transition-colors duration-300 group-hover:text-gray-700"
              style={{
                color: COLORS.text,
                fontSize: "0.95rem",
                letterSpacing: "-0.01em",
                lineHeight: "1.3",
              }}
            >
              {product.name}
            </h3>

            {/* Action hint */}
            <div
              className="text-center text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
              style={{ color: COLORS.textMuted }}
            >
              Click to view details
            </div>
          </div>
        </div>

        {/* Floating action button on hover */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            style={{
              background: COLORS.primary,
              boxShadow: `0 4px 12px ${COLORS.shadow}`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onOpen(product.id);
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductCardMobile({
  product,
  onOpen,
}: {
  product: (typeof PRODUCTS)[0];
  onOpen: (id?: string) => void;
}) {
  return (
    <div
      className="flex flex-col items-center px-3"
      style={{
        minWidth: "75vw",
        maxWidth: "280px",
      }}
    >
      <div
        className="relative flex flex-col items-center group w-full cursor-pointer"
        onClick={() => onOpen(product.id)}
      >
        {/* Mobile card container */}
        <div
          className="relative w-full rounded-xl overflow-hidden transition-all duration-400 ease-out active:scale-95"
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            boxShadow: `0 2px 8px ${COLORS.shadow}`,
          }}
        >
          {/* Price badge */}
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold z-10 backdrop-blur-sm"
            style={{
              background: `${COLORS.accent}20`,
              border: `1px solid ${COLORS.accent}`,
              color: COLORS.primary,
              boxShadow: `0 1px 4px ${COLORS.accent}20`,
            }}
          >
            ₹{product.price}
          </div>

          {/* Product image container */}
          <div className="relative p-4 pt-10 pb-3 bg-gradient-to-br from-gray-50 to-white">
            <Image
              src={product.image}
              alt={product.name}
              width={200}
              height={200}
              className="w-full h-[180px] object-contain transition-transform duration-400 active:scale-110"
              style={{
                filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.1))",
              }}
            />
          </div>

          {/* Product info section */}
          <div className="p-3 pt-1 bg-white">
            <h3
              className="text-center font-medium leading-tight"
              style={{
                color: COLORS.text,
                fontSize: "0.9rem",
                letterSpacing: "-0.01em",
                lineHeight: "1.25",
              }}
            >
              {product.name}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductCarousel() {
  const router = useRouter();
  const [scrollIndex, setScrollIndex] = useState(0);
  const visibleCount = 3;
  const carouselRef = useRef<HTMLDivElement>(null);
  const pauseUntilRef = useRef<number>(0);
  const scrollDebounceRef = useRef<number | null>(null);

  // Dynamic products fetched from public API (same normalization logic as in page.tsx)
  const [fetched, setFetched] = useState<Array<
    (typeof PRODUCTS)[0] & { subcategory?: string | null }
  > | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // fetch without specifying a mainCategory so API returns products across all categories
        const params: ProductQueryParams = {
          page: 1,
          limit: 10,
        };
        const res = await fetchPublicProducts(params);
        const resObj = res as { data?: unknown } | unknown;
        let payload: unknown;
        if (
          resObj &&
          typeof resObj === "object" &&
          resObj !== null &&
          "data" in resObj
        ) {
          payload = (resObj as { data: unknown }).data;
        } else {
          payload = res;
        }
        type ApiProductLite = {
          id?: string;
          name?: string;
          price?: number;
          images?: string[];
          subcategory?: string;
          subcategoryId?: string;
          subCategory?: string;
          subCategories?: Array<string | { id?: string; name?: string }>;
        };
        let apiItems: ApiProductLite[] = [];
        if (Array.isArray(payload)) apiItems = payload as ApiProductLite[];
        else if (
          payload &&
          typeof payload === "object" &&
          "data" in (payload as object) &&
          Array.isArray((payload as { data: unknown }).data)
        ) {
          apiItems = (payload as { data: unknown }).data as ApiProductLite[];
        } else apiItems = [];
        const transformed = apiItems.map((p) => {
          let sub: string | null = null;
          if (p.subcategory) sub = p.subcategory;
          else if (p.subcategoryId) sub = p.subcategoryId;
          else if (p.subCategory) sub = p.subCategory;
          else if (
            Array.isArray(p.subCategories) &&
            p.subCategories.length > 0
          ) {
            const first = p.subCategories[0];
            sub =
              typeof first === "string"
                ? first
                : (first && (first.id || first.name)) || null;
          }
          return {
            id: p.id,
            name: p.name || "Unnamed Product",
            price:
              typeof p.price === "number" ? `${Math.round(p.price)}/-` : "--/-",
            image:
              p.images && p.images.length > 0
                ? p.images[0]
                : "/placeholder.png",
            subcategory: sub,
          } as (typeof PRODUCTS)[0] & { subcategory?: string | null };
        });

        let finalList:
          | Array<(typeof PRODUCTS)[0] & { subcategory?: string | null }>
          | undefined;
        if (transformed.length === 0) {
          finalList = PRODUCTS.map((p) => ({ ...p, subcategory: null }));
        } else if (transformed.length < 5) {
          const appended = [
            ...transformed,
            ...PRODUCTS.map((p) => ({ ...p, subcategory: null })),
          ]
            .slice(0, 5)
            .map((p) => ({ ...p, subcategory: p.subcategory ?? null }));
          finalList = appended;
        } else {
          finalList = transformed;
        }
        if (!cancelled && finalList) {
          setFetched(finalList);
        }
      } catch (e) {
        if (!cancelled) {
          const fallback = PRODUCTS.map((p) => ({ ...p, subcategory: null }));
          setFetched(fallback);
        }
        console.warn("Failed to fetch public products (all)", e);
      }
    })();
    return () => {
      cancelled = true;
    };
    // run once on mount
  }, []);

  const items = fetched || PRODUCTS.map((p) => ({ ...p, subcategory: null }));

  const openDetails = (id?: string) => {
    if (id) router.push(`/product_details?id=${encodeURIComponent(id)}`);
    else router.push(`/product_details`);
  };

  // Autoscroll logic (depends on items length)
  useEffect(() => {
    const interval = setInterval(() => {
      // don't auto-advance if user recently interacted
      if (Date.now() < pauseUntilRef.current) return;
      setScrollIndex((prev) => (prev + 1 >= items.length ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [items.length]);

  // Scroll to item when scrollIndex changes - use child's offsetLeft so fixed widths align
  useEffect(() => {
    if (!carouselRef.current) return;
    const children = carouselRef.current.children;
    const idx = Math.max(0, Math.min(scrollIndex, children.length - 1));
    const target = children[idx] as HTMLElement | undefined;
    if (target) {
      carouselRef.current.scrollTo({
        left: target.offsetLeft,
        behavior: "smooth",
      });
    }
  }, [scrollIndex]);

  // handle manual scroll: update scrollIndex and pause auto-scroll briefly
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const onScroll = () => {
      // mark as user interaction: pause auto-scroll for 3s
      pauseUntilRef.current = Date.now() + 3000;

      // debounce index calculation to avoid thrashing
      if (scrollDebounceRef.current)
        window.clearTimeout(scrollDebounceRef.current);
      scrollDebounceRef.current = window.setTimeout(() => {
        const children = el.children;
        const scrollLeft = el.scrollLeft;
        let nearest = 0;
        let minDiff = Infinity;
        for (let i = 0; i < children.length; i++) {
          const child = children[i] as HTMLElement;
          const diff = Math.abs(child.offsetLeft - scrollLeft);
          if (diff < minDiff) {
            minDiff = diff;
            nearest = i;
          }
        }
        setScrollIndex((prev) => {
          if (prev !== nearest) return nearest;
          return prev;
        });
      }, 120);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (scrollDebounceRef.current)
        window.clearTimeout(scrollDebounceRef.current);
    };
  }, [carouselRef, items.length]);

  // Progress bar calculation
  const progress = ((scrollIndex + visibleCount) / items.length) * 100;

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
    <div className="w-full py-12 bg-gradient-to-b from-white to-gray-50">
      {/* Section Header */}
      <div className="text-center mb-12 px-4">
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
          style={{ background: `${COLORS.primary}15` }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={COLORS.primary}
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
          </svg>
        </div>
        <h2
          className="text-3xl md:text-4xl font-bold mb-3"
          style={{ color: COLORS.text, letterSpacing: "-0.02em" }}
        >
          Featured Collection
        </h2>
        <p
          className="text-lg max-w-2xl mx-auto"
          style={{ color: COLORS.textSecondary, lineHeight: "1.6" }}
        >
          Discover our carefully curated selection of premium timepieces, each
          crafted with precision and attention to detail
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        <div
          ref={carouselRef}
          className={`flex overflow-x-hidden ${
            isMobile ? "w-full px-4" : "w-full max-w-[1400px] mx-auto px-8"
          }`}
          style={{
            scrollBehavior: "smooth",
            scrollSnapType: "x mandatory",
          }}
        >
          {items.map((product, idx) =>
            isMobile ? (
              <ProductCardMobile
                key={idx}
                product={product}
                onOpen={openDetails}
              />
            ) : (
              <ProductCard key={idx} product={product} onOpen={openDetails} />
            )
          )}
        </div>

        {/* Navigation arrows for desktop */}
        {!isMobile && (
          <>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-10"
              style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                boxShadow: `0 4px 12px ${COLORS.shadow}`,
              }}
              onClick={() => setScrollIndex(Math.max(0, scrollIndex - 1))}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={COLORS.primary}
                strokeWidth="2"
              >
                <path d="M15 18L9 12L15 6" />
              </svg>
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-10"
              style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                boxShadow: `0 4px 12px ${COLORS.shadow}`,
              }}
              onClick={() =>
                setScrollIndex(Math.min(items.length - 1, scrollIndex + 1))
              }
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={COLORS.primary}
                strokeWidth="2"
              >
                <path d="M9 18L15 12L9 6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Enhanced Progress Indicator */}
      <div className="flex flex-col items-center mt-10 px-4">
        <div className="flex items-center space-x-2 mb-4">
          {items.map((_, idx) => (
            <button
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === scrollIndex ? "scale-125" : "hover:scale-110"
              }`}
              style={{
                background:
                  idx === scrollIndex ? COLORS.primary : COLORS.border,
              }}
              onClick={() => setScrollIndex(idx)}
            />
          ))}
        </div>

        <div
          className="w-full max-w-xs h-1 rounded-full overflow-hidden mb-6"
          style={{ background: COLORS.progressBg }}
        >
          <div
            className="h-full transition-all duration-700 ease-out rounded-full"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.accent})`,
            }}
          />
        </div>

        {/* Enhanced CTA Button */}
        <button
          className="group relative px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
            color: "white",
            fontSize: "1rem",
            boxShadow: `0 4px 16px ${COLORS.primary}30`,
          }}
          onClick={() => (window.location.href = "/shop")}
        >
          <span className="relative z-10 flex items-center space-x-2">
            <span>Explore All Watches</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>
      </div>
    </div>
  );
}

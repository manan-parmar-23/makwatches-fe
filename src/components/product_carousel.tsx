"use client";
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { fetchPublicProducts, ProductQueryParams } from "@/utils/api";

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
    <div className="w-full flex flex-col items-center">
      <div
        ref={carouselRef}
        className={`flex overflow-x-hidden ${
          isMobile ? "w-full max-w-full" : "w-full max-w-[1800px]"
        }`}
        style={{
          scrollBehavior: "smooth",
        }}
      >
        {items.map((product, idx) =>
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
          setScrollIndex(Math.max(0, items.length - visibleCount));
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

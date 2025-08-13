"use client";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchPublicCategories,
  Category,
  fetchPublicProducts,
  ProductQueryParams,
} from "@/utils/api";
import Image from "next/image";
// Components
import HeroBanner from "@/components/women/HeroBanner";
import CategoriesSection from "@/components/women/CategoriesSection";

// Loading Skeletons
function CategorySkeleton() {
  return (
    <div className="my-6 md:my-0 md:mb-8">
      <div className="h-5 md:h-6 w-24 md:w-32 bg-gray-200 rounded mb-3 md:mb-4"></div>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="aspect-square bg-gray-200 rounded-xl animate-pulse shadow-sm"></div>
        <div className="aspect-square bg-gray-200 rounded-xl animate-pulse shadow-sm"></div>
      </div>
    </div>
  );
}

// Client-side categories fetcher (handles 401 gracefully without infinite re-renders under Suspense)
function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await fetchPublicCategories("Women");
        if (!cancelled) {
          setCategories(data.data || []);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          // Narrow error shape
          const err = e as
            | {
                response?: { status?: number; data?: { message?: string } };
                message?: string;
              }
            | undefined;
          const msg =
            err?.response?.status === 401
              ? "Unauthorized: admin session missing or expired."
              : err?.response?.data?.message ||
                err?.message ||
                "Failed to load categories";
          setError(msg);
          // Optional fallback (static) categories so UI isn\'t empty
          setCategories([
            { id: "women-tops", name: "Tops", subcategories: [] },
            { id: "women-bottoms", name: "Bottoms", subcategories: [] },
            { id: "women-outerwear", name: "Outerwear", subcategories: [] },
          ]);
          console.warn("Categories fetch failed", e);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <CategorySkeleton />;
  return (
    <div>
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error} (showing fallback categories)
        </div>
      )}
      <CategoriesSection categories={categories} />
    </div>
  );
}

// Carousel product data
const PRODUCTS = [
  {
    id: undefined,
    name: "Black-blue T-shirt for women",
    price: "1799/-",
    image: "/tshirt1.png",
  },
  {
    id: undefined,
    name: "Black-blue T-shirt for women",
    price: "1799/-",
    image: "/tshirt2.png",
  },
  {
    id: undefined,
    name: "Black-blue T-shirt for women",
    price: "1799/-",
    image: "/tshirt3.png",
  },
  {
    id: undefined,
    name: "Black-blue T-shirt for women",
    price: "1799/-",
    image: "/tshirt3.png",
  },
  {
    id: undefined,
    name: "Black-blue T-shirt for women",
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
  const content = (
    <div
      className="flex flex-col items-center px-4 md:px-8"
      style={{
        minWidth: `calc(100%/3)`,
        transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
      }}
    >
      <div className="relative flex flex-col items-center group w-full">
        <div
          className="absolute top-2 left-2 px-5 py-2 rounded-full border text-base font-semibold z-10 bg-white"
          style={{
            border: `1.5px solid ${COLORS.badgeBorder}`,
            color: COLORS.primary,
            boxShadow: "0 1px 4px #531A1A10",
            whiteSpace: "nowrap",
          }}
        >
          {product.price}
        </div>
        <Image
          src={product.image}
          alt={product.name}
          width={340}
          height={340}
          className="mt-8 mb-4 w-[340px] h-[340px] object-contain transition-transform duration-300 group-hover:scale-105"
          style={{ display: "block", background: "none", border: "none" }}
        />
      </div>
      <div
        className="mt-4 text-center font-medium w-full"
        style={{
          color: COLORS.text,
          fontSize: "1.15rem",
          letterSpacing: "0.01em",
        }}
      >
        {product.name}
      </div>
    </div>
  );
  return product.id ? (
    <Link href={`/product_details?id=${product.id}`}>{content}</Link>
  ) : (
    content
  );
}

function ProductCardMobile({ product }: { product: (typeof PRODUCTS)[0] }) {
  const content = (
    <div className="flex flex-col items-center px-2 w-full">
      <div className="relative flex flex-col items-center group w-full">
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
        <Image
          src={product.image}
          alt={product.name}
          width={220}
          height={220}
          className="mt-6 mb-2 w-[220px] h-[220px] object-contain transition-transform duration-300 group-hover:scale-105"
          style={{ display: "block", background: "none", border: "none" }}
        />
      </div>
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
  return product.id ? (
    <Link href={`/product_details?id=${product.id}`}>{content}</Link>
  ) : (
    content
  );
}

function ProductCarousel() {
  const [scrollIndex, setScrollIndex] = useState(0);
  const visibleCount = 3;
  const carouselRef = useRef<HTMLDivElement>(null);

  // Dynamic products fetched from public API
  const [fetched, setFetched] = useState<typeof PRODUCTS | null>(null);

  // Fetch products only for women category (page specific)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params: ProductQueryParams = {
          mainCategory: "Women",
          page: 1,
          limit: 10,
        };
        const { data } = await fetchPublicProducts(params);
        type ApiProductLite = {
          name?: string;
          price?: number;
          images?: string[];
        };
        const apiItems: ApiProductLite[] = Array.isArray(data.data)
          ? (data.data as ApiProductLite[])
          : [];
        // Transform to local PRODUCT shape (name, price string, image)
        type ApiItem = {
          id?: string;
          name?: string;
          price?: number;
          images?: string[];
        };
        const transformed = apiItems.map((p: ApiItem) => ({
          id: p.id,
          name: p.name || "Unnamed Product",
          price:
            typeof p.price === "number" ? `${Math.round(p.price)}/-` : "--/-",
          image:
            p.images && p.images.length > 0 ? p.images[0] : "/placeholder.png",
        })) as typeof PRODUCTS;

        let finalList: typeof PRODUCTS;
        if (transformed.length === 0) {
          finalList = PRODUCTS; // no products -> fallback entirely
        } else if (transformed.length < 5) {
          // append static to reach at least 5 (preserve order: real first)
          finalList = [...transformed, ...PRODUCTS].slice(
            0,
            5
          ) as typeof PRODUCTS;
        } else {
          // 5 or more
          finalList = transformed; // real data only
        }
        if (!cancelled) setFetched(finalList);
      } catch (e) {
        if (!cancelled) setFetched(PRODUCTS); // fallback on error
        console.warn("Failed to fetch public products (women)", e);
      } finally {
        // no-op
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const items = fetched || PRODUCTS; // while loading use static

  // Autoscroll logic (depends on items length)
  useEffect(() => {
    const interval = setInterval(() => {
      setScrollIndex((prev) => (prev + 1 >= items.length ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [items.length]);

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
        className={`flex ${
          isMobile ? "flex-col items-center" : "flex-row"
        } overflow-x-hidden ${
          isMobile ? "w-full max-w-full" : "w-full max-w-[1800px]"
        }`}
        style={{ scrollBehavior: "smooth" }}
      >
        {items.map((product, idx) =>
          isMobile ? (
            <ProductCardMobile key={idx} product={product} />
          ) : (
            <ProductCard key={idx} product={product} />
          )
        )}
      </div>
      <style>{`.group:hover { transform: translateY(-4px); }`}</style>
    </div>
  );
}

export default function WomenPage() {
  return (
    <main className="container mx-auto px-2 md:py-2 max-w-7xl">
      {/* Hero Banner */}
      <div className="max-w-lg md:max-w-4xl mx-0">
        <HeroBanner />
      </div>
      {/* Bestsellers Section */}
      <section className="mt-12 md:mt-16">
        {/* Categories Section */}
        <CategoriesClient />
        <h3 className="text-2xl md:text-3xl font-semibold text-[#531A1A] mb-8">
          Bestsellers
        </h3>
        <div className="space-y-16">
          <ProductCarousel />
          <ProductCarousel />
        </div>
      </section>
    </main>
  );
}

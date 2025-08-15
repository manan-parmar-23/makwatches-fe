"use client";
import { useRef, useEffect, useState } from "react";

import {
  fetchPublicCategories,
  Category,
  fetchPublicProducts,
  ProductQueryParams,
} from "@/utils/api";
// Components
import HeroBanner from "@/components/women/HeroBanner";
import CategoriesSection from "@/components/women/CategoriesSection";
import SubcategoryCarousel from "@/components/women/SubCategoryCarousel";
import ProductCard from "@/components/women/ProductCard";
import ProductCardMobile from "@/components/women/ProductCardMobile";

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
// Now accepts an optional onLoad callback to expose categories to parent
function CategoriesClient({ onLoad }: { onLoad?: (cats: Category[]) => void }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await fetchPublicCategories("Women");
        if (!cancelled) {
          const list = data.data || [];
          setCategories(list);
          onLoad?.(list);
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
          // Optional fallback (static) categories so UI isn't empty
          const fallback = [
            { id: "women-tops", name: "Tops", subcategories: [] },
            { id: "women-bottoms", name: "Bottoms", subcategories: [] },
            { id: "women-outerwear", name: "Outerwear", subcategories: [] },
          ];
          setCategories(fallback);
          onLoad?.(fallback);
          console.warn("Categories fetch failed", e);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onLoad]);

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
export const PRODUCTS = [
  {
    id: undefined,
    name: "Black-blue T-shirt for women",
    price: "1799/-",
    image: "/tshirt1.png",
    subcategory: null,
  },
  {
    id: undefined,
    name: "Black-blue T-shirt for women",
    price: "1799/-",
    image: "/tshirt2.png",
    subcategory: null,
  },
  {
    id: undefined,
    name: "Black-blue T-shirt for women",
    price: "1799/-",
    image: "/tshirt3.png",
    subcategory: null,
  },
  {
    id: undefined,
    name: "Black-blue T-shirt for women",
    price: "1799/-",
    image: "/tshirt3.png",
    subcategory: null,
  },
  {
    id: undefined,
    name: "Black-blue T-shirt for women",
    price: "1799/-",
    image: "/tshirt3.png",
    subcategory: null,
  },
];

// Modify ProductCarousel to accept onLoad and include subcategory when transforming
function ProductCarousel({
  onLoad,
}: {
  onLoad?: (
    items: Array<(typeof PRODUCTS)[0] & { subcategory?: string | null }>
  ) => void;
}) {
  const [scrollIndex, setScrollIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Dynamic products fetched from public API
  const [fetched, setFetched] = useState<Array<
    (typeof PRODUCTS)[0] & { subcategory?: string | null }
  > | null>(null);

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
          id?: string;
          name?: string;
          price?: number;
          images?: string[];
          // try to pick common subcategory fields
          subcategory?: string;
          subcategoryId?: string;
          subCategory?: string;
          subCategories?: Array<string | { id?: string; name?: string }>;
        };
        const apiItems: ApiProductLite[] = Array.isArray(data.data)
          ? (data.data as ApiProductLite[])
          : [];
        // Transform to local PRODUCT shape (name, price string, image, optional subcategory)
        const transformed = apiItems.map((p) => {
          // normalize subcategory: check multiple possible fields
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

        let finalList: Array<
          (typeof PRODUCTS)[0] & { subcategory?: string | null }
        >;
        if (transformed.length === 0) {
          finalList = PRODUCTS.map((p) => ({ ...p, subcategory: null }));
        } else if (transformed.length < 5) {
          // append static to reach at least 5 (preserve order: real first)
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
        if (!cancelled) {
          // ensure finalList typed consistently with subcategory optional
          const normalized = finalList as Array<
            (typeof PRODUCTS)[0] & { subcategory?: string | null }
          >;
          setFetched(normalized);
          onLoad?.(normalized);
        }
      } catch (e) {
        if (!cancelled) {
          // fallback: attach undefined subcategory to static products
          const fallback = PRODUCTS.map((p) => ({ ...p, subcategory: null }));
          setFetched(
            fallback as Array<
              (typeof PRODUCTS)[0] & { subcategory?: string | null }
            >
          );
          onLoad?.(
            fallback as Array<
              (typeof PRODUCTS)[0] & { subcategory?: string | null }
            >
          );
        }
        console.warn("Failed to fetch public products (women)", e);
      } finally {
        // no-op
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onLoad]);

  const items = fetched || PRODUCTS.map((p) => ({ ...p, subcategory: null })); // while loading use static

  // Autoscroll logic (depends on items length)
  useEffect(() => {
    const interval = setInterval(() => {
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
        className="flex flex-row items-center overflow-x-auto no-scrollbar"
        style={{
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
          // enable scroll snapping for a nicer manual scroll experience
          scrollSnapType: "x mandatory",
          width: "100%",
          maxWidth: "1800px",
          gap: "0",
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
      <style>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .group:hover { transform: translateY(-4px); }
      `}</style>
    </div>
  );
}

export default function WomenPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  // products loaded by the primary carousel (includes subcategory when present)
  const [productsLoaded, setProductsLoaded] = useState<
    Array<(typeof PRODUCTS)[0] & { subcategory?: string | null }>
  >([]);

  // keep original first carousel as "fixed" featured one and capture loaded products
  return (
    <main className="container px-2 md:py-2 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="max-w-lg md:max-w-4xl">
        <HeroBanner />
      </div>
      {/* Bestsellers Section */}
      <section className="mt-12 md:mt-16">
        {/* Categories Section (now passes loaded categories up) */}
        <CategoriesClient onLoad={(cats) => setCategories(cats)} />
        <h3 className="text-2xl md:text-3xl font-semibold text-[#531A1A] mb-8">
          Bestsellers
        </h3>
        <div className="space-y-16">
          {/* fixed primary carousel (works as before) */}
          <ProductCarousel onLoad={(items) => setProductsLoaded(items || [])} />

          {/* For each category render per-subcategory carousels.
              If no subcategories exist, render a carousel for the category itself. */}
          {categories &&
            categories.map((cat) => {
              const subs = Array.isArray(cat.subcategories)
                ? cat.subcategories
                : [];
              if (subs.length > 0) {
                return subs.map(
                  (sub: string | { id?: string; name?: string }) => {
                    const subId = typeof sub === "string" ? sub : sub?.id;
                    const subName =
                      typeof sub === "string" ? sub : sub?.name || sub?.id;
                    const title = `${cat.name} — ${subName}`;
                    const key = `${cat.id || cat.name}-${subId || subName}`;
                    // filter productsLoaded for this subcategory (match id or name)
                    const filtered = productsLoaded.filter((p) => {
                      if (!p.subcategory) return false;
                      return (
                        p.subcategory === subId ||
                        p.subcategory === subName ||
                        p.subcategory === (subId ?? subName)
                      );
                    });
                    return (
                      <SubcategoryCarousel
                        key={key}
                        mainCategory="Women"
                        categoryId={cat.id}
                        categoryName={cat.name}
                        subcategoryId={subId}
                        subcategoryName={subName}
                        title={title}
                        items={filtered.length > 0 ? filtered : undefined}
                      />
                    );
                  }
                );
              }
              // No subcategories -> render a carousel for the category itself, pass filtered products for the category (if any)
              const key = `${cat.id || cat.name}-category`;
              return (
                <SubcategoryCarousel
                  key={key}
                  mainCategory="Women"
                  categoryId={cat.id}
                  categoryName={cat.name}
                  title={cat.name}
                />
              );
            })}
        </div>
      </section>
      <style>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .group:hover { transform: translateY(-4px); }
      `}</style>
    </main>
  );
}

"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { fetchPublicCategories, Category, Product } from "@/utils/api";
// Components
import HeroBanner from "@/components/women/HeroBanner";
import CategoriesSection from "@/components/women/CategoriesSection";
import ProductGrid from "@/components/shared/ProductGrid";

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
  const [localReload, setLocalReload] = useState(0);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localReload]);

  if (loading) return <CategorySkeleton />;
  if (error)
    return (
      <div className="mb-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-semibold text-yellow-800">
                Unable to load categories
              </h4>
              <p className="text-sm text-yellow-700 mt-1">{error}</p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => setLocalReload((r) => r + 1)}
                className="px-4 py-2 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  return (
    <div>
      <CategoriesSection categories={categories} />
    </div>
  );
}

export default function WomenPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  const handleCategoriesLoad = useCallback((cats: Category[]) => {
    setCategories(cats);
  }, []);

  const handleProductClick = (product: Product) => {
    // Navigate to product details page with the product ID
    router.push(`/product_details?id=${product.id}`);
  };

  return (
    <main className="container px-2 md:py-2 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="max-w-lg md:max-w-4xl">
        <HeroBanner />
      </div>

      {/* Categories Section (hidden) - kept for logic but removed from UI */}
      <section className="hidden">
        <CategoriesClient onLoad={handleCategoriesLoad} />
      </section>

      {/* Products Grid Section */}
      <section className="mt-12 md:mt-16 pb-20">
        <ProductGrid
          mainCategory="Women"
          title="Women's Collection"
          onProductClick={handleProductClick}
          limit={20}
          isCollection={true}
        />
      </section>

      {/* Category-specific sections */}
      {categories && categories.length > 0 && (
        <section className="mt-16 space-y-16">
          {categories.map((cat) => {
            const subs = Array.isArray(cat.subcategories)
              ? cat.subcategories
              : [];

            if (subs.length > 0) {
              return subs.map(
                (sub: string | { id?: string; name?: string }) => {
                  // Prefer subcategory name for filtering to match backend expectations
                  const subName =
                    typeof sub === "string" ? sub : sub?.name || sub?.id || "";
                  const title = `${cat.name} — ${subName}`;
                  const key = `${cat.id || cat.name}-${subName}`;

                  return (
                    <ProductGrid
                      key={key}
                      mainCategory="Women"
                      category={cat.name}
                      subcategory={subName}
                      title={title}
                      onProductClick={handleProductClick}
                      limit={12}
                    />
                  );
                }
              );
            }

            // No subcategories -> render products for the category itself
            return (
              <ProductGrid
                key={cat.id || cat.name}
                mainCategory="Women"
                category={cat.name}
                title={cat.name}
                onProductClick={handleProductClick}
                limit={12}
              />
            );
          })}
        </section>
      )}
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

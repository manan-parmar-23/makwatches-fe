import { PRODUCTS, ProductCardMobile, ProductCard } from "@/app/women/page";
import { ProductQueryParams, fetchPublicProducts } from "@/utils/api";
import { useState, useRef, useEffect } from "react";

// Reusable carousel that accepts optional preloaded items; still falls back to fetching if items not provided
export default function SubcategoryCarousel({
  mainCategory,
  categoryId,
  categoryName,
  subcategoryId,
  subcategoryName,
  title,
  items: providedItems,
}: {
  mainCategory: string;
  categoryId?: string;
  categoryName?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  title?: string;
  items?: Array<(typeof PRODUCTS)[0] & { subcategory?: string | null }> | null;
}) {
  // use a different local state name to avoid shadowing the `items` prop
  const [itemsState, setItemsState] = useState<Array<
    (typeof PRODUCTS)[0] & { subcategory?: string | null }
  > | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // helper to apply same fallback/padding logic as primary carousel
  function buildFinalList(
    source: Array<(typeof PRODUCTS)[0] & { subcategory?: string | null }>
  ) {
    if (!Array.isArray(source) || source.length === 0) {
      return PRODUCTS.map((p) => ({ ...p, subcategory: null }));
    }
    if (source.length < 5) {
      const appended = [
        ...source,
        ...PRODUCTS.map((p) => ({ ...p, subcategory: null })),
      ].slice(0, 5);
      return appended.map((p) => ({
        ...p,
        subcategory: p.subcategory ?? null,
      }));
    }
    return source;
  }

  // If providedItems exist, use them (with fallback logic) and skip fetching
  useEffect(() => {
    if (providedItems) {
      setItemsState(buildFinalList(providedItems));
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const params: ProductQueryParams & {
          category?: string;
          subcategory?: string;
        } = {
          mainCategory,
          page: 1,
          limit: 10,
        };
        if (categoryId) params.category = categoryId;
        else if (categoryName) params.category = categoryName;
        if (subcategoryId) params.subcategory = subcategoryId;
        else if (subcategoryName) params.subcategory = subcategoryName;

        const { data } = await fetchPublicProducts(params);
        type ApiItem = {
          id?: string;
          name?: string;
          price?: number;
          images?: string[];
          subcategory?: string;
          subcategoryId?: string;
          subCategory?: string;
          subCategories?: Array<string | { id?: string; name?: string }>;
        };
        const apiItems: ApiItem[] = Array.isArray(data.data)
          ? (data.data as ApiItem[])
          : [];
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

        const finalList = buildFinalList(transformed);
        if (!cancelled) setItemsState(finalList);
      } catch (err) {
        if (!cancelled)
          setItemsState(PRODUCTS.map((p) => ({ ...p, subcategory: null })));
        console.warn(
          "Failed to fetch products for",
          mainCategory,
          categoryId ?? categoryName,
          subcategoryId ?? subcategoryName,
          err
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    providedItems,
    mainCategory,
    categoryId,
    categoryName,
    subcategoryId,
    subcategoryName,
  ]);

  // Autoscroll
  useEffect(() => {
    const len = (
      itemsState || PRODUCTS.map((p) => ({ ...p, subcategory: null }))
    ).length;
    const interval = setInterval(() => {
      setScrollIndex((prev) => (prev + 1 >= len ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [itemsState]);

  // Scroll when index changes
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

  // Responsive
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const list = itemsState || PRODUCTS.map((p) => ({ ...p, subcategory: null }));

  return (
    <section className="w-full">
      {title && (
        <h4 className="text-xl md:text-2xl font-semibold text-[#531A1A] mb-4">
          {title}
        </h4>
      )}
      <div className="w-full flex flex-col items-center py-6">
        <div
          ref={carouselRef}
          className="flex flex-row items-center overflow-x-auto no-scrollbar"
          style={{
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
            scrollSnapType: "x mandatory",
            width: "100%",
            maxWidth: "1800px",
            gap: "0",
          }}
        >
          {list.map((product, idx) =>
            isMobile ? (
              <ProductCardMobile key={idx} product={product} />
            ) : (
              <ProductCard key={idx} product={product} />
            )
          )}
        </div>
      </div>
    </section>
  );
}

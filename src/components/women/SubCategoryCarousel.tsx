import ProductCard from "@/components/women/ProductCard";
import ProductCardMobile from "@/components/women/ProductCardMobile";
import { ProductQueryParams, fetchPublicProducts } from "@/utils/api";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

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
  const [retryCount, setRetryCount] = useState(0); // Track retries
  const [isLoading, setIsLoading] = useState(true);

  // Generate the proper link to the subcategory page
  const getSubcategoryLink = () => {
    const idParam = subcategoryId || categoryId || "";
    const nameParam = encodeURIComponent(subcategoryName || categoryName || "");

    return `/${mainCategory.toLowerCase()}/category/${idParam}?name=${nameParam}`;
  };

  // Using useCallback to memoize the buildFinalList function
  const buildFinalList = useCallback(
    (source: Array<(typeof PRODUCTS)[0] & { subcategory?: string | null }>) => {
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
    },
    []
  );

  // If providedItems exist, use them (with fallback logic) and skip fetching
  useEffect(() => {
    if (providedItems) {
      setItemsState(buildFinalList(providedItems));
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchWithRetry = async () => {
      setIsLoading(true);

      try {
        // Try different parameter combinations for maximum compatibility
        const baseParams = {
          mainCategory,
          page: 1,
          limit: 10,
        };

        let params: ProductQueryParams & {
          category?: string;
          subcategory?: string;
        };

        // Try different parameter combinations based on retry count
        if (retryCount === 0) {
          // First try - send both category and subcategory if available
          params = { ...baseParams };
          if (categoryId) params.category = categoryId;
          else if (categoryName) params.category = categoryName;
          if (subcategoryId) params.subcategory = subcategoryId;
          else if (subcategoryName) params.subcategory = subcategoryName;
        } else if (retryCount === 1) {
          // Second try - send only subcategory or category
          params = { ...baseParams };
          if (subcategoryId || subcategoryName) {
            params.subcategory = subcategoryId || subcategoryName;
          } else {
            params.category = categoryId || categoryName;
          }
        } else {
          // Third try - inverse priority of params
          params = { ...baseParams };
          if (subcategoryName) params.subcategory = subcategoryName;
          else if (subcategoryId) params.subcategory = subcategoryId;
          else if (categoryName) params.category = categoryName;
          else if (categoryId) params.category = categoryId;
        }

        console.debug(
          `SubCategoryCarousel fetch attempt ${retryCount + 1}:`,
          params
        );

        const { data } = await fetchPublicProducts(params);
        console.debug(
          `SubCategoryCarousel response (attempt ${retryCount + 1}):`,
          data
        );

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

        if (apiItems.length > 0) {
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
                typeof p.price === "number"
                  ? `${Math.round(p.price)}/-`
                  : "--/-",
              image:
                p.images && p.images.length > 0
                  ? p.images[0]
                  : "/placeholder.png",
              subcategory: sub,
            } as (typeof PRODUCTS)[0] & { subcategory?: string | null };
          });

          const finalList = buildFinalList(transformed);
          if (isMounted) {
            setItemsState(finalList);
            setIsLoading(false);
          }
        } else if (retryCount < 2) {
          // Try again with different parameters
          if (isMounted) {
            console.debug(
              "No products found, retrying with different parameters..."
            );
            setRetryCount((prev) => prev + 1);
          }
        } else {
          // Give up and use fallback
          if (isMounted) {
            setItemsState(PRODUCTS.map((p) => ({ ...p, subcategory: null })));
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.warn(
          "Failed to fetch products for",
          mainCategory,
          categoryId ?? categoryName,
          subcategoryId ?? subcategoryName,
          err
        );

        if (retryCount < 2 && isMounted) {
          console.debug(
            "Error occurred, retrying with different parameters..."
          );
          setRetryCount((prev) => prev + 1);
        } else if (isMounted) {
          setItemsState(PRODUCTS.map((p) => ({ ...p, subcategory: null })));
          setIsLoading(false);
        }
      }
    };

    fetchWithRetry();

    return () => {
      isMounted = false;
    };
  }, [
    providedItems,
    mainCategory,
    categoryId,
    categoryName,
    subcategoryId,
    subcategoryName,
    retryCount,
    buildFinalList,
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
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl md:text-2xl font-semibold text-[#531A1A]">
            {title}
          </h4>
          <Link
            href={getSubcategoryLink()}
            className="text-sm md:text-base text-[#531A1A] hover:underline font-medium"
          >
            View all
          </Link>
        </div>
      )}
      <div className="w-full flex flex-col items-center py-6">
        {isLoading ? (
          <div className="flex flex-row items-center overflow-x-auto no-scrollbar w-full">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="min-w-[250px] md:min-w-[300px] h-[320px] md:h-[400px] bg-gray-100 rounded-xl animate-pulse mx-2 flex-shrink-0"
              />
            ))}
          </div>
        ) : (
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
        )}
      </div>
    </section>
  );
}

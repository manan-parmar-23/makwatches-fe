"use client";
import ProductCard from "@/components/men/ProductCard";
import ProductCardMobile from "@/components/men/ProductCardMobile";
import { ProductQueryParams, fetchPublicProducts } from "@/utils/api";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

// Watch products for men subcategory
export const PRODUCTS = [
  {
    id: "1",
    name: "MAK Classic Heritage",
    subtitle: "Timeless Elegance",
    price: "₹12,999",
    originalPrice: "₹15,999",
    image: "/watches/item-card-image-1.png",
    subcategory: "Classic",
    features: ["Swiss Movement", "Water Resistant", "Leather Strap"],
    discount: "25% OFF",
  },
  {
    id: "2",
    name: "MAK Sport Pro",
    subtitle: "Athletic Performance",
    price: "₹18,999",
    originalPrice: "₹22,999",
    image: "/watches/item-card-image-2.png",
    subcategory: "Sports",
    features: ["Chronograph", "Titanium Case", "Rubber Strap"],
    discount: "17% OFF",
  },
  {
    id: "3",
    name: "MAK Luxury Gold",
    subtitle: "Premium Collection",
    price: "₹45,999",
    originalPrice: "₹52,999",
    image: "/watches/item-card-image-3.png",
    subcategory: "Luxury",
    features: ["Gold Plated", "Sapphire Crystal", "Automatic"],
    discount: "13% OFF",
  },
  {
    id: "4",
    name: "MAK Smart Elite",
    subtitle: "Digital Innovation",
    price: "₹24,999",
    originalPrice: "₹29,999",
    image: "/watches/item-card-image-4.png",
    subcategory: "Smart",
    features: ["GPS Tracking", "Heart Rate", "Bluetooth"],
    discount: "17% OFF",
  },
  {
    id: "5",
    name: "MAK Casual Style",
    subtitle: "Everyday Comfort",
    price: "₹8,999",
    originalPrice: "₹11,999",
    image: "/watches/item-card-image-5.png",
    subcategory: "Casual",
    features: ["Quartz Movement", "Stainless Steel", "Date Display"],
    discount: "25% OFF",
  },
  {
    id: "6",
    name: "MAK Executive",
    subtitle: "Business Class",
    price: "₹32,999",
    originalPrice: "₹38,999",
    image: "/watches/item-card-image-1.png",
    subcategory: "Luxury",
    features: ["Automatic Movement", "Ceramic Bezel", "Power Reserve"],
    discount: "15% OFF",
  },
];

interface SubCategoryGridProps {
  mainCategory: "Men" | "Women";
  categoryId?: string;
  categoryName?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  title?: string;
  items?: typeof PRODUCTS;
  className?: string;
}

// Professional Grid Component for Subcategories
export default function SubCategoryGrid({
  mainCategory,
  categoryId,
  categoryName,
  subcategoryId,
  subcategoryName,
  title,
  items,
  className = "",
}: SubCategoryGridProps) {
  const [itemsState, setItemsState] = useState<typeof PRODUCTS | null>(
    items || null
  );
  const [isLoading, setIsLoading] = useState(!items);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Build the link for "View all" based on available parameters
  const getSubcategoryLink = () => {
    const baseCategory = mainCategory.toLowerCase();
    if (categoryId && subcategoryId) {
      return `/${baseCategory}/category/${categoryId}/subcategory/${subcategoryId}`;
    }
    if (categoryId) {
      return `/${baseCategory}/category/${categoryId}`;
    }
    return `/${baseCategory}`;
  };

  // Fetch products if not provided
  useEffect(() => {
    if (items) {
      setItemsState(items);
      setIsLoading(false);
      return;
    }

    const fetchItems = async () => {
      if (!categoryId && !subcategoryId) {
        // No specific category/subcategory provided, show empty state
        setItemsState([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const params: ProductQueryParams = {
          limit: 6,
        };

        if (categoryId) params.category = categoryId;
        if (subcategoryId) params.subcategory = subcategoryId;

        const response = await fetchPublicProducts(params);
        const fetchedProducts = response.data?.data || [];

        if (fetchedProducts.length > 0) {
          setItemsState(
            fetchedProducts.map((p) => ({
              id: p.id || "",
              name: p.name || "",
              subtitle: "Premium Watch",
              price:
                typeof p.price === "number" ? `₹${p.price}` : p.price || "₹0",
              originalPrice: `₹${(p.price || 0) * 1.2}`,
              image: (p.images && p.images[0]) || "/watches/default.png",
              subcategory: p.subcategory || "General",
              features: [
                "Premium Quality",
                "Water Resistant",
                "Elegant Design",
              ],
              discount: "20% OFF",
            }))
          );
        } else {
          setItemsState(PRODUCTS);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setItemsState(PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [categoryId, subcategoryId, items]);

  const displayTitle =
    title || subcategoryName || categoryName || "Featured Products";
  const products = itemsState || [];

  return (
    <section
      className={`py-12 px-4 bg-gradient-to-b from-gray-50 to-white ${className}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-center justify-between mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-4 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {displayTitle}
            </h2>
            <p className="text-lg text-gray-600">
              Discover our premium collection of {mainCategory.toLowerCase()}
              &apos;s timepieces
            </p>
          </div>

          <Link
            href={getSubcategoryLink()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-900 to-black text-white px-6 py-3 rounded-full font-medium hover:from-black hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            View All Products
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="bg-gray-200 rounded-2xl animate-pulse"
                style={{ aspectRatio: "1/1.2" }}
              />
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && (
          <>
            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.slice(0, 6).map((product, index) => (
                <ProductCard
                  key={product.id || index}
                  product={product}
                  index={index}
                />
              ))}
            </div>

            {/* Mobile Grid */}
            <div className="md:hidden space-y-6">
              {products.slice(0, 4).map((product, index) => (
                <ProductCardMobile
                  key={product.id || index}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && products.length === 0 && (
          <motion.div
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                No Watches Found
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We couldn&apos;t find any watches in this category at the
                moment.
              </p>
            </div>
          </motion.div>
        )}

        {/* Featured Section */}
        {!isLoading && products.length > 0 && (
          <motion.div
            className="mt-16 p-8 bg-gradient-to-r from-gray-900 to-black rounded-2xl text-white text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Discover More Premium Collections
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Explore our complete range of luxury timepieces, each crafted with
              precision and attention to detail
            </p>
            <Link
              href={`/${mainCategory.toLowerCase()}/shop`}
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Shop All {mainCategory} Watches
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

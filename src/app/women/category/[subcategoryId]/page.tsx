"use client";
import React, { useEffect, useState } from "react";
import { fetchPublicProducts, ProductQueryParams } from "@/utils/api";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
// Replace react-icons/fi with heroicons
import { FunnelIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";

// Import new shared components
import ProductCard from "@/components/shared/ProductCard";
import ProductDetailModal from "@/components/shared/ProductDetailModal";
import FilterSidebar from "@/components/shared/FilterSidebar";
import Pagination from "@/components/shared/Pagination";
import SearchBar from "@/components/shared/SearchBar";
import ProductSkeleton from "@/components/shared/ProductSkeleton";

type LiteProduct = {
  id?: string;
  name?: string;
  price?: number;
  images?: string[];
  description?: string;
};

export default function WomenSubcategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ subcategoryId: string }>;
  searchParams?: Promise<{ name?: string }>;
}) {
  // unwrap possible promise-based params/searchParams using React.use()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolvedParams = React.use(params as unknown as any) as {
    subcategoryId: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolvedSearchParams = React.use(searchParams as unknown as any) as
    | { name?: string }
    | undefined;

  const subcategoryId = decodeURIComponent(resolvedParams.subcategoryId);
  const subcategoryName = resolvedSearchParams?.name
    ? decodeURIComponent(resolvedSearchParams.name)
    : undefined;

  // State variables
  const [items, setItems] = useState<LiteProduct[]>([]);
  const [filteredItems, setFilteredItems] = useState<LiteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  // Removed unused isMobile state
  const [filterOption, setFilterOption] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<LiteProduct | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [inStockOnly, setInStockOnly] = useState(false);

  // Pagination
  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle product click to navigate to product details
  const router = useRouter();

  const handleProductClick = (product: LiteProduct) => {
    // First show quick preview modal
    setSelectedProduct(product);
    setIsModalOpen(true);

    // After a short delay, navigate to the full product details page
    if (product.id) {
      setTimeout(() => {
        router.push(`/product_details?id=${product.id}`);
      }, 300); // Short delay for better UX
    }
  };

  // Handle filter changes
  const handleFilterChange = (filters: {
    priceRange?: { min: number; max: number };
    sortBy?: string;
    inStock?: boolean;
  }) => {
    if (filters.priceRange) {
      setPriceRange(filters.priceRange);
    }
    if (filters.sortBy !== undefined) {
      setFilterOption(filters.sortBy);
    }
    if (filters.inStock !== undefined) {
      setInStockOnly(filters.inStock);
    }

    // Reset to first page when filters change
    setCurrentPage(1);
  };

  // Apply filtering when items or filter options change
  useEffect(() => {
    if (!items.length) return;

    let result = [...items];

    // Apply price filter
    result = result.filter(
      (item) =>
        (item.price || 0) >= priceRange.min &&
        (item.price || 0) <= priceRange.max
    );

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        item.name?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (filterOption === "price_low") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (filterOption === "price_high") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    setFilteredItems(result);
  }, [items, filterOption, priceRange, searchQuery, inStockOnly]);

  // Handle mobile/desktop detection
  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < 768;
      // setIsMobile(mobile); // Removed unused isMobile state
      if (!mobile) {
        setIsFilterOpen(true);
      } else {
        setIsFilterOpen(false);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch products with improved reliability
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      setLoading(true);

      try {
        const queryParams: ProductQueryParams & {
          subcategory?: string;
          category?: string;
        } = {
          mainCategory: "Women",
          page: 1,
          limit: 30, // Get more items to ensure we have enough
        };

        // Set the subcategory - prefer name over ID for better matching
        if (subcategoryName) {
          queryParams.subcategory = subcategoryName;
        } else if (subcategoryId) {
          queryParams.subcategory = subcategoryId;
        }

        console.debug(
          `Fetching products (attempt ${retryCount + 1}):`,
          queryParams
        );

        const { data } = await fetchPublicProducts(queryParams);
        console.debug("API response:", data);

        const apiItems = Array.isArray(data.data) ? data.data : [];

        if (apiItems.length > 0) {
          // Convert API items to our local format
          const productList: LiteProduct[] = apiItems.map((p) => ({
            id: p.id,
            name: p.name || "Unnamed Product",
            price: p.price,
            images: Array.isArray(p.images) ? p.images : [],
            description: p.description || undefined,
          }));

          if (isMounted) {
            setItems(productList);
            setFilteredItems(productList);
            setLoading(false);
          }
        } else if (retryCount < 2) {
          // If no products found and we haven't retried too many times,
          // try with a delay and different parameter
          console.debug(
            "No products found, retrying with different parameters..."
          );

          if (isMounted) {
            setRetryCount((prev) => prev + 1);
            // The retry will happen due to dependency change on retryCount
          }
        } else {
          // We've retried enough, show empty state
          if (isMounted) {
            setItems([]);
            setFilteredItems([]);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        if (isMounted) {
          setItems([]);
          setFilteredItems([]);
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [subcategoryId, subcategoryName, retryCount]); // Add retryCount as dependency

  // Title derived from params
  const title = subcategoryName || subcategoryId || "Products";

  // Available sort options for sidebar
  const sortOptions = [
    { value: "", label: "Recommended" },
    { value: "newest", label: "Newest First" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
  ];

  return (
    <main className="bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with luxury styling */}
        <div className="mb-6 md:mb-10 mt-10 md:mt-4 border-b border-gray-200 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            {title}
          </h1>
          <div className="flex items-center justify-between mt-4">
            <p className="text-gray-600">
              <span className="font-medium">{filteredItems.length}</span>{" "}
              timepieces available
            </p>
            <div className="hidden md:block h-px w-32 bg-accent"></div>
          </div>
        </div>

        {/* Main content with sidebar layout */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar - hidden on mobile until toggled */}
          <aside className="md:w-64 flex-shrink-0">
            <FilterSidebar
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              onFilterChange={handleFilterChange}
              availableFilters={{
                sortOptions,
              }}
              currentFilters={{
                priceRange,
                sortBy: filterOption,
                inStock: inStockOnly,
              }}
            />
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            {/* Search and filter bar */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2">
                <SearchBar
                  onSearch={setSearchQuery}
                  placeholder="Search products..."
                />
              </div>

              {/* Mobile filter button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="bg-white border border-gray-300 rounded-md px-4 py-2 flex items-center text-gray-700 w-full"
                >
                  <FunnelIcon className="h-5 w-5 mr-2" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Products display */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-16 px-4 bg-white rounded-lg shadow-sm"
              >
                <div className="flex justify-center mb-4">
                  <ShoppingBagIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  No Products Found
                </h2>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  We couldn&#39;t find any products matching your criteria. Try
                  adjusting your filters or search terms.
                </p>
                <button
                  onClick={() => {
                    setPriceRange({ min: 0, max: 10000 });
                    setFilterOption("");
                    setSearchQuery("");
                    setInStockOnly(false);
                  }}
                  className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
                >
                  Reset Filters
                </button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                >
                  {currentItems.map((product, idx) => (
                    <motion.div
                      key={product.id || idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: { delay: idx * 0.05 },
                      }}
                    >
                      <ProductCard
                        product={{
                          id: product.id,
                          name: product.name || "Product",
                          price:
                            typeof product.price === "number"
                              ? Math.round(product.price)
                              : "--/-",
                          image:
                            product.images && product.images.length > 0
                              ? product.images[0]
                              : "/placeholder.png",
                        }}
                        onClick={() => handleProductClick(product)}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={{
            id: selectedProduct.id,
            name: selectedProduct.name,
            price:
              typeof selectedProduct.price === "number"
                ? Math.round(selectedProduct.price)
                : selectedProduct.price,
            image:
              selectedProduct.images && selectedProduct.images.length > 0
                ? selectedProduct.images[0]
                : "/placeholder.png",
            images: selectedProduct.images,
            description: selectedProduct.description,
          }}
        />
      )}
    </main>
  );
}

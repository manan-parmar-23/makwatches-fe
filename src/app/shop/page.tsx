"use client";

import React, { useState, useEffect } from "react";
import {
  FunnelIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { productApi } from "@/services/api";
import { Product, ProductFilters } from "@/types";
import EnhancedProductCard from "@/components/shared/EnhancedProductCard";
import ProductQuickView from "@/components/shared/ProductQuickView";
import EnhancedSearchBar from "@/components/shared/EnhancedSearchBar";
import FilterSidebar from "@/components/shared/FilterSidebar";
import Pagination from "@/components/shared/Pagination";
import ShopBanner from "@/components/shared/ShopBanner";
import ProductSkeleton from "@/components/shared/ProductSkeleton";
import { useMemo } from "react";

export default function ShopPage() {
  // State for products and loading
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // State for filters
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 12,
    sortBy: "createdAt",
    order: "desc",
  });

  // State for search query
  const [searchQuery, setSearchQuery] = useState("");

  // State for filter sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State for quick view modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await productApi.getProducts({
          ...filters,
          ...(searchQuery && { search: searchQuery }),
        });

        if (response.success) {
          setProducts(response.data);
          if (response.meta) {
            setTotalProducts(response.meta.total);
            setTotalPages(response.meta.pages);
          }
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [filters, searchQuery]);

  // Group products by category for display
  const productsByCategory = useMemo(() => {
    const map = new Map<string, Product[]>();
    products.forEach((p) => {
      const cat = p.mainCategory || p.category || "Uncategorized";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(p);
    });
    return Array.from(map.entries()); // [ [category, products[]], ... ]
  }, [products]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));

    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters((prev) => ({
      ...prev,
      page: 1, // Reset to first page when search changes
    }));
  };

  // Handle quick view
  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  // Handle close quick view
  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    // Reset selected product after animation completes
    setTimeout(() => {
      setSelectedProduct(null);
    }, 300);
  };

  // Available sort options
  const sortOptions = [
    { value: "createdAt:desc", label: "Newest First" },
    { value: "createdAt:asc", label: "Oldest First" },
    { value: "price:asc", label: "Price: Low to High" },
    { value: "price:desc", label: "Price: High to Low" },
    { value: "name:asc", label: "Name: A to Z" },
    { value: "name:desc", label: "Name: Z to A" },
  ];

  // Process sort option
  const handleSortChange = (sortOption: string) => {
    const [sortBy, order] = sortOption.split(":");
    handleFilterChange({
      sortBy,
      order: order as "asc" | "desc",
    });
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Banner */}
      <ShopBanner />

      {/* Shop content */}
      <div className="container mx-auto md:px-20 md:py-12 px-4 py-6">
        {/* Search and filter controls */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="w-full md:w-1/3">
            <EnhancedSearchBar
              onSearch={handleSearch}
              initialValue={searchQuery}
              placeholder="Search products..."
              className="md:max-w-md"
            />
          </div>

          <div className="flex items-center gap-4 self-end">
            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={`${filters.sortBy}:${filters.order}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-md py-2 pl-4 pr-10 leading-tight focus:outline-none focus:border-primary"
              >
                <option value="" disabled>
                  Sort By
                </option>
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
              </div>
            </div>

            {/* Filter button (mobile) */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden flex items-center gap-2 py-2 px-4 bg-primary text-white rounded-md"
            >
              <FunnelIcon className="h-4 w-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {isLoading
              ? "Loading products..."
              : `Showing ${products.length} of ${totalProducts} products`}
          </p>
        </div>

        {/* Main content with sidebar and products */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter sidebar (desktop) */}
          <div className="md:w-64 lg:w-72 hidden md:block">
            <FilterSidebar
              isOpen={true}
              onClose={() => {}}
              onFilterChange={(filters) => {
                handleFilterChange({
                  minPrice: filters.priceRange?.min,
                  maxPrice: filters.priceRange?.max,
                });
              }}
              availableFilters={{
                sortOptions,
              }}
              currentFilters={{
                priceRange: {
                  min: filters.minPrice || 0,
                  max: filters.maxPrice || 10000,
                },
                sortBy: `${filters.sortBy}:${filters.order}`,
                inStock: false,
              }}
            />
          </div>

          {/* Product grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            ) : products.length > 0 ? (
              // Render products grouped by category
              productsByCategory.map(([category, items]) => (
                <section key={category} className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {category}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {items.length} items
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {items.map((product) => (
                      <EnhancedProductCard
                        key={product.id}
                        product={product}
                        onQuickView={() => handleQuickView(product)}
                      />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <h3 className="text-xl font-medium text-gray-800 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={filters.page || 1}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter sidebar */}
      <FilterSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onFilterChange={(filters) => {
          handleFilterChange({
            minPrice: filters.priceRange?.min,
            maxPrice: filters.priceRange?.max,
          });
        }}
        availableFilters={{
          sortOptions,
        }}
        currentFilters={{
          priceRange: {
            min: filters.minPrice || 0,
            max: filters.maxPrice || 10000,
          },
          sortBy: `${filters.sortBy}:${filters.order}`,
          inStock: false,
        }}
      />

      {/* Quick view modal */}
      <ProductQuickView
        product={selectedProduct}
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
      />
    </main>
  );
}

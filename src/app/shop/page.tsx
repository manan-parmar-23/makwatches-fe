"use client";

import React, { useState, useEffect } from "react";
import {
  FunnelIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Product, ProductFilters } from "@/types";
import { fetchCatalogFilters, fetchPublicProducts } from "@/utils/api";
import EnhancedProductCard from "@/components/shared/EnhancedProductCard";
import ProductQuickView from "@/components/shared/ProductQuickView";
import EnhancedSearchBar from "@/components/shared/EnhancedSearchBar";
import FilterSidebar from "@/components/shared/FilterSidebar";
import { motion } from "framer-motion";

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

  // State for dynamic catalog filter options
  const [availableFilters, setAvailableFilters] = useState<{
    brands: string[];
    genders: string[];
    dialColors: string[];
    dialShapes: string[];
    dialTypes: string[];
    strapColors: string[];
    strapMaterials: string[];
    styles: string[];
    dialThicknesses: string[];
    minPrice?: number;
    maxPrice?: number;
  }>({
    brands: [],
    genders: [],
    dialColors: [],
    dialShapes: [],
    dialTypes: [],
    strapColors: [],
    strapMaterials: [],
    styles: [],
    dialThicknesses: [],
  });

  // State for filter sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] =
    useState(false);

  // State for quick view modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Fetch products with filters (public catalog endpoint)
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Use a larger page size when searching so we can filter client-side reliably
        const originalLimit = filters.limit || 12;
        const fetchLimit = searchQuery
          ? Math.max(originalLimit, 200)
          : originalLimit;

        const requestParams: Record<string, unknown> = {
          ...filters,
          limit: fetchLimit,
        };
        if (searchQuery) {
          // Send multiple common search keys for broader backend compatibility
          requestParams.search = searchQuery;
          requestParams.q = searchQuery;
          requestParams.name = searchQuery;
          // Always start from first page when searching
          requestParams.page = 1;
        }

        const { data: resp } = await fetchPublicProducts(
          requestParams as import("@/utils/api").ProductQueryParams
        );

        if (resp.success) {
          const all: Product[] = Array.isArray(resp.data)
            ? (resp.data as Product[])
            : [];

          if (searchQuery) {
            // Client-side filtering fallback by name/brand
            const q = searchQuery.toLowerCase();
            const filtered = all.filter(
              (p: Product) =>
                (p?.name ?? "").toLowerCase().includes(q) ||
                (p?.brand ?? "").toLowerCase().includes(q)
            );

            const total = filtered.length;
            const page = filters.page || 1;
            const start = (page - 1) * originalLimit;
            const pageItems = filtered.slice(start, start + originalLimit);

            setProducts(pageItems);
            setTotalProducts(total);
            setTotalPages(Math.max(1, Math.ceil(total / originalLimit)));
          } else {
            setProducts(all);
            // Public catalog response may not include meta; derive from length
            setTotalProducts(all.length);
            setTotalPages(Math.max(1, Math.ceil(all.length / originalLimit)));
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

  // Fetch dynamic filter options once (or whenever category scope changes)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await fetchCatalogFilters({
          category: filters.category,
        });
        if (!cancelled && data?.success && data.data) {
          const f = data.data;
          setAvailableFilters({
            brands: f.brands || [],
            genders: f.genders || [],
            dialColors: f.dialColors || [],
            dialShapes: f.dialShapes || [],
            dialTypes: f.dialTypes || [],
            strapColors: f.strapColors || [],
            strapMaterials: f.strapMaterials || [],
            styles: f.styles || [],
            dialThicknesses: f.dialThicknesses || [],
            minPrice: f.minPrice,
            maxPrice: f.maxPrice,
          });
          // If server provides price range and current is default, align
          setFilters((prev) => ({
            ...prev,
            minPrice: prev.minPrice ?? f.minPrice,
            maxPrice: prev.maxPrice ?? f.maxPrice,
          }));
        }
      } catch (e) {
        console.warn("Failed to load catalog filters", e);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  };

  // Handle watch-specific filter changes
  const handleWatchFilterChange = (filters: {
    priceRange?: { min: number; max: number };
    sortBy?: string;
    inStock?: boolean;
    watchFilters?: {
      brands: string[];
      gender?: string;
      dialColor?: string;
      dialShape?: string;
      dialType?: string;
      strapColor?: string;
      strapMaterial?: string;
      style?: string;
      dialThickness?: string;
    };
  }) => {
    if (filters.priceRange) {
      handleFilterChange({
        minPrice: filters.priceRange.min,
        maxPrice: filters.priceRange.max,
      });
    }

    if (filters.sortBy) {
      const [sortBy, order] = filters.sortBy.split(":");
      handleFilterChange({
        sortBy,
        order: order as "asc" | "desc",
      });
    }

    if (filters.inStock !== undefined) {
      handleFilterChange({
        inStock: filters.inStock,
      });
    }

    if (filters.watchFilters) {
      const {
        brands,
        gender,
        dialColor,
        dialShape,
        dialType,
        strapColor,
        strapMaterial,
        style,
        dialThickness,
      } = filters.watchFilters;

      // Update filters with watch-specific properties
      handleFilterChange({
        brand: brands.length > 0 ? brands : undefined,
        gender,
        dialColor,
        dialShape,
        dialType,
        strapColor,
        strapMaterial,
        style,
        dialThickness,
      });
    }
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

  // Toggle desktop sidebar
  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed);
  };

  // Reset all filters function
  const resetAllFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sortBy: "createdAt",
      order: "desc",
    });
    setSearchQuery("");
  };

  // Count active filters
  const countActiveFilters = () => {
    let count = 0;
    if (filters.brand && filters.brand.length > 0) count++;
    if (filters.gender) count++;
    if (filters.dialColor) count++;
    if (filters.dialShape) count++;
    if (filters.dialType) count++;
    if (filters.strapColor) count++;
    if (filters.strapMaterial) count++;
    if (filters.style) count++;
    if (filters.dialThickness) count++;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined)
      count++;
    return count;
  };

  const activeFilterCount = countActiveFilters();

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50/30 to-white md:mt-22 mt-16 font-inter">
      {/* Elegant header with parallax effect - Same for mobile and desktop */}
      <div className="bg-gradient-to-r from-amber-500/10 to-white border-b relative overflow-hidden">
        <div className="absolute inset-0 bg-transparent opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-inter font-bold text-gray-800 text-center mb-2">
            Luxury Timepieces Collection
          </h1>
          <p className="text-center text-gray-600 mt-2 text-sm md:text-base max-w-2xl mx-auto">
            Discover the perfect expression of craftsmanship and elegance. Each
            timepiece tells a unique story of precision and sophistication.
          </p>

          {/* Search Bar - Centered and elegant - Same on mobile and desktop */}
          <div className="max-w-xl mx-auto mt-4 sm:mt-6">
            <EnhancedSearchBar
              onSearch={handleSearch}
              initialValue={searchQuery}
              placeholder="Search our luxury timepiece collection..."
              className="bg-white/80 backdrop-blur-sm shadow-lg rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Main Container with Flexible Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex">
          {/* Collapsible Desktop Sidebar Toggle */}
          <div className="hidden lg:flex">
            <motion.div
              initial={false}
              animate={{ width: isDesktopSidebarCollapsed ? "0px" : "280px" }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden flex-shrink-0 mr-6"
            >
              <div className="w-[280px]">
                <div className="bg-white rounded-xl shadow-md border border-amber-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-50 to-white border-b border-amber-100 p-4 flex justify-between items-center">
                    <h3 className="text-base font-semibold text-gray-800 font-inter">
                      REFINE SELECTION
                    </h3>
                    {activeFilterCount > 0 && (
                      <span className="bg-amber-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent">
                    {/* Search Bar */}
                    <div>
                      <h4 className="font-medium text-amber-800 mb-3 uppercase text-sm tracking-wider">
                        Search
                      </h4>
                      <div className="space-y-2">
                        <EnhancedSearchBar
                          onSearch={handleSearch}
                          initialValue={searchQuery}
                          placeholder="Search timepieces..."
                          className="w-full border-amber-300 focus:border-amber-500 focus:ring-amber-500 rounded-md"
                        />
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h4 className="font-medium text-amber-800 mb-3 uppercase text-sm tracking-wider">
                        Price Range
                      </h4>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <label className="text-xs text-gray-500">Min</label>
                          <input
                            type="number"
                            value={filters.minPrice || 0}
                            onChange={(e) =>
                              handleFilterChange({
                                minPrice: Number(e.target.value),
                              })
                            }
                            className="w-full border rounded px-2 py-1 text-sm border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            min="0"
                            max={filters.maxPrice || 10000}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Max</label>
                          <input
                            type="number"
                            value={filters.maxPrice || 10000}
                            onChange={(e) =>
                              handleFilterChange({
                                maxPrice: Number(e.target.value),
                              })
                            }
                            className="w-full border rounded px-2 py-1 text-sm border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            min={filters.minPrice || 0}
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <input
                          type="range"
                          min="0"
                          max="10000"
                          value={filters.maxPrice || 10000}
                          onChange={(e) =>
                            handleFilterChange({
                              maxPrice: Number(e.target.value),
                            })
                          }
                          className="w-full accent-amber-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>₹0</span>
                          <span>₹10,000+</span>
                        </div>
                      </div>
                    </div>

                    {/* Brands */}
                    <div>
                      <h4 className="font-medium text-amber-800 mb-3 uppercase text-sm tracking-wider">
                        Brands
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {(availableFilters.brands.length
                          ? availableFilters.brands
                          : [
                              "MOVADA",
                              "BALMAIN",
                              "GUESS",
                              "VERSACE",
                              "TITAN",
                              "FOSSIL",
                            ]
                        ).map((brand) => (
                          <label
                            key={brand}
                            className="flex items-center hover:text-amber-700 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={(filters.brand || []).includes(brand)}
                              onChange={(e) => {
                                const currentBrands = filters.brand || [];
                                if (e.target.checked) {
                                  handleFilterChange({
                                    brand: [...currentBrands, brand],
                                  });
                                } else {
                                  handleFilterChange({
                                    brand: currentBrands.filter(
                                      (b) => b !== brand
                                    ),
                                  });
                                }
                              }}
                              className="mr-2 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                            />
                            <span className="text-sm">{brand}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <h4 className="font-medium text-amber-800 mb-3 uppercase text-sm tracking-wider">
                        Gender
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(availableFilters.genders.length
                          ? availableFilters.genders
                          : ["Men", "Women", "Unisex"]
                        ).map((genderOption) => (
                          <button
                            key={genderOption}
                            onClick={() =>
                              handleFilterChange({
                                gender:
                                  filters.gender === genderOption
                                    ? undefined
                                    : genderOption,
                              })
                            }
                            className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                              filters.gender === genderOption
                                ? "bg-amber-500 text-white border-amber-500"
                                : "border-amber-300 text-gray-700 hover:border-amber-400"
                            }`}
                          >
                            {genderOption}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dial Color */}
                    <div>
                      <h4 className="font-medium text-amber-800 mb-3 uppercase text-sm tracking-wider">
                        Dial Color
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {(availableFilters.dialColors.length
                          ? availableFilters.dialColors
                          : [
                              "Black",
                              "White",
                              "Blue",
                              "Gold",
                              "Silver",
                              "Green",
                            ]
                        ).map((color) => (
                          <button
                            key={color}
                            onClick={() =>
                              handleFilterChange({
                                dialColor:
                                  filters.dialColor === color
                                    ? undefined
                                    : color,
                              })
                            }
                            className={`px-1 py-1 text-xs rounded border flex flex-col items-center transition-all ${
                              filters.dialColor === color
                                ? "bg-amber-500 text-white border-amber-500"
                                : "border-amber-200 text-gray-700 hover:border-amber-400"
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded-full mb-1 border border-gray-200`}
                              style={{
                                backgroundColor: color.toLowerCase(),
                                boxShadow:
                                  filters.dialColor === color
                                    ? "0 0 0 2px rgba(245, 158, 11, 0.5)"
                                    : "none",
                              }}
                            />
                            <span>{color}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dial Shape */}
                    <div>
                      <h4 className="font-medium text-amber-800 mb-3 uppercase text-sm tracking-wider">
                        Dial Shape
                      </h4>
                      <div className="space-y-2">
                        {(availableFilters.dialShapes.length
                          ? availableFilters.dialShapes
                          : ["Round", "Square", "Rectangle", "Oval", "Tonneau"]
                        ).map((shape) => (
                          <label
                            key={shape}
                            className="flex items-center hover:text-amber-700 transition-colors"
                          >
                            <input
                              type="radio"
                              name="dialShape"
                              checked={filters.dialShape === shape}
                              onChange={() =>
                                handleFilterChange({ dialShape: shape })
                              }
                              className="mr-2 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                            />
                            <span className="text-sm">{shape}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Other filters collapsed to save space */}
                    <details className="group">
                      <summary className="flex cursor-pointer items-center justify-between font-medium text-amber-800 text-sm uppercase tracking-wider">
                        <span>More Filters</span>
                        <span className="transition group-open:rotate-180">
                          <ChevronRightIcon className="h-4 w-4" />
                        </span>
                      </summary>

                      <div className="mt-4 space-y-6">
                        {/* Dial Type */}
                        <div>
                          <h4 className="font-medium text-amber-800 mb-3 uppercase text-sm tracking-wider">
                            Dial Type
                          </h4>
                          <div className="space-y-2">
                            {(availableFilters.dialTypes.length
                              ? availableFilters.dialTypes
                              : [
                                  "Analog",
                                  "Digital",
                                  "Automatic",
                                  "Chronograph",
                                ]
                            ).map((type) => (
                              <label
                                key={type}
                                className="flex items-center hover:text-amber-700 transition-colors"
                              >
                                <input
                                  type="radio"
                                  name="dialType"
                                  checked={filters.dialType === type}
                                  onChange={() =>
                                    handleFilterChange({ dialType: type })
                                  }
                                  className="mr-2 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                                />
                                <span className="text-sm">{type}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Strap Color */}
                        <div>
                          <h4 className="font-medium text-amber-800 mb-3 uppercase text-sm tracking-wider">
                            Strap Color
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                            {(availableFilters.strapColors.length
                              ? availableFilters.strapColors
                              : [
                                  "Black",
                                  "Brown",
                                  "Silver",
                                  "Gold",
                                  "Blue",
                                  "Green",
                                ]
                            ).map((color) => (
                              <button
                                key={color}
                                onClick={() =>
                                  handleFilterChange({
                                    strapColor:
                                      filters.strapColor === color
                                        ? undefined
                                        : color,
                                  })
                                }
                                className={`px-1 py-1 text-xs rounded border flex flex-col items-center transition-all ${
                                  filters.strapColor === color
                                    ? "bg-amber-500 text-white border-amber-500"
                                    : "border-amber-200 text-gray-700 hover:border-amber-400"
                                }`}
                              >
                                <span
                                  className={`w-4 h-4 rounded-full mb-1 border border-gray-200`}
                                  style={{
                                    backgroundColor: color.toLowerCase(),
                                    boxShadow:
                                      filters.strapColor === color
                                        ? "0 0 0 2px rgba(245, 158, 11, 0.5)"
                                        : "none",
                                  }}
                                />
                                <span>{color}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Strap Material */}
                        <div>
                          <h4 className="font-medium text-amber-800 mb-3 uppercase text-sm tracking-wider">
                            Strap Material
                          </h4>
                          <div className="space-y-2">
                            {(availableFilters.strapMaterials.length
                              ? availableFilters.strapMaterials
                              : [
                                  "Leather",
                                  "Metal",
                                  "Rubber",
                                  "Fabric",
                                  "Ceramic",
                                  "Silicone",
                                ]
                            ).map((material) => (
                              <label
                                key={material}
                                className="flex items-center hover:text-amber-700 transition-colors"
                              >
                                <input
                                  type="radio"
                                  name="strapMaterial"
                                  checked={filters.strapMaterial === material}
                                  onChange={() =>
                                    handleFilterChange({
                                      strapMaterial: material,
                                    })
                                  }
                                  className="mr-2 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                                />
                                <span className="text-sm">{material}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Style */}
                        <div>
                          <h4 className="font-medium text-amber-800 mb-3 uppercase text-sm tracking-wider">
                            Style
                          </h4>
                          <div className="space-y-2">
                            {(availableFilters.styles.length
                              ? availableFilters.styles
                              : [
                                  "Casual",
                                  "Dress",
                                  "Sports",
                                  "Luxury",
                                  "Smart",
                                  "Vintage",
                                ]
                            ).map((styleOption) => (
                              <label
                                key={styleOption}
                                className="flex items-center hover:text-amber-700 transition-colors"
                              >
                                <input
                                  type="radio"
                                  name="style"
                                  checked={filters.style === styleOption}
                                  onChange={() =>
                                    handleFilterChange({ style: styleOption })
                                  }
                                  className="mr-2 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                                />
                                <span className="text-sm">{styleOption}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </details>

                    {/* Clear Filters Button */}
                    <div className="pt-4 border-t border-amber-200">
                      <button
                        onClick={resetAllFilters}
                        className="w-full bg-amber-50 text-amber-800 text-sm font-medium py-2.5 px-4 rounded-md hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Sidebar Collapse Button */}
            <div className="mt-4">
              <button
                onClick={toggleDesktopSidebar}
                className="bg-white border border-amber-200 rounded-full p-2 shadow-md hover:bg-amber-50 transition-colors"
                aria-label={
                  isDesktopSidebarCollapsed
                    ? "Expand filters"
                    : "Collapse filters"
                }
              >
                {isDesktopSidebarCollapsed ? (
                  <ChevronRightIcon className="h-5 w-5 text-amber-700" />
                ) : (
                  <ChevronLeftIcon className="h-5 w-5 text-amber-700" />
                )}
              </button>
            </div>
          </div>

          {/* Right Content Area with Flex Grow */}
          <div className="flex-1">
            {/* Header with sorting and count - Improved mobile design */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
              <div className="flex items-center justify-between w-full md:w-auto">
                <div className="flex items-center space-x-4">
                  {/* Mobile Filter Button - Enhanced with count */}
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-3 py-2 border border-amber-300 rounded-lg text-sm hover:bg-amber-50 text-amber-800 shadow-sm"
                  >
                    <FunnelIcon className="h-4 w-4" />
                    <span className="font-medium">Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="bg-amber-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  <div className="text-sm text-accent font-medium md:block hidden">
                    {isLoading
                      ? "Discovering timepieces..."
                      : `${totalProducts} Watches Found`}
                  </div>
                </div>

                {/* Mobile Sort Dropdown - Positioned right */}
                <div className="flex items-center lg:hidden">
                  <select
                    value={`${filters.sortBy}:${filters.order}`}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="pl-3 pr-8 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-gray-700 appearance-none"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 flex items-center px-2">
                    <ChevronRightIcon className="h-4 w-4 text-gray-500 rotate-90" />
                  </div>
                </div>
              </div>

              {/* Active Filters - Mobile view */}
              {activeFilterCount > 0 && (
                <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4 py-1">
                  <div className="flex gap-1.5 items-center whitespace-nowrap">
                    {filters.brand && filters.brand.length > 0 && (
                      <div className="bg-amber-50 px-2.5 py-1 rounded-full text-xs text-amber-800 flex items-center gap-1 border border-amber-100">
                        Brands: {filters.brand.length}
                        <button
                          onClick={() =>
                            handleFilterChange({ brand: undefined })
                          }
                          className="hover:text-amber-600 ml-1"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {filters.gender && (
                      <div className="bg-amber-50 px-2.5 py-1 rounded-full text-xs text-amber-800 flex items-center gap-1 border border-amber-100">
                        {filters.gender}
                        <button
                          onClick={() =>
                            handleFilterChange({ gender: undefined })
                          }
                          className="hover:text-amber-600 ml-1"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {filters.dialColor && (
                      <div className="bg-amber-50 px-2.5 py-1 rounded-full text-xs text-amber-800 flex items-center gap-1 border border-amber-100">
                        {filters.dialColor} Dial
                        <button
                          onClick={() =>
                            handleFilterChange({ dialColor: undefined })
                          }
                          className="hover:text-amber-600 ml-1"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {filters.dialShape && (
                      <div className="bg-amber-50 px-2.5 py-1 rounded-full text-xs text-amber-800 flex items-center gap-1 border border-amber-100">
                        {filters.dialShape} Shape
                        <button
                          onClick={() =>
                            handleFilterChange({ dialShape: undefined })
                          }
                          className="hover:text-amber-600 ml-1"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {(filters.minPrice !== undefined ||
                      filters.maxPrice !== undefined) && (
                      <div className="bg-amber-50 px-2.5 py-1 rounded-full text-xs text-amber-800 flex items-center gap-1 border border-amber-100">
                        ₹{filters.minPrice || 0} - ₹
                        {filters.maxPrice || "10000+"}
                        <button
                          onClick={() =>
                            handleFilterChange({
                              minPrice: undefined,
                              maxPrice: undefined,
                            })
                          }
                          className="hover:text-amber-600 ml-1"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    <button
                      onClick={resetAllFilters}
                      className="text-xs text-amber-700 hover:text-amber-900 flex items-center gap-0.5 underline-offset-2 bg-white/80 px-2.5 py-1 rounded-full border border-amber-100"
                    >
                      <XMarkIcon className="h-3 w-3" />
                      Clear all
                    </button>
                  </div>
                </div>
              )}

              {/* Desktop active filters and sort dropdown - unchanged */}
              <div className="hidden md:flex flex-wrap gap-2 items-center">
                {activeFilterCount > 0 && (
                  <div className="hidden md:flex flex-wrap gap-1.5 items-center">
                    {filters.brand && filters.brand.length > 0 && (
                      <div className="bg-amber-50 px-2.5 py-1 rounded-full text-xs text-amber-800 flex items-center gap-1 border border-amber-100">
                        Brands: {filters.brand.length}
                        <button
                          onClick={() =>
                            handleFilterChange({ brand: undefined })
                          }
                          className="hover:text-amber-600 ml-1"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {filters.gender && (
                      <div className="bg-amber-50 px-2.5 py-1 rounded-full text-xs text-amber-800 flex items-center gap-1 border border-amber-100">
                        {filters.gender}
                        <button
                          onClick={() =>
                            handleFilterChange({ gender: undefined })
                          }
                          className="hover:text-amber-600 ml-1"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {filters.dialColor && (
                      <div className="bg-amber-50 px-2.5 py-1 rounded-full text-xs text-amber-800 flex items-center gap-1 border border-amber-100">
                        {filters.dialColor} Dial
                        <button
                          onClick={() =>
                            handleFilterChange({ dialColor: undefined })
                          }
                          className="hover:text-amber-600 ml-1"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {filters.dialShape && (
                      <div className="bg-amber-50 px-2.5 py-1 rounded-full text-xs text-amber-800 flex items-center gap-1 border border-amber-100">
                        {filters.dialShape} Shape
                        <button
                          onClick={() =>
                            handleFilterChange({ dialShape: undefined })
                          }
                          className="hover:text-amber-600 ml-1"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {(filters.minPrice !== undefined ||
                      filters.maxPrice !== undefined) && (
                      <div className="bg-amber-50 px-2.5 py-1 rounded-full text-xs text-amber-800 flex items-center gap-1 border border-amber-100">
                        ₹{filters.minPrice || 0} - ₹
                        {filters.maxPrice || "10000+"}
                        <button
                          onClick={() =>
                            handleFilterChange({
                              minPrice: undefined,
                              maxPrice: undefined,
                            })
                          }
                          className="hover:text-amber-600 ml-1"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    {activeFilterCount > 3 && (
                      <div className="bg-amber-50 px-2.5 py-1 rounded-full text-xs text-amber-800 border border-amber-100">
                        +{activeFilterCount - 3} more
                      </div>
                    )}

                    <button
                      onClick={resetAllFilters}
                      className="text-xs text-amber-700 hover:text-amber-900 underline underline-offset-2"
                    >
                      Clear all
                    </button>
                  </div>
                )}

                {/* Sort Dropdown */}
                <div className="flex items-center">
                  <label className="text-xs text-gray-500 mr-2 hidden md:inline">
                    Sort:
                  </label>
                  <select
                    value={`${filters.sortBy}:${filters.order}`}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-gray-700"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Product Grid - Improved mobile spacing */}
            <div className="bg-white rounded-xl shadow-md border border-amber-100 p-4 sm:p-6">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-gradient-to-b from-amber-50/30 to-white border border-amber-100 rounded-lg overflow-hidden">
                        <div className="aspect-square bg-amber-100"></div>
                        <div className="p-5">
                          <div className="h-4 bg-amber-100 rounded w-2/3 mx-auto mb-3"></div>
                          <div className="h-3 bg-amber-100/80 rounded w-1/2 mx-auto mb-4"></div>
                          <div className="h-5 bg-amber-100 rounded w-1/3 mx-auto mb-4"></div>
                          <div className="h-8 bg-amber-100/80 rounded w-full mx-auto"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="transform transition duration-300 hover:-translate-y-1"
                    >
                      <div className="h-full">
                        <EnhancedProductCard
                          product={product}
                          onQuickView={() => handleQuickView(product)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 sm:py-20">
                  <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 mb-6 sm:mb-8 text-amber-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-medium text-amber-900 mb-3 font-inter">
                    No Timepieces Found
                  </h3>
                  <p className="text-amber-700 mb-6">
                    Please adjust your search or filter criteria
                  </p>
                  <button
                    onClick={resetAllFilters}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-6 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Pagination - Simplified for small screens */}
            {totalPages > 1 && (
              <div className="mt-8 sm:mt-10 flex justify-center">
                <nav className="flex items-center bg-white px-3 sm:px-4 py-2 sm:py-3 border border-amber-100 rounded-xl shadow-sm">
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(1, (filters.page || 1) - 1))
                    }
                    disabled={(filters.page || 1) === 1}
                    className="px-2 sm:px-3 py-1 text-sm font-medium text-amber-800 hover:text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed mr-1 sm:mr-2"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>

                  <div className="flex space-x-1">
                    {/* Mobile: Show fewer pagination buttons */}
                    <div className="sm:hidden flex items-center">
                      <span className="text-sm font-medium">
                        {filters.page || 1} of {totalPages}
                      </span>
                    </div>

                    {/* Desktop: Show pagination buttons */}
                    <div className="hidden sm:flex space-x-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          const currentPage = filters.page || 1;

                          // Logic to show pages centered around current page
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          const isActive = pageNum === currentPage;

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                                isActive
                                  ? "bg-amber-500 text-white"
                                  : "text-gray-700 hover:bg-amber-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}

                      {totalPages > 5 && filters.page! < totalPages - 2 && (
                        <>
                          <span className="text-gray-400 flex items-center px-1">
                            ...
                          </span>
                          <button
                            onClick={() => handlePageChange(totalPages)}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium text-gray-700 hover:bg-amber-50"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handlePageChange(
                        Math.min(totalPages, (filters.page || 1) + 1)
                      )
                    }
                    disabled={(filters.page || 1) === totalPages}
                    className="px-2 sm:px-3 py-1 text-sm font-medium text-amber-800 hover:text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed ml-1 sm:ml-2"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sidebar - Enhanced with updated design */}
      <FilterSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onFilterChange={handleWatchFilterChange}
        availableFilters={{
          sortOptions,
          brands: availableFilters.brands,
          genders: availableFilters.genders,
          dialColors: availableFilters.dialColors,
          dialShapes: availableFilters.dialShapes,
          dialTypes: availableFilters.dialTypes,
          strapColors: availableFilters.strapColors,
          strapMaterials: availableFilters.strapMaterials,
          styles: availableFilters.styles,
          dialThicknesses: availableFilters.dialThicknesses,
        }}
        currentFilters={{
          priceRange: {
            min: filters.minPrice || availableFilters.minPrice || 0,
            max: filters.maxPrice || availableFilters.maxPrice || 10000,
          },
          sortBy: `${filters.sortBy}:${filters.order}`,
          inStock: filters.inStock || false,
          watchFilters: {
            brands: filters.brand || [],
            gender: filters.gender,
            dialColor: filters.dialColor,
            dialShape: filters.dialShape,
            dialType: filters.dialType,
            strapColor: filters.strapColor,
            strapMaterial: filters.strapMaterial,
            style: filters.style,
            dialThickness: filters.dialThickness,
          },
        }}
      />

      {/* Quick View Modal */}
      <ProductQuickView
        product={selectedProduct}
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
      />
    </main>
  );
}

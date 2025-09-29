"use client";
import Link from "next/link";

import React, { useState, useEffect } from "react";
import {
  FunnelIcon,
  XMarkIcon,
  //ChevronRightIcon,
  //HomeIcon,
} from "@heroicons/react/24/outline";
import { productApi } from "@/services/api";
import { Product, ProductFilters } from "@/types";
import EnhancedProductCard from "@/components/shared/EnhancedProductCard";
import ProductQuickView from "@/components/shared/ProductQuickView";
import EnhancedSearchBar from "@/components/shared/EnhancedSearchBar";
import FilterSidebar from "@/components/shared/FilterSidebar";
//import Link from "next/link";

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

  // State for watch-specific filter options
  const watchFilterOptions = {
    brands: ["MOVADA", "BALMAIN", "GUESS", "VERSACE", "TITAN", "FOSSIL"],
    genders: ["Men", "Women", "Unisex"],
    dialColors: ["Black", "White", "Blue", "Gold", "Silver", "Green"],
    dialShapes: ["Round", "Square", "Rectangle", "Oval", "Tonneau"],
    dialTypes: ["Analog", "Digital", "Automatic", "Chronograph"],
    strapColors: ["Black", "Brown", "Silver", "Gold", "Blue", "Green"],
    strapMaterials: [
      "Leather",
      "Metal",
      "Rubber",
      "Fabric",
      "Ceramic",
      "Silicone",
    ],
    styles: ["Casual", "Dress", "Sports", "Luxury", "Smart", "Vintage"],
    dialThicknesses: ["Ultra-thin", "Slim", "Medium", "Thick"],
  };

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

  // Note: Removed productsByCategory grouping to match reference design

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

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50/30 to-white md:mt-22 mt-16 font-inter">
      {/* Elegant header for shop page */}
      <div className="bg-gradient-to-r from-accent/30 to-white border-b ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl md:text-3xl font-inter font-bold text-gray-700 text-center">
            Luxury Timepieces Collection
          </h1>
          <p className="text-center text-gray-700 mt-2 text-sm md:text-base">
            Discover the perfect expression of craftsmanship and elegance
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md border border-amber-200 p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 font-inter border-b border-amber-200 pb-2">
                REFINE SELECTION
              </h3>

              {/* Filter Categories */}
              <div className="space-y-6">
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
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={filters.maxPrice || 10000}
                    onChange={(e) =>
                      handleFilterChange({ maxPrice: Number(e.target.value) })
                    }
                    className="w-full accent-amber-600"
                  />
                </div>

                {/* Brands */}
                <div>
                  <h4 className="font-medium text-amber-800 mb-3 uppercase text-sm tracking-wider">
                    Brands
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {watchFilterOptions.brands.map((brand) => (
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
                                brand: currentBrands.filter((b) => b !== brand),
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
                  <div className="space-y-2">
                    {watchFilterOptions.genders.map((genderOption) => (
                      <label
                        key={genderOption}
                        className="flex items-center hover:text-amber-700 transition-colors"
                      >
                        <input
                          type="radio"
                          name="gender"
                          checked={filters.gender === genderOption}
                          onChange={() =>
                            handleFilterChange({ gender: genderOption })
                          }
                          className="mr-2 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                        />
                        <span className="text-sm">{genderOption}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Dial Color */}
                <div>
                  <h4 className="font-medium text-amber-800 mb-3 uppercase text-sm tracking-wider">
                    Dial Color
                  </h4>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-2">
                    {watchFilterOptions.dialColors.map((color) => (
                      <label
                        key={color}
                        className="flex items-center hover:text-amber-700 transition-colors"
                      >
                        <input
                          type="radio"
                          name="dialColor"
                          checked={filters.dialColor === color}
                          onChange={() =>
                            handleFilterChange({ dialColor: color })
                          }
                          className="mr-2 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                        />
                        <span className="text-sm">{color}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Dial Shape */}
                <div>
                  <h4 className="font-medium text-amber-800 mb-3 uppercase text-sm tracking-wider">
                    Dial Shape
                  </h4>
                  <div className="space-y-2">
                    {watchFilterOptions.dialShapes.map((shape) => (
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

                {/* Dial Type */}
                <div>
                  <h4 className="font-medium text-amber-800 mb-3 uppercase text-sm tracking-wider">
                    Dial Type
                  </h4>
                  <div className="space-y-2">
                    {watchFilterOptions.dialTypes.map((type) => (
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
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-2">
                    {watchFilterOptions.strapColors.map((color) => (
                      <label
                        key={color}
                        className="flex items-center hover:text-amber-700 transition-colors"
                      >
                        <input
                          type="radio"
                          name="strapColor"
                          checked={filters.strapColor === color}
                          onChange={() =>
                            handleFilterChange({ strapColor: color })
                          }
                          className="mr-2 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                        />
                        <span className="text-sm">{color}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Strap Material */}
                <div>
                  <h4 className="font-medium text-amber-800 mb-3 uppercase text-sm tracking-wider">
                    Strap Material
                  </h4>
                  <div className="space-y-2">
                    {watchFilterOptions.strapMaterials.map((material) => (
                      <label
                        key={material}
                        className="flex items-center hover:text-amber-700 transition-colors"
                      >
                        <input
                          type="radio"
                          name="strapMaterial"
                          checked={filters.strapMaterial === material}
                          onChange={() =>
                            handleFilterChange({ strapMaterial: material })
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
                    {watchFilterOptions.styles.map((styleOption) => (
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

                {/* Clear Filters Button */}
                <div className="pt-4 border-t border-amber-200">
                  <button
                    onClick={() => {
                      setFilters({
                        page: 1,
                        limit: 12,
                        sortBy: "createdAt",
                        order: "desc",
                      });
                      setSearchQuery("");
                    }}
                    className="w-full bg-amber-100 text-amber-800 text-xs font-semibold py-2.5 px-2 rounded shadow-sm hover:bg-amber-200 transition-colors uppercase tracking-wider"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-md border border-amber-200 hidden">
              <div className="relative">
                <EnhancedSearchBar
                  onSearch={handleSearch}
                  initialValue={searchQuery}
                  placeholder="Search our luxury timepiece collection..."
                  className="w-full border-amber-300 focus:border-amber-500 focus:ring-amber-500 rounded-md pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-amber-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Header with sorting and count */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
              <div className="text-sm text-amber-700 font-medium">
                {isLoading
                  ? "Discovering luxury timepieces..."
                  : `${Math.min(
                      (filters.page || 1) * (filters.limit || 12),
                      totalProducts
                    )} of ${totalProducts} Timepieces`}
              </div>

              {/* Active Filters */}
              {Object.entries(filters).some(
                ([key, value]) =>
                  [
                    "brand",
                    "gender",
                    "dialColor",
                    "dialShape",
                    "dialType",
                    "strapColor",
                    "strapMaterial",
                    "style",
                    "dialThickness",
                  ].includes(key) && value !== undefined
              ) && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-amber-800">
                    Active filters:
                  </span>
                  {filters.brand && filters.brand.length > 0 && (
                    <div className="bg-amber-100 px-2 py-1 rounded-md text-xs text-amber-800 flex items-center gap-1">
                      Brands: {filters.brand.length}
                      <button
                        onClick={() => handleFilterChange({ brand: undefined })}
                        className="hover:text-amber-600"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {filters.gender && (
                    <div className="bg-amber-100 px-2 py-1 rounded-md text-xs text-amber-800 flex items-center gap-1">
                      {filters.gender}
                      <button
                        onClick={() =>
                          handleFilterChange({ gender: undefined })
                        }
                        className="hover:text-amber-600"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {filters.dialColor && (
                    <div className="bg-amber-100 px-2 py-1 rounded-md text-xs text-amber-800 flex items-center gap-1">
                      {filters.dialColor}
                      <button
                        onClick={() =>
                          handleFilterChange({ dialColor: undefined })
                        }
                        className="hover:text-amber-600"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {filters.dialShape && (
                    <div className="bg-amber-100 px-2 py-1 rounded-md text-xs text-amber-800 flex items-center gap-1">
                      {filters.dialShape} Shape
                      <button
                        onClick={() =>
                          handleFilterChange({ dialShape: undefined })
                        }
                        className="hover:text-amber-600"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {(filters.minPrice !== undefined ||
                    filters.maxPrice !== undefined) && (
                    <div className="bg-amber-100 px-2 py-1 rounded-md text-xs text-amber-800 flex items-center gap-1">
                      Price: ₹{filters.minPrice || 0} - ₹
                      {filters.maxPrice || "10000+"}
                      <button
                        onClick={() =>
                          handleFilterChange({
                            minPrice: undefined,
                            maxPrice: undefined,
                          })
                        }
                        className="hover:text-amber-600"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 md:gap-4">
                {/* Active Filters Display */}
                {Object.entries(filters).some(
                  ([key, value]) =>
                    [
                      "brand",
                      "gender",
                      "dialColor",
                      "dialShape",
                      "dialType",
                      "strapColor",
                      "strapMaterial",
                      "style",
                      "dialThickness",
                      "minPrice",
                      "maxPrice",
                    ].includes(key) && value !== undefined
                ) && (
                  <button
                    onClick={() => {
                      setFilters({
                        page: 1,
                        limit: 12,
                        sortBy: "createdAt",
                        order: "desc",
                      });
                      setSearchQuery("");
                    }}
                    className="hidden md:flex items-center gap-1 px-3 py-1.5 border border-amber-300 rounded-md text-xs hover:bg-amber-50 text-amber-800"
                  >
                    <XMarkIcon className="h-3 w-3" />
                    Clear Filters
                  </button>
                )}

                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-amber-300 rounded-md text-sm hover:bg-amber-50 text-amber-800 shadow-sm"
                >
                  <FunnelIcon className="h-4 w-4" />
                  Filter
                </button>

                {/* Sort Dropdown */}
                <select
                  value={`${filters.sortBy}:${filters.order}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-4 py-2 border border-amber-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gradient-to-r from-amber-50 to-white text-amber-800"
                >
                  <option value="createdAt:desc">Best Sellers</option>
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <div className="bg-white rounded-lg shadow-md border border-amber-200 p-6">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 gap-3">
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
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 gap-2 ">
                  {products.map((product) => (
                    <div key={product.id} className="group cursor-pointer">
                      <div className="bg-gradient-to-b from-amber-50/30 to-white border border-primary/20 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 group-hover:border-amber-300">
                        {/* Product Image */}
                        <div className="aspect-square bg-gradient-to-b from-amber-50 to-white relative overflow-hidden">
                          <EnhancedProductCard
                            product={product}
                            onQuickView={() => handleQuickView(product)}
                          />
                        </div>

                        {/* Product Info */}
                        <div className="p-5 text-center">
                          <h3 className="font-bold text-amber-900 mb-1 uppercase text-sm font-inter">
                            {product.brand || "MAK"}
                          </h3>
                          <p className="text-xs text-amber-700/80 mb-2 uppercase tracking-wider">
                            {product.category || "LUXURY"}
                          </p>
                          <p className="font-bold text-amber-800 mb-4 text-lg">
                            ₹ {product.price?.toLocaleString("en-IN") || "0"}
                          </p>
                          <Link
                            href={`/product_details?id=${product.id}`}
                            className="block"
                          >
                            <button className="w-full bg-accent text-white text-xs font-semibold py-2.5 px-2 rounded shadow-sm hover:bg-amber-800 transition-colors uppercase tracking-wider">
                              View Details
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="mx-auto w-20 h-20 mb-6 text-amber-300">
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
                  <h3 className="text-xl font-medium text-amber-900 mb-3 font-inter">
                    No Timepieces Found
                  </h3>
                  <p className="text-amber-700">
                    Please adjust your search or filter criteria
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(1, (filters.page || 1) - 1))
                    }
                    disabled={(filters.page || 1) === 1}
                    className="px-3 py-2 text-sm font-medium text-amber-800 hover:text-amber-600 disabled:opacity-40 border border-amber-200 rounded-md hover:border-amber-300 disabled:hover:border-amber-200"
                  >
                    &lt;
                  </button>

                  {Array.from({ length: Math.min(6, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    const isActive = pageNum === (filters.page || 1);
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 text-sm font-medium rounded-md border ${
                          isActive
                            ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                            : "text-amber-800 hover:bg-amber-50 border-amber-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() =>
                      handlePageChange(
                        Math.min(totalPages, (filters.page || 1) + 1)
                      )
                    }
                    disabled={(filters.page || 1) === totalPages}
                    className="px-3 py-2 text-sm font-medium text-amber-800 hover:text-amber-600 disabled:opacity-40 border border-amber-200 rounded-md hover:border-amber-300 disabled:hover:border-amber-200"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sidebar */}
      <FilterSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onFilterChange={handleWatchFilterChange}
        availableFilters={{
          sortOptions,
          brands: watchFilterOptions.brands,
          genders: watchFilterOptions.genders,
          dialColors: watchFilterOptions.dialColors,
          dialShapes: watchFilterOptions.dialShapes,
          dialTypes: watchFilterOptions.dialTypes,
          strapColors: watchFilterOptions.strapColors,
          strapMaterials: watchFilterOptions.strapMaterials,
          styles: watchFilterOptions.styles,
          dialThicknesses: watchFilterOptions.dialThicknesses,
        }}
        currentFilters={{
          priceRange: {
            min: filters.minPrice || 0,
            max: filters.maxPrice || 10000,
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

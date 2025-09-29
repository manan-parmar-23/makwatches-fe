// src/components/shared/ProductGrid.tsx
import React from "react";
import { Product } from "@/utils/api";
import { useProducts } from "@/hooks/useProducts";
import GridProductCard from "./GridProductCard";

interface ProductGridProps {
  mainCategory?: "Men" | "Women";
  category?: string;
  subcategory?: string;
  limit?: number;
  title?: string;
  className?: string;
  onProductClick?: (product: Product) => void;
  isCollection?: boolean; // True for collection views (show all), false for filtered views
}

// Loading skeleton component
const ProductSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
    <div className="aspect-square bg-gray-200"></div>
    <div className="p-3 md:p-4">
      <div className="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 rounded mb-2 w-1/3"></div>
      <div className="h-5 bg-gray-200 rounded w-1/4"></div>
    </div>
  </div>
);

// Empty state component
const EmptyState: React.FC<{ onRefetch: () => void }> = ({ onRefetch }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
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
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No products found
      </h3>
      <p className="text-gray-600 mb-4 max-w-sm">
        We couldn&apos;t find any products in this category. Try refreshing or
        check back later.
      </p>
      <button
        onClick={onRefetch}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Refresh
      </button>
    </div>
  </div>
);

// Error state component
const ErrorState: React.FC<{ error: string; onRefetch: () => void }> = ({
  error,
  onRefetch,
}) => (
  <div className="col-span-full">
    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Error loading products
          </h3>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <div className="mt-3">
            <button
              onClick={onRefetch}
              className="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-1 px-3 rounded text-sm transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProductGrid: React.FC<ProductGridProps> = ({
  mainCategory,
  category,
  subcategory,
  limit = 20,
  title,
  className = "",
  onProductClick,
  isCollection = false,
}) => {
  const { products, loading, error, refetch } = useProducts({
    mainCategory,
    category,
    subcategory,
    limit,
    isCollection,
  });

  const handleProductClick = (product: Product) => {
    onProductClick?.(product);
  };

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">
          {title}
        </h2>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: limit > 10 ? 10 : limit }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))
        ) : error ? (
          // Error state
          <ErrorState error={error} onRefetch={refetch} />
        ) : products.length === 0 ? (
          // Empty state
          <EmptyState onRefetch={refetch} />
        ) : (
          // Products
          products.map((product) => (
            <GridProductCard
              key={product.id}
              product={product}
              onClick={handleProductClick}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ProductGrid;

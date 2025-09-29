// src/components/shared/ProductList.tsx
import React from "react";
import Image from "next/image";
import { Product } from "@/utils/api";
import { useProducts } from "@/hooks/useProducts";
import GridProductCard from "./GridProductCard";

interface ProductListProps {
  mainCategory?: "Men" | "Women";
  category?: string;
  subcategory?: string;
  limit?: number;
  title?: string;
  className?: string;
  onProductClick?: (product: Product) => void;
  viewMode?: "grid" | "list"; // New prop for view mode
}

// List-style product card for mobile
const ListProductCard: React.FC<{
  product: Product;
  onClick?: (product: Product) => void;
}> = ({ product, onClick }) => {
  const handleClick = () => {
    onClick?.(product);
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };

  const getImageSrc = () => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    if (product.imageUrl) {
      return product.imageUrl;
    }
    return "/placeholder.png";
  };

  return (
    <div
      className="flex items-center bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={handleClick}
    >
      {/* Product Image */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={getImageSrc()}
          alt={product.name}
          fill
          className="object-cover"
          sizes="80px"
        />

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white text-xs font-medium">Out</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="ml-3 flex-1 min-w-0">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
            {product.brand}
          </p>
        )}

        {/* Product Name */}
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
          {product.name}
        </h3>

        {/* Category */}
        {product.subcategory && (
          <p className="text-xs text-gray-400 mb-2">{product.subcategory}</p>
        )}

        {/* Price and Stock */}
        <div className="flex items-center justify-between">
          <span className="font-bold text-base text-gray-900">
            {formatPrice(product.price)}
          </span>

          {/* Stock indicator */}
          {product.stock && product.stock < 10 && product.stock > 0 && (
            <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              {product.stock} left
            </span>
          )}
        </div>
      </div>

      {/* Action button */}
      <div className="ml-3 flex-shrink-0">
        <button
          className="bg-black text-white px-3 py-2 rounded-full text-xs hover:bg-gray-800 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // Handle add to cart
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
};

// Loading skeleton for list view
const ListSkeleton: React.FC = () => (
  <div className="flex items-center bg-white rounded-lg p-3 shadow-sm animate-pulse">
    <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
    <div className="ml-3 flex-1">
      <div className="h-3 bg-gray-200 rounded mb-2 w-1/3"></div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 rounded mb-2 w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>
    <div className="ml-3 w-12 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
  </div>
);

const ProductList: React.FC<ProductListProps> = ({
  mainCategory,
  category,
  subcategory,
  limit = 20,
  title,
  className = "",
  onProductClick,
  viewMode = "grid",
}) => {
  // Use the improved useProducts hook with retry logic
  const { products, loading, error, refetch } = useProducts({
    mainCategory,
    category,
    subcategory,
    limit,
  });

  const handleProductClick = (product: Product) => {
    onProductClick?.(product);
  };

  // Use mobile list view for small screens or when explicitly set to list
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const shouldShowList = viewMode === "list" || isMobile;

  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        {title && (
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">
            {title}
          </h2>
        )}

        {shouldShowList ? (
          <div className="space-y-3">
            {Array.from({ length: Math.min(limit, 6) }).map((_, index) => (
              <ListSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
            {Array.from({ length: Math.min(limit, 10) }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse"
              >
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-3 md:p-4">
                  <div className="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2 w-1/3"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full ${className}`}>
        {title && (
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">
            {title}
          </h2>
        )}
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
                  onClick={refetch}
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
  }

  if (products.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        {title && (
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">
            {title}
          </h2>
        )}
        <div className="flex flex-col items-center justify-center py-12 px-4">
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
              We couldn&apos;t find any products in this category. Try
              refreshing or check back later.
            </p>
            <button
              onClick={refetch}
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
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">
          {title}
        </h2>
      )}

      {shouldShowList ? (
        // List view for mobile
        <div className="space-y-3">
          {products.map((product) => (
            <ListProductCard
              key={product.id}
              product={product}
              onClick={handleProductClick}
            />
          ))}
        </div>
      ) : (
        // Grid view for desktop
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
          {products.map((product) => (
            <GridProductCard
              key={product.id}
              product={product}
              onClick={handleProductClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;

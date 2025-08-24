import React from "react";

const ProductSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
      {/* Image skeleton */}
      <div className="w-full aspect-[3/4] bg-gray-200" />

      {/* Content skeleton */}
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-5 bg-gray-200 rounded w-1/4 mt-2"></div>
      </div>
    </div>
  );
};

export default ProductSkeleton;

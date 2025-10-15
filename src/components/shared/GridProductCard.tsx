// src/components/shared/GridProductCard.tsx
"use client";
import React, { useState, useCallback } from "react";
import Image from "next/image";
import { Product } from "@/utils/api";
import { useShoppingContext } from "@/context/ShoppingContext";
import DiscountBadge, {
  PriceWithDiscount,
  SavingsBadge,
} from "./DiscountBadge";
import { calculateDiscount } from "@/utils/discount";
import { ShoppingCart, Check, Loader2 } from "lucide-react";

interface GridProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  className?: string;
}

const GridProductCard: React.FC<GridProductCardProps> = ({
  product,
  onClick,
  className = "",
}) => {
  const { addToCart, isInCart } = useShoppingContext();
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleClick = useCallback(() => {
    onClick?.(product);
  }, [onClick, product]);

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isAdding || product.stock === 0) return;

      setIsAdding(true);
      try {
        await addToCart(product.id, 1);
      } catch (error) {
        console.error("Failed to add to cart:", error);
      } finally {
        setTimeout(() => setIsAdding(false), 600);
      }
    },
    [isAdding, product.stock, product.id, addToCart]
  );

  const getImageSrc = () => {
    if (imageError) return "/placeholder.png";
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    if (product.imageUrl) {
      return product.imageUrl;
    }
    return "/placeholder.png";
  };

  // Calculate discount information
  const discountInfo = calculateDiscount(
    product.price,
    product.discountPercentage,
    product.discountAmount,
    product.discountStartDate,
    product.discountEndDate
  );

  const inCart = isInCart(product.id);
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock && product.stock < 10 && product.stock > 0;

  return (
    <div
      className={`group bg-gradient-to-br from-gray-100 to-gray-150 border border-gray-200 hover:border-primary/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer ${
        isOutOfStock ? "opacity-75" : ""
      } ${className}`}
      onClick={handleClick}
    >
      {/* Product Image */}
      <div className="relative bg-white aspect-square overflow-hidden ">
        <Image
          src={getImageSrc()}
          alt={product.name}
          fill
          className={`object-contain p-4 transition-all duration-500 ${
            isOutOfStock
              ? "grayscale group-hover:grayscale"
              : "group-hover:scale-110"
          }`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onError={() => setImageError(true)}
          priority={false}
          loading="lazy"
        />

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Top Badges Container */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 z-10">
          {/* Discount Badge */}
          {discountInfo.isActive && discountInfo.discountPercentage && (
            <DiscountBadge
              discountPercentage={discountInfo.discountPercentage}
              position="top-left"
              size="sm"
              variant="premium"
            />
          )}

          {/* Stock Badge */}
          {isLowStock && (
            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm">
              {product.stock} left
            </span>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-xl font-bold text-sm shadow-2xl">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 lg:p-5 space-y-3">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs font-medium text-primary/70 uppercase tracking-[0.15em] truncate">
            {product.brand}
          </p>
        )}

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 text-sm lg:text-base line-clamp-2 min-h-[2.5rem] leading-tight group-hover:text-primary transition-colors duration-300">
          {product.name}
        </h3>

        {/* Category */}
        {product.subcategory && (
          <p className="text-xs text-gray-500 truncate">
            {product.subcategory}
          </p>
        )}

        {/* Price Section */}
        <div className="pt-3 border-t border-gray-100 space-y-2.5">
          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <PriceWithDiscount
                originalPrice={discountInfo.originalPrice}
                finalPrice={discountInfo.finalPrice}
                isActive={discountInfo.isActive}
                size="sm"
              />
            </div>

            {/* Add to Cart Button */}
            <button
              className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${
                inCart
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-primary hover:bg-primary/90 text-white"
              } ${isOutOfStock ? "bg-gray-300 hover:bg-gray-300" : ""}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              aria-label={inCart ? "Added to cart" : "Add to cart"}
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">Adding...</span>
                </>
              ) : inCart ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {isOutOfStock ? "Unavailable" : "Add"}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Savings Badge */}
          {discountInfo.isActive && discountInfo.savingsText && (
            <SavingsBadge savingsText={discountInfo.savingsText} />
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(GridProductCard);

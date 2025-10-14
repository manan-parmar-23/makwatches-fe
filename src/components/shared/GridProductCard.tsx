// src/components/shared/GridProductCard.tsx
import React from "react";
import Image from "next/image";
import { Product } from "@/utils/api";
import { useShoppingContext } from "@/context/ShoppingContext";
import DiscountBadge, {
  PriceWithDiscount,
  SavingsBadge,
} from "./DiscountBadge";
import { calculateDiscount } from "@/utils/discount";

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

  const handleClick = () => {
    onClick?.(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product.id, 1);
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

  // Calculate discount information
  const discountInfo = calculateDiscount(
    product.price,
    product.discountPercentage,
    product.discountAmount,
    product.discountStartDate,
    product.discountEndDate
  );

  return (
    <div
      className={`group bg-white border border-gray-100 hover:border-primary/30 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {/* Product Image with updated styling */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={getImageSrc()}
          alt={product.name}
          fill
          className="object-contain group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>

        {/* Discount Badge */}
        {discountInfo.isActive && discountInfo.discountPercentage && (
          <DiscountBadge
            discountPercentage={discountInfo.discountPercentage}
            position="top-right"
            size="sm"
            variant="premium"
          />
        )}

        {/* Stock indicator */}
        {product.stock && product.stock < 10 && product.stock > 0 && (
          <div className="absolute top-2 left-2">
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              Only {product.stock} left
            </span>
          </div>
        )}

        {/* Out of stock */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Details with luxury styling */}
      <div className="p-4 md:p-5 border-t border-gray-100">
        {/* Brand with primary color */}
        {product.brand && (
          <p className="text-xs md:text-sm text-gray-500 uppercase tracking-widest mb-1">
            {product.brand}
          </p>
        )}

        {/* Product Name with elegant typography */}
        <h3 className="font-medium text-gray-800 text-sm md:text-base line-clamp-2 mb-2 tracking-tight hover:text-primary">
          {product.name}
        </h3>

        {/* Category with subtle styling */}
        {product.subcategory && (
          <p className="text-xs text-gray-500 mb-3">{product.subcategory}</p>
        )}

        {/* Price with elegant presentation */}
        <div className="border-t border-gray-50 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <PriceWithDiscount
              originalPrice={discountInfo.originalPrice}
              finalPrice={discountInfo.finalPrice}
              isActive={discountInfo.isActive}
              size="sm"
            />

            {/* Add to cart button */}
            <button
              className={`opacity-100 transition-opacity duration-500 px-2 py-1 rounded-sm text-xs 
                ${
                  isInCart(product.id)
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-accent hover:bg-primary/90"
                } text-white`}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {isInCart(product.id) ? "In Cart" : "Add to Cart"}
            </button>
          </div>

          {/* Savings Badge */}
          {discountInfo.isActive && (
            <SavingsBadge savingsText={discountInfo.savingsText} />
          )}
        </div>
      </div>
    </div>
  );
};

export default GridProductCard;

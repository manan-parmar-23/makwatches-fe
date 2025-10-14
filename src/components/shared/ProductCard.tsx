import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { EyeIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import DiscountBadge, {
  PriceWithDiscount,
  SavingsBadge,
} from "./DiscountBadge";
import { calculateDiscount } from "@/utils/discount";

type ProductCardProps = {
  product: {
    id?: string;
    name?: string;
    price?: string | number;
    image?: string;
    description?: string;
    subcategory?: string | null;
    discountPercentage?: number | null;
    discountAmount?: number | null;
    discountStartDate?: string | null;
    discountEndDate?: string | null;
  };
  onClick: () => void;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const price =
    typeof product.price === "number"
      ? product.price
      : parseFloat(product.price || "0");
  const discountInfo = calculateDiscount(
    price,
    product.discountPercentage,
    product.discountAmount,
    product.discountStartDate,
    product.discountEndDate
  );

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      {/* Product Image */}
      <div
        className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden cursor-pointer"
        onClick={onClick}
      >
        <Image
          src={product.image || "/placeholder.png"}
          alt={product.name || "Product"}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Discount Badge */}
        {discountInfo.isActive && discountInfo.discountPercentage && (
          <DiscountBadge
            discountPercentage={discountInfo.discountPercentage}
            position="top-right"
            size="md"
            variant="premium"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <div className="flex space-x-3 bg-black/80 backdrop-blur-md rounded-full p-3 shadow-xl">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              aria-label="Quick view"
            >
              <EyeIcon className="text-gray-900 w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-gray-900 to-black p-3 rounded-full shadow-lg hover:from-black hover:to-gray-800 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                // Add to cart functionality here
                console.log("Add to cart:", product.name);
              }}
              aria-label="Add to cart"
            >
              <ShoppingBagIcon className="text-white w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6" onClick={onClick}>
        <div className="space-y-3">
          {product.subcategory && (
            <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">
              {product.subcategory}
            </p>
          )}

          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-lg">
            {product.name}
          </h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <PriceWithDiscount
                originalPrice={discountInfo.originalPrice}
                finalPrice={discountInfo.finalPrice}
                isActive={discountInfo.isActive}
                size="md"
              />
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-3 h-3 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
            </div>
            {discountInfo.isActive && (
              <SavingsBadge savingsText={discountInfo.savingsText} />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

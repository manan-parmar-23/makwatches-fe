"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { EyeIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { ShoppingBagIcon as ShoppingBagSolid } from "@heroicons/react/24/solid";
import WishlistButton from "./WishlistButton";
import DiscountBadge, {
  PriceWithDiscount,
  SavingsBadge,
} from "./DiscountBadge";
import { calculateDiscount } from "@/utils/discount";
import { useShoppingContext } from "@/context/ShoppingContext";
import { Product } from "@/types";

type ProductCardProps = {
  product: Product;
  onQuickView: () => void;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart, isInCart } = useShoppingContext();
  const discountInfo = calculateDiscount(
    product.price,
    product.discountPercentage,
    product.discountAmount,
    product.discountStartDate,
    product.discountEndDate
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      {/* Product Image */}
      <div className="relative w-full aspect-[3/4] bg-white overflow-hidden">
        <Link href={`/product_details?id=${product.id}`}>
          <div className="w-full h-full relative cursor-pointer">
            <Image
              src={product.imageUrl || product.images[0] || "/placeholder.png"}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              priority
            />

            {/* Discount badge */}
            {discountInfo.isActive && discountInfo.discountPercentage && (
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
                <DiscountBadge
                  discountPercentage={discountInfo.discountPercentage}
                />
              </div>
            )}

            {/* Out of stock badge (subtle) */}
            {product.stock <= 0 && (
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                <span className="inline-block bg-white/85 text-red-600 border border-red-100 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-md font-medium shadow-sm">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Quick actions overlay - Works on both mobile and desktop */}
        <div className="absolute inset-0 bg-transparent transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
          {/* Tablet/Desktop view buttons */}
          <div className="hidden sm:flex space-x-3 bg-black/80 backdrop-blur-md rounded-full p-3 shadow-xl">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView();
              }}
              aria-label="Quick view"
            >
              <EyeIcon className="text-gray-900 w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              disabled={product.stock <= 0}
              className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
                product.stock <= 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : isInCart(product.id)
                  ? "bg-gradient-to-r from-green-500 to-green-600"
                  : "bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-800"
              }`}
              onClick={handleAddToCart}
              aria-label={isInCart(product.id) ? "In cart" : "Add to cart"}
            >
              {isInCart(product.id) ? (
                <ShoppingBagSolid className="text-white w-5 h-5" />
              ) : (
                <ShoppingBagIcon className="text-white w-5 h-5" />
              )}
            </motion.button>
          </div>

          {/* Mobile view buttons - Simplified */}
          <div className="sm:hidden flex flex-col gap-2 absolute bottom-2 right-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView();
              }}
              aria-label="Quick view"
            >
              <EyeIcon className="text-gray-900 w-4 h-4" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={product.stock <= 0}
              className={`p-2 rounded-full shadow-md transition-all duration-300 ${
                product.stock <= 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : isInCart(product.id)
                  ? "bg-green-500"
                  : "bg-black"
              }`}
              onClick={handleAddToCart}
              aria-label={isInCart(product.id) ? "In cart" : "Add to cart"}
            >
              {isInCart(product.id) ? (
                <ShoppingBagSolid className="text-white w-4 h-4" />
              ) : (
                <ShoppingBagIcon className="text-white w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Wishlist button */}
        <div className="absolute top-2 right-2">
          <WishlistButton product={product} />
        </div>
      </div>

      {/* Product Info */}
      <Link href={`/product_details?id=${product.id}`}>
        <div className="p-3 sm:p-4">
          {product.brand && (
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              {product.brand}
            </p>
          )}

          <h3 className="text-sm sm:text-base font-medium text-gray-800 mb-1 line-clamp-1 hover:text-primary transition-colors">
            {product.name}
          </h3>

          {product.subcategory && (
            <p className="text-xs text-gray-500 mb-2">{product.subcategory}</p>
          )}

          <div className="flex items-center justify-between mt-2">
            <PriceWithDiscount
              originalPrice={discountInfo.originalPrice}
              finalPrice={discountInfo.finalPrice}
              isActive={discountInfo.isActive}
            />
            {/* Ratings placeholder */}
          </div>
          {discountInfo.isActive && discountInfo.savingsText && (
            <div className="mt-1">
              <SavingsBadge savingsText={discountInfo.savingsText} />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { EyeIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { ShoppingBagIcon as ShoppingBagSolid } from "@heroicons/react/24/solid";
import WishlistButton from "./WishlistButton";
import { formatPrice } from "@/utils/formatters";
import { useShoppingContext } from "@/context/ShoppingContext";
import { Product } from "@/types";

type ProductCardProps = {
  product: Product;
  onQuickView: () => void;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart, isInCart } = useShoppingContext();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {/* Product Image */}
      <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden">
        <Link href={`/product/${product.id}`}>
          <div className="w-full h-full relative cursor-pointer">
            <Image
              src={product.imageUrl || product.images[0] || "/placeholder.png"}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              priority
            />

            {/* Out of stock badge (subtle) */}
            {product.stock <= 0 && (
              <div className="absolute top-3 left-3">
                <span className="inline-block bg-white/85 text-red-600 border border-red-100 px-3 py-1 rounded-md font-medium shadow-sm">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Sale tag - you can add this if you have sale prices */}
            {/* {product.salePrice && product.salePrice < product.price && (
              <div className="absolute top-2 left-2">
                <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  SALE
                </div>
              </div>
            )} */}
          </div>
        </Link>

        {/* Quick actions overlay (no dark background) */}
        <div className="absolute inset-0 bg-transparent transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
          <div className="flex space-x-2 bg-white/60 backdrop-blur-sm rounded-full p-2 shadow-sm">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white p-3 rounded-full shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView();
              }}
              aria-label="Quick view"
            >
              <EyeIcon className="text-gray-700 w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              disabled={product.stock <= 0}
              className={`p-3 rounded-full shadow-md ${
                product.stock <= 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : isInCart(product.id)
                  ? "bg-green-500"
                  : "bg-primary"
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
        </div>

        {/* Wishlist button */}
        <div className="absolute top-2 right-2">
          <WishlistButton product={product} />
        </div>
      </div>

      {/* Product Info */}
      <Link href={`/product/${product.id}`}>
        <div className="p-4">
          {product.brand && (
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              {product.brand}
            </p>
          )}

          <h3 className="font-medium text-gray-800 mb-1 line-clamp-1 hover:text-primary transition-colors">
            {product.name}
          </h3>

          {product.subcategory && (
            <p className="text-xs text-gray-500 mb-2">{product.subcategory}</p>
          )}

          <div className="flex items-center justify-between mt-2">
            <p className="text-primary font-semibold">
              {formatPrice(product.price)}
            </p>

            {/* You can add star ratings here if available */}
            {/* <div className="flex items-center">
              <StarIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-600 ml-1">4.5</span>
            </div> */}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useShoppingContext } from "@/context/ShoppingContext";
import { formatPrice } from "@/utils/formatters";
import WishlistButton from "./WishlistButton";
import { Product } from "@/types";

type ProductQuickViewProps = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
};

const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addToCart } = useShoppingContext();

  if (!product) return null;

  const handleAddToCart = async () => {
    await addToCart(product.id, quantity);
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };

  const displayImages =
    product.images.length > 0 ? product.images : [product.imageUrl];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (soft translucent with blur) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-white/30 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-1 rounded-full bg-white shadow-md hover:bg-gray-100"
                aria-label="Close"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row">
                {/* Product images */}
                <div className="w-full md:w-1/2 relative">
                  {/* Main image */}
                  <div className="relative w-full aspect-square bg-gray-100">
                    <Image
                      src={
                        displayImages[selectedImageIndex] || "/placeholder.png"
                      }
                      alt={product.name}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain"
                    />

                    {/* Wishlist button */}
                    <div className="absolute top-4 right-16">
                      <WishlistButton product={product} />
                    </div>
                  </div>

                  {/* Thumbnail images */}
                  {displayImages.length > 1 && (
                    <div className="flex p-2 gap-2 overflow-x-auto">
                      {displayImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => handleImageSelect(index)}
                          className={`relative w-16 h-16 border-2 rounded ${
                            selectedImageIndex === index
                              ? "border-primary"
                              : "border-transparent"
                          }`}
                        >
                          <Image
                            src={image || "/placeholder.png"}
                            alt={`${product.name} - image ${index + 1}`}
                            fill
                            sizes="64px"
                            className="object-cover rounded"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product details */}
                <div className="w-full md:w-1/2 p-6 overflow-y-auto max-h-[90vh] md:max-h-[unset]">
                  {product.brand && (
                    <p className="text-sm text-gray-500 uppercase">
                      {product.brand}
                    </p>
                  )}
                  <h2 className="text-2xl font-semibold mt-1">
                    {product.name}
                  </h2>

                  <p className="text-xl font-bold text-primary my-3">
                    {formatPrice(product.price)}
                  </p>

                  <div className="space-y-4 mt-6">
                    {/* Stock status */}
                    <div className="flex items-center">
                      <span className="text-sm">Availability:</span>
                      {product.stock > 0 ? (
                        <span className="ml-2 text-sm text-green-600 font-medium">
                          In Stock ({product.stock} items)
                        </span>
                      ) : (
                        <span className="ml-2 text-sm text-red-600 font-medium">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Category */}
                    {(product.category || product.mainCategory) && (
                      <div className="flex items-center text-sm">
                        <span>Category:</span>
                        <span className="ml-2 font-medium">
                          {product.mainCategory || product.category}
                          {product.subcategory && ` / ${product.subcategory}`}
                        </span>
                      </div>
                    )}

                    {/* Short description */}
                    <div className="mt-4">
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {product.description}
                      </p>
                    </div>

                    {/* Quantity selector */}
                    {product.stock > 0 && (
                      <div className="mt-6">
                        <p className="text-sm mb-2">Quantity:</p>
                        <div className="flex items-center border rounded-md w-32">
                          <button
                            onClick={decrementQuantity}
                            disabled={quantity <= 1}
                            className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="flex-grow text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={incrementQuantity}
                            disabled={quantity >= product.stock}
                            className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      <button
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md ${
                          product.stock <= 0
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-primary hover:bg-primary/90 text-white"
                        }`}
                      >
                        <ShoppingBagIcon className="w-5 h-5" />
                        Add to Cart
                      </button>

                      <Link
                        href={`/product_details?id=${product.id}`}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md border border-primary text-primary hover:text-white transition-colors"
                      >
                        View Details
                        <ArrowRightIcon className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductQuickView;

"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import type { WomenProduct } from "./ProductCard";

// Watch product data for women's mobile
export const PRODUCTS: WomenProduct[] = [
  {
    id: "1",
    name: "MAK Elegance Rose",
    subtitle: "Feminine Grace",
    price: "₹14,999",
    originalPrice: "₹17,999",
    image: "/watches/item-card-image-1.png",
    subcategory: "Elegant",
    features: ["Rose Gold", "Sapphire Crystal"],
    discount: "17% OFF",
  },
  {
    id: "2",
    name: "MAK Luxury Diamond",
    subtitle: "Premium Collection",
    price: "₹55,999",
    originalPrice: "₹65,999",
    image: "/watches/item-card-image-2.png",
    subcategory: "Luxury",
    features: ["Diamond Studded", "18K Gold"],
    discount: "15% OFF",
  },
  {
    id: "3",
    name: "MAK Sport Active",
    subtitle: "Fitness Companion",
    price: "₹22,999",
    originalPrice: "₹27,999",
    image: "/watches/item-card-image-3.png",
    subcategory: "Sports",
    features: ["Fitness Tracking", "Water Resistant"],
    discount: "18% OFF",
  },
  {
    id: "4",
    name: "MAK Classic Pearl",
    subtitle: "Timeless Beauty",
    price: "₹18,999",
    originalPrice: "₹23,999",
    image: "/watches/item-card-image-4.png",
    subcategory: "Classic",
    features: ["Pearl Dial", "Leather Strap"],
    discount: "21% OFF",
  },
  {
    id: "5",
    name: "MAK Smart Elite",
    subtitle: "Connected Lifestyle",
    price: "₹26,999",
    originalPrice: "₹32,999",
    image: "/watches/item-card-image-5.png",
    subcategory: "Smart",
    features: ["Health Monitoring", "Bluetooth"],
    discount: "18% OFF",
  },
  {
    id: "6",
    name: "MAK Fashion Trend",
    subtitle: "Style Statement",
    price: "₹12,999",
    originalPrice: "₹15,999",
    image: "/watches/item-card-image-1.png",
    subcategory: "Fashion",
    features: ["Interchangeable Strap", "Fashion Design"],
    discount: "19% OFF",
  },
];

interface ProductCardMobileProps {
  product: WomenProduct;
  index?: number;
}

export default function ProductCardMobile({
  product,
  index = 0,
}: ProductCardMobileProps) {
  const content = (
    <motion.div
      className="group relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileTap={{ scale: 0.95 }}
      style={{
        minWidth: "280px",
        maxWidth: "280px",
        flexShrink: 0,
      }}
    >
      {/* Discount Badge */}
      {product.discount && (
        <div className="absolute top-3 left-3 z-20">
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
            {product.discount}
          </div>
        </div>
      )}

      {/* Wishlist Button */}
      <div className="absolute top-3 right-3 z-20">
        <motion.button
          className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md"
          whileTap={{ scale: 0.9 }}
        >
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </motion.button>
      </div>

      {/* Product Image */}
      <div className="relative h-48 bg-gradient-to-br from-rose-50 to-pink-50 overflow-hidden">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-110 p-3"
            sizes="280px"
          />
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 space-y-3">
        {/* Category & Rating */}
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
            {product.subcategory}
          </span>
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-2.5 h-2.5 text-rose-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
        </div>

        {/* Product Name */}
        <div>
          <h3 className="text-base font-bold text-gray-900 leading-tight">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{product.subtitle}</p>
        </div>

        {/* Features */}
        {product.features && (
          <div className="flex flex-wrap gap-1">
            {product.features.slice(0, 2).map((feature, idx) => (
              <span
                key={idx}
                className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              {product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {product.originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-2.5 rounded-lg font-medium text-sm
          hover:from-rose-600 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg"
          whileTap={{ scale: 0.98 }}
        >
          Add to Cart
        </motion.button>
      </div>

      {/* Border glow effect */}
      <div className="absolute inset-0 rounded-xl border border-transparent bg-gradient-to-r from-rose-200 via-transparent to-pink-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );

  return product.id ? (
    <Link href={`/product_details?id=${product.id}`} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}

// Mobile Grid Component for Women
export function ProductGridMobile({
  products = PRODUCTS,
}: {
  products?: typeof PRODUCTS;
}) {
  return (
    <section className="py-8 px-4 bg-gradient-to-b from-rose-50 to-white">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Women&apos;s Collection
          </h2>
          <p className="text-sm text-gray-600">
            Elegant timepieces for every occasion
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="space-y-4">
          {products.map((product, index) => (
            <ProductCardMobile
              key={product.id}
              product={product}
              index={index}
            />
          ))}
        </div>

        {/* View More Button */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Link
            href="/women/shop"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-full font-medium text-sm hover:from-rose-600 hover:to-pink-700 transition-all duration-300 shadow-lg"
          >
            View All Products
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

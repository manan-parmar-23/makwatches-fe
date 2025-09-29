"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

// Watch product data
export const PRODUCTS = [
  {
    id: "1",
    name: "MAK Classic Heritage",
    subtitle: "Timeless Elegance",
    price: "₹12,999",
    originalPrice: "₹15,999",
    image: "/watches/item-card-image-1.png",
    subcategory: "Classic",
    features: ["Swiss Movement", "Water Resistant", "Leather Strap"],
    discount: "25% OFF",
  },
  {
    id: "2",
    name: "MAK Sport Pro",
    subtitle: "Athletic Performance",
    price: "₹18,999",
    originalPrice: "₹22,999",
    image: "/watches/item-card-image-2.png",
    subcategory: "Sports",
    features: ["Chronograph", "Titanium Case", "Rubber Strap"],
    discount: "17% OFF",
  },
  {
    id: "3",
    name: "MAK Luxury Gold",
    subtitle: "Premium Collection",
    price: "₹45,999",
    originalPrice: "₹52,999",
    image: "/watches/item-card-image-3.png",
    subcategory: "Luxury",
    features: ["Gold Plated", "Sapphire Crystal", "Automatic"],
    discount: "13% OFF",
  },
  {
    id: "4",
    name: "MAK Smart Elite",
    subtitle: "Digital Innovation",
    price: "₹24,999",
    originalPrice: "₹29,999",
    image: "/watches/item-card-image-4.png",
    subcategory: "Smart",
    features: ["GPS Tracking", "Heart Rate", "Bluetooth"],
    discount: "17% OFF",
  },
  {
    id: "5",
    name: "MAK Casual Style",
    subtitle: "Everyday Comfort",
    price: "₹8,999",
    originalPrice: "₹11,999",
    image: "/watches/item-card-image-5.png",
    subcategory: "Casual",
    features: ["Quartz Movement", "Stainless Steel", "Date Display"],
    discount: "25% OFF",
  },
  {
    id: "6",
    name: "MAK Executive",
    subtitle: "Business Class",
    price: "₹32,999",
    originalPrice: "₹38,999",
    image: "/watches/item-card-image-1.png",
    subcategory: "Luxury",
    features: ["Automatic Movement", "Ceramic Bezel", "Power Reserve"],
    discount: "15% OFF",
  },
];

interface ProductCardProps {
  product: (typeof PRODUCTS)[0];
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <motion.div
      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Discount Badge */}
      {product.discount && (
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            {product.discount}
          </div>
        </div>
      )}

      {/* Wishlist Button */}
      <div className="absolute top-4 right-4 z-20">
        <motion.button
          className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors"
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
      <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain transition-transform duration-500 group-hover:scale-110 p-4"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Overlay on hover */}
        <motion.div
          className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            <span className="text-gray-900 font-medium">Quick View</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Product Details */}
      <div className="p-6 space-y-4">
        {/* Category */}
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
            {product.subcategory}
          </span>
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

        {/* Product Name */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600">{product.subtitle}</p>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2">
          {product.features.slice(0, 2).map((feature, idx) => (
            <span
              key={idx}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">
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
          className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-3 rounded-xl font-medium 
          hover:from-black hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Add to Cart
        </motion.button>
      </div>

      {/* Elegant border glow effect */}
      <div className="absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-gray-200 via-transparent to-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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

// Professional Grid Component
export function ProductGrid({
  products = PRODUCTS,
}: {
  products?: typeof PRODUCTS;
}) {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Premium Men&apos;s Collection
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our curated selection of luxury timepieces designed for the
            modern gentleman
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* View More Button */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Link
            href="/men/shop"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-900 to-black text-white px-8 py-4 rounded-full font-medium hover:from-black hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            View All Products
            <svg
              className="w-5 h-5"
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

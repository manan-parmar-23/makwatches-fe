import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { EyeIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";

type ProductCardProps = {
  product: {
    id?: string;
    name?: string;
    price?: string | number;
    image?: string;
    description?: string;
    subcategory?: string | null;
  };
  onClick: () => void;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
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

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white p-3 rounded-full shadow-md mx-1"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            aria-label="Quick view"
          >
            <EyeIcon className="text-gray-700 w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary p-3 rounded-full shadow-md mx-1"
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

      {/* Product Info */}
      <div className="p-4" onClick={onClick}>
        <h3 className="font-medium text-gray-800 mb-1 line-clamp-1">
          {product.name}
        </h3>

        {product.subcategory && (
          <p className="text-xs text-gray-500 mb-2">{product.subcategory}</p>
        )}

        <p className="text-primary font-semibold">
          ₹{typeof product.price === "number" ? product.price : product.price}
        </p>
      </div>
    </motion.div>
  );
};

export default ProductCard;

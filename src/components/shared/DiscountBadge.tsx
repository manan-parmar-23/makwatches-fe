"use client";
import React from "react";
import { motion } from "framer-motion";
import { TagIcon, SparklesIcon } from "@heroicons/react/24/outline";

interface DiscountBadgeProps {
  discountPercentage?: number;
  position?: "top-left" | "top-right" | "inline";
  size?: "sm" | "md" | "lg";
  variant?: "default" | "premium" | "minimal";
}

const DiscountBadge: React.FC<DiscountBadgeProps> = ({
  discountPercentage,
  position = "top-right",
  size = "md",
  variant = "default",
}) => {
  if (!discountPercentage || discountPercentage <= 0) return null;

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const positionClasses = {
    "top-left": "absolute top-3 left-3 z-10",
    "top-right": "absolute top-3 right-3 z-10",
    inline: "inline-flex",
  };

  if (variant === "premium") {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className={`${positionClasses[position]} flex items-center gap-1.5 font-bold rounded-lg shadow-xl backdrop-blur-sm ${sizeClasses[size]}`}
        style={{
          background: "linear-gradient(135deg, #D4AF37 0%, #F4CD68 100%)",
          color: "#0F0F0F",
        }}
      >
        <SparklesIcon className={iconSizeClasses[size]} />
        <span>{Math.round(discountPercentage)}% OFF</span>
      </motion.div>
    );
  }

  if (variant === "minimal") {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`${positionClasses[position]} flex items-center gap-1 font-semibold rounded-md ${sizeClasses[size]}`}
        style={{
          backgroundColor: "#006400",
          color: "#FFFFFF",
        }}
      >
        <span>{Math.round(discountPercentage)}%</span>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, rotate: -3 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className={`${positionClasses[position]} flex items-center gap-1.5 font-bold rounded-lg shadow-lg ${sizeClasses[size]}`}
      style={{
        backgroundColor: "#B00020",
        color: "#FFFFFF",
      }}
    >
      <TagIcon className={iconSizeClasses[size]} />
      <span>{Math.round(discountPercentage)}% OFF</span>
    </motion.div>
  );
};

export default DiscountBadge;

interface PriceWithDiscountProps {
  originalPrice: number;
  finalPrice: number;
  isActive: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const PriceWithDiscount: React.FC<PriceWithDiscountProps> = ({
  originalPrice,
  finalPrice,
  isActive,
  className = "",
  size = "md",
}) => {
  const priceSizeClasses = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  const originalSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  if (!isActive || originalPrice === finalPrice) {
    return (
      <p
        className={`${priceSizeClasses[size]} font-bold text-gray-900 ${className}`}
      >
        ₹{originalPrice.toLocaleString("en-IN")}
      </p>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <p className={`${priceSizeClasses[size]} font-bold text-gray-900`}>
        ₹{finalPrice.toLocaleString("en-IN")}
      </p>
      <p
        className={`${originalSizeClasses[size]} font-medium text-gray-500 line-through`}
      >
        ₹{originalPrice.toLocaleString("en-IN")}
      </p>
    </div>
  );
};

interface SavingsBadgeProps {
  savingsText: string;
  className?: string;
}

export const SavingsBadge: React.FC<SavingsBadgeProps> = ({
  savingsText,
  className = "",
}) => {
  if (!savingsText) return null;

  return (
    <motion.span
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${className}`}
      style={{
        backgroundColor: "#006400" + "20",
        color: "#006400",
      }}
    >
      <SparklesIcon className="w-3 h-3" />
      {savingsText}
    </motion.span>
  );
};

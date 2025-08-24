"use client";

import React, { useState, useEffect } from "react";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useShoppingContext } from "@/context/ShoppingContext";
import { Product } from "@/types";

type WishlistButtonProps = {
  product: Product;
  className?: string;
};

const WishlistButton: React.FC<WishlistButtonProps> = ({
  product,
  className = "",
}) => {
  const { addToWishlist, removeFromWishlist, isInWishlist, wishlist } =
    useShoppingContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  // Find the wishlist item id if the product is in the wishlist
  const getWishlistItemId = (): string | undefined => {
    const wishlistItem = wishlist.find((item) => item.productId === product.id);
    return wishlistItem?.id;
  };

  useEffect(() => {
    setInWishlist(isInWishlist(product.id));
  }, [isInWishlist, product.id, wishlist]);

  const toggleWishlist = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      if (inWishlist) {
        const wishlistItemId = getWishlistItemId();
        if (wishlistItemId) {
          await removeFromWishlist(wishlistItemId);
        }
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={isProcessing}
      className={`transition-all duration-300 ${className}`}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      {inWishlist ? (
        <HeartIconSolid className="w-6 h-6 text-red-500" />
      ) : (
        <HeartIcon className="w-6 h-6" />
      )}
    </button>
  );
};

export default WishlistButton;

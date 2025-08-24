"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { CartItem, WishlistItem } from "@/types";
import { cartApi, wishlistApi } from "@/services/api";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface ShoppingContextProps {
  cart: CartItem[];
  wishlist: WishlistItem[];
  cartTotal: number;
  cartCount: number;
  wishlistCount: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  isInCart: (productId: string) => boolean;
  isInWishlist: (productId: string) => boolean;
}

const ShoppingContext = createContext<ShoppingContextProps | undefined>(
  undefined
);

export const ShoppingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const userId = user?.id ?? null;

  // Fetch cart and wishlist data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (userId) {
          // Fetch cart
          const cartResponse = await cartApi.getCart(userId);
          if (cartResponse.success) {
            setCart(cartResponse.data.items);
            setCartTotal(cartResponse.data.total);
          }
          // Fetch wishlist (authenticated endpoint)
          const wishlistResponse = await wishlistApi.getWishlist();
          if (wishlistResponse.success) {
            setWishlist(wishlistResponse.data);
          }
        }
      } catch (error) {
        console.error("Error fetching shopping data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  // Add to cart
  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      if (!userId) {
        toast.error("Please login to add items to your cart");
        return;
      }

      const response = await cartApi.addToCart(productId, quantity);
      if (response.success) {
        // Refetch cart after adding item
        const cartResponse = await cartApi.getCart(userId);
        if (cartResponse.success) {
          setCart(cartResponse.data.items);
          setCartTotal(cartResponse.data.total);
          toast.success("Item added to cart");
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };

  // Remove from cart
  const removeFromCart = async (productId: string) => {
    try {
      if (!userId) return;

      const response = await cartApi.removeFromCart(userId, productId);
      if (response.success) {
        // Refetch cart after removing item
        const cartResponse = await cartApi.getCart(userId);
        if (cartResponse.success) {
          setCart(cartResponse.data.items);
          setCartTotal(cartResponse.data.total);
          toast.success("Item removed from cart");
        }
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove item from cart");
    }
  };

  // Add to wishlist
  const addToWishlist = async (productId: string) => {
    try {
      if (!userId) {
        toast.error("Please login to add items to your wishlist");
        return;
      }

      const response = await wishlistApi.addToWishlist(productId);
      if (response.success) {
        // Refetch wishlist after adding item
        const wishlistResponse = await wishlistApi.getWishlist();
        if (wishlistResponse.success) {
          setWishlist(wishlistResponse.data);
          toast.success("Item added to wishlist");
        }
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Failed to add item to wishlist");
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (itemId: string) => {
    try {
      const response = await wishlistApi.removeFromWishlist(itemId);
      if (response.success) {
        // Refetch wishlist after removing item
        const wishlistResponse = await wishlistApi.getWishlist();
        if (wishlistResponse.success) {
          setWishlist(wishlistResponse.data);
          toast.success("Item removed from wishlist");
        }
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove item from wishlist");
    }
  };

  // Check if product is in cart
  const isInCart = (productId: string): boolean => {
    return cart.some((item) => item.productId === productId);
  };

  // Check if product is in wishlist
  const isInWishlist = (productId: string): boolean => {
    return wishlist.some((item) => item.productId === productId);
  };

  // Calculate cart count
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Calculate wishlist count
  const wishlistCount = wishlist.length;

  const value = {
    cart,
    wishlist,
    cartTotal,
    cartCount,
    wishlistCount,
    isLoading,
    addToCart,
    removeFromCart,
    addToWishlist,
    removeFromWishlist,
    isInCart,
    isInWishlist,
  };

  return (
    <ShoppingContext.Provider value={value}>
      {children}
    </ShoppingContext.Provider>
  );
};

export const useShoppingContext = () => {
  const context = useContext(ShoppingContext);
  if (context === undefined) {
    throw new Error(
      "useShoppingContext must be used within a ShoppingProvider"
    );
  }
  return context;
};

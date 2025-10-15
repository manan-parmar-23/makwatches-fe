"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Heart,
  ArrowLeft,
  AlertCircle,
  Package,
  Share2,
  X,
  Check,
  Copy,
} from "lucide-react";

interface CartProduct {
  id?: string; // product id (hex) from backend
  name?: string;
  price?: number;
  images?: string[];
  brand?: string;
  mainCategory?: string;
}

interface CartItem {
  id: string; // cart item id
  productId: string;
  quantity: number;
  product?: CartProduct;
  size?: string;
}

interface CartResponse {
  items: CartItem[];
  total: number;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://api.makwatches.in";

// Color constants
const COLORS = {
  primary: "#1A1A1A",
  primaryDark: "#000000",
  primaryLight: "#232323",
  accent: "#C6A664",
  secondary: "#F5F5F5",
  background: "#FFFFFF",
  surface: "#F5F5F5",
  surfaceLight: "#E5E5E5",
  text: "#262626",
  textMuted: "#737373",
  error: "#EF4444",
  success: "#22C55E",
  inputBg: "#FAFAFA",
  inputBorder: "#E5E5E5",
  inputFocus: "#C6A664",
};

// Utility to resolve any token (customer/admin) for auth calls
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("customerToken") ||
    localStorage.getItem("adminToken") ||
    sessionStorage.getItem("adminAuthToken") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("authToken") ||
    null
  );
}

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartResponse>({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${API_BASE}/cart/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to load cart");
      const data = json.data as { items?: unknown[]; total?: number };
      type RawProduct = {
        id?: string;
        _id?: string;
        name?: string;
        price?: number;
        images?: string[];
        brand?: string;
        mainCategory?: string;
      };
      type RawCartItem = {
        id?: string;
        _id?: string;
        productId?: string;
        product_id?: string;
        ProductID?: string;
        quantity?: number;
        product?: RawProduct;
      };
      const items: CartItem[] = (data.items || []).map((raw): CartItem => {
        const ci = raw as RawCartItem;
        const prod = ci.product as RawProduct | undefined;
        return {
          id: ci.id || ci._id || "",
          productId: ci.productId || ci.product_id || ci.ProductID || "",
          quantity: ci.quantity || 1,
          product: prod && {
            id: prod.id || prod._id,
            name: prod.name,
            price: prod.price,
            images: prod.images,
            brand: prod.brand,
            mainCategory: prod.mainCategory,
          },
        };
      });
      setCart({
        items,
        total: typeof data.total === "number" ? data.total : 0,
      });
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e && "message" in e
          ? (e as { message?: string }).message
          : undefined;
      setError(msg || "Error loading cart");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return; // wait for auth
    if (user) fetchCart();
    else {
      setLoading(false);
    }
  }, [authLoading, user, fetchCart]);

  async function updateQuantity(productId: string, delta: number) {
    const item = cart.items.find((i) => i.productId === productId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty < 1) {
      // treat as removal
      return removeItem(productId);
    }
    try {
      setUpdating(productId);
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      if (delta > 0) {
        // Simple increment: send the positive delta to AddToCart, then refresh from server to reflect discounts
        const res = await fetch(`${API_BASE}/cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId, quantity: delta }),
        });
        const json = await res.json();
        if (!res.ok || !json.success)
          throw new Error(json.message || "Failed to update");
        await fetchCart();
      } else if (delta < 0) {
        // Decrement: backend lacks decrease endpoint. Workaround:
        // 1. Remove item
        // 2. Re-add with newQty
        const delRes = await fetch(
          `${API_BASE}/cart/${user!.id}/${productId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const delJson = await delRes.json();
        if (!delRes.ok || !delJson.success)
          throw new Error(delJson.message || "Failed to adjust item");
        const addRes = await fetch(`${API_BASE}/cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId, quantity: newQty }),
        });
        const addJson = await addRes.json();
        if (!addRes.ok || !addJson.success)
          throw new Error(addJson.message || "Failed to set quantity");
        // Refresh cart from server to avoid drift
        await fetchCart();
      }
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e && "message" in e
          ? (e as { message?: string }).message
          : undefined;
      setError(msg || "Failed to update quantity");
    } finally {
      setUpdating(null);
    }
  }

  async function removeItem(productId: string) {
    const item = cart.items.find((i) => i.productId === productId);
    if (!item || !user) return;
    if (!confirm("Remove this item from cart?")) return;
    try {
      setRemoving(productId);
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${API_BASE}/cart/${user.id}/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to remove");
      setCart((prev) => {
        const items = prev.items.filter((ci) => ci.productId !== productId);
        const total = items.reduce(
          (sum, ci) => sum + (ci.product?.price || 0) * ci.quantity,
          0
        );
        return { items, total };
      });
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e && "message" in e
          ? (e as { message?: string }).message
          : undefined;
      setError(msg || "Failed to remove item");
    } finally {
      setRemoving(null);
    }
  }

  // Save item to wishlist and remove from cart (move-to-wishlist behaviour)
  async function saveForLater(productId: string) {
    if (!user) return setError("Please login to save items");
    try {
      setSaving(productId);
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      // Add to wishlist
      const res = await fetch(`${API_BASE}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to save to wishlist");

      // Remove from cart (best-effort). Backend cart delete requires user id.
      try {
        const delRes = await fetch(`${API_BASE}/cart/${user.id}/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const delJson = await delRes.json();
        if (!delRes.ok || !delJson.success) {
          // If delete failed, refresh cart from server to avoid drift
          await fetchCart();
        } else {
          // Optimistically remove locally
          setCart((prev) => {
            const items = prev.items.filter((ci) => ci.productId !== productId);
            const total = items.reduce(
              (sum, ci) => sum + (ci.product?.price || 0) * ci.quantity,
              0
            );
            return { items, total };
          });
        }
      } catch {
        // ignore and refresh
        await fetchCart();
      }

      // Inform user
      // Using alert to keep changes minimal; could be replaced by a toast
      alert(json.message || "Saved to wishlist");
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e && "message" in e
          ? (e as { message?: string }).message
          : undefined;
      setError(msg || "Failed to save item");
    } finally {
      setSaving(null);
    }
  }

  // Removed unused subtotal variable
  // Derived amounts for displaying discount in summary
  const originalSubtotal = cart.items.reduce(
    (sum, ci) => sum + (ci.product?.price || 0) * ci.quantity,
    0
  );
  const discountTotal = Math.max(0, originalSubtotal - cart.total);

  // Placeholder recommendations (could wire to /recommendations when implemented)
  const recommendations = (
    cart.items[0]?.product?.images || [
      "/tshirt1.png",
      "/tshirt2.png",
      "/tshirt3.png",
    ]
  ).slice(0, 5);

  // Share functionality: try native share first, otherwise fallback to modal
  const handleShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "My Cart - MakWatches",
          text: `My cart — ${cart.items.length} item${
            cart.items.length !== 1 ? "s" : ""
          } worth ₹${cart.total.toFixed(2)}`,
          url: typeof window !== "undefined" ? window.location.href : undefined,
        });
        // success or user accepted share; do not open modal
        return;
      } catch (error) {
        // user cancelled or an error occurred — fall back to modal
        console.debug("Share failed or cancelled:", error);
      }
    }
    setShareModalOpen(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <rect width="24" height="24" rx="6" fill="#25D366" />
          <path
            d="M7.5 12.5c.4 2.1 2.1 3.7 4.2 3.9.3 0 .6 0 .9-.1l1.6.6-.5-1.6c.2-.3.4-.7.5-1.1.1-2.1-1.2-4.1-3.2-4.8-.8-.3-1.6-.3-2.4 0-.8.3-1.4.9-1.8 1.6-.2.3-.2.6-.3.9z"
            fill="#fff"
          />
        </svg>
      ),
      color: "#25D366",
      action: () => {
        const text = encodeURIComponent(
          `Check out my cart! ${
            cart.items.length
          } items for ₹${cart.total.toFixed(2)}/-`
        );
        window.open(
          `https://wa.me/?text=${text}%20${encodeURIComponent(
            window.location.href
          )}`,
          "_blank"
        );
      },
    },
    {
      name: "Facebook",
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <rect width="24" height="24" rx="6" fill="#1877F2" />
          <path
            d="M14.5 8.5h1.9v-2.1c-.4-.1-1-.2-1.9-.2-1.9 0-3.2 1.2-3.2 3.4v1.9H9.7v2.3h1.6V20h2.4v-7.9h1.8l.6-2.3h-2.4V9.1c0-.6.2-1 1-1z"
            fill="#fff"
          />
        </svg>
      ),
      color: "#1877F2",
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            window.location.href
          )}`,
          "_blank"
        );
      },
    },
    {
      name: "Twitter",
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <rect width="24" height="24" rx="6" fill="#1DA1F2" />
          <path
            d="M18 8.6c-.5.2-1 .3-1.6.4.6-.4 1-1 1.2-1.8-.6.4-1.3.7-2.1.9-.6-.6-1.5-1-2.4-1-1.8 0-3.1 1.6-2.8 3.2-2.3-.1-4.3-1.2-5.6-2.8-.8 1.4-.4 3.1 1 4- .4 0-.8-.1-1.2-.3 0 1.4 1 2.6 2.4 2.9-.4.1-.8.1-1.2.1-.3 0-.6 0-.9-.1.6 1.8 2.5 3.1 4.7 3.1-1.7 1.3-3.8 2.1-6.1 2.1-.4 0-.8 0-1.2-.1 2.2 1.4 4.8 2.2 7.6 2.2 9.1 0 14.1-7.5 14.1-14.1v-.6c1-.7 1.8-1.6 2.5-2.6-.9.4-1.8.7-2.8.8 1-.6 1.7-1.5 2-2.6-.9.5-1.9.9-3 1.1z"
            fill="#fff"
          />
        </svg>
      ),
      color: "#1DA1F2",
      action: () => {
        const text = encodeURIComponent(
          `Check out my cart with ${cart.items.length} awesome items!`
        );
        window.open(
          `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(
            window.location.href
          )}`,
          "_blank"
        );
      },
    },
    {
      name: "Email",
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <rect width="24" height="24" rx="6" fill="#EA4335" />
          <path
            d="M6 8.5l6 4 6-4V17a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8.5z"
            fill="#fff"
          />
          <path d="M6 7h12v.9L12 12 6 7.9V7z" fill="#fff" />
        </svg>
      ),
      color: "#EA4335",
      action: () => {
        const subject = encodeURIComponent("Check out my cart!");
        const body = encodeURIComponent(
          `I found ${cart.items.length} items for ₹${cart.total.toFixed(
            0
          )}/- that you might like!\n\n${window.location.href}`
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      },
    },
  ];

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: COLORS.background }}
    >
      <main
        className="container mx-auto px-4 sm:px-6 md:mt-20 mt-10 lg:px-8 py-10 max-w-7xl"
        style={{ color: COLORS.text }}
      >
        {/* Header: compact and informative */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.primary}10` }}
            >
              <ShoppingCart
                className="w-6 h-6"
                style={{ color: COLORS.primary }}
              />
            </div>
            <div>
              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight"
                style={{ color: COLORS.primary }}
              >
                Shopping Cart
              </h1>
              <p
                className="mt-1 text-sm flex items-center gap-2"
                style={{ color: COLORS.textMuted }}
              >
                <Package className="w-4 h-4" />
                {cart.items.length || 0} item
                {cart.items.length !== 1 ? "s" : ""}
                {cart.items.length > 0 && (
                  <>
                    <span>•</span>
                    <span
                      className="font-semibold"
                      style={{ color: COLORS.primary }}
                    >
                      ₹{cart.total.toFixed(2)}/-
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-all hover:scale-105 hover:shadow-md"
            style={{
              backgroundColor: COLORS.surface,
              color: COLORS.text,
            }}
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Continue Shopping
          </Link>
        </div>

        {authLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <div
                className="w-12 h-12 border-3 rounded-full animate-spin"
                style={{
                  borderColor: COLORS.secondary,
                  borderTopColor: COLORS.primary,
                }}
              ></div>
              <span
                className="text-sm font-medium animate-pulse"
                style={{ color: COLORS.textMuted }}
              >
                Loading your cart...
              </span>
            </div>
          </div>
        )}

        {!authLoading && !user && (
          <div className="text-center py-12 sm:py-20 animate-fade-in">
            <div
              className="max-w-md mx-auto p-8 sm:p-10 rounded-3xl shadow-xl border transform transition-all hover:scale-105"
              style={{
                backgroundColor: COLORS.background,
                borderColor: COLORS.inputBorder,
              }}
            >
              <div
                className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${COLORS.primary}10` }}
              >
                <ShoppingCart
                  className="w-10 h-10"
                  style={{ color: COLORS.primary }}
                />
              </div>
              <p
                className="mb-3 text-xl font-bold"
                style={{ color: COLORS.text }}
              >
                Sign in to view your cart
              </p>
              <p className="text-sm mb-8" style={{ color: COLORS.textMuted }}>
                Access your saved items, exclusive prices, and seamless checkout
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  Sign In
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl border font-medium transition-all hover:scale-105 hover:shadow-md"
                  style={{
                    borderColor: COLORS.inputBorder,
                    color: COLORS.text,
                    backgroundColor: COLORS.surface,
                  }}
                >
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        )}

        {user && (
          <>
            {error && (
              <div
                className="mb-6 p-4 rounded-xl border-l-4 flex items-start gap-3 animate-slide-down shadow-sm"
                style={{
                  backgroundColor: `${COLORS.error}08`,
                  borderLeftColor: COLORS.error,
                }}
              >
                <AlertCircle
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  style={{ color: COLORS.error }}
                />
                <div
                  className="text-sm font-medium"
                  style={{ color: COLORS.error }}
                >
                  {error}
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto"
                  style={{ color: COLORS.error }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {loading ? (
              <div className="py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="p-6 rounded-2xl border animate-pulse"
                        style={{
                          backgroundColor: COLORS.background,
                          borderColor: COLORS.inputBorder,
                        }}
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200" />
                          <div className="flex-1 space-y-3">
                            <div className="h-5 w-3/4 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded-lg" />
                            <div className="h-4 w-1/2 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded-lg" />
                            <div className="h-10 w-32 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded-lg mt-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    className="p-8 rounded-2xl border h-fit sticky top-24"
                    style={{
                      borderColor: COLORS.inputBorder,
                      backgroundColor: COLORS.surface,
                    }}
                  >
                    <div className="h-6 w-1/2 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded-lg animate-pulse mb-6" />
                    <div className="h-12 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded-xl animate-pulse" />
                  </div>
                </div>
              </div>
            ) : cart.items.length === 0 ? (
              <div className="py-20 text-center animate-fade-in">
                <div
                  className="max-w-lg mx-auto p-12 rounded-3xl shadow-lg"
                  style={{ backgroundColor: COLORS.surface }}
                >
                  <div
                    className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${COLORS.primary}10` }}
                  >
                    <ShoppingCart
                      className="w-12 h-12"
                      style={{ color: COLORS.textMuted }}
                    />
                  </div>
                  <p
                    className="text-2xl font-bold mb-3"
                    style={{ color: COLORS.text }}
                  >
                    Your cart is empty
                  </p>
                  <p
                    className="text-sm mb-8"
                    style={{ color: COLORS.textMuted }}
                  >
                    Discover amazing products and add them to your cart
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white transition-all hover:scale-105 hover:shadow-xl"
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    <Package className="w-5 h-5" />
                    Start Shopping
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Items list */}
                <div className="lg:col-span-2 space-y-4">
                  {cart.items.map((item) => {
                    const p = item.product;
                    const price = p?.price || 0;
                    return (
                      <div
                        key={item.id + item.productId}
                        className="group p-4 sm:p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
                        style={{
                          backgroundColor: COLORS.background,
                          borderColor: COLORS.inputBorder,
                        }}
                      >
                        {/* Mobile: Column layout, Desktop: Row layout */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
                          {/* Product Image */}
                          <div
                            className="w-32 h-32 sm:w-28 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-white flex items-center justify-center border transition-transform duration-300 group-hover:scale-105"
                            style={{ borderColor: COLORS.inputBorder }}
                          >
                            {p?.images?.[0] ? (
                              <Image
                                src={p.images[0]}
                                alt={p.name || "product"}
                                width={128}
                                height={128}
                                className="object-contain w-full h-full"
                              />
                            ) : (
                              <Package
                                className="w-10 h-10"
                                style={{ color: COLORS.textMuted }}
                              />
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 w-full min-w-0">
                            {/* Title and Price */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
                              <div className="min-w-0 text-center sm:text-left">
                                <h3
                                  className="text-base sm:text-lg font-bold mb-1"
                                  style={{ color: COLORS.text }}
                                >
                                  {p?.name || "Product"}
                                </h3>
                                <div
                                  className="text-xs flex items-center justify-center sm:justify-start gap-2 flex-wrap"
                                  style={{ color: COLORS.textMuted }}
                                >
                                  {p?.brand && <span>{p.brand}</span>}
                                  {p?.brand && p?.mainCategory && (
                                    <span>•</span>
                                  )}
                                  {p?.mainCategory && (
                                    <span>{p.mainCategory}</span>
                                  )}
                                </div>
                              </div>

                              <div className="text-center sm:text-right">
                                <div
                                  className="text-lg sm:text-xl font-bold"
                                  style={{ color: COLORS.primary }}
                                >
                                  ₹{(price * item.quantity).toFixed(2)}
                                </div>
                                <div
                                  className="text-xs"
                                  style={{ color: COLORS.textMuted }}
                                >
                                  ₹{price.toFixed(2)} each
                                </div>
                              </div>
                            </div>

                            {/* Quantity Controls and Actions */}
                            <div className="flex flex-col gap-3">
                              {/* Quantity Counter - Centered on mobile */}
                              <div className="flex justify-center sm:justify-start">
                                <div
                                  className="flex items-center border rounded-xl overflow-hidden shadow-sm"
                                  style={{ borderColor: COLORS.inputBorder }}
                                >
                                  <button
                                    disabled={updating === item.productId}
                                    onClick={() =>
                                      updateQuantity(item.productId, -1)
                                    }
                                    className="px-4 py-2.5 transition-all hover:bg-opacity-80 disabled:opacity-50 active:scale-95"
                                    style={{ backgroundColor: COLORS.surface }}
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <div
                                    className="px-6 py-2.5 bg-white text-sm font-semibold min-w-[60px] text-center"
                                    style={{ color: COLORS.text }}
                                  >
                                    {updating === item.productId
                                      ? "…"
                                      : item.quantity}
                                  </div>
                                  <button
                                    disabled={updating === item.productId}
                                    onClick={() =>
                                      updateQuantity(item.productId, 1)
                                    }
                                    className="px-4 py-2.5 transition-all hover:bg-opacity-80 disabled:opacity-50 active:scale-95"
                                    style={{ backgroundColor: COLORS.surface }}
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Action Buttons - Full width on mobile, inline on desktop */}
                              <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3">
                                <button
                                  onClick={() => saveForLater(item.productId)}
                                  disabled={saving === item.productId}
                                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-50 shadow-sm active:scale-95"
                                  style={{
                                    backgroundColor: COLORS.surface,
                                    color: COLORS.text,
                                  }}
                                  aria-label="Save for later"
                                >
                                  <Heart className="w-4 h-4" />
                                  <span className="hidden sm:inline">
                                    {saving === item.productId
                                      ? "Saving…"
                                      : "Save"}
                                  </span>
                                  <span className="sm:hidden">
                                    {saving === item.productId ? "..." : "Save"}
                                  </span>
                                </button>

                                <button
                                  onClick={() => removeItem(item.productId)}
                                  disabled={removing === item.productId}
                                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-50 shadow-sm active:scale-95"
                                  style={{
                                    color: COLORS.error,
                                    backgroundColor: `${COLORS.error}10`,
                                  }}
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span className="hidden sm:inline">
                                    {removing === item.productId
                                      ? "Removing…"
                                      : "Remove"}
                                  </span>
                                  <span className="sm:hidden">
                                    {removing === item.productId
                                      ? "..."
                                      : "Remove"}
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                <aside className="h-fit sticky top-24">
                  <div
                    className="p-8 rounded-2xl border shadow-lg"
                    style={{
                      backgroundColor: COLORS.surface,
                      borderColor: COLORS.inputBorder,
                    }}
                  >
                    <h3
                      className="text-xl font-bold mb-6"
                      style={{ color: COLORS.text }}
                    >
                      Order Summary
                    </h3>

                    <div className="space-y-4 mb-6 text-sm">
                      <div
                        className="flex justify-between items-center"
                        style={{ color: COLORS.textMuted }}
                      >
                        <span>Subtotal</span>
                        <span
                          className="font-semibold"
                          style={{ color: COLORS.text }}
                        >
                          ₹{originalSubtotal.toFixed(2)}
                        </span>
                      </div>
                      {discountTotal > 0 && (
                        <div
                          className="flex justify-between items-center px-3 py-2 rounded-lg"
                          style={{ backgroundColor: `${COLORS.accent}10` }}
                        >
                          <span style={{ color: COLORS.accent }}>
                            Discount Applied
                          </span>
                          <span
                            className="font-semibold"
                            style={{ color: COLORS.accent }}
                          >
                            -₹{discountTotal.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div
                        className="flex justify-between items-center"
                        style={{ color: COLORS.textMuted }}
                      >
                        <span>Shipping</span>
                        <span className="text-xs">At checkout</span>
                      </div>
                    </div>

                    <div
                      className="border-t pt-6 mb-6"
                      style={{ borderColor: COLORS.inputBorder }}
                    >
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span style={{ color: COLORS.text }}>Total</span>
                        <span style={{ color: COLORS.primary }}>
                          ₹{cart.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => (window.location.href = "/checkout")}
                      className="w-full py-4 rounded-xl text-white font-bold transition-all hover:scale-105 hover:shadow-xl mb-3"
                      style={{ backgroundColor: COLORS.primary }}
                    >
                      Proceed to Checkout
                    </button>

                    <button
                      onClick={handleShare}
                      className="w-full py-3 rounded-xl text-sm font-medium border transition-all hover:scale-105 hover:shadow-md flex items-center justify-center gap-2"
                      style={{
                        borderColor: COLORS.inputBorder,
                        backgroundColor: COLORS.background,
                        color: COLORS.text,
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                      Share Cart
                    </button>

                    <p
                      className="mt-6 text-xs text-center leading-relaxed"
                      style={{ color: COLORS.textMuted }}
                    >
                      Final prices including tax & shipping calculated at
                      checkout
                    </p>
                  </div>
                </aside>
              </div>
            )}

            {/* Recommendations */}
            {cart.items.length > 0 && (
              <section className="mt-16">
                <h2
                  className="text-2xl font-bold mb-6"
                  style={{ color: COLORS.text }}
                >
                  You Might Also Like
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {recommendations.map((img, i) => (
                    <div
                      key={i}
                      className="group rounded-2xl overflow-hidden border transition-all hover:shadow-xl hover:scale-105 cursor-pointer"
                      style={{
                        borderColor: COLORS.inputBorder,
                        backgroundColor: COLORS.background,
                      }}
                    >
                      <div className="aspect-square p-4 flex items-center justify-center bg-white">
                        <Image
                          src={img}
                          alt={`recommendation-${i}`}
                          width={200}
                          height={200}
                          className="object-contain transition-transform group-hover:scale-110"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Share Modal */}
      {shareModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Share cart"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setShareModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg md:max-w-xl lg:max-w-2xl p-6 md:p-8 rounded-2xl shadow-2xl transform animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: COLORS.background }}
          >
            <button
              onClick={() => setShareModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                backgroundColor: COLORS.surface,
                color: COLORS.textMuted,
              }}
              aria-label="Close share dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 mb-6">
              <div className="flex items-center gap-4">
                {/* use app logo; fallback to logo.png if svg missing */}
                <Image
                  src="/logo.svg"
                  alt="MakWatches"
                  className="w-12 h-12 object-contain rounded-md"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/logo.png";
                  }}
                />
                <div>
                  <h3
                    className="text-lg font-bold"
                    style={{ color: COLORS.primary }}
                  >
                    Share Your Cart
                  </h3>
                  <p className="text-sm" style={{ color: COLORS.textMuted }}>
                    Share {cart.items.length} item
                    {cart.items.length !== 1 ? "s" : ""} • ₹
                    {cart.total.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 md:gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium shadow-sm"
                  style={{
                    backgroundColor: copied ? COLORS.success : COLORS.surface,
                    color: copied ? "#fff" : COLORS.text,
                  }}
                  aria-label="Copy cart link"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? "Copied" : "Copy link"}
                </button>
                <button
                  onClick={() => {
                    // open native share if supported
                    if (navigator.share) {
                      navigator
                        .share({
                          title: "My Cart",
                          text: `My cart — ${
                            cart.items.length
                          } items for ₹${cart.total.toFixed(2)}`,
                          url: window.location.href,
                        })
                        .catch(() => {});
                    } else {
                      setShareModalOpen(true); // keep open (no-op)
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border"
                  style={{
                    borderColor: COLORS.inputBorder,
                    backgroundColor: COLORS.surface,
                    color: COLORS.text,
                  }}
                  aria-label="Open system share"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => {
                    option.action();
                    setShareModalOpen(false);
                  }}
                  className="flex flex-col items-center gap-3 p-4 rounded-lg border transition-all hover:scale-105 hover:shadow-md"
                  style={{
                    borderColor: COLORS.inputBorder,
                    backgroundColor: COLORS.surface,
                  }}
                  aria-label={`Share via ${option.name}`}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${option.color}18`,
                    }}
                  >
                    {option.icon}
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: COLORS.text }}
                  >
                    {option.name}
                  </span>
                </button>
              ))}
            </div>

            <div
              className="p-4 rounded-lg border"
              style={{
                borderColor: COLORS.inputBorder,
                backgroundColor: COLORS.surface,
              }}
            >
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: COLORS.text }}
              >
                Shareable link
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  readOnly
                  value={
                    typeof window !== "undefined" ? window.location.href : ""
                  }
                  className="flex-1 px-3 py-2 rounded-lg text-sm border truncate"
                  style={{
                    backgroundColor: COLORS.background,
                    borderColor: COLORS.inputBorder,
                    color: COLORS.textMuted,
                  }}
                  aria-label="Cart link"
                  onFocus={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{
                    backgroundColor: copied ? COLORS.success : COLORS.primary,
                  }}
                  aria-label="Copy link"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
      <style jsx global>{`
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @media (max-width: 640px) {
          /* slightly tighten modal padding on small screens */
          .animate-scale-in {
            transform-origin: center top;
          }
        }
      `}</style>
    </div>
  );
}

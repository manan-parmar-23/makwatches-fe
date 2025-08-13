"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

// Color constants
const COLORS = {
  primary: "#531A1A",
  primaryDark: "#3B1212",
  primaryLight: "#A45A5A",
  secondary: "#BFA5A5",
  background: "#FFFFFF",
  surface: "#F5F5F5",
  surfaceLight: "#E5E5E5",
  text: "#2D1B1B",
  textMuted: "#7C5C5C",
  error: "#B3261E",
  success: "#388E3C",
  inputBg: "#F9F6F6",
  inputBorder: "#BFA5A5",
  inputFocus: "#531A1A",
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
  const [updating, setUpdating] = useState<string | null>(null); // productId while updating qty
  const [removing, setRemoving] = useState<string | null>(null);

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
        // Simple increment: send the positive delta to AddToCart
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
        // Optimistic increment
        setCart((prev) => ({
          ...prev,
          items: prev.items.map((ci) =>
            ci.productId === productId ? { ...ci, quantity: newQty } : ci
          ),
          total: prev.items.reduce((acc, ci) => {
            const price = ci.product?.price || 0;
            const q = ci.productId === productId ? newQty : ci.quantity;
            return acc + price * q;
          }, 0),
        }));
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

  const subtotal = cart.total.toFixed(0) + "/-";

  // Placeholder recommendations (could wire to /recommendations when implemented)
  const recommendations = (
    cart.items[0]?.product?.images || [
      "/tshirt1.png",
      "/tshirt2.png",
      "/tshirt3.png",
    ]
  ).slice(0, 5);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: COLORS.background }}
    >
      <main
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl"
        style={{ color: COLORS.text }}
      >
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wide mb-2"
            style={{ color: COLORS.primary }}
          >
            SHOPPING CART
          </h1>
          <div
            className="w-24 h-1 mx-auto rounded-full"
            style={{ backgroundColor: COLORS.secondary }}
          ></div>
        </div>

        {authLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center space-x-2">
              <div
                className="w-6 h-6 border-2 rounded-full animate-spin"
                style={{
                  borderColor: COLORS.secondary,
                  borderTopColor: COLORS.primary,
                }}
              ></div>
              <span className="text-sm" style={{ color: COLORS.textMuted }}>
                Loading...
              </span>
            </div>
          </div>
        )}

        {!authLoading && !user && (
          <div className="text-center py-12 sm:py-16">
            <div
              className="max-w-md mx-auto p-8 rounded-2xl shadow-lg border"
              style={{
                backgroundColor: COLORS.surface,
                borderColor: COLORS.inputBorder,
              }}
            >
              <div
                className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${COLORS.primary}20` }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: COLORS.primary }}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 4a1 1 0 011-1h8a1 1 0 011 1v1h3a1 1 0 110 2h-1v11a3 3 0 01-3 3H8a3 3 0 01-3-3V7H4a1 1 0 110-2h3V4z" />
                </svg>
              </div>
              <p
                className="mb-6 text-lg font-medium"
                style={{ color: COLORS.text }}
              >
                Please login to view your cart.
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg transform"
                style={{ backgroundColor: COLORS.primary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.primaryDark;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.primary;
                }}
              >
                Login to Continue
              </Link>
            </div>
          </div>
        )}

        {user && (
          <>
            {error && (
              <div
                className="mb-6 p-4 rounded-xl border-l-4 flex items-start space-x-3 animate-pulse"
                style={{
                  backgroundColor: `${COLORS.error}10`,
                  borderLeftColor: COLORS.error,
                  color: COLORS.error,
                }}
              >
                <svg
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            )}

            {loading ? (
              <div className="py-12 text-center">
                <div className="flex justify-center items-center space-x-2">
                  <div
                    className="w-8 h-8 border-2 rounded-full animate-spin"
                    style={{
                      borderColor: COLORS.secondary,
                      borderTopColor: COLORS.primary,
                    }}
                  ></div>
                  <span className="text-lg" style={{ color: COLORS.textMuted }}>
                    Loading cart...
                  </span>
                </div>
              </div>
            ) : cart.items.length === 0 ? (
              <div className="py-16 text-center">
                <div
                  className="max-w-md mx-auto p-8 rounded-2xl"
                  style={{ backgroundColor: COLORS.surface }}
                >
                  <div
                    className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${COLORS.secondary}30` }}
                  >
                    <svg
                      className="w-10 h-10"
                      style={{ color: COLORS.textMuted }}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M7 4a1 1 0 011-1h8a1 1 0 011 1v1h3a1 1 0 110 2h-1v11a3 3 0 01-3 3H8a3 3 0 01-3-3V7H4a1 1 0 110-2h3V4z" />
                    </svg>
                  </div>
                  <p
                    className="text-xl font-medium mb-2"
                    style={{ color: COLORS.text }}
                  >
                    Your cart is empty
                  </p>
                  <p className="text-sm" style={{ color: COLORS.textMuted }}>
                    Add some items to get started
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                  <div className="space-y-1">
                    {cart.items.map((item, index) => {
                      const p = item.product;
                      const price = p?.price || 0;
                      return (
                        <div
                          key={item.id + item.productId}
                          className="p-4 sm:p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg"
                          style={{
                            backgroundColor: COLORS.background,
                            borderColor: COLORS.inputBorder,
                            animationDelay: `${index * 100}ms`,
                          }}
                        >
                          <div className="flex gap-4 sm:gap-6 items-start">
                            <div
                              className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 border rounded-xl overflow-hidden flex items-center justify-center transition-transform duration-300 hover:scale-105"
                              style={{
                                backgroundColor: COLORS.surface,
                                borderColor: COLORS.inputBorder,
                              }}
                            >
                              {p?.images?.[0] && (
                                <Image
                                  src={p.images[0]}
                                  alt={p.name || "product"}
                                  width={96}
                                  height={96}
                                  className="object-contain w-full h-full"
                                />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div
                                className="text-sm sm:text-base font-semibold mb-2 line-clamp-2"
                                style={{ color: COLORS.text }}
                              >
                                {p?.name || "Product"}
                              </div>
                              <div
                                className="text-lg sm:text-xl font-bold mb-2"
                                style={{ color: COLORS.primary }}
                              >
                                ₹{price.toFixed(0)}/-
                              </div>
                              <div
                                className="text-sm mb-4"
                                style={{ color: COLORS.textMuted }}
                              >
                                Size: {item.size || "-"}
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center justify-between">
                                <div
                                  className="flex items-center border rounded-xl overflow-hidden"
                                  style={{ borderColor: COLORS.inputBorder }}
                                >
                                  <button
                                    disabled={updating === item.productId}
                                    onClick={() =>
                                      updateQuantity(item.productId, -1)
                                    }
                                    className="px-3 sm:px-4 py-2 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                                    style={{
                                      backgroundColor: COLORS.surface,
                                      color: COLORS.text,
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!e.currentTarget.disabled) {
                                        e.currentTarget.style.backgroundColor =
                                          COLORS.secondary;
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!e.currentTarget.disabled) {
                                        e.currentTarget.style.backgroundColor =
                                          COLORS.surface;
                                      }
                                    }}
                                  >
                                    −
                                  </button>
                                  <span
                                    className="px-4 sm:px-6 py-2 font-semibold select-none min-w-[60px] text-center"
                                    style={{
                                      backgroundColor: COLORS.inputBg,
                                      color: COLORS.text,
                                    }}
                                  >
                                    {updating === item.productId ? (
                                      <div
                                        className="w-4 h-4 border-2 rounded-full animate-spin mx-auto"
                                        style={{
                                          borderColor: COLORS.secondary,
                                          borderTopColor: COLORS.primary,
                                        }}
                                      ></div>
                                    ) : (
                                      item.quantity
                                    )}
                                  </span>
                                  <button
                                    disabled={updating === item.productId}
                                    onClick={() =>
                                      updateQuantity(item.productId, 1)
                                    }
                                    className="px-3 sm:px-4 py-2 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                                    style={{
                                      backgroundColor: COLORS.surface,
                                      color: COLORS.text,
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!e.currentTarget.disabled) {
                                        e.currentTarget.style.backgroundColor =
                                          COLORS.secondary;
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!e.currentTarget.disabled) {
                                        e.currentTarget.style.backgroundColor =
                                          COLORS.surface;
                                      }
                                    }}
                                  >
                                    +
                                  </button>
                                </div>

                                <button
                                  aria-label="remove"
                                  onClick={() => removeItem(item.productId)}
                                  disabled={removing === item.productId}
                                  className="p-2 rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50"
                                  style={{
                                    backgroundColor: `${COLORS.error}10`,
                                    color: COLORS.error,
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!e.currentTarget.disabled) {
                                      e.currentTarget.style.backgroundColor = `${COLORS.error}20`;
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!e.currentTarget.disabled) {
                                      e.currentTarget.style.backgroundColor = `${COLORS.error}10`;
                                    }
                                  }}
                                >
                                  {removing === item.productId ? (
                                    <div
                                      className="w-4 h-4 border-2 rounded-full animate-spin"
                                      style={{
                                        borderColor: COLORS.error,
                                        borderTopColor: "transparent",
                                      }}
                                    ></div>
                                  ) : (
                                    <svg
                                      className="w-4 h-4"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className="text-right">
                              <div
                                className="text-lg sm:text-xl font-bold"
                                style={{ color: COLORS.primary }}
                              >
                                ₹{(price * item.quantity).toFixed(0)}/-
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div
                    className="p-6 sm:p-8 rounded-2xl border sticky top-6"
                    style={{
                      backgroundColor: COLORS.surface,
                      borderColor: COLORS.inputBorder,
                    }}
                  >
                    <h2
                      className="text-xl font-bold mb-6"
                      style={{ color: COLORS.text }}
                    >
                      Order Summary
                    </h2>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center text-sm">
                        <span style={{ color: COLORS.textMuted }}>
                          Items ({cart.items.length})
                        </span>
                        <span style={{ color: COLORS.text }}>{subtotal}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span style={{ color: COLORS.textMuted }}>
                          Shipping
                        </span>
                        <span style={{ color: COLORS.text }}>
                          Calculated at checkout
                        </span>
                      </div>
                      <div
                        className="border-t pt-4"
                        style={{ borderColor: COLORS.inputBorder }}
                      >
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span style={{ color: COLORS.text }}>Total</span>
                          <span style={{ color: COLORS.primary }}>
                            {subtotal}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => (window.location.href = "/checkout")}
                      className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg transform relative overflow-hidden group"
                      style={{ backgroundColor: COLORS.primary }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          COLORS.primaryDark;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = COLORS.primary;
                      }}
                    >
                      <span className="relative z-10">PROCEED TO CHECKOUT</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 transition-all duration-700 group-hover:translate-x-full"></div>
                    </button>

                    <p
                      className="mt-4 text-xs text-center leading-relaxed"
                      style={{ color: COLORS.textMuted }}
                    >
                      *Subtotal excludes shipping & taxes. Proceed to checkout
                      for final amount. Items in cart are not reserved until
                      purchase is completed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {cart.items.length > 0 && (
              <section className="mt-12 sm:mt-16">
                <h2
                  className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8"
                  style={{ color: COLORS.text }}
                >
                  Recommend for you
                </h2>
                <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide">
                  {recommendations.map((img, i) => (
                    <div
                      key={i}
                      className="w-40 sm:w-48 flex-shrink-0 group cursor-pointer"
                    >
                      <div
                        className="aspect-square w-full border rounded-2xl flex items-center justify-center overflow-hidden mb-3 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
                        style={{
                          backgroundColor: COLORS.background,
                          borderColor: COLORS.inputBorder,
                        }}
                      >
                        <Image
                          src={img}
                          alt={`rec-${i}`}
                          width={192}
                          height={192}
                          className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <div
                        className="text-sm font-semibold truncate mb-1"
                        style={{ color: COLORS.text }}
                      >
                        {cart.items[0]?.product?.name ||
                          "Black-blue T-shirt for men"}
                      </div>
                      <div
                        className="text-sm font-bold"
                        style={{ color: COLORS.primary }}
                      >
                        {subtotal}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Accordions */}
            <section className="mt-12 sm:mt-16 space-y-1">
              {[
                {
                  title: "T-shirts for Women",
                  body: "Explore sizes and fits tailored for comfort and style.",
                },
                {
                  title: "Reviews on Women's T-shirts",
                  body: "Customers love the softness & vibrant prints. Average rating 4.6/5.",
                },
              ].map((acc, i) => (
                <details
                  key={i}
                  className="group border rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:shadow-md"
                  style={{
                    backgroundColor: COLORS.background,
                    borderColor: COLORS.inputBorder,
                  }}
                >
                  <summary
                    className="cursor-pointer flex justify-between items-center list-none font-medium transition-colors duration-300 group-hover:text-opacity-80"
                    style={{ color: COLORS.text }}
                  >
                    <span>{acc.title}</span>
                    <span
                      className="text-xl leading-none transition-transform duration-300 group-open:rotate-45 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: `${COLORS.secondary}20`,
                        color: COLORS.primary,
                      }}
                    >
                      +
                    </span>
                  </summary>
                  <div className="overflow-hidden transition-all duration-300">
                    <p
                      className="mt-4 leading-relaxed text-sm"
                      style={{ color: COLORS.textMuted }}
                    >
                      {acc.body}
                    </p>
                  </div>
                </details>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

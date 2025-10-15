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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8080";

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
  const [updating, setUpdating] = useState<string | null>(null); // productId while updating qty
  const [removing, setRemoving] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

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
        className="container mx-auto px-4 sm:px-6 md:mt-0 mt-10 lg:px-8 py-10 max-w-6xl"
        style={{ color: COLORS.text }}
      >
        {/* Header: compact and informative */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight"
              style={{ color: COLORS.primary }}
            >
              Your Cart
            </h1>
            <p className="mt-1 text-sm" style={{ color: COLORS.textMuted }}>
              {cart.items.length || 0} item{cart.items.length !== 1 ? "s" : ""}{" "}
              —{" "}
              <span className="font-semibold" style={{ color: COLORS.primary }}>
                ₹{cart.total.toFixed(0)}/-
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm font-medium px-3 py-2 rounded-lg hover:underline"
              style={{ color: COLORS.textMuted }}
            >
              Continue shopping
            </Link>
          </div>
        </div>

        {authLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 border-2 rounded-full animate-spin"
                style={{
                  borderColor: COLORS.secondary,
                  borderTopColor: COLORS.primary,
                }}
              ></div>
              <span className="text-sm" style={{ color: COLORS.textMuted }}>
                Verifying account...
              </span>
            </div>
          </div>
        )}

        {!authLoading && !user && (
          <div className="text-center py-12 sm:py-16">
            <div
              className="max-w-lg mx-auto p-8 rounded-2xl shadow-md border"
              style={{
                backgroundColor: COLORS.surface,
                borderColor: COLORS.inputBorder,
              }}
            >
              <div
                className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${COLORS.primary}14` }}
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
                className="mb-3 text-lg font-semibold"
                style={{ color: COLORS.text }}
              >
                Please sign in to view your cart
              </p>
              <p className="text-sm mb-6" style={{ color: COLORS.textMuted }}>
                Saved items, prices and checkout are available after login.
              </p>
              <div className="flex justify-center gap-3">
                <Link
                  href="/login"
                  className="inline-block px-5 py-3 rounded-lg font-semibold text-white"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  Login
                </Link>
                <Link
                  href="/"
                  className="inline-block px-5 py-3 rounded-lg border font-medium"
                  style={{
                    borderColor: COLORS.inputBorder,
                    color: COLORS.text,
                  }}
                >
                  Browse
                </Link>
              </div>
            </div>
          </div>
        )}

        {user && (
          <>
            {error && (
              <div
                className="mb-6 p-4 rounded-lg border-l-4 flex items-start gap-3"
                style={{
                  backgroundColor: `${COLORS.error}10`,
                  borderLeftColor: COLORS.error,
                  color: COLORS.error,
                }}
              >
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <div className="text-sm font-medium">{error}</div>
              </div>
            )}

            {loading ? (
              <div className="py-12">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-4">
                    {[1, 2].map((n) => (
                      <div
                        key={n}
                        className="p-4 rounded-2xl border animate-pulse"
                        style={{
                          backgroundColor: COLORS.background,
                          borderColor: COLORS.inputBorder,
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-xl bg-neutral-100" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-3/4 bg-neutral-200 rounded" />
                            <div className="h-3 w-1/3 bg-neutral-200 rounded" />
                            <div className="h-8 w-1/4 bg-neutral-200 rounded mt-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    className="p-6 rounded-2xl border"
                    style={{ borderColor: COLORS.inputBorder }}
                  >
                    <div className="h-6 w-1/2 bg-neutral-200 rounded animate-pulse mb-4" />
                    <div className="h-10 bg-neutral-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ) : cart.items.length === 0 ? (
              <div className="py-16 text-center">
                <div
                  className="max-w-lg mx-auto p-10 rounded-2xl shadow-sm"
                  style={{ backgroundColor: COLORS.surface }}
                >
                  <div
                    className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${COLORS.secondary}28` }}
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
                    className="text-xl font-semibold mb-2"
                    style={{ color: COLORS.text }}
                  >
                    Your cart is empty
                  </p>
                  <p
                    className="text-sm mb-6"
                    style={{ color: COLORS.textMuted }}
                  >
                    Add items to your cart and they will appear here.
                  </p>
                  <Link
                    href="/"
                    className="inline-block px-6 py-3 rounded-lg font-semibold text-white"
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Items list */}
                <div className="lg:col-span-2 space-y-4">
                  {cart.items.map((item) => {
                    const p = item.product;
                    const price = p?.price || 0;
                    return (
                      <div
                        key={item.id + item.productId}
                        className="p-4 sm:p-6 rounded-2xl border flex gap-4 items-start transition-shadow hover:shadow-lg"
                        style={{
                          backgroundColor: COLORS.background,
                          borderColor: COLORS.inputBorder,
                        }}
                      >
                        <div
                          className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-white flex items-center justify-center border"
                          style={{ borderColor: COLORS.inputBorder }}
                        >
                          {p?.images?.[0] ? (
                            <Image
                              src={p.images[0]}
                              alt={p.name || "product"}
                              width={96}
                              height={96}
                              className="object-contain w-full h-full"
                            />
                          ) : (
                            <div className="text-xs text-gray-400">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-3">
                            <div className="truncate">
                              <div
                                className="text-sm sm:text-base font-semibold"
                                style={{ color: COLORS.text }}
                              >
                                {p?.name || "Product"}
                              </div>
                              <div
                                className="text-xs mt-1"
                                style={{ color: COLORS.textMuted }}
                              >
                                {p?.brand
                                  ? `${p.brand} • ${p.mainCategory || ""}`
                                  : p?.mainCategory}
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className="text-sm font-semibold"
                                style={{ color: COLORS.primary }}
                              >
                                ₹{(price * item.quantity).toFixed(0)}/-
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: COLORS.textMuted }}
                              >
                                ₹{price.toFixed(0)}/- each
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ">
                            <div className="flex flex-wrap items-center gap-2 md:gap-12 ">
                              <div
                                className="flex items-center border rounded-lg overflow-hidden w-fit "
                                style={{ borderColor: COLORS.inputBorder }}
                              >
                                <button
                                  disabled={updating === item.productId}
                                  onClick={() =>
                                    updateQuantity(item.productId, -1)
                                  }
                                  className="px-3 py-2 text-sm"
                                  style={{ backgroundColor: COLORS.surface }}
                                >
                                  −
                                </button>
                                <div
                                  className="px-4 py-2 bg-white text-sm font-medium"
                                  style={{ minWidth: 44, textAlign: "center" }}
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
                                  className="px-3 py-2 text-sm"
                                  style={{ backgroundColor: COLORS.surface }}
                                >
                                  +
                                </button>
                              </div>

                              <button
                                aria-label="remove"
                                onClick={() => removeItem(item.productId)}
                                disabled={removing === item.productId}
                                className="px-3 py-2 rounded-lg text-sm font-medium"
                                style={{
                                  color: COLORS.error,
                                  backgroundColor: `${COLORS.error}08`,
                                }}
                              >
                                {removing === item.productId
                                  ? "Removing…"
                                  : "Remove"}
                              </button>
                              <button
                                className="px-3 py-2 rounded-lg text-sm font-medium border flex items-center"
                                style={{ borderColor: COLORS.inputBorder }}
                                onClick={() => saveForLater(item.productId)}
                                disabled={saving === item.productId}
                              >
                                {saving === item.productId
                                  ? "Saving…"
                                  : "Save for later"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                <aside>
                  <div
                    className="p-6 rounded-2xl border"
                    style={{
                      backgroundColor: COLORS.surface,
                      borderColor: COLORS.inputBorder,
                    }}
                  >
                    <h3
                      className="text-lg font-bold mb-4"
                      style={{ color: COLORS.text }}
                    >
                      Order Summary
                    </h3>

                    <div className="space-y-3 mb-4 text-sm">
                      <div
                        className="flex justify-between"
                        style={{ color: COLORS.textMuted }}
                      >
                        <span>Subtotal</span>
                        <span style={{ color: COLORS.text }}>
                          ₹{cart.total.toFixed(0)}/-
                        </span>
                      </div>
                      <div
                        className="flex justify-between"
                        style={{ color: COLORS.textMuted }}
                      >
                        <span>Estimated tax</span>
                        <span style={{ color: COLORS.text }}>
                          ₹{(cart.total * 0.05).toFixed(0)}/-
                        </span>
                      </div>
                      <div
                        className="flex justify-between"
                        style={{ color: COLORS.textMuted }}
                      >
                        <span>Shipping</span>
                        <span style={{ color: COLORS.textMuted }}>
                          Calculated at checkout
                        </span>
                      </div>
                    </div>

                    <div
                      className="border-t pt-4"
                      style={{ borderColor: COLORS.inputBorder }}
                    >
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span style={{ color: COLORS.text }}>Total</span>
                        <span style={{ color: COLORS.primary }}>
                          ₹{(cart.total + cart.total * 0.05).toFixed(0)}/-
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => (window.location.href = "/checkout")}
                      className="w-full mt-6 py-3 rounded-lg text-white font-semibold"
                      style={{ backgroundColor: COLORS.primary }}
                    >
                      Checkout
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(window.location.href);
                      }}
                      className="w-full mt-3 py-2 rounded-lg text-sm border"
                      style={{
                        borderColor: COLORS.inputBorder,
                        backgroundColor: "transparent",
                        color: COLORS.text,
                      }}
                    >
                      Share Cart
                    </button>

                    <p
                      className="mt-4 text-xs text-center"
                      style={{ color: COLORS.textMuted }}
                    >
                      Prices shown are indicative. Final prices (including tax &
                      shipping) are available at checkout.
                    </p>
                  </div>
                </aside>
              </div>
            )}

            {/* Recommendations */}
            {cart.items.length > 0 && (
              <section className="mt-12 sm:mt-16">
                <h2
                  className="text-xl sm:text-2xl font-bold mb-6"
                  style={{ color: COLORS.text }}
                >
                  Recommended for you
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {recommendations.map((img, i) => (
                    <div
                      key={i}
                      className="rounded-2xl overflow-hidden border"
                      style={{
                        borderColor: COLORS.inputBorder,
                        backgroundColor: COLORS.background,
                      }}
                    >
                      <div className="aspect-square p-3 flex items-center justify-center">
                        <Image
                          src={img}
                          alt={`rec-${i}`}
                          width={200}
                          height={200}
                          className="object-contain"
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
    </div>
  );
}

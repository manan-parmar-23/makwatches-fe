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
    <main className="container mx-auto px-4 py-6 max-w-5xl text-[#531A1A]">
      <h1 className="text-center font-semibold tracking-wide mb-6">CART</h1>
      {authLoading && <div>Loading...</div>}
      {!authLoading && !user && (
        <div className="text-center py-8">
          <p className="mb-4">Please login to view your cart.</p>
          <Link
            href="/login"
            className="inline-block px-5 py-2 rounded-md bg-[#531A1A] text-white text-sm"
          >
            Login
          </Link>
        </div>
      )}
      {user && (
        <>
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
              {error}
            </div>
          )}
          {loading ? (
            <div className="py-10 text-center text-sm opacity-70">
              Loading cart...
            </div>
          ) : cart.items.length === 0 ? (
            <div className="py-10 text-center text-sm opacity-70">
              Your cart is empty.
            </div>
          ) : (
            <div className="space-y-0 divide-y">
              {cart.items.map((item) => {
                const p = item.product;
                const price = p?.price || 0;
                return (
                  <div
                    key={item.id + item.productId}
                    className="py-5 flex gap-4 items-start"
                  >
                    <div className="w-20 h-20 flex-shrink-0 border rounded-md overflow-hidden bg-white flex items-center justify-center">
                      {p?.images?.[0] && (
                        <Image
                          src={p.images[0]}
                          alt={p.name || "product"}
                          width={80}
                          height={80}
                          className="object-contain w-full h-full"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium mb-1 line-clamp-2">
                        {p?.name || "Product"}
                      </div>
                      <div className="text-xs mb-2">{price.toFixed(0)}/-</div>
                      <div className="text-xs text-gray-500">
                        Size: {item.size || "-"}
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center border rounded-md overflow-hidden">
                          <button
                            disabled={updating === item.productId}
                            onClick={() => updateQuantity(item.productId, -1)}
                            className="px-2 py-1"
                          >
                            -
                          </button>
                          <span className="px-3 select-none">
                            {updating === item.productId
                              ? "..."
                              : item.quantity}
                          </span>
                          <button
                            disabled={updating === item.productId}
                            onClick={() => updateQuantity(item.productId, 1)}
                            className="px-2 py-1"
                          >
                            +
                          </button>
                        </div>
                        <button
                          aria-label="remove"
                          onClick={() => removeItem(item.productId)}
                          disabled={removing === item.productId}
                          className="text-xs hover:text-red-600"
                        >
                          {removing === item.productId ? "..." : "X"}
                        </button>
                      </div>
                    </div>
                    <div className="text-xs font-medium whitespace-nowrap">
                      {(price * item.quantity).toFixed(0)}/-
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between items-center pt-6 text-xs font-medium">
                <span>SUBTOTAL</span>
                <span>{subtotal}</span>
              </div>
              <div className="pt-4 pb-10">
                <button
                  onClick={() => (window.location.href = "/checkout")}
                  className="mx-auto block px-8 py-2 rounded-full bg-[#531A1A] text-white text-xs font-medium tracking-wide hover:opacity-90"
                >
                  CHECKOUT
                </button>
                <p className="mt-3 text-[10px] text-center leading-relaxed opacity-70 max-w-sm mx-auto">
                  *Subtotal excludes shipping & taxes. Proceed to checkout for
                  final amount. Items in cart are not reserved until purchase is
                  completed.
                </p>
              </div>
            </div>
          )}
          {/* Recommendations */}
          <section className="mt-4">
            <h2 className="text-sm font-medium mb-4">Recommend for you</h2>
            <div className="flex gap-6 overflow-x-auto pb-2">
              {recommendations.map((img, i) => (
                <div key={i} className="w-36 flex-shrink-0">
                  <div className="aspect-square w-full border rounded-lg flex items-center justify-center overflow-hidden mb-2 bg-white">
                    <Image
                      src={img}
                      alt={`rec-${i}`}
                      width={160}
                      height={160}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <div className="text-[11px] font-medium truncate">
                    {cart.items[0]?.product?.name ||
                      "Black-blue T-shirt for men"}
                  </div>
                  <div className="text-[10px] opacity-70">{subtotal}</div>
                </div>
              ))}
            </div>
          </section>
          {/* Accordions */}
          <section className="mt-10 space-y-3 text-xs">
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
              <details key={i} className="group border-t border-b py-3">
                <summary className="cursor-pointer flex justify-between items-center list-none">
                  <span>{acc.title}</span>
                  <span className="transition group-open:rotate-45 text-base leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-2 opacity-80 leading-relaxed">{acc.body}</p>
              </details>
            ))}
          </section>
        </>
      )}
    </main>
  );
}

"use client";
import { useEffect, useState, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

type OrderItem = {
  productId: string;
  productName: string;
  price: number;
  size?: string;
  quantity: number;
  subtotal: number;
};

type Order = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  paymentInfo: { method: string };
  items: OrderItem[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [fetchedOnce, setFetchedOnce] = useState(false);

  // Resolve credentials on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t =
      localStorage.getItem("customerToken") ||
      localStorage.getItem("adminToken") ||
      sessionStorage.getItem("adminAuthToken") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("authToken");
    setToken(t);
    let uid =
      localStorage.getItem("userId") || sessionStorage.getItem("userId");
    // Try to decode JWT for user id if not present (assuming payload has userId or id)
    if (!uid && t) {
      try {
        const payload = JSON.parse(atob(t.split(".")[1] || ""));
        uid = payload.userId || payload.id || payload.sub || null;
      } catch {}
    }
    if (uid) {
      setUserId(uid);
      // persist for subsequent pages
      localStorage.setItem("userId", uid);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!token || !userId) return;
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/orders/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await r.json();
      if (r.ok && j.success) {
        setOrders(j.data || []);
      } else {
        setError(j.message || "Failed to load orders");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setFetchedOnce(true);
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    if (!token || !userId) {
      if (!token) return; // wait until token resolved
      setLoading(false);
      return;
    }
    fetchOrders();
  }, [token, userId, fetchOrders]);

  async function retryPayment(order: Order) {
    setError(null);
    try {
      // Create a fresh Razorpay order for outstanding amount
      const pr = await fetch(`${API_BASE}/payments/razorpay/order`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const pj = await pr.json();
      if (!pr.ok || !pj.success)
        throw new Error(pj.message || "Failed to init payment");
      await loadRazorpay();
      const rzpData = pj.data || {};
      // @ts-expect-error Razorpay global
      const rzp = new window.Razorpay({
        key: pj.key,
        amount: pj.amount,
        currency: pj.currency,
        name: "Pehnaw",
        order_id: rzpData.id,
        handler: async (resp: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const res = await fetch(`${API_BASE}/checkout`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                shippingAddress: order.items.length
                  ? {
                      street: "",
                      city: "",
                      state: "",
                      zipCode: "",
                      country: "India",
                    }
                  : {
                      street: "",
                      city: "",
                      state: "",
                      zipCode: "",
                      country: "India",
                    },
                paymentInfo: {
                  method: "razorpay",
                  razorpayOrderId: resp.razorpay_order_id,
                  razorpayPaymentId: resp.razorpay_payment_id,
                  razorpaySignature: resp.razorpay_signature,
                },
              }),
            });
            const js = await res.json();
            if (!res.ok || !js.success)
              throw new Error(js.message || "Checkout failed");
            window.location.href = `/order-success?id=${js.data.id}`;
          } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Checkout failed");
          }
        },
        prefill: {},
        theme: { color: "#531A1A" },
      });
      rzp.open();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Retry failed");
    }
  }

  if (loading) return <main className="max-w-4xl mx-auto p-6">Loading...</main>;
  if (error)
    return <main className="max-w-4xl mx-auto p-6 text-red-600">{error}</main>;

  return (
    <main className="max-w-5xl mx-auto p-6 text-[#531A1A]">
      <h1 className="text-3xl font-semibold mb-8">My Orders</h1>
      {fetchedOnce && !loading && orders.length === 0 && (
        <div className="text-sm flex items-center gap-2">
          <span>No orders found.</span>
          <button onClick={fetchOrders} className="underline text-[#531A1A]">
            Refresh
          </button>
        </div>
      )}
      <div className="space-y-6">
        {orders.map((o) => (
          <div key={o.id} className="border rounded-lg p-5 bg-white shadow-sm">
            <div className="flex flex-wrap justify-between gap-4 mb-4 text-sm">
              <div>
                <span className="font-medium">Order:</span> {o.id}
              </div>
              <div>
                <span className="font-medium">Placed:</span>{" "}
                {new Date(o.createdAt).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Status:</span> {o.status}
              </div>
              <div>
                <span className="font-medium">Total:</span> ₹
                {o.total.toFixed(2)}
              </div>
            </div>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-500">
                  <th className="py-1">Item</th>
                  <th className="py-1">Size</th>
                  <th className="py-1">Qty</th>
                  <th className="py-1">Price</th>
                  <th className="py-1">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {o.items.map((it) => (
                  <tr key={it.productId + it.size} className="border-t">
                    <td className="py-1 pr-2">{it.productName}</td>
                    <td className="py-1 pr-2">{it.size || "-"}</td>
                    <td className="py-1 pr-2">{it.quantity}</td>
                    <td className="py-1 pr-2">₹{it.price.toFixed(2)}</td>
                    <td className="py-1 pr-2">₹{it.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {o.status === "pending" && o.paymentInfo.method !== "cod" && (
              <button
                onClick={() => retryPayment(o)}
                className="px-4 py-2 bg-[#531A1A] text-white rounded-full text-xs"
              >
                Retry Payment
              </button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

async function loadRazorpay() {
  if (typeof window === "undefined") return;
  if (
    document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    )
  )
    return;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Razorpay SDK failed"));
    document.body.appendChild(s);
  });
}

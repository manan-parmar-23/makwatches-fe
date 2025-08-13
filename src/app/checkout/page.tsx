"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

// ---- Types ----
type Address = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  landmark?: string;
};
type PaymentMethod = "razorpay_upi" | "razorpay_card" | "cod";
interface CartItem {
  id: string;
  productId?: string;
  name?: string;
  price?: number;
  quantity: number;
  size?: string;
  product?: { name?: string; price?: number; images?: string[] };
}

interface PlacedOrderItem {
  productId: string;
  productName: string;
  price: number;
  size?: string;
  quantity: number;
  subtotal: number;
}
interface PlacedOrder {
  id: string;
  status: string;
  total: number;
  items: PlacedOrderItem[];
  paymentInfo: { method: string };
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

// Resolve any token (customer/admin) from storage
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

// Razorpay global type (minimal)
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });
  const [method, setMethod] = useState<PaymentMethod | undefined>();
  const [error, setError] = useState<string | null>(null);

  const [cart, setCart] = useState<{ items: CartItem[]; total: number }>({
    items: [],
    total: 0,
  });
  const [loadingCart, setLoadingCart] = useState(false);
  const [placing, setPlacing] = useState(false);

  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

  const { user } = useAuth();

  const localComputedTotal = cart.items.reduce(
    (s, i) => s + (i.price ?? i.product?.price ?? 0) * i.quantity,
    0
  );
  const serverTotal = cart.total || 0;

  // ---- Load Cart ----
  const loadCart = useCallback(async () => {
    if (!token || !userId) {
      setError("Missing token or userId for cart fetch");
      return;
    }
    setLoadingCart(true);
    try {
      // Debug log for troubleshooting
      console.log("Cart fetch: token", token, "userId", userId);
      const r = await fetch(`${API_BASE}/cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await r.json();
      if (j?.success) {
        const items: CartItem[] = (j.data.items || []).map(
          (raw: Record<string, unknown>) => ({
            id:
              (raw.id as string) ||
              (raw._id as string) ||
              `${raw.productId as string}-${raw.size || ""}`,
            productId: raw.productId as string,
            name: (raw.product as { name?: string })?.name,
            price: (raw.product as { price?: number })?.price,
            quantity: (raw.quantity as number) ?? 0,
            size: raw.size as string,
            product: raw.product as {
              name?: string;
              price?: number;
              images?: string[];
            },
          })
        );
        setCart({ items, total: j.data.total || 0 });
      } else {
        setError(
          `Failed to load cart: ${
            j.message || "Unknown error"
          } (userId: ${userId})`
        );
      }
    } catch {
      setError(`Unable to load cart (userId: ${userId}, token: ${token})`);
    } finally {
      setLoadingCart(false);
    }
  }, [token, userId]);

  useEffect(() => {
    // Prefer context user id if available
    let resolvedUserId: string | null = null;
    if (user && (user.id || user.id)) {
      resolvedUserId = user.id || user.id;
    } else if (typeof window !== "undefined") {
      resolvedUserId =
        localStorage.getItem("userId") ||
        sessionStorage.getItem("userId") ||
        null;
    }
    setUserId(resolvedUserId);

    // Always update token
    if (typeof window !== "undefined") {
      setToken(getToken());
    }
  }, [user]);

  useEffect(() => {
    if (token && userId) {
      loadCart();
    }
  }, [token, userId, loadCart]);

  // ---- Step Navigation ----
  function next() {
    if (step === 0) {
      if (!/^[0-9]{10}$/.test(mobile)) {
        setError("Enter valid 10-digit mobile");
        return;
      }
      if (!cart.items.length) {
        setError("Cart empty");
        return;
      }
    }
    if (step === 1) {
      const { street, city, state, zipCode, country } = address;
      if (!street || !city || !state || !zipCode || !country) {
        setError("Fill all address fields");
        return;
      }
    }
    setError(null);
    setStep((s) => (s + 1) as 0 | 1 | 2);
  }
  function back() {
    setError(null);
    setStep((s) => (s - 1) as 0 | 1 | 2);
  }

  // ---- Checkout: COD ----
  async function placeCOD() {
    if (!token || !userId) {
      setError("Login required");
      return;
    }
    if (!cart.items.length) {
      setError("Cart empty");
      return;
    }
    setPlacing(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress: address,
          paymentInfo: { method: "cod" },
          clientTotal: localComputedTotal,
          serverReportedTotal: serverTotal,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed");
      setPlacedOrder(json.data);
      setShowSuccess(true);
      setTimeout(() => {
        window.location.href = "/orders";
      }, 2200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setPlacing(false);
    }
  }

  // ---- Load Razorpay Script ----
  async function ensureRazorpayLoaded() {
    if (typeof window === "undefined") return;
    if (window.Razorpay) return;
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
      s.onerror = () => reject(new Error("Razorpay SDK load failed"));
      document.body.appendChild(s);
    });
  }

  // ---- Checkout: Razorpay ----
  async function payRazorpay(selected: PaymentMethod) {
    if (!token || !userId) {
      setError("Login required");
      return;
    }
    if (!cart.items.length) {
      setError("Cart empty");
      return;
    }
    setPlacing(true);
    setError(null);
    try {
      await ensureRazorpayLoaded();
      const pr = await fetch(`${API_BASE}/payments/razorpay/order`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: serverTotal * 100, // if backend needs amount in paise
        }),
      });
      const pj = await pr.json();
      if (!pr.ok || !pj.success)
        throw new Error(pj.message || "Payment init failed");
      const rzpData = pj.data || {};

      const rzp = new window.Razorpay!({
        key: pj.key,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: "Pehnaw",
        order_id: rzpData.id,
        prefill: { contact: mobile },
        theme: { color: "#531A1A" },
        handler: async (response: {
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
                shippingAddress: address,
                paymentInfo: {
                  method: selected.startsWith("razorpay")
                    ? "razorpay"
                    : selected,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                },
                clientTotal: localComputedTotal,
                serverReportedTotal: serverTotal,
              }),
            });
            const json = await res.json();
            if (!res.ok || !json.success)
              throw new Error(json.message || "Checkout failed");
            setPlacedOrder(json.data);
            setShowSuccess(true);
            setTimeout(() => {
              window.location.href = "/orders";
            }, 2200);
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Order verification failed"
            );
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPlacing(false);
          },
        },
      });
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed to start");
      setPlacing(false);
    }
  }

  const proceedPayment = () => {
    if (!method) return;
    if (method === "cod") return placeCOD();
    return payRazorpay(method);
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 text-[#531A1A]">
      <h1 className="text-3xl font-semibold text-center mb-10">CHECKOUT</h1>
      {showSuccess && placedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-100 text-green-700 text-xl">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-semibold">Order Placed!</h3>
                <p className="text-sm text-gray-600">
                  Your order has been created successfully.
                </p>
              </div>
            </div>
            <div className="text-xs bg-neutral-50 border rounded-md p-3 mb-4 space-y-1 max-h-40 overflow-auto">
              <div>
                <span className="font-medium">Order ID:</span> {placedOrder.id}
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                {placedOrder.status}
              </div>
              <div>
                <span className="font-medium">Total:</span> ₹
                {placedOrder.total?.toFixed?.(2) || placedOrder.total}
              </div>
              <div>
                <span className="font-medium">Items:</span>{" "}
                {placedOrder.items?.length}
              </div>
              <div>
                <span className="font-medium">Payment:</span>{" "}
                {placedOrder.paymentInfo?.method}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => (window.location.href = "/orders")}
                className="flex-1 bg-[#531A1A] text-white rounded-full py-2 text-sm"
              >
                View Orders
              </button>
              <button
                onClick={() => setShowSuccess(false)}
                className="px-4 py-2 text-sm rounded-full border border-[#531A1A] text-[#531A1A]"
              >
                Close
              </button>
            </div>
            <p className="mt-3 text-[10px] text-gray-500 text-center">
              Redirecting…
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-center gap-10 text-sm font-medium mb-8">
        {["CONTACT", "ADDRESS", "PAYMENT"].map((t, i) => (
          <div
            key={t}
            className={
              i === step ? "border-b-2 border-[#531A1A] pb-1" : "text-gray-400"
            }
          >
            {t}
          </div>
        ))}
      </div>

      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

      {step === 0 && (
        <section>
          <div className="flex justify-between mb-6 text-sm">
            <span className="font-semibold">ORDER TOTAL</span>
            <span className="text-right">
              {loadingCart ? "..." : `${serverTotal.toFixed(0)}/-`}
            </span>
          </div>
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Enter Mobile No."
            className="w-full border px-4 py-3 rounded-md bg-neutral-100 mb-3 outline-none"
          />
          <label className="flex items-center gap-2 text-xs mb-8">
            <input type="checkbox" /> Notify me for orders, updates & offers
          </label>
          {!cart.items.length && !loadingCart && (
            <div className="mb-4 text-sm text-yellow-700">
              Cart appears empty.{" "}
              <button className="underline" onClick={loadCart}>
                Reload Cart
              </button>
            </div>
          )}
          <button
            onClick={next}
            className="w-full bg-[#531A1A] text-white rounded-full py-3 text-sm tracking-wide disabled:opacity-50"
            disabled={placing || loadingCart}
          >
            CONTINUE
          </button>
        </section>
      )}

      {step === 1 && (
        <section>
          <h2 className="font-semibold text-lg mb-6">Address</h2>
          <div className="grid gap-4 mb-6">
            <input
              placeholder="Street"
              value={address.street}
              onChange={(e) =>
                setAddress((a) => ({ ...a, street: e.target.value }))
              }
              className="border px-4 py-3 rounded-md bg-neutral-100"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="City"
                value={address.city}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, city: e.target.value }))
                }
                className="border px-4 py-3 rounded-md bg-neutral-100"
              />
              <input
                placeholder="State"
                value={address.state}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, state: e.target.value }))
                }
                className="border px-4 py-3 rounded-md bg-neutral-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Pincode"
                value={address.zipCode}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, zipCode: e.target.value }))
                }
                className="border px-4 py-3 rounded-md bg-neutral-100"
              />
              <input
                placeholder="Country"
                value={address.country}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, country: e.target.value }))
                }
                className="border px-4 py-3 rounded-md bg-neutral-100"
              />
            </div>
            <input
              placeholder="Landmark (optional)"
              value={address.landmark || ""}
              onChange={(e) =>
                setAddress((a) => ({ ...a, landmark: e.target.value }))
              }
              className="border px-4 py-3 rounded-md bg-neutral-100"
            />
          </div>
          <div className="flex gap-4">
            <button onClick={back} className="px-6 py-3 rounded-full border">
              Back
            </button>
            <button
              onClick={next}
              className="flex-1 bg-[#531A1A] text-white rounded-full py-3 text-sm"
            >
              CONTINUE
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section>
          <h2 className="font-semibold text-lg mb-6">Payment Options</h2>

          <div className="mb-8 border rounded-md p-4 bg-white shadow-sm">
            <h3 className="font-semibold mb-3 text-sm">Order Summary</h3>
            <div className="space-y-2 max-h-52 overflow-auto pr-1">
              {cart.items.map((ci) => (
                <div
                  key={ci.id}
                  className="flex justify-between items-center text-xs gap-2"
                >
                  <div className="truncate flex-1">
                    {ci.name || ci.product?.name || "Item"}{" "}
                    {ci.size && <span className="opacity-60">({ci.size})</span>}
                  </div>
                  <div>x{ci.quantity}</div>
                  <div>
                    ₹
                    {(
                      ((ci.price ?? ci.product?.price) || 0) * ci.quantity
                    ).toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between text-sm font-medium border-t pt-2">
              <span>Total</span>
              <span>
                ₹{loadingCart ? "..." : serverTotal.toFixed(0)}
                {localComputedTotal !== serverTotal && (
                  <span className="text-xs text-red-500 ml-2">
                    (mismatch: local {localComputedTotal.toFixed(0)})
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="space-y-5 mb-8">
            {[
              {
                id: "razorpay_upi",
                label: "Pay by UPI (Razorpay)",
                desc: "GPay / PhonePe / BHIM UPI",
              },
              {
                id: "razorpay_card",
                label: "Pay by Card (Razorpay)",
                desc: "Secure card payment",
              },
              {
                id: "cod",
                label: "Cash on Delivery",
                desc: "Pay with cash when the order arrives",
              },
            ].map((opt) => (
              <label
                key={opt.id}
                className="flex items-start gap-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name="pay"
                  value={opt.id}
                  onChange={() => setMethod(opt.id as PaymentMethod)}
                  checked={method === opt.id}
                />
                <div>
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-xs text-gray-500">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-4">
            <button onClick={back} className="px-6 py-3 rounded-full border">
              Back
            </button>
            <button
              disabled={!method || placing}
              onClick={proceedPayment}
              className="flex-1 bg-[#531A1A] text-white rounded-full py-3 text-sm disabled:opacity-50"
            >
              {placing ? "Processing..." : "CONFIRM"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

// --- Mak Watches brand palette (black/white/gold) ---
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
};

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

// Enhanced Toast Notification Component
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "error" | "success" | "info";
  onClose: () => void;
}) => (
  <div className="fixed top-6 right-6 z-50 animate-slide-in">
    <div
      className={`rounded-2xl p-4 shadow-xl border-2 flex items-center gap-3 min-w-[300px] transition-all duration-300 ${
        type === "error"
          ? "border-red-200"
          : type === "success"
          ? "border-green-200"
          : "border-blue-200"
      }`}
      style={{
        backgroundColor:
          type === "error"
            ? `${COLORS.error}10`
            : type === "success"
            ? `${COLORS.success}10`
            : `${COLORS.primary}10`,
      }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor:
            type === "error"
              ? `${COLORS.error}20`
              : type === "success"
              ? `${COLORS.success}20`
              : `${COLORS.primary}20`,
        }}
      >
        {type === "error" && <span className="text-red-600">⚠️</span>}
        {type === "success" && <span className="text-green-600">✅</span>}
        {type === "info" && <span className="text-blue-600">ℹ️</span>}
      </div>
      <p
        className="flex-1 font-medium"
        style={{
          color:
            type === "error"
              ? COLORS.error
              : type === "success"
              ? COLORS.success
              : COLORS.primary,
        }}
      >
        {message}
      </p>
      <button
        onClick={onClose}
        className="w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
        style={{
          backgroundColor:
            type === "error"
              ? `${COLORS.error}20`
              : type === "success"
              ? `${COLORS.success}20`
              : `${COLORS.primary}20`,
        }}
      >
        <span className="text-sm">×</span>
      </button>
    </div>
  </div>
);

// Enhanced Success Modal
const SuccessModal = ({
  order,
  onClose,
}: {
  order: PlacedOrder;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-fade-in">
    <div
      className="rounded-3xl shadow-2xl w-full max-w-md p-8 border-2 transform transition-all duration-300 hover:scale-105"
      style={{
        backgroundColor: COLORS.background,
        borderColor: `${COLORS.success}30`,
      }}
    >
      {/* Success Icon */}
      <div className="text-center mb-6">
        <div
          className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-4 animate-bounce"
          style={{ backgroundColor: `${COLORS.success}20` }}
        >
          <span className="text-4xl">🎉</span>
        </div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: COLORS.success }}
        >
          Order Placed Successfully!
        </h2>
        <p className="text-base" style={{ color: COLORS.textMuted }}>
          Thank you for your purchase. Your order has been confirmed.
        </p>
      </div>

      {/* Order Details Card */}
      <div
        className="rounded-2xl p-4 mb-6 border-2"
        style={{
          backgroundColor: COLORS.surface,
          borderColor: `${COLORS.surfaceLight}80`,
        }}
      >
        <h3
          className="font-semibold text-base mb-3"
          style={{ color: COLORS.primary }}
        >
          Order Details
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span style={{ color: COLORS.textMuted }}>Order ID:</span>
            <span
              className="font-mono font-semibold"
              style={{ color: COLORS.text }}
            >
              #{order.id.substring(0, 12)}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: COLORS.textMuted }}>Status:</span>
            <span
              className="px-2 py-1 rounded-lg font-semibold capitalize"
              style={{
                backgroundColor: `${COLORS.success}20`,
                color: COLORS.success,
              }}
            >
              {order.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: COLORS.textMuted }}>Items:</span>
            <span className="font-semibold" style={{ color: COLORS.text }}>
              {order.items?.length} products
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: COLORS.textMuted }}>Payment:</span>
            <span
              className="font-semibold uppercase"
              style={{ color: COLORS.text }}
            >
              {order.paymentInfo?.method}
            </span>
          </div>
          <div
            className="flex justify-between pt-2 border-t"
            style={{ borderColor: `${COLORS.surfaceLight}80` }}
          >
            <span className="font-semibold" style={{ color: COLORS.text }}>
              Total:
            </span>
            <span
              className="text-xl font-bold"
              style={{ color: COLORS.primary }}
            >
              ₹{order.total?.toFixed?.(2) || order.total}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => (window.location.href = "/orders")}
          className="flex-1 py-3 rounded-2xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
          style={{ backgroundColor: COLORS.primary }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.primaryDark;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.primary;
          }}
        >
          View Orders
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-2xl border-2 font-semibold transition-all duration-300 hover:scale-105"
          style={{
            borderColor: COLORS.primary,
            color: COLORS.primary,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.primary;
            e.currentTarget.style.color = COLORS.background;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = COLORS.primary;
          }}
        >
          Continue Shopping
        </button>
      </div>

      <p
        className="mt-4 text-xs text-center animate-pulse"
        style={{ color: COLORS.textMuted }}
      >
        Redirecting to orders page...
      </p>
    </div>
  </div>
);

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
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success" | "info";
  } | null>(null);

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

  // Show toast notifications
  const showToast = (message: string, type: "error" | "success" | "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ---- Load Cart ----
  const loadCart = useCallback(async () => {
    if (!token || !userId) {
      showToast("Please login to continue", "error");
      return;
    }
    setLoadingCart(true);
    try {
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
        showToast(
          `Failed to load cart: ${j.message || "Unknown error"}`,
          "error"
        );
      }
    } catch {
      showToast("Unable to load cart. Please try again.", "error");
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
        showToast("Please enter a valid 10-digit mobile number", "error");
        return;
      }
      if (!cart.items.length) {
        showToast("Your cart is empty", "error");
        return;
      }
    }
    if (step === 1) {
      const { street, city, state, zipCode, country } = address;
      if (!street || !city || !state || !zipCode || !country) {
        showToast("Please fill in all required address fields", "error");
        return;
      }
    }
    setError(error ? null : ""); // Clear any previous error
    setStep((s) => (s + 1) as 0 | 1 | 2);
  }
  function back() {
    setError(null);
    setStep((s) => (s - 1) as 0 | 1 | 2);
  }

  // ---- Checkout: COD ----
  async function placeCOD() {
    if (!token || !userId) {
      showToast("Please login to continue", "error");
      return;
    }
    if (!cart.items.length) {
      showToast("Your cart is empty", "error");
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
      }, 3000);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Checkout failed", "error");
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
      showToast("Please login to continue", "error");
      return;
    }
    if (!cart.items.length) {
      showToast("Your cart is empty", "error");
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
        name: "makwatches",
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
            }, 3000);
          } catch (err) {
            showToast(
              err instanceof Error ? err.message : "Order verification failed",
              "error"
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
      showToast(
        e instanceof Error ? e.message : "Payment failed to start",
        "error"
      );
      setPlacing(false);
    }
  }

  const proceedPayment = () => {
    if (!method) return;
    if (method === "cod") return placeCOD();
    return payRazorpay(method);
  };

  return (
    <main
      className="max-w-3xl mx-auto px-4 py-6 sm:py-10 transition-all duration-300"
      style={{
        backgroundColor: COLORS.background,
        color: COLORS.text,
        minHeight: "100vh",
      }}
    >
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Success modal */}
      {showSuccess && placedOrder && (
        <SuccessModal
          order={placedOrder}
          onClose={() => setShowSuccess(false)}
        />
      )}

      {/* Header */}
      <header className="mb-8 text-center">
        <div className="inline-flex items-center gap-3">
          <div
            className="w-1.5 h-8 rounded-full hidden sm:block"
            style={{ backgroundColor: COLORS.primary }}
          />
          <h1
            className="text-2xl sm:text-3xl font-semibold leading-tight"
            style={{ color: COLORS.primary }}
          >
            Checkout
          </h1>
        </div>
        <p className="mt-2 text-sm" style={{ color: COLORS.textMuted }}>
          Secure checkout — shipping & taxes calculated at the next step
        </p>
      </header>

      {/* Steps (compact for small screens) */}
      <div className="flex items-center justify-between gap-3 mb-6">
        {[
          {
            label: "Contact",
            i: 0,
            icon: "📞",
          },
          {
            label: "Address",
            i: 1,
            icon: "📍",
          },
          {
            label: "Payment",
            i: 2,
            icon: "💳",
          },
        ].map((s) => (
          <div key={s.label} className="flex-1">
            <div
              className={`mx-auto w-full flex items-center gap-3 sm:gap-4`}
              style={{ maxWidth: 300 }}
            >
              <div
                className={`w-10 h-10 rounded-md flex items-center justify-center text-base font-semibold`}
                style={{
                  backgroundColor:
                    s.i <= step ? `${COLORS.primary}15` : COLORS.surface,
                  color: s.i <= step ? COLORS.primary : COLORS.textMuted,
                  border: `1px solid ${
                    s.i <= step ? COLORS.primary : COLORS.surfaceLight
                  }`,
                }}
              >
                {s.i < step ? "✓" : s.icon}
              </div>
              <div
                className="text-xs sm:text-sm"
                style={{
                  color: s.i <= step ? COLORS.primary : COLORS.textMuted,
                }}
              >
                {s.label}
              </div>
              {s.i < 2 && (
                <div
                  className="hidden sm:block flex-1 h-[1px]"
                  style={{
                    backgroundColor:
                      s.i < step ? COLORS.primary : COLORS.surfaceLight,
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <section
        className="rounded-xl p-6 sm:p-8 shadow-sm"
        style={{
          backgroundColor: COLORS.surface,
          border: `1px solid ${COLORS.surfaceLight}`,
        }}
      >
        {/* STEP 0: Contact */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <div
                  className="text-sm font-medium"
                  style={{ color: COLORS.text }}
                >
                  Order Total
                </div>
                <div
                  className="text-lg font-bold"
                  style={{ color: COLORS.primary }}
                >
                  {loadingCart ? "..." : `₹${serverTotal.toFixed(0)}`}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm font-medium"
                style={{ color: COLORS.text }}
              >
                Mobile number
              </label>
              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full rounded-lg px-4 py-3 border focus:outline-none text-sm"
                style={{
                  backgroundColor: COLORS.background,
                  border: `1px solid ${COLORS.surfaceLight}`,
                  color: COLORS.text,
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = COLORS.primary)
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = `${COLORS.surfaceLight}`)
                }
              />
            </div>

            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                style={{ accentColor: COLORS.primary }}
              />
              <span style={{ color: COLORS.textMuted }}>
                Notify me about order updates, offers and delivery
              </span>
            </label>

            {!cart.items.length && !loadingCart && (
              <div
                className="rounded-lg p-4 border mt-2"
                style={{
                  borderColor: `${COLORS.error}30`,
                  backgroundColor: `${COLORS.error}08`,
                }}
              >
                <div
                  className="text-sm font-medium"
                  style={{ color: COLORS.error }}
                >
                  Cart empty
                </div>
                <div className="mt-2">
                  <button
                    onClick={loadCart}
                    className="px-4 py-2 rounded-md text-sm"
                    style={{ backgroundColor: COLORS.primary, color: "#fff" }}
                  >
                    Reload cart
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4">
              <button
                onClick={next}
                disabled={placing || loadingCart}
                className="w-full py-3 rounded-lg font-semibold text-white"
                style={{
                  backgroundColor: COLORS.primary,
                  opacity: placing || loadingCart ? 0.6 : 1,
                  cursor: placing || loadingCart ? "not-allowed" : "pointer",
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: Address */}
        {step === 1 && (
          <div className="space-y-6">
            <h3
              className="text-lg font-semibold"
              style={{ color: COLORS.primary }}
            >
              Delivery address
            </h3>

            <div className="grid gap-3">
              <input
                placeholder="Street address"
                value={address.street}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, street: e.target.value }))
                }
                className="w-full rounded-lg px-4 py-3 border text-sm"
                style={{
                  backgroundColor: COLORS.background,
                  border: `1px solid ${COLORS.surfaceLight}`,
                  color: COLORS.text,
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = COLORS.primary)
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = `${COLORS.surfaceLight}`)
                }
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  placeholder="City"
                  value={address.city}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, city: e.target.value }))
                  }
                  className="w-full rounded-lg px-4 py-3 border text-sm"
                  style={{
                    backgroundColor: COLORS.background,
                    border: `1px solid ${COLORS.surfaceLight}`,
                    color: COLORS.text,
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = COLORS.primary)
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = `${COLORS.surfaceLight}`)
                  }
                />
                <input
                  placeholder="State"
                  value={address.state}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, state: e.target.value }))
                  }
                  className="w-full rounded-lg px-4 py-3 border text-sm"
                  style={{
                    backgroundColor: COLORS.background,
                    border: `1px solid ${COLORS.surfaceLight}`,
                    color: COLORS.text,
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = COLORS.primary)
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = `${COLORS.surfaceLight}`)
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  placeholder="Pincode"
                  value={address.zipCode}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, zipCode: e.target.value }))
                  }
                  className="w-full rounded-lg px-4 py-3 border text-sm"
                  style={{
                    backgroundColor: COLORS.background,
                    border: `1px solid ${COLORS.surfaceLight}`,
                    color: COLORS.text,
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = COLORS.primary)
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = `${COLORS.surfaceLight}`)
                  }
                />
                <input
                  placeholder="Country"
                  value={address.country}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, country: e.target.value }))
                  }
                  className="w-full rounded-lg px-4 py-3 border text-sm"
                  style={{
                    backgroundColor: COLORS.background,
                    border: `1px solid ${COLORS.surfaceLight}`,
                    color: COLORS.text,
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = COLORS.primary)
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = `${COLORS.surfaceLight}`)
                  }
                />
              </div>

              <input
                placeholder="Landmark (optional)"
                value={address.landmark || ""}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, landmark: e.target.value }))
                }
                className="w-full rounded-lg px-4 py-3 border text-sm"
                style={{
                  backgroundColor: COLORS.background,
                  border: `1px solid ${COLORS.surfaceLight}`,
                  color: COLORS.text,
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = COLORS.primary)
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = `${COLORS.surfaceLight}`)
                }
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={back}
                className="w-full sm:w-auto px-4 py-3 rounded-lg border text-sm font-medium"
                style={{ borderColor: COLORS.primary, color: COLORS.primary }}
              >
                Back
              </button>
              <button
                onClick={next}
                className="w-full py-3 rounded-lg text-white font-semibold"
                style={{ backgroundColor: COLORS.primary }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Payment */}
        {step === 2 && (
          <div className="space-y-6">
            <h3
              className="text-lg font-semibold"
              style={{ color: COLORS.primary }}
            >
              Payment
            </h3>

            <div
              className="rounded-lg border p-4"
              style={{ borderColor: COLORS.surfaceLight }}
            >
              <div className="space-y-3 max-h-56 overflow-auto">
                {cart.items.map((ci) => (
                  <div
                    key={ci.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="text-sm" style={{ color: COLORS.text }}>
                      {ci.name || ci.product?.name || "Item"}{" "}
                      {ci.size ? (
                        <span className="text-xs text-muted">({ci.size})</span>
                      ) : null}
                    </div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: COLORS.primary }}
                    >
                      ₹
                      {(
                        ((ci.price ?? ci.product?.price) || 0) * ci.quantity
                      ).toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="mt-4 flex items-center justify-between border-t pt-4"
                style={{ borderColor: COLORS.surfaceLight }}
              >
                <div
                  className="text-sm text-muted"
                  style={{ color: COLORS.textMuted }}
                >
                  Total
                </div>
                <div
                  className="text-lg font-bold"
                  style={{ color: COLORS.primary }}
                >
                  ₹{loadingCart ? "..." : serverTotal.toFixed(0)}
                  {localComputedTotal !== serverTotal && (
                    <span className="text-xs text-red-500 ml-2">
                      {" "}
                      (local mismatch)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: "razorpay_upi",
                  label: "UPI / UPI apps",
                  desc: "GPay, PhonePe, AliPay etc.",
                  icon: "📱",
                },
                {
                  id: "razorpay_card",
                  label: "Card",
                  desc: "Credit / Debit card",
                  icon: "💳",
                },
                {
                  id: "cod",
                  label: "Cash on delivery",
                  desc: "Pay upon delivery",
                  icon: "💵",
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                    method === opt.id ? "shadow-sm" : ""
                  }`}
                  style={{
                    borderColor:
                      method === opt.id ? COLORS.primary : COLORS.surfaceLight,
                    backgroundColor:
                      method === opt.id ? `${COLORS.primary}08` : "transparent",
                  }}
                >
                  <input
                    type="radio"
                    name="pay"
                    value={opt.id}
                    checked={method === opt.id}
                    onChange={() => setMethod(opt.id as PaymentMethod)}
                    style={{ accentColor: COLORS.primary }}
                  />
                  <div className="text-xl">{opt.icon}</div>
                  <div className="flex-1 text-sm">
                    <div style={{ color: COLORS.text }}>{opt.label}</div>
                    <div
                      className="text-xs"
                      style={{ color: COLORS.textMuted }}
                    >
                      {opt.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={back}
                className="w-full sm:w-auto px-4 py-3 rounded-lg border text-sm font-medium"
                style={{ borderColor: COLORS.primary, color: COLORS.primary }}
              >
                Back
              </button>

              <button
                onClick={proceedPayment}
                disabled={!method || placing}
                className="w-full py-3 rounded-lg text-white font-semibold"
                style={{
                  backgroundColor: COLORS.primary,
                  opacity: !method || placing ? 0.6 : 1,
                }}
              >
                {placing ? "Processing…" : "Place Order"}
              </button>
            </div>
          </div>
        )}
      </section>

      <style jsx>{`
        @media (max-width: 640px) {
          main {
            padding-left: 16px;
            padding-right: 16px;
          }
          .rounded-3xl {
            border-radius: 12px;
          }
        }
      `}</style>
    </main>
  );
}

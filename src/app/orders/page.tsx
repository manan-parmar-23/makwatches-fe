"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8080"
).replace(/\/$/, "");

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
  paymentStatus?: string;
  total: number;
  createdAt: string;
  paymentInfo: { method: string; razorpayPaymentId?: string };
  items: OrderItem[];
};

// --- Lightweight skeleton (updated colours & sizes for small screens) ---

// --- Compact, light loading spinner ---
const LoadingSpinner = () => (
  <div
    className="flex items-center justify-center py-16"
    style={{ backgroundColor: COLORS.background }}
  >
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div
          className="w-12 h-12 border-4 rounded-full animate-spin"
          style={{
            borderColor: `${COLORS.surfaceLight}`,
            borderTopColor: COLORS.primary,
          }}
        />
      </div>
      <p className="text-base font-medium" style={{ color: COLORS.textMuted }}>
        Loading your orders…
      </p>
    </div>
  </div>
);

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [fetchedOnce, setFetchedOnce] = useState(false);
  // Review UI state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [currentProductName, setCurrentProductName] = useState<string | null>(
    null
  );
  const [rating, setRating] = useState<number>(5);
  const [reviewTitle, setReviewTitle] = useState<string>("");
  const [reviewComment, setReviewComment] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
    // userId not needed for account endpoint; it derives from token
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Use account endpoint to infer user from token and avoid mismatch
      const r = await fetch(`${API_BASE}/account/orders`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
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
  }, [token]);

  useEffect(() => {
    if (!token) {
      if (!token) return; // wait until token resolved
      setLoading(false);
      return;
    }
    fetchOrders();
  }, [token, fetchOrders]);

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
        name: "makwatches",
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
        theme: { color: "#C6A664" },
      });
      rzp.open();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Retry failed");
    }
  }

  // Enhanced status badge styles
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          icon: "✓",
        };
      case "pending":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          icon: "⏳",
        };
      case "cancelled":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
          icon: "✕",
        };
      case "processing":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          icon: "⚙️",
        };
      case "shipped":
        return {
          bg: "bg-indigo-50",
          text: "text-indigo-700",
          border: "border-indigo-200",
          icon: "🚚",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
          icon: "📋",
        };
    }
  };

  // Payment status badge styles
  const getPaymentStatusStyle = (status: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "paid":
        return { bg: "#ECFDF5", text: "#065F46", border: "#10B981", icon: "₹" };
      case "unpaid":
        return {
          bg: "#FEF3C7",
          text: "#92400E",
          border: "#F59E0B",
          icon: "⏳",
        };
      case "failed":
        return { bg: "#FEE2E2", text: "#991B1B", border: "#EF4444", icon: "!" };
      case "refunded":
        return { bg: "#E0E7FF", text: "#3730A3", border: "#6366F1", icon: "↩" };
      default:
        return { bg: "#F3F4F6", text: "#374151", border: "#9CA3AF", icon: "₹" };
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // --- Replace the loading/empty/final render from "if (loading) { ... }" onward with a lighter UI ---
  // Note: this replaces the earlier large-return blocks but preserves data/logic like fetchOrders, retryPayment, etc.

  if (loading) {
    return (
      <main
        className="max-w-4xl mx-auto mt-12 p-4 sm:p-6 min-h-screen transition-all duration-300"
        style={{ backgroundColor: COLORS.background }}
      >
        <LoadingSpinner />
      </main>
    );
  }

  return (
    <motion.main
      className="max-w-4xl mx-auto mt-20 p-4 sm:p-6 min-h-screen transition-all duration-300"
      style={{ backgroundColor: COLORS.background, color: COLORS.text }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div
            className="w-1.5 h-12 rounded-r-full"
            style={{ backgroundColor: COLORS.primary }}
          />
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: COLORS.primary }}
            >
              My Orders
            </h1>
            <p className="text-sm" style={{ color: COLORS.textMuted }}>
              Track purchases, payments and delivery updates
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="mb-6 p-4 rounded-lg border flex items-start justify-between"
          style={{
            backgroundColor: `${COLORS.error}08`,
            borderColor: `${COLORS.error}30`,
          }}
        >
          <div>
            <h3
              className="text-sm font-semibold"
              style={{ color: COLORS.error }}
            >
              Something went wrong
            </h3>
            <p className="text-sm" style={{ color: COLORS.textMuted }}>
              {error}
            </p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-4 p-2 rounded-md"
            style={{
              backgroundColor: `${COLORS.error}10`,
              color: COLORS.error,
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Empty state */}
      {fetchedOnce && orders.length === 0 && (
        <div
          className="rounded-xl p-8 text-center border"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.surfaceLight,
          }}
        >
          <div
            className="mx-auto mb-6 w-20 h-20 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${COLORS.surfaceLight}` }}
          >
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke={COLORS.textMuted}
            >
              <path
                d="M3 3h18v4H3zM5 11h14v8H5z"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2
            className="text-xl font-semibold"
            style={{ color: COLORS.primary }}
          >
            No orders yet
          </h2>
          <p className="text-sm mt-2" style={{ color: COLORS.textMuted }}>
            Your order history will appear here once you make a purchase.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={fetchOrders}
              className="px-4 py-2 rounded-md font-semibold"
              style={{ backgroundColor: COLORS.primary, color: "#fff" }}
            >
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Orders list (cards on small screens, table on wide screens) */}
      <div className="space-y-6 mt-6">
        {orders.map((o) => {
          const statusStyle = getStatusStyle(o.status);
          const paymentStatus = o.paymentStatus || "";
          const payStyle = getPaymentStatusStyle(paymentStatus);
          return (
            <article
              key={o.id}
              className="rounded-lg border shadow-sm overflow-hidden"
              style={{
                backgroundColor: COLORS.surface,
                borderColor: COLORS.surfaceLight,
              }}
            >
              {/* header */}
              <div
                className="p-4 sm:p-6 flex flex-col sm:flex-row sm:justify-between gap-4 sm:items-center border-b"
                style={{ borderColor: COLORS.surfaceLight }}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: COLORS.primary }}
                    >
                      Order #{o.id.substring(0, 10)}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium`}
                      style={{
                        backgroundColor: statusStyle.bg.replace("bg-", ""),
                        color: "inherit",
                      }}
                    >
                      {statusStyle.icon} {o.status}
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium border"
                      style={{
                        backgroundColor: payStyle.bg,
                        color: payStyle.text,
                        borderColor: payStyle.border,
                      }}
                      title="Payment status"
                    >
                      {payStyle.icon}{" "}
                      {(paymentStatus || "unpaid").toUpperCase()}
                    </span>
                  </div>
                  <div
                    className="mt-2 text-sm"
                    style={{ color: COLORS.textMuted }}
                  >
                    {o.items.length} item{o.items.length !== 1 ? "s" : ""} •{" "}
                    {formatDate(o.createdAt)}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div
                      className="text-sm text-muted"
                      style={{ color: COLORS.textMuted }}
                    >
                      Payment
                    </div>
                    <div className="font-medium" style={{ color: COLORS.text }}>
                      {o.paymentInfo.method.toUpperCase()}
                    </div>
                  </div>
                  <div className="text-right">
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
                      ₹{o.total.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* items (responsive) */}
              <div className="p-4 sm:p-6">
                <div className="hidden sm:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        className="text-left text-xs text-muted"
                        style={{ color: COLORS.textMuted }}
                      >
                        <th className="pb-3">Product</th>
                        <th className="pb-3">Size</th>
                        <th className="pb-3">Qty</th>
                        <th className="pb-3">Price</th>
                        <th className="pb-3">Subtotal</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {o.items.map((it, i) => (
                        <tr
                          key={i}
                          className="border-t"
                          style={{ borderColor: COLORS.surfaceLight }}
                        >
                          <td className="py-3" style={{ color: COLORS.text }}>
                            {it.productName}
                          </td>
                          <td className="py-3">{it.size || "—"}</td>
                          <td className="py-3">{it.quantity}</td>
                          <td className="py-3">₹{it.price.toFixed(2)}</td>
                          <td
                            className="py-3 font-semibold"
                            style={{ color: COLORS.primary }}
                          >
                            ₹{it.subtotal.toFixed(2)}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              className="px-3 py-1.5 rounded-md border text-sm"
                              style={{ borderColor: COLORS.surfaceLight }}
                              onClick={() => {
                                setCurrentProductId(it.productId);
                                setCurrentProductName(it.productName);
                                setRating(5);
                                setReviewTitle("");
                                setReviewComment("");
                                setFormError(null);
                                setShowReviewModal(true);
                              }}
                            >
                              Give review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* stacked view for small screens */}
                <div className="sm:hidden space-y-3">
                  {o.items.map((it, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-start gap-3"
                    >
                      <div>
                        <div
                          className="text-sm font-medium"
                          style={{ color: COLORS.text }}
                        >
                          {it.productName}
                        </div>
                        <div
                          className="text-xs mt-1"
                          style={{ color: COLORS.textMuted }}
                        >
                          {it.size ? `Size: ${it.size}` : ""}
                        </div>
                        <div
                          className="text-xs mt-1"
                          style={{ color: COLORS.textMuted }}
                        >
                          Qty: {it.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm" style={{ color: COLORS.text }}>
                          ₹{it.subtotal.toFixed(2)}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: COLORS.textMuted }}
                        >
                          ₹{it.price.toFixed(2)} each
                        </div>
                        <button
                          className="mt-2 px-3 py-1.5 rounded-md border text-sm"
                          style={{ borderColor: COLORS.surfaceLight }}
                          onClick={() => {
                            setCurrentProductId(it.productId);
                            setCurrentProductName(it.productName);
                            setRating(5);
                            setReviewTitle("");
                            setReviewComment("");
                            setFormError(null);
                            setShowReviewModal(true);
                          }}
                        >
                          Give review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* actions */}
              <div
                className="p-4 sm:p-6 border-t"
                style={{ borderColor: COLORS.surfaceLight }}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between items-stretch gap-3">
                  <div
                    className="text-sm text-muted"
                    style={{ color: COLORS.textMuted }}
                  >
                    Ordered on {formatDate(o.createdAt)}
                  </div>
                  <div className="flex gap-3">
                    {o.status === "pending" &&
                      o.paymentInfo.method !== "cod" && (
                        <button
                          onClick={() => retryPayment(o)}
                          className="px-4 py-2 rounded-md font-semibold text-white"
                          style={{ backgroundColor: COLORS.primary }}
                        >
                          Retry Payment
                        </button>
                      )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Review modal */}
      {showReviewModal && currentProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowReviewModal(false)}
          />
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md z-10"
            style={{ boxShadow: "0 8px 24px rgba(15,23,42,0.12)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-sm">
                ★
              </div>
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: COLORS.primary }}
                >
                  Write a review
                </h3>
                <div className="text-xs" style={{ color: COLORS.textMuted }}>
                  Share your experience with other shoppers
                </div>
              </div>
            </div>
            <div
              className="text-sm text-muted mb-4"
              style={{ color: COLORS.textMuted }}
            >
              {currentProductName
                ? currentProductName
                : `Product ID: ${currentProductId?.substring(0, 10)}`}
            </div>
            <div className="mb-3">
              <label
                className="block text-sm mb-1"
                style={{ color: COLORS.textMuted }}
              >
                Rating
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => setRating(v)}
                    aria-label={`${v} star`}
                    className={`h-8 w-8 rounded-full flex items-center justify-center border ${
                      v <= rating
                        ? "bg-amber-300 border-amber-400"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
                1 = Poor, 5 = Excellent
              </div>
            </div>
            <input
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="Title"
              className="w-full mb-3 p-2 border rounded"
            />
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Write your review"
              rows={4}
              className="w-full p-2 mb-3 border rounded"
            />
            {formError && (
              <div
                className="mb-3 text-sm p-2 rounded border"
                style={{
                  color: COLORS.error,
                  borderColor: `${COLORS.error}50`,
                  backgroundColor: `${COLORS.error}0D`,
                }}
              >
                {formError}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-md border"
                style={{ borderColor: COLORS.surfaceLight }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!token) {
                    setFormError("Please login to submit a review");
                    return;
                  }
                  if (!currentProductId) {
                    setFormError("Invalid product selected");
                    return;
                  }
                  if (!reviewTitle || reviewTitle.trim().length === 0) {
                    setFormError("Please enter a title for your review");
                    return;
                  }
                  if (!reviewComment || reviewComment.trim().length < 5) {
                    setFormError(
                      "Please enter a comment (minimum 5 characters)"
                    );
                    return;
                  }
                  setSubmittingReview(true);
                  setError(null);
                  setFormError(null);
                  try {
                    const res = await fetch(`${API_BASE}/account/reviews`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        productId: currentProductId,
                        rating,
                        title: reviewTitle,
                        comment: reviewComment,
                      }),
                    });
                    const js = await res.json();
                    if (!res.ok || !js.success)
                      throw new Error(js.message || "Failed to submit review");
                    // success - close modal and refresh orders (review count will be visible in account)
                    setShowReviewModal(false);
                  } catch (e: unknown) {
                    setFormError(
                      e instanceof Error ? e.message : "Failed to submit review"
                    );
                  } finally {
                    setSubmittingReview(false);
                  }
                }}
                className="px-4 py-2 rounded-md font-semibold text-white"
                style={{ backgroundColor: COLORS.primary }}
                disabled={submittingReview}
              >
                {submittingReview ? "Submitting..." : "Submit review"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 640px) {
          .rounded-3xl {
            border-radius: 12px;
          }
        }
      `}</style>
    </motion.main>
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

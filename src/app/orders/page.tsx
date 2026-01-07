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
  brand?: string;
  image?: string;
  price: number;
  size?: string;
  quantity: number;
  subtotal: number;
};

type ShippingInfo = {
  provider?: string;
  waybill?: string;
  trackingUrl?: string;
  shipmentStatus?: string;
  expectedDelivery?: string;
  currentLocation?: string;
  shipmentError?: string;
  lastStatusUpdate?: string;
};

type PickupDetails = {
  locationName?: string;
  sellerName?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  country?: string;
  gstNumber?: string;
};

type TrackingScan = {
  scan_datetime: string;
  scan_type: string;
  scanned_location: string;
  status_detail: string;
  instructions?: string;
};

type TrackingData = {
  waybill: string;
  status: string;
  status_code: string;
  status_type: string;
  status_location: string;
  status_datetime: string;
  expected_delivery?: string;
  shipment_status: string;
  destination_city?: string;
  scans?: TrackingScan[];
};

type Order = {
  id: string;
  orderNumber?: string;
  status: string;
  paymentStatus?: string;
  total: number;
  createdAt: string;
  paymentInfo: { method: string; razorpayPaymentId?: string };
  items: OrderItem[];
  shippingInfo?: ShippingInfo;
  pickupDetails?: PickupDetails;
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
  
  // Tracking state
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<Record<string, TrackingData>>({});
  const [trackingLoading, setTrackingLoading] = useState<Record<string, boolean>>({});
  
  // Cancel order state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  // Fetch tracking data from Delhivery API via backend
  const fetchTrackingData = useCallback(async (orderId: string) => {
    if (!token || trackingLoading[orderId]) return;
    
    setTrackingLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      const response = await fetch(`${API_BASE}/shipping/track/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setTrackingData(prev => ({ ...prev, [orderId]: data.data }));
        // Also refresh orders to update local status
        fetchOrders();
      }
    } catch (error) {
      console.error("Failed to fetch tracking:", error);
    } finally {
      setTrackingLoading(prev => ({ ...prev, [orderId]: false }));
    }
  }, [token, trackingLoading, fetchOrders]);

  // Auto-refresh tracking for expanded order every 30 seconds
  useEffect(() => {
    if (!expandedOrder || !token) return;
    const order = orders.find(o => o.id === expandedOrder);
    if (!order?.shippingInfo?.waybill) return;
    
    const interval = setInterval(() => {
      fetchTrackingData(expandedOrder);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [expandedOrder, orders, token, fetchTrackingData]);

  // Cancel order function
  const handleCancelOrder = async () => {
    if (!orderToCancel || !token) return;
    
    setCancellingOrder(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/account/orders/${orderToCancel.id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: cancelReason }),
        credentials: "include",
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Refresh orders list to show updated status
        await fetchOrders();
        setShowCancelModal(false);
        setOrderToCancel(null);
        setCancelReason("");
        // Show success message with auto-dismiss
        setSuccessMessage(
          orderToCancel.paymentStatus === "paid" 
            ? "Order cancelled successfully! Refund will be processed within 5-7 business days." 
            : "Order cancelled successfully!"
        );
        setTimeout(() => setSuccessMessage(null), 6000);
      } else {
        setError(data.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
      setError(error instanceof Error ? error.message : "Failed to cancel order");
    } finally {
      setCancellingOrder(false);
    }
  };

  // Toggle order expansion and load tracking
  const toggleOrderExpand = (orderId: string, hasWaybill: boolean) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      if (hasWaybill && !trackingData[orderId]) {
        fetchTrackingData(orderId);
      }
    }
  };

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

  // Enhanced status badge styles with more semantic colors
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          icon: "✓",
          iconBg: "#10B981",
        };
      case "pending":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          icon: "⏳",
          iconBg: "#F59E0B",
        };
      case "cancelled":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
          icon: "✕",
          iconBg: "#EF4444",
        };
      case "processing":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          icon: "⚙",
          iconBg: "#3B82F6",
        };
      case "shipped":
        return {
          bg: "bg-indigo-50",
          text: "text-indigo-700",
          border: "border-indigo-200",
          icon: "→",
          iconBg: "#6366F1",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
          icon: "•",
          iconBg: "#9CA3AF",
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
      {/* Elegant Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.primary}10` }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={COLORS.accent} strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold tracking-tight"
                style={{ color: COLORS.primary }}
              >
                My Orders
              </h1>
              <p className="text-sm" style={{ color: COLORS.textMuted }}>
                Track your purchases and delivery status
              </p>
            </div>
          </div>
          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl transition-all hover:scale-105"
            style={{ backgroundColor: COLORS.surface }}
            title="Refresh orders"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={COLORS.textMuted} strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
        {/* Stats bar with enhanced design */}
        {orders.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm" style={{ backgroundColor: COLORS.surface, color: COLORS.textMuted }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={COLORS.primary} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
              <span className="font-bold" style={{ color: COLORS.primary }}>{orders.length}</span> Total
            </div>
            <div className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm" style={{ backgroundColor: "#ECFDF5", color: "#065F46" }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#10B981" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-bold">{orders.filter(o => o.status === "delivered").length}</span> Delivered
            </div>
            <div className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm" style={{ backgroundColor: "#EEF2FF", color: "#4338CA" }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#6366F1" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
              <span className="font-bold">{orders.filter(o => o.status === "shipped").length}</span> In Transit
            </div>
            {orders.filter(o => o.status === "cancelled").length > 0 && (
              <div className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm" style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#EF4444" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="font-bold">{orders.filter(o => o.status === "cancelled").length}</span> Cancelled
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl border flex items-start justify-between shadow-sm"
          style={{
            backgroundColor: `${COLORS.error}08`,
            borderColor: `${COLORS.error}30`,
          }}
        >
          <div className="flex items-start gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${COLORS.error}20` }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={COLORS.error} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h3
                className="text-sm font-semibold mb-1"
                style={{ color: COLORS.error }}
              >
                Something went wrong
              </h3>
              <p className="text-sm" style={{ color: COLORS.textMuted }}>
                {error}
              </p>
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-4 p-2 rounded-lg transition-all hover:scale-105"
            style={{
              backgroundColor: `${COLORS.error}15`,
              color: COLORS.error,
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-6 p-4 rounded-xl border flex items-start justify-between shadow-sm"
          style={{
            backgroundColor: `${COLORS.success}08`,
            borderColor: `${COLORS.success}30`,
          }}
        >
          <div className="flex items-start gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${COLORS.success}20` }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={COLORS.success} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3
                className="text-sm font-semibold mb-1"
                style={{ color: COLORS.success }}
              >
                Success!
              </h3>
              <p className="text-sm" style={{ color: COLORS.textMuted }}>
                {successMessage}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-4 p-2 rounded-lg transition-all hover:scale-105"
            style={{
              backgroundColor: `${COLORS.success}15`,
              color: COLORS.success,
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}

      {/* Empty state - Enhanced design */}
      {fetchedOnce && orders.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-12 text-center border shadow-sm"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.surfaceLight,
          }}
        >
          <div
            className="mx-auto mb-6 w-24 h-24 rounded-2xl flex items-center justify-center relative overflow-hidden"
            style={{ backgroundColor: `${COLORS.primary}08` }}
          >
            {/* Animated background pulse */}
            <div 
              className="absolute inset-0 animate-ping opacity-20"
              style={{ backgroundColor: COLORS.accent }}
            />
            <svg className="w-12 h-12 relative z-10" fill="none" viewBox="0 0 24 24" stroke={COLORS.accent} strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: COLORS.primary }}
          >
            No orders yet
          </h2>
          <p className="text-sm mt-2 max-w-md mx-auto leading-relaxed mb-6" style={{ color: COLORS.textMuted }}>
            Your order history will appear here once you make a purchase. Discover our exclusive collection of premium watches and accessories!
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <a
              href="/shop"
              className="px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-md inline-flex items-center justify-center gap-2"
              style={{ backgroundColor: COLORS.primary, color: "#fff" }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Explore Collection
            </a>
            <button
              onClick={fetchOrders}
              className="px-8 py-3 rounded-xl font-medium border-2 transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
              style={{ borderColor: COLORS.surfaceLight, color: COLORS.text, backgroundColor: COLORS.background }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>
        </motion.div>
      )}

      {/* Orders list - elegant card design */}
      <div className="space-y-4">
        {orders.map((o) => {
          const statusStyle = getStatusStyle(o.status);
          const paymentStatus = o.paymentStatus || "";
          const payStyle = getPaymentStatusStyle(paymentStatus);
          const isExpanded = expandedOrder === o.id;
          const hasWaybill = !!o.shippingInfo?.waybill;
          const tracking = trackingData[o.id];
          const isTrackingLoading = trackingLoading[o.id];
          // Display external order number (must match Delhivery "order" field)
          const displayOrderNo = o.orderNumber || o.id;
          return (
            <motion.article
              key={o.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border overflow-hidden transition-all hover:shadow-lg"
              style={{
                backgroundColor: COLORS.background,
                borderColor: isExpanded ? COLORS.accent : COLORS.surfaceLight,
                boxShadow: isExpanded ? `0 4px 20px ${COLORS.accent}15` : "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              {/* Clickable header with enhanced visual hierarchy */}
              <div
                className="p-4 sm:p-5 cursor-pointer transition-all duration-200"
                onClick={() => toggleOrderExpand(o.id, hasWaybill)}
                style={{ backgroundColor: isExpanded ? `${COLORS.surface}` : COLORS.background }}
              >
                <div className="flex flex-col lg:flex-row lg:justify-between gap-4 lg:items-center">
                  <div className="flex-1 min-w-0">
                    {/* Order Number - prominent display with status */}
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm"
                          style={{ backgroundColor: `${COLORS.accent}15` }}
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={COLORS.accent} strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                          </svg>
                        </div>
                        <div>
                          <h3
                            className="text-lg sm:text-xl font-bold tracking-wide"
                            style={{ color: COLORS.primary }}
                          >
                            {displayOrderNo}
                          </h3>
                          <p className="text-xs" style={{ color: COLORS.textMuted }}>
                            {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status badges row */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5"
                        style={{
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                        }}
                      >
                        <span 
                          className="w-2 h-2 rounded-full animate-pulse" 
                          style={{ backgroundColor: statusStyle.iconBg }}
                        />
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                      <span
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border shadow-sm"
                        style={{
                          backgroundColor: payStyle.bg,
                          color: payStyle.text,
                          borderColor: payStyle.border,
                        }}
                      >
                        {payStyle.icon} {(paymentStatus || "pending").toUpperCase()}
                      </span>
                      {o.status === "cancelled" && o.paymentStatus === "refunded" && (
                        <span
                          className="px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm"
                          style={{ backgroundColor: "#E0E7FF", color: "#4338CA" }}
                        >
                          💰 Refund Processed
                        </span>
                      )}
                    </div>
                    
                    {/* Order metadata */}
                    <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: COLORS.textMuted }}>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(o.createdAt)}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: COLORS.surface }}>
                        {o.paymentInfo.method.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 lg:flex-col lg:items-end">
                    <div className="text-left lg:text-right">
                      <div className="text-xs font-medium mb-1" style={{ color: COLORS.textMuted }}>Order Total</div>
                      <div className="text-2xl font-bold tracking-tight" style={{ color: COLORS.primary }}>
                        ₹{o.total.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div 
                      className="p-2.5 rounded-xl transition-transform shadow-sm"
                      style={{ 
                        backgroundColor: COLORS.surface,
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)"
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={COLORS.textMuted} strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Quick shipping preview when collapsed with enhanced design */}
                {hasWaybill && !isExpanded && (
                  <div 
                    className="mt-3 p-2.5 rounded-lg flex items-center justify-between"
                    style={{ backgroundColor: `${COLORS.accent}08` }}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={COLORS.accent} strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                      </svg>
                      <span className="text-sm font-medium" style={{ color: COLORS.text }}>
                        {tracking?.shipment_status?.replace(/_/g, " ") || o.shippingInfo?.shipmentStatus?.replace(/_/g, " ") || "In Transit"}
                      </span>
                      {(tracking?.status_location || o.shippingInfo?.currentLocation) && (
                        <span className="text-xs" style={{ color: COLORS.textMuted }}>
                          • {tracking?.status_location || o.shippingInfo?.currentLocation}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono" style={{ color: COLORS.accent }}>
                      AWB: {o.shippingInfo?.waybill}
                    </span>
                  </div>
                )}
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="border-t"
                  style={{ borderColor: COLORS.surfaceLight }}
                >
                  {/* Order Progress Steps */}
                  <div className="px-4 sm:px-5 py-4" style={{ backgroundColor: COLORS.surface }}>
                    <div className="flex items-center justify-between relative">
                      <div className="absolute top-4 left-6 right-6 h-0.5" style={{ backgroundColor: COLORS.surfaceLight }} />
                      <div 
                        className="absolute top-4 left-6 h-0.5 transition-all duration-500"
                        style={{ 
                          backgroundColor: COLORS.accent,
                          width: o.status === "pending" ? "0%" : 
                                 o.status === "processing" ? "33%" : 
                                 o.status === "shipped" ? "66%" : 
                                 o.status === "delivered" ? "100%" : "0%",
                          maxWidth: "calc(100% - 48px)"
                        }}
                      />
                      {[
                        { key: "pending", label: "Ordered" },
                        { key: "processing", label: "Processing" },
                        { key: "shipped", label: "Shipped" },
                        { key: "delivered", label: "Delivered" }
                      ].map((step, idx) => {
                        const stepOrder = ["pending", "processing", "shipped", "delivered"];
                        const currentIdx = stepOrder.indexOf(o.status.toLowerCase());
                        const isActive = idx <= currentIdx;
                        const iconColor = isActive ? "#FFFFFF" : COLORS.textMuted;
                        return (
                          <div key={step.key} className="flex flex-col items-center z-10">
                            <div 
                              className="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all"
                              style={{ 
                                backgroundColor: isActive ? COLORS.accent : COLORS.background,
                                borderColor: isActive ? COLORS.accent : COLORS.surfaceLight,
                              }}
                            >
                              {step.key === "pending" && (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                </svg>
                              )}
                              {step.key === "processing" && (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.78.929l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.149-.894c-.07-.424-.383-.764-.78-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              )}
                              {step.key === "shipped" && (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                </svg>
                              )}
                              {step.key === "delivered" && (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </div>
                            <span className="text-xs mt-1.5 hidden sm:block font-medium" style={{ color: isActive ? COLORS.text : COLORS.textMuted }}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Shipping & Tracking Details */}
                  {hasWaybill && (
                    <div 
                      className="mx-4 sm:mx-5 mb-4 p-4 rounded-xl"
                      style={{ backgroundColor: `${COLORS.accent}05`, border: `1px solid ${COLORS.accent}20` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: COLORS.accent }}
                          >
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold" style={{ color: COLORS.text }}>
                              Shipment Tracking
                            </p>
                            <p className="text-xs" style={{ color: COLORS.textMuted }}>
                              Your order is on its way
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); fetchTrackingData(o.id); }}
                            className="p-2 rounded-lg transition-all hover:scale-105"
                            style={{ backgroundColor: COLORS.surface }}
                            title="Refresh tracking"
                          >
                            <svg className={`w-4 h-4 ${isTrackingLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke={COLORS.textMuted} strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                          </button>
                          {o.shippingInfo?.trackingUrl && (
                            <a
                              href={o.shippingInfo.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                              style={{ backgroundColor: COLORS.primary, color: "#fff" }}
                            >
                              Track →
                            </a>
                          )}
                        </div>
                      </div>
                      
                      {/* Current status & expected delivery */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.background }}>
                          <p className="text-xs mb-1" style={{ color: COLORS.textMuted }}>Status</p>
                          <p className="font-semibold text-sm capitalize" style={{ color: COLORS.text }}>
                            {tracking?.shipment_status?.replace(/_/g, " ") || o.shippingInfo?.shipmentStatus?.replace(/_/g, " ") || "Processing"}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.background }}>
                          <p className="text-xs mb-1" style={{ color: COLORS.textMuted }}>Expected Delivery</p>
                          <p className="font-semibold text-sm" style={{ color: COLORS.accent }}>
                            {tracking?.expected_delivery || o.shippingInfo?.expectedDelivery || "—"}
                          </p>
                        </div>
                      </div>

                      {/* Current location */}
                      {(tracking?.status_location || o.shippingInfo?.currentLocation) && (
                        <div className="p-3 rounded-lg mb-3 flex items-center gap-3" style={{ backgroundColor: COLORS.background }}>
                          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={COLORS.accent} strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          <div>
                            <p className="text-xs" style={{ color: COLORS.textMuted }}>Current Location</p>
                            <p className="font-medium text-sm" style={{ color: COLORS.text }}>
                              {tracking?.status_location || o.shippingInfo?.currentLocation}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Tracking timeline */}
                      {isTrackingLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: COLORS.surfaceLight, borderTopColor: COLORS.accent }} />
                          <span className="ml-2 text-sm" style={{ color: COLORS.textMuted }}>Loading tracking...</span>
                        </div>
                      ) : tracking?.scans && tracking.scans.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: COLORS.text }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Tracking History
                          </p>
                          <div className="relative pl-5 space-y-3">
                            <div className="absolute left-1.5 top-2 bottom-2 w-0.5 rounded" style={{ backgroundColor: COLORS.surfaceLight }} />
                            {tracking.scans.slice(0, 5).map((scan, idx) => (
                              <div key={idx} className="relative">
                                <div 
                                  className="absolute -left-3.5 top-1 w-2.5 h-2.5 rounded-full border-2"
                                  style={{ 
                                    backgroundColor: idx === 0 ? COLORS.accent : COLORS.background,
                                    borderColor: idx === 0 ? COLORS.accent : COLORS.surfaceLight
                                  }}
                                />
                                <div>
                                  <p className="text-sm font-medium" style={{ color: idx === 0 ? COLORS.text : COLORS.textMuted }}>
                                    {scan.status_detail || scan.scan_type}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: COLORS.textMuted }}>
                                    <span>{new Date(scan.scan_datetime).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                                    {scan.scanned_location && <span>• {scan.scanned_location}</span>}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Shipping Error */}
                  {o.shippingInfo?.shipmentError && !hasWaybill && (
                    <div 
                      className="mx-4 sm:mx-5 mb-4 p-4 rounded-xl flex items-center gap-3"
                      style={{ backgroundColor: `${COLORS.error}10`, border: `1px solid ${COLORS.error}30` }}
                    >
                      <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={COLORS.error} strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                      <div>
                        <p className="font-medium text-sm" style={{ color: COLORS.error }}>Shipment pending</p>
                        <p className="text-xs" style={{ color: COLORS.error }}>Our team is working on it. Tracking will be available soon.</p>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="px-4 sm:px-5 pb-4">
                    <p className="text-sm font-semibold mb-3" style={{ color: COLORS.text }}>Order Items</p>
                    <div className="space-y-2">
                      {o.items.map((it, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl transition-all hover:shadow-sm" style={{ backgroundColor: COLORS.surface }}>
                          {/* Product Image */}
                          {it.image ? (
                            <img
                              src={it.image}
                              alt={it.productName}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0 border"
                              style={{ borderColor: COLORS.surfaceLight }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center flex-shrink-0 ${it.image ? 'hidden' : ''}`} style={{ backgroundColor: COLORS.surfaceLight }}>
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke={COLORS.accent} strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                            </svg>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm sm:text-base truncate" style={{ color: COLORS.text }}>{it.productName}</p>
                            {it.brand && (
                              <p className="text-xs font-medium" style={{ color: COLORS.accent }}>{it.brand}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs" style={{ color: COLORS.textMuted }}>
                                Quantity: {it.quantity}
                              </p>
                              {it.size && (
                                <>
                                  <span style={{ color: COLORS.textMuted }}>•</span>
                                  <p className="text-xs" style={{ color: COLORS.textMuted }}>
                                    Size: {it.size}
                                  </p>
                                </>
                              )}
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: COLORS.textMuted }}>
                              ₹{it.price.toLocaleString("en-IN")} each
                            </p>
                          </div>
                          
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-base sm:text-lg" style={{ color: COLORS.primary }}>₹{it.subtotal.toLocaleString("en-IN")}</p>
                            {o.status === "delivered" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentProductId(it.productId);
                                  setCurrentProductName(it.productName);
                                  setRating(5);
                                  setReviewTitle("");
                                  setReviewComment("");
                                  setFormError(null);
                                  setShowReviewModal(true);
                                }}
                                className="mt-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                                style={{ backgroundColor: COLORS.accent, color: "#fff" }}
                              >
                                Write Review
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions - Enhanced with better visual hierarchy */}
                  <div className="px-4 sm:px-5 pb-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Cancel Order Button - only show for pending/processing orders that haven't shipped */}
                      {(o.status === "pending" || o.status === "processing") && !hasWaybill && (
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setOrderToCancel(o);
                            setCancelReason("");
                            setShowCancelModal(true);
                          }}
                          className="flex-1 py-3.5 rounded-xl font-semibold transition-all hover:scale-[1.02] border-2 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                          style={{ 
                            backgroundColor: COLORS.background,
                            color: COLORS.error,
                            borderColor: COLORS.error 
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel Order
                        </button>
                      )}
                      
                      {/* Complete Payment Button */}
                      {o.status === "pending" && o.paymentInfo.method !== "cod" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); retryPayment(o); }}
                          className="flex-1 py-3.5 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                          style={{ backgroundColor: COLORS.primary }}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                          </svg>
                          Complete Payment
                        </button>
                      )}
                      
                      {/* Help text for cancelled orders */}
                      {o.status === "cancelled" && (
                        <div 
                          className="p-4 rounded-xl flex items-center gap-3 w-full"
                          style={{ backgroundColor: `${COLORS.textMuted}10` }}
                        >
                          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={COLORS.textMuted} strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                          </svg>
                          <span className="text-sm" style={{ color: COLORS.textMuted }}>
                            This order has been cancelled. {o.paymentStatus === "refunded" && "Your refund has been processed."}
                          </span>
                        </div>
                      )}
                      
                      {/* Contact support link */}
                      {o.status !== "cancelled" && (
                        <a
                          href="/contact"
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm text-center py-2 hover:underline"
                          style={{ color: COLORS.accent }}
                        >
                          Need help with this order?
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.article>
          );
        })}
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !cancellingOrder && setShowCancelModal(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md z-10 relative overflow-hidden"
            style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}
          >
            {/* Warning accent bar */}
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: COLORS.error }}
            />
            
            <div className="flex items-start gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${COLORS.error}15` }}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={COLORS.error} strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3
                  className="text-lg font-bold mb-1"
                  style={{ color: COLORS.primary }}
                >
                  Cancel Order?
                </h3>
                <p className="text-sm" style={{ color: COLORS.textMuted }}>
                  Are you sure you want to cancel this order?
                </p>
              </div>
            </div>
            
            {/* Order Details */}
            <div
              className="mb-4 p-4 rounded-lg border"
              style={{ backgroundColor: COLORS.surface, borderColor: COLORS.surfaceLight }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: COLORS.textMuted }}>
                  Order Number
                </span>
                <span className="text-sm font-bold" style={{ color: COLORS.primary }}>
                  {orderToCancel.orderNumber || orderToCancel.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: COLORS.textMuted }}>
                  Order Total
                </span>
                <span className="text-lg font-bold" style={{ color: COLORS.accent }}>
                  ₹{orderToCancel.total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Important information */}
            <div
              className="mb-4 p-3 rounded-lg"
              style={{ backgroundColor: `${COLORS.accent}08`, border: `1px solid ${COLORS.accent}30` }}
            >
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: COLORS.text }}>
                <svg className="w-4 h-4" fill={COLORS.accent} viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                Important Information
              </p>
              <ul className="text-xs space-y-1.5" style={{ color: COLORS.textMuted }}>
                <li className="flex items-start gap-1.5">
                  <span className="text-accent mt-0.5">•</span>
                  <span>{orderToCancel.paymentStatus === "paid" ? "Refund will be processed within 5-7 business days" : "No charges will be applied to your account"}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Once cancelled, this order cannot be restored</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-accent mt-0.5">•</span>
                  <span>You can place a new order anytime</span>
                </li>
              </ul>
            </div>
            
            {/* Cancellation reason (optional) */}
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: COLORS.text }}
              >
                Reason for cancellation <span className="text-xs" style={{ color: COLORS.textMuted }}>(optional)</span>
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 rounded-lg text-sm transition-all duration-200 focus:outline-none"
                style={{ 
                  backgroundColor: COLORS.surface,
                  border: `1px solid ${COLORS.surfaceLight}`,
                  color: COLORS.text
                }}
                disabled={cancellingOrder}
              >
                <option value="">Select a reason...</option>
                <option value="changed_mind">Changed my mind</option>
                <option value="found_better_price">Found better price elsewhere</option>
                <option value="ordered_by_mistake">Ordered by mistake</option>
                <option value="delivery_time">Delivery time too long</option>
                <option value="payment_issues">Payment issues</option>
                <option value="other">Other reasons</option>
              </select>
            </div>

            {error && (
              <div
                className="mb-4 text-sm p-3 rounded-lg flex items-center gap-2"
                style={{
                  color: COLORS.error,
                  backgroundColor: `${COLORS.error}10`,
                  border: `1px solid ${COLORS.error}30`
                }}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setOrderToCancel(null);
                  setCancelReason("");
                }}
                className="px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: COLORS.surface,
                  color: COLORS.text,
                  border: `1px solid ${COLORS.surfaceLight}`
                }}
                disabled={cancellingOrder}
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-6 py-2.5 rounded-lg font-semibold text-sm text-white transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ backgroundColor: COLORS.error }}
                disabled={cancellingOrder}
              >
                {cancellingOrder ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Yes, Cancel Order
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Review modal */}
      {showReviewModal && currentProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowReviewModal(false)}
          />
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md z-10 relative overflow-hidden"
            style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }}
          >
            {/* Decorative accent */}
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.primary})` }}
            />
            
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${COLORS.accent}15` }}
              >
                <svg className="w-6 h-6" fill={COLORS.accent} viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <h3
                  className="text-lg font-bold"
                  style={{ color: COLORS.primary }}
                >
                  Write a Review
                </h3>
                <p className="text-xs" style={{ color: COLORS.textMuted }}>
                  Share your experience with other shoppers
                </p>
              </div>
            </div>
            
            <div
              className="text-sm font-medium mb-4 p-3 rounded-lg"
              style={{ backgroundColor: COLORS.surface, color: COLORS.text }}
            >
              {currentProductName
                ? currentProductName
                : `Product ID: ${currentProductId?.substring(0, 10)}`}
            </div>
            
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: COLORS.text }}
              >
                Your Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => setRating(v)}
                    aria-label={`${v} star`}
                    className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg transition-all duration-200 ${
                      v <= rating
                        ? "scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{
                      backgroundColor: v <= rating ? COLORS.accent : COLORS.surface,
                      color: v <= rating ? "#FFF" : COLORS.textMuted,
                      border: `2px solid ${v <= rating ? COLORS.accent : COLORS.surfaceLight}`
                    }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2" style={{ color: COLORS.textMuted }}>
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            </div>
            
            <input
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="Review title..."
              className="w-full mb-3 p-3 rounded-lg text-sm transition-all duration-200 focus:outline-none"
              style={{ 
                backgroundColor: COLORS.surface,
                border: `1px solid ${COLORS.surfaceLight}`,
                color: COLORS.text
              }}
            />
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={4}
              className="w-full p-3 mb-4 rounded-lg text-sm resize-none transition-all duration-200 focus:outline-none"
              style={{ 
                backgroundColor: COLORS.surface,
                border: `1px solid ${COLORS.surfaceLight}`,
                color: COLORS.text
              }}
            />
            {formError && (
              <div
                className="mb-4 text-sm p-3 rounded-lg flex items-center gap-2"
                style={{
                  color: COLORS.error,
                  backgroundColor: `${COLORS.error}10`,
                  border: `1px solid ${COLORS.error}30`
                }}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {formError}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: COLORS.surface,
                  color: COLORS.text,
                  border: `1px solid ${COLORS.surfaceLight}`
                }}
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
                className="px-5 py-2.5 rounded-lg font-semibold text-sm text-white transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ backgroundColor: COLORS.primary }}
                disabled={submittingReview}
              >
                {submittingReview ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
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

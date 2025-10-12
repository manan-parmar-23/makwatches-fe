"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { format } from "date-fns";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  XMarkIcon,
  EyeIcon,
  PencilSquareIcon,
  CreditCardIcon,
  MapPinIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

// Enhanced Color constants - luxury theme with rich black and gold
const COLORS = {
  primary: "#D4AF37", // Luxury Gold
  primaryDark: "#A67C00", // Darker Gold
  primaryLight: "#F4CD68", // Lighter Gold
  secondary: "#0F0F0F", // Rich Black
  background: "#FFFFFF", // White
  surface: "#F8F8F8", // Off-White
  surfaceLight: "#F0F0F0", // Light Gray
  text: "#0F0F0F", // Rich Black for text
  textMuted: "#6D6D6D", // Muted Gray
  error: "#B00020", // Deep Red
  success: "#006400", // Deep Green
  inputBg: "#FFFFFF", // White
  inputBorder: "#D4AF37", // Gold for borders
  inputFocus: "#A67C00", // Darker Gold for focus
};

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentInfo {
  method: string;
  cardNumber?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

interface Order {
  id: string;
  userId: string;
  customerName?: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentStatus?: string;
  shippingAddress: Address;
  paymentInfo: PaymentInfo;
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [updateOrder, setUpdateOrder] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>("processing");
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Admin can fetch all orders (requires backend route /orders for admin)
      const res = await api.get("/orders");

      // Normalize date strings to Date objects
      const normalized = res.data.data.map(
        (order: Order & { _id?: string }) => ({
          ...order,
          // Ensure id exists (convert _id if needed)
          id: order.id || order._id || "",
          // Parse dates
          createdAt: order.createdAt || new Date().toISOString(),
          updatedAt: order.updatedAt || new Date().toISOString(),
        })
      );

      setOrders(normalized);
    } catch (error) {
      console.error("Error fetching orders", error);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateOrder || !newStatus) return;

    try {
      const payload: Record<string, string> = { status: newStatus };
      if (newPaymentStatus) payload.paymentStatus = newPaymentStatus;
      await api.patch(`/orders/${updateOrder}/status`, payload);

      // Update order in local state
      setOrders(
        orders.map((order) =>
          order.id === updateOrder
            ? {
                ...order,
                status: newStatus,
                paymentStatus: newPaymentStatus || order.paymentStatus,
                updatedAt: new Date().toISOString(),
              }
            : order
        )
      );

      setUpdateOrder(null);
      setNewPaymentStatus("");
      alert("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status", error);
      alert("Failed to update order status");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders by search term (order ID, customer info, product names)
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.userId.toLowerCase().includes(search.toLowerCase()) ||
      order.items.some((item) =>
        item.productName.toLowerCase().includes(search.toLowerCase())
      );

    const matchesStatus = !statusFilter || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM dd, yyyy h:mm a");
    } catch {
      return "Invalid date";
    }
  };

  // Get appropriate status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return { bg: "#FEF3C7", text: "#B45309", border: "#F59E0B" };
      case "processing":
        return { bg: "#DBEAFE", text: "#1E40AF", border: "#3B82F6" };
      case "shipped":
        return { bg: "#E0E7FF", text: "#4338CA", border: "#6366F1" };
      case "delivered":
        return { bg: "#D1FAE5", text: "#065F46", border: "#10B981" };
      case "cancelled":
        return { bg: "#FEE2E2", text: "#B91C1C", border: "#EF4444" };
      default:
        return { bg: "#F3F4F6", text: "#374151", border: "#9CA3AF" };
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "paid":
        return { bg: "#ECFDF5", text: "#065F46", border: "#10B981" };
      case "unpaid":
        return { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B" };
      case "failed":
        return { bg: "#FEE2E2", text: "#991B1B", border: "#EF4444" };
      case "refunded":
        return { bg: "#E0E7FF", text: "#3730A3", border: "#6366F1" };
      default:
        return { bg: "#F3F4F6", text: "#374151", border: "#9CA3AF" };
    }
  };

  return (
    <div className="space-y-5 pt-18">
      {/* Header with animation */}
      <div className="mb-6 animate-fade-in-up">
        <div className="flex items-center mb-3 group">
          <div
            className="w-1 h-8 rounded-full mr-3 transform group-hover:scale-y-110 transition-transform duration-300"
            style={{ backgroundColor: COLORS.primary }}
          />
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 hover:tracking-wide transition-all duration-300"
              style={{ color: COLORS.primary }}
            >
              Order Management
            </h1>
            <p
              className="text-xs sm:text-sm"
              style={{ color: COLORS.textMuted }}
            >
              Track, view and update customer orders
            </p>
          </div>
        </div>
        <div
          className="w-24 h-1 rounded-full transform hover:w-32 transition-all duration-500"
          style={{
            background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`,
          }}
        />
      </div>

      {/* Enhanced Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {/* Search box */}
        <div className="relative">
          <MagnifyingGlassIcon
            className="w-5 h-5 absolute top-2.5 left-3"
            style={{ color: COLORS.textMuted }}
          />
          <input
            type="text"
            placeholder="Search orders by ID, customer, or product"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full rounded-lg text-sm transition-all duration-300 focus:ring-2"
            style={{
              backgroundColor: COLORS.inputBg,
              borderColor: COLORS.inputBorder,
              border: `1px solid ${COLORS.inputBorder}`,
              color: COLORS.text,
              outline: "none",
            }}
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-4 pr-10 py-2.5 w-full appearance-none rounded-lg text-sm transition-all duration-300 focus:ring-2"
            style={{
              backgroundColor: COLORS.inputBg,
              borderColor: COLORS.inputBorder,
              border: `1px solid ${COLORS.inputBorder}`,
              color: COLORS.text,
              outline: "none",
            }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDownIcon
            className="w-4 h-4 absolute top-3 right-3 pointer-events-none"
            style={{ color: COLORS.textMuted }}
          />
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchOrders}
          className="group flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm transition-all duration-300 hover:scale-105 hover:shadow-md"
          style={{ background: COLORS.primary }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.primaryDark;
            e.currentTarget.style.boxShadow = `0 4px 12px ${COLORS.primary}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.primary;
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <ArrowPathIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Enhanced Order Status Update Form */}
      {updateOrder && (
        <div
          className="mb-5 rounded-xl shadow-md overflow-hidden border animate-fade-in"
          style={{
            backgroundColor: COLORS.background,
            borderColor: `${COLORS.surfaceLight}60`,
          }}
        >
          <div
            className="px-4 py-3 border-b flex justify-between items-center"
            style={{
              backgroundColor: COLORS.surface,
              borderColor: `${COLORS.surfaceLight}80`,
            }}
          >
            <div className="flex items-center space-x-2">
              <DocumentTextIcon
                className="w-4 h-4"
                style={{ color: COLORS.primary }}
              />
              <h3
                className="text-sm font-semibold"
                style={{ color: COLORS.primary }}
              >
                Update Order Status
              </h3>
            </div>
            <button
              onClick={() => setUpdateOrder(null)}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              <XMarkIcon
                className="w-4 h-4"
                style={{ color: COLORS.textMuted }}
              />
            </button>
          </div>

          <form onSubmit={handleUpdateStatus} className="p-4">
            <div className="mb-3">
              <p className="text-xs mb-1" style={{ color: COLORS.textMuted }}>
                Order ID
              </p>
              <p className="text-sm font-mono" style={{ color: COLORS.text }}>
                {updateOrder}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="sm:col-span-2">
                <label
                  className="block text-xs mb-1.5"
                  style={{ color: COLORS.textMuted }}
                >
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm transition-all duration-300"
                  style={{
                    backgroundColor: COLORS.inputBg,
                    borderColor: COLORS.inputBorder,
                    border: `1px solid ${COLORS.inputBorder}`,
                    color: COLORS.text,
                    outline: "none",
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-xs mb-1.5"
                  style={{ color: COLORS.textMuted }}
                >
                  Payment Status (optional)
                </label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm transition-all duration-300"
                  style={{
                    backgroundColor: COLORS.inputBg,
                    borderColor: COLORS.inputBorder,
                    border: `1px solid ${COLORS.inputBorder}`,
                    color: COLORS.text,
                    outline: "none",
                  }}
                >
                  <option value="">No change</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div className="flex gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setUpdateOrder(null)}
                  className="px-3 py-2 rounded-lg border text-sm"
                  style={{
                    borderColor: COLORS.inputBorder,
                    color: COLORS.textMuted,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg text-white text-sm transition-all duration-300 hover:shadow"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  Update
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Enhanced Order Detail View */}
      {viewOrder && (
        <div
          className="mb-5 rounded-xl shadow-md overflow-hidden border animate-fade-in"
          style={{
            backgroundColor: COLORS.background,
            borderColor: `${COLORS.surfaceLight}60`,
          }}
        >
          <div
            className="px-4 py-3 border-b flex justify-between items-center"
            style={{
              backgroundColor: COLORS.surface,
              borderColor: `${COLORS.surfaceLight}80`,
            }}
          >
            <div className="flex items-center space-x-2">
              <EyeIcon className="w-4 h-4" style={{ color: COLORS.primary }} />
              <h3
                className="text-sm font-semibold"
                style={{ color: COLORS.primary }}
              >
                Order Details
              </h3>
            </div>
            <button
              onClick={() => setViewOrder(null)}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              <XMarkIcon
                className="w-4 h-4"
                style={{ color: COLORS.textMuted }}
              />
            </button>
          </div>

          <div className="p-4">
            {/* Order info cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Order information */}
              <div
                className="p-3 rounded-lg border"
                style={{
                  borderColor: `${COLORS.surfaceLight}80`,
                  backgroundColor: COLORS.surface,
                }}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <DocumentTextIcon
                    className="w-4 h-4"
                    style={{ color: COLORS.primary }}
                  />
                  <h4
                    className="text-sm font-medium"
                    style={{ color: COLORS.text }}
                  >
                    Order Information
                  </h4>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex">
                    <span className="w-24" style={{ color: COLORS.textMuted }}>
                      Order ID:
                    </span>
                    <span className="font-mono" style={{ color: COLORS.text }}>
                      {viewOrder.id}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-24" style={{ color: COLORS.textMuted }}>
                      Customer ID:
                    </span>
                    <span className="font-mono" style={{ color: COLORS.text }}>
                      {viewOrder.userId}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-24" style={{ color: COLORS.textMuted }}>
                      Date:
                    </span>
                    <span style={{ color: COLORS.text }}>
                      {formatDate(viewOrder.createdAt)}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-24" style={{ color: COLORS.textMuted }}>
                      Total:
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: COLORS.primary }}
                    >
                      {formatCurrency(viewOrder.total)}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-24" style={{ color: COLORS.textMuted }}>
                      Status:
                    </span>
                    <span
                      className="px-2 rounded-full text-xs"
                      style={{
                        backgroundColor: getStatusColor(viewOrder.status).bg,
                        color: getStatusColor(viewOrder.status).text,
                      }}
                    >
                      {viewOrder.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-24" style={{ color: COLORS.textMuted }}>
                      Payment:
                    </span>
                    <span
                      className="px-2 rounded-full text-xs border"
                      style={{
                        backgroundColor: getPaymentStatusColor(
                          viewOrder.paymentStatus
                        ).bg,
                        color: getPaymentStatusColor(viewOrder.paymentStatus)
                          .text,
                        borderColor: getPaymentStatusColor(
                          viewOrder.paymentStatus
                        ).border,
                      }}
                    >
                      {(viewOrder.paymentStatus || "unpaid").toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment & Shipping */}
              <div className="space-y-3">
                {/* Payment info */}
                <div
                  className="p-3 rounded-lg border"
                  style={{
                    borderColor: `${COLORS.surfaceLight}80`,
                    backgroundColor: COLORS.surface,
                  }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <CreditCardIcon
                      className="w-4 h-4"
                      style={{ color: COLORS.primary }}
                    />
                    <h4
                      className="text-sm font-medium"
                      style={{ color: COLORS.text }}
                    >
                      Payment Details
                    </h4>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex">
                      <span
                        className="w-24"
                        style={{ color: COLORS.textMuted }}
                      >
                        Method:
                      </span>
                      <span style={{ color: COLORS.text }}>
                        {viewOrder.paymentInfo.method}
                      </span>
                    </div>
                    {viewOrder.paymentInfo.razorpayOrderId && (
                      <div className="flex">
                        <span
                          className="w-24"
                          style={{ color: COLORS.textMuted }}
                        >
                          Razorpay ID:
                        </span>
                        <span
                          className="font-mono text-[10px]"
                          style={{ color: COLORS.text }}
                        >
                          {viewOrder.paymentInfo.razorpayOrderId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping info */}
                <div
                  className="p-3 rounded-lg border"
                  style={{
                    borderColor: `${COLORS.surfaceLight}80`,
                    backgroundColor: COLORS.surface,
                  }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPinIcon
                      className="w-4 h-4"
                      style={{ color: COLORS.primary }}
                    />
                    <h4
                      className="text-sm font-medium"
                      style={{ color: COLORS.text }}
                    >
                      Shipping Address
                    </h4>
                  </div>

                  <div className="text-xs" style={{ color: COLORS.text }}>
                    <p>{viewOrder.shippingAddress.street}</p>
                    <p>
                      {viewOrder.shippingAddress.city},{" "}
                      {viewOrder.shippingAddress.state}{" "}
                      {viewOrder.shippingAddress.zipCode}
                    </p>
                    <p>{viewOrder.shippingAddress.country}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order items */}
            <div
              className="rounded-lg border overflow-hidden"
              style={{ borderColor: `${COLORS.surfaceLight}80` }}
            >
              <div
                className="px-3 py-2 border-b"
                style={{
                  backgroundColor: COLORS.surface,
                  borderColor: `${COLORS.surfaceLight}80`,
                }}
              >
                <div className="flex items-center space-x-2">
                  <ShoppingBagIcon
                    className="w-4 h-4"
                    style={{ color: COLORS.primary }}
                  />
                  <h4
                    className="text-sm font-medium"
                    style={{ color: COLORS.text }}
                  >
                    Order Items
                  </h4>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table
                  className="min-w-full divide-y"
                  style={{ borderColor: `${COLORS.surfaceLight}60` }}
                >
                  <thead style={{ backgroundColor: `${COLORS.surface}50` }}>
                    <tr>
                      <th
                        className="px-3 py-2 text-left text-xs font-medium tracking-wider"
                        style={{ color: COLORS.textMuted }}
                      >
                        Product
                      </th>
                      <th
                        className="px-3 py-2 text-right text-xs font-medium tracking-wider"
                        style={{ color: COLORS.textMuted }}
                      >
                        Price
                      </th>
                      <th
                        className="px-3 py-2 text-right text-xs font-medium tracking-wider"
                        style={{ color: COLORS.textMuted }}
                      >
                        Qty
                      </th>
                      <th
                        className="px-3 py-2 text-right text-xs font-medium tracking-wider"
                        style={{ color: COLORS.textMuted }}
                      >
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y"
                    style={{ borderColor: `${COLORS.surfaceLight}40` }}
                  >
                    {viewOrder.items.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td
                          className="px-3 py-2 whitespace-nowrap text-xs"
                          style={{ color: COLORS.text }}
                        >
                          {item.productName}
                        </td>
                        <td
                          className="px-3 py-2 whitespace-nowrap text-xs text-right"
                          style={{ color: COLORS.textMuted }}
                        >
                          {formatCurrency(item.price)}
                        </td>
                        <td
                          className="px-3 py-2 whitespace-nowrap text-xs text-right"
                          style={{ color: COLORS.textMuted }}
                        >
                          {item.quantity}
                        </td>
                        <td
                          className="px-3 py-2 whitespace-nowrap text-xs font-medium text-right"
                          style={{ color: COLORS.primary }}
                        >
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot style={{ backgroundColor: `${COLORS.surface}30` }}>
                    <tr>
                      <td
                        colSpan={3}
                        className="px-3 py-2 text-right text-xs font-medium"
                        style={{ color: COLORS.text }}
                      >
                        Total:
                      </td>
                      <td
                        className="px-3 py-2 text-xs font-bold text-right"
                        style={{ color: COLORS.primary }}
                      >
                        {formatCurrency(viewOrder.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setUpdateOrder(viewOrder.id);
                  setNewStatus(viewOrder.status);
                  setViewOrder(null);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-white transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: COLORS.primary }}
              >
                <PencilSquareIcon className="w-3.5 h-3.5" />
                <span>Update Status</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-3">
          <div
            className="w-10 h-10 border-3 rounded-full animate-spin"
            style={{
              borderColor: `${COLORS.secondary}40`,
              borderTopColor: COLORS.primary,
            }}
          />
          <p
            className="text-sm animate-pulse"
            style={{ color: COLORS.textMuted }}
          >
            Loading orders...
          </p>
        </div>
      ) : (
        /* Enhanced Orders List Table */
        <div
          className="rounded-xl shadow-md overflow-hidden border transition-all duration-300 hover:shadow-lg"
          style={{
            backgroundColor: COLORS.background,
            borderColor: `${COLORS.surfaceLight}60`,
          }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ backgroundColor: COLORS.primary }}>
                  <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white">
                    Order ID
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white">
                    Customer
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white hidden sm:table-cell">
                    Date
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white hidden md:table-cell">
                    Items
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white">
                    Total
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white">
                    Status
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium tracking-wider text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center"
                      style={{ color: COLORS.textMuted }}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: `${COLORS.surfaceLight}50`,
                          }}
                        >
                          <DocumentTextIcon
                            className="w-6 h-6"
                            style={{ color: COLORS.textMuted }}
                          />
                        </div>
                        <p className="text-sm">No orders found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b transition-all duration-300 hover:bg-gray-50 group"
                      style={{ borderColor: `${COLORS.surfaceLight}60` }}
                    >
                      <td className="px-3 py-3">
                        <div
                          className="font-mono text-xs px-2 py-1 rounded-lg inline-block transition-all duration-300 group-hover:scale-105"
                          style={{
                            backgroundColor: `${COLORS.primary}15`,
                            color: COLORS.primary,
                          }}
                        >
                          #{order.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                            style={{ backgroundColor: `${COLORS.secondary}90` }}
                          >
                            <UserIcon
                              className="w-3.5 h-3.5"
                              style={{ color: "white" }}
                            />
                          </div>
                          <span
                            className="text-xs font-medium overflow-hidden text-ellipsis"
                            style={{ color: COLORS.text }}
                            title={order.customerName || order.userId}
                          >
                            {order.customerName
                              ? order.customerName.length > 18
                                ? order.customerName.slice(0, 15) + "..."
                                : order.customerName
                              : order.userId.substring(0, 8) + "..."}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-3 py-3 text-xs hidden sm:table-cell"
                        style={{ color: COLORS.textMuted }}
                      >
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-3 h-3" />
                          <span>
                            {formatDate(order.createdAt).split(",")[0]}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-3 py-3 text-xs hidden md:table-cell"
                        style={{ color: COLORS.textMuted }}
                      >
                        <div
                          className="px-2 py-1 rounded-lg text-center"
                          style={{
                            backgroundColor: `${COLORS.surfaceLight}50`,
                          }}
                        >
                          {order.items.length}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="text-xs font-semibold group-hover:scale-105 transition-transform duration-300 inline-block"
                          style={{ color: COLORS.primary }}
                        >
                          {formatCurrency(order.total)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium inline-block"
                          style={{
                            backgroundColor: getStatusColor(order.status).bg,
                            color: getStatusColor(order.status).text,
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => setViewOrder(order)}
                            className="p-1.5 rounded-lg transition-all duration-300 hover:scale-110"
                            style={{ backgroundColor: `${COLORS.primary}10` }}
                            aria-label="View order"
                            title="View details"
                          >
                            <EyeIcon
                              className="h-3.5 w-3.5"
                              style={{ color: COLORS.primary }}
                            />
                          </button>
                          <button
                            onClick={() => {
                              setUpdateOrder(order.id);
                              setNewStatus(order.status);
                            }}
                            className="p-1.5 rounded-lg transition-all duration-300 hover:scale-110"
                            style={{ backgroundColor: `${COLORS.primary}10` }}
                            aria-label="Update order"
                            title="Update status"
                          >
                            <PencilSquareIcon
                              className="h-3.5 w-3.5"
                              style={{ color: COLORS.primary }}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

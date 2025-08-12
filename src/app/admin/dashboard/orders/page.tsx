"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { format } from "date-fns";

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
  items: OrderItem[];
  total: number;
  status: string;
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Admin can fetch all orders by user ID
      const res = await api.get("/admin/orders");

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
      await api.patch(`/orders/${updateOrder}/status`, { status: newStatus });

      // Update order in local state
      setOrders(
        orders.map((order) =>
          order.id === updateOrder
            ? {
                ...order,
                status: newStatus,
                updatedAt: new Date().toISOString(),
              }
            : order
        )
      );

      setUpdateOrder(null);
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
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <p className="p-4">Loading orders...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#531A1A]">
        Order Management
      </h1>

      {/* Filters and Search */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search orders by ID, customer, or product"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#531A1A]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#531A1A]"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          onClick={fetchOrders}
          className="bg-[#531A1A] text-white px-4 py-2 rounded hover:bg-red-900 transition"
        >
          Refresh Orders
        </button>
      </div>

      {/* Order Status Update Form */}
      {updateOrder && (
        <form
          onSubmit={handleUpdateStatus}
          className="mb-6 bg-white shadow-md p-4 rounded-lg border-l-4 border-[#531A1A]"
        >
          <h3 className="font-semibold mb-2">Update Order Status</h3>
          <p className="mb-2 text-sm text-gray-600">Order ID: {updateOrder}</p>

          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-[#531A1A]"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-[#531A1A] text-white px-4 py-2 rounded hover:bg-red-900 transition"
              >
                Update Status
              </button>
              <button
                type="button"
                onClick={() => setUpdateOrder(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Order Detail View */}
      {viewOrder && (
        <div className="mb-6 bg-white shadow-md p-4 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">Order Details</h3>
            <button
              onClick={() => setViewOrder(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="text-xl">&times;</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium text-gray-700">Order Information</h4>
              <p className="text-sm">Order ID: {viewOrder.id}</p>
              <p className="text-sm">Customer ID: {viewOrder.userId}</p>
              <p className="text-sm">Date: {formatDate(viewOrder.createdAt)}</p>
              <p className="text-sm">
                Total: {formatCurrency(viewOrder.total)}
              </p>
              <p className="text-sm">
                Status:{" "}
                <span
                  className={`px-2 py-1 rounded text-xs ${getStatusColor(
                    viewOrder.status
                  )}`}
                >
                  {viewOrder.status.toUpperCase()}
                </span>
              </p>
              <p className="text-sm">
                Payment Method: {viewOrder.paymentInfo.method}
              </p>
              {viewOrder.paymentInfo.razorpayOrderId && (
                <p className="text-sm">
                  Razorpay Order: {viewOrder.paymentInfo.razorpayOrderId}
                </p>
              )}
            </div>

            <div>
              <h4 className="font-medium text-gray-700">Shipping Address</h4>
              <p className="text-sm">{viewOrder.shippingAddress.street}</p>
              <p className="text-sm">
                {viewOrder.shippingAddress.city},{" "}
                {viewOrder.shippingAddress.state}{" "}
                {viewOrder.shippingAddress.zipCode}
              </p>
              <p className="text-sm">{viewOrder.shippingAddress.country}</p>
            </div>
          </div>

          <h4 className="font-medium text-gray-700 mb-2">Order Items</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {viewOrder.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {item.productName}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-2 text-right text-sm font-medium"
                  >
                    Total:
                  </td>
                  <td className="px-3 py-2 text-sm font-medium">
                    {formatCurrency(viewOrder.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setUpdateOrder(viewOrder.id);
                setNewStatus(viewOrder.status);
                setViewOrder(null);
              }}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mr-2"
            >
              Update Status
            </button>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full border">
          <thead className="bg-[#531A1A] text-white">
            <tr>
              <th className="p-3 border">Order ID</th>
              <th className="p-3 border">Customer ID</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Items</th>
              <th className="p-3 border">Total</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="text-center border-b">
                <td className="p-3 border text-xs">
                  {order.id.substring(0, 10)}...
                </td>
                <td className="p-3 border text-xs">
                  {order.userId.substring(0, 10)}...
                </td>
                <td className="p-3 border">{formatDate(order.createdAt)}</td>
                <td className="p-3 border">{order.items.length} items</td>
                <td className="p-3 border">{formatCurrency(order.total)}</td>
                <td className="p-3 border">
                  <span
                    className={`px-2 py-1 rounded text-xs ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-3 border flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => setViewOrder(order)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs"
                  >
                    View
                  </button>
                  <button
                    onClick={() => {
                      setUpdateOrder(order.id);
                      setNewStatus(order.status);
                    }}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-700 text-xs"
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

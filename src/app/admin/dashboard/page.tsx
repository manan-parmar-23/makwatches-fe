"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  UserGroupIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";

// statIcons removed (unused)

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
};

function AdminDashboardPage() {
  const [stats, setStats] = useState([
    {
      name: "Total Users",
      value: "-",
      icon: UserGroupIcon,
      color: "bg-blue-100 text-blue-600",
    },
    {
      name: "Orders",
      value: "-",
      icon: ShoppingBagIcon,
      color: "bg-green-100 text-green-600",
    },
    {
      name: "Revenue",
      value: "-",
      icon: CurrencyDollarIcon,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      name: "Products",
      value: "-",
      icon: CubeIcon,
      color: "bg-purple-100 text-purple-600",
    },
  ]);
  interface Order {
    id: string;
    userId: string;
    createdAt: string;
    total: number;
    status: string;
  }
  const [recentOrders, setRecentOrders] = useState<
    Array<{
      id: string;
      customer: string;
      date: string;
      amount: string;
      status: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        // Fetch stats
        const [usersRes, ordersRes, productsRes] = await Promise.all([
          api.get("/admin/accounts"),
          api.get("/orders"),
          api.get("/products"),
        ]);
        const users = usersRes.data.data || [];
        const orders = ordersRes.data.data || [];
        const products = productsRes.data.data || [];
        // Calculate revenue
        const revenue = orders.reduce(
          (sum: number, o: Order) => sum + (o.total || 0),
          0
        );
        setStats([
          {
            name: "Total Users",
            value: users.length.toLocaleString(),
            icon: UserGroupIcon,
            color: "bg-blue-100 text-blue-600",
          },
          {
            name: "Orders",
            value: orders.length.toLocaleString(),
            icon: ShoppingBagIcon,
            color: "bg-green-100 text-green-600",
          },
          {
            name: "Revenue",
            value: `₹${revenue.toLocaleString()}`,
            icon: CurrencyDollarIcon,
            color: "bg-yellow-100 text-yellow-600",
          },
          {
            name: "Products",
            value: products.length.toLocaleString(),
            icon: CubeIcon,
            color: "bg-purple-100 text-purple-600",
          },
        ]);
        // Recent orders (latest 5)
        setRecentOrders(
          orders
            .sort(
              (a: Order, b: Order) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .slice(0, 5)
            .map((o: Order) => ({
              id: o.id,
              customer: o.userId,
              date: o.createdAt
                ? new Date(o.createdAt).toLocaleDateString()
                : "",
              amount: `₹${o.total.toFixed(2)}`,
              status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
            }))
        );
      } catch {
        // fallback to dashes
        setStats([
          {
            name: "Total Users",
            value: "-",
            icon: UserGroupIcon,
            color: "bg-blue-100 text-blue-600",
          },
          {
            name: "Orders",
            value: "-",
            icon: ShoppingBagIcon,
            color: "bg-green-100 text-green-600",
          },
          {
            name: "Revenue",
            value: "-",
            icon: CurrencyDollarIcon,
            color: "bg-yellow-100 text-yellow-600",
          },
          {
            name: "Products",
            value: "-",
            icon: CubeIcon,
            color: "bg-purple-100 text-purple-600",
          },
        ]);
        setRecentOrders([]);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold text-[#531A1A] mb-2">
        Admin Dashboard
      </h1>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`flex items-center gap-4 p-5 rounded-xl shadow-sm bg-white hover:shadow-md transition duration-200 cursor-pointer group`}
          >
            <div
              className={`p-3 rounded-full ${stat.color} group-hover:scale-105 transition-transform`}
            >
              <stat.icon className="h-7 w-7" />
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium">
                {stat.name}
              </div>
              <div className="text-xl font-bold text-gray-900">
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#531A1A]">
            Recent Orders
          </h2>
          <button className="text-sm text-[#531A1A] hover:underline">
            View All
          </button>
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 px-3 font-semibold text-gray-600">
                Order ID
              </th>
              <th className="py-2 px-3 font-semibold text-gray-600">
                Customer
              </th>
              <th className="py-2 px-3 font-semibold text-gray-600">Date</th>
              <th className="py-2 px-3 font-semibold text-gray-600">Amount</th>
              <th className="py-2 px-3 font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            ) : recentOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-400">
                  No recent orders
                </td>
              </tr>
            ) : (
              recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b hover:bg-gray-50 transition duration-150"
                >
                  <td className="py-2 px-3 font-mono text-[#531A1A]">
                    {order.id}
                  </td>
                  <td className="py-2 px-3">{order.customer}</td>
                  <td className="py-2 px-3">{order.date}</td>
                  <td className="py-2 px-3 font-semibold">{order.amount}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        statusColors[order.status.toLowerCase()] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboardPage;

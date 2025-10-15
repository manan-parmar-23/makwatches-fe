"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  FiUsers as UserGroupIcon,
  FiShoppingBag as ShoppingBagIcon,
  FiDollarSign as CurrencyDollarIcon,
  FiBox as CubeIcon,
  FiArrowUpRight as ArrowUpRightIcon,
  FiStar as SparklesIcon,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import ProductFormModal from "@/components/admin/ProductFormModal";

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

const statusColors: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function AdminDashboardPage() {
  const [stats, setStats] = useState([
    {
      name: "Total Users",
      value: "-",
      icon: UserGroupIcon,
      color: "from-blue-500/10 to-blue-600/10",
      iconColor: "text-blue-600",
      borderColor: "border-blue-100",
      change: "+12%",
      trend: "up",
    },
    {
      name: "Orders",
      value: "-",
      icon: ShoppingBagIcon,
      color: "from-emerald-500/10 to-emerald-600/10",
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-100",
      change: "+8%",
      trend: "up",
    },
    {
      name: "Revenue",
      value: "-",
      icon: CurrencyDollarIcon,
      color: "from-amber-500/10 to-orange-500/10",
      iconColor: "text-amber-600",
      borderColor: "border-amber-100",
      change: "+24%",
      trend: "up",
    },
    {
      name: "Products",
      value: "-",
      icon: CubeIcon,
      color: "from-purple-500/10 to-purple-600/10",
      iconColor: "text-purple-600",
      borderColor: "border-purple-100",
      change: "+5%",
      trend: "up",
    },
  ]);
  const router = useRouter();

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
  const [productModalOpen, setProductModalOpen] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        // Helper to read a list from different response shapes
        const extractList = (payload: unknown): unknown[] => {
          if (!payload) return [];
          const d = (payload as { data?: unknown }).data ?? payload;
          if (Array.isArray(d)) return d as unknown[];
          if (
            d &&
            typeof d === "object" &&
            Array.isArray((d as { data?: unknown[] }).data)
          )
            return (d as { data: unknown[] }).data;
          if (
            d &&
            typeof d === "object" &&
            Array.isArray((d as { users?: unknown[] }).users)
          )
            return (d as { users: unknown[] }).users;
          if (
            d &&
            typeof d === "object" &&
            Array.isArray((d as { accounts?: unknown[] }).accounts)
          )
            return (d as { accounts: unknown[] }).accounts;
          if (
            d &&
            typeof d === "object" &&
            Array.isArray((d as { items?: unknown[] }).items)
          )
            return (d as { items: unknown[] }).items;
          return [];
        };

        // Try multiple endpoints to fetch users, as backends may vary
        const userEndpoints = [
          "/admin/accounts",
          "/admin/users",
          "/admin/customers",
          "/accounts",
          "/users",
          "/customers",
        ];

        let users: unknown[] = [];
        for (const ep of userEndpoints) {
          try {
            const res = await api.get(ep);
            const list = extractList(res?.data);
            if (Array.isArray(list) && list.length >= 0) {
              users = list;
              break;
            }
          } catch {
            // keep trying next endpoint
          }
        }

        const [ordersRes, productsRes] = await Promise.all([
          api.get("/orders"),
          api.get("/products"),
        ]);

        const orders = extractList(ordersRes?.data) as unknown[] as Order[];
        const products = extractList(productsRes?.data) as unknown[];

        const revenue: number = orders.reduce(
          (sum, o) => sum + (o.total || 0),
          0
        );

        setStats([
          {
            name: "Total Users",
            value: (users?.length ?? 0).toLocaleString(),
            icon: UserGroupIcon,
            color: "from-blue-500/10 to-blue-600/10",
            iconColor: "text-blue-600",
            borderColor: "border-blue-100",
            change: "+12%",
            trend: "up",
          },
          {
            name: "Orders",
            value: orders.length.toLocaleString(),
            icon: ShoppingBagIcon,
            color: "from-emerald-500/10 to-emerald-600/10",
            iconColor: "text-emerald-600",
            borderColor: "border-emerald-100",
            change: "+8%",
            trend: "up",
          },
          {
            name: "Revenue",
            value: `₹${revenue.toLocaleString()}`,
            icon: CurrencyDollarIcon,
            color: "from-amber-500/10 to-orange-500/10",
            iconColor: "text-amber-600",
            borderColor: "border-amber-100",
            change: "+24%",
            trend: "up",
          },
          {
            name: "Products",
            value: products.length.toLocaleString(),
            icon: CubeIcon,
            color: "from-purple-500/10 to-purple-600/10",
            iconColor: "text-purple-600",
            borderColor: "border-purple-100",
            change: "+5%",
            trend: "up",
          },
        ]);

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
        setStats([
          {
            name: "Total Users",
            value: "-",
            icon: UserGroupIcon,
            color: "from-blue-500/10 to-blue-600/10",
            iconColor: "text-blue-600",
            borderColor: "border-blue-100",
            change: "+12%",
            trend: "up",
          },
          {
            name: "Orders",
            value: "-",
            icon: ShoppingBagIcon,
            color: "from-emerald-500/10 to-emerald-600/10",
            iconColor: "text-emerald-600",
            borderColor: "border-emerald-100",
            change: "+8%",
            trend: "up",
          },
          {
            name: "Revenue",
            value: "-",
            icon: CurrencyDollarIcon,
            color: "from-amber-500/10 to-orange-500/10",
            iconColor: "text-amber-600",
            borderColor: "border-amber-100",
            change: "+24%",
            trend: "up",
          },
          {
            name: "Products",
            value: "-",
            icon: CubeIcon,
            color: "from-purple-500/10 to-purple-600/10",
            iconColor: "text-purple-600",
            borderColor: "border-purple-100",
            change: "+5%",
            trend: "up",
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
    <div
      className="transition-all duration-500 ease-in-out mt-20"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Subtle background elements
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-5 animate-pulse"
          style={{ backgroundColor: COLORS.primary }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-3 animate-pulse"
          style={{ backgroundColor: COLORS.secondary }}
        />
      </div> */}

      <div className="relative space-y-6 p-2 sm:p-4 md:p-6 max-w-7xl mx-auto">
        {/* More compact header */}
        <div className="mb-6 animate-fade-in-up">
          <div className="flex items-center mb-3 group">
            <div
              className="w-1 h-8 rounded-full mr-3 transform group-hover:scale-y-110 transition-transform duration-300"
              style={{ backgroundColor: COLORS.primary }}
            />
            <div>
              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-1 hover:tracking-wide transition-all duration-300"
                style={{ color: COLORS.primary }}
              >
                Admin Dashboard
              </h1>
              <div className="flex items-center space-x-1">
                <SparklesIcon
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  style={{ color: COLORS.secondary }}
                />
                <p
                  className="text-xs sm:text-sm font-medium"
                  style={{ color: COLORS.textMuted }}
                >
                  Welcome back! Here&apos;s what&apos;s happening with your
                  store today.
                </p>
              </div>
            </div>
          </div>
          <div
            className="w-24 h-1 rounded-full transform hover:w-32 transition-all duration-500"
            style={{
              background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`,
            }}
          />
        </div>

        {/* Stats - more compact, better layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {stats.map((stat, index) => (
            <div
              key={stat.name}
              className={`group relative overflow-hidden rounded-xl border transition-all duration-500 hover:scale-102 hover:-translate-y-1 cursor-pointer shadow-sm hover:shadow-md ${stat.borderColor}`}
              style={{
                backgroundColor: COLORS.background,
                animationDelay: `${index * 150}ms`,
                boxShadow: loading ? "none" : `0 2px 8px ${COLORS.primary}08`,
              }}
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.color} group-hover:opacity-100 transition-opacity duration-500 opacity-50`}
              />

              {/* Content */}
              <div className="relative p-3 sm:p-4">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className="flex-1">
                    <div
                      className="text-xs font-semibold mb-1 uppercase tracking-wider opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ color: COLORS.textMuted }}
                    >
                      {stat.name}
                    </div>
                    <div
                      className="text-xl sm:text-2xl md:text-3xl font-bold transition-all duration-300 group-hover:scale-105"
                      style={{ color: COLORS.text }}
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-4 h-4 border-2 rounded-full animate-spin"
                            style={{
                              borderColor: `${COLORS.secondary}40`,
                              borderTopColor: COLORS.primary,
                            }}
                          />
                          <span
                            className="text-xs animate-pulse"
                            style={{ color: COLORS.textMuted }}
                          >
                            Loading...
                          </span>
                        </div>
                      ) : (
                        stat.value
                      )}
                    </div>
                    {!loading && (
                      <div className="flex items-center mt-1 sm:mt-2 space-x-1">
                        <ArrowUpRightIcon className="w-3 h-3 text-emerald-500" />
                        <span className="text-xs font-semibold text-emerald-600">
                          {stat.change}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: COLORS.textMuted }}
                        >
                          vs last month
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Icon */}
                  <div
                    className={`p-2 sm:p-3 rounded-lg ${stat.iconColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm group-hover:shadow-md`}
                    style={{ backgroundColor: `${COLORS.surface}80` }}
                  >
                    <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                </div>

                {/* Hover effect */}
                <div
                  className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-xl"
                  style={{
                    background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.primaryLight})`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders Table - more compact */}
        <div
          className="rounded-xl shadow-md overflow-hidden border transition-all duration-500 hover:shadow-lg hover:border-opacity-80"
          style={{
            backgroundColor: COLORS.background,
            borderColor: `${COLORS.surfaceLight}60`,
            boxShadow: `0 4px 16px ${COLORS.primary}08`,
          }}
        >
          {/* Table Header */}
          <div
            className="px-4 sm:px-6 py-4 sm:py-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
            style={{
              backgroundColor: COLORS.surface,
              borderColor: `${COLORS.surfaceLight}80`,
            }}
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-1 h-10 rounded-full"
                style={{ backgroundColor: COLORS.primary }}
              />
              <div>
                <h2
                  className="text-lg sm:text-xl font-bold mb-0.5"
                  style={{ color: COLORS.primary }}
                >
                  Recent Orders
                </h2>
                <p
                  className="text-xs sm:text-sm font-medium"
                  style={{ color: COLORS.textMuted }}
                >
                  Latest orders from your customers
                </p>
              </div>
            </div>
            <button
              className="group px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-md transform flex items-center space-x-2 hover:-translate-y-0.5 text-sm"
              style={{ backgroundColor: COLORS.primary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.primaryDark;
                e.currentTarget.style.boxShadow = `0 8px 16px ${COLORS.primary}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.primary;
                e.currentTarget.style.boxShadow = "none";
              }}
              onClick={(e) => {
                e.stopPropagation();
                router.push("/admin/dashboard/orders");
              }}
            >
              <span>View All Orders</span>
              <ArrowUpRightIcon className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </button>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className="border-b"
                  style={{
                    backgroundColor: `${COLORS.surface}60`,
                    borderColor: `${COLORS.surfaceLight}60`,
                  }}
                >
                  {["Order ID", "Customer", "Date", "Amount", "Status"].map(
                    (header, index) => (
                      <th
                        key={header}
                        className="px-3 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm transition-all duration-300 hover:text-opacity-80"
                        style={{
                          color: COLORS.text,
                          animationDelay: `${index * 100}ms`,
                        }}
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <div
                          className="w-8 h-8 border-3 rounded-full animate-spin"
                          style={{
                            borderColor: `${COLORS.secondary}40`,
                            borderTopColor: COLORS.primary,
                          }}
                        />
                        <span
                          className="text-sm font-medium"
                          style={{ color: COLORS.textMuted }}
                        >
                          Loading orders...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center animate-pulse"
                          style={{ backgroundColor: `${COLORS.textMuted}20` }}
                        >
                          <ShoppingBagIcon
                            className="w-6 h-6"
                            style={{ color: COLORS.textMuted }}
                          />
                        </div>
                        <div>
                          <p
                            className="text-sm font-semibold mb-1"
                            style={{ color: COLORS.text }}
                          >
                            No recent orders
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: COLORS.textMuted }}
                          >
                            Orders will appear here when customers make
                            purchases
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order, index) => (
                    <tr
                      key={order.id}
                      className="border-b transition-all duration-300 group cursor-pointer hover:bg-gray-50"
                      style={{
                        borderColor: `${COLORS.surfaceLight}60`,
                        animationDelay: `${index * 150}ms`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${COLORS.surface}40`;
                        e.currentTarget.style.transform = "translateX(2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      <td className="px-3 sm:px-4 py-3 sm:py-4">
                        <div
                          className="font-mono text-xs px-2 py-1 rounded-lg inline-block transition-all duration-300 group-hover:scale-105 font-semibold"
                          style={{
                            backgroundColor: `${COLORS.primary}15`,
                            color: COLORS.primary,
                          }}
                        >
                          #{order.id.slice(-8)}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                            style={{ backgroundColor: `${COLORS.secondary}40` }}
                          >
                            <UserGroupIcon
                              className="w-3 h-3 sm:w-4 sm:h-4"
                              style={{ color: "white" }}
                            />
                          </div>
                          <span
                            className="font-semibold text-xs sm:text-sm"
                            style={{ color: COLORS.text }}
                          >
                            {order.customer.slice(0, 8)}...
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium"
                        style={{ color: COLORS.textMuted }}
                      >
                        {order.date}
                      </td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4">
                        <span
                          className="font-bold text-sm sm:text-base group-hover:scale-105 transition-transform duration-300 inline-block"
                          style={{ color: COLORS.primary }}
                        >
                          {order.amount}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-all duration-300 hover:scale-105 ${
                            statusColors[order.status.toLowerCase()] ||
                            "bg-gray-50 text-gray-700 border-gray-200"
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

        {/* Quick Actions - more compact */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6">
          {/* Add New Product */}
          <button
            type="button"
            className={`group relative overflow-hidden w-full text-left p-4 rounded-xl border cursor-pointer transition-all duration-500 hover:scale-103 hover:-translate-y-1 hover:shadow-md hover:border-blue-300`}
            style={{
              backgroundColor: COLORS.background,
              borderColor: COLORS.surfaceLight,
              animationDelay: `0ms`,
            }}
            onMouseEnter={(e) => {
              (
                e.currentTarget as HTMLButtonElement
              ).style.boxShadow = `0 8px 16px ${COLORS.primary}10`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
            onClick={(e) => {
              e.stopPropagation();
              setProductModalOpen(true);
            }}
          >
            <div
              aria-hidden="true"
              className={`absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
            />
            <div className="relative">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm group-hover:shadow-md"
                style={{ backgroundColor: `${COLORS.primary}15` }}
              >
                <span className="text-lg">🚀</span>
              </div>
              <h3
                className="text-sm font-bold mb-1 group-hover:text-opacity-90 transition-all duration-300"
                style={{ color: COLORS.text }}
              >
                Add New Product
              </h3>
              <p
                className="text-xs leading-relaxed group-hover:text-opacity-80 transition-all duration-300"
                style={{ color: COLORS.textMuted }}
              >
                Create a new product listing
              </p>
              <div className="mt-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300">
                <span
                  className="text-xs font-semibold"
                  style={{ color: COLORS.primary }}
                >
                  Get started
                </span>
                <ArrowUpRightIcon
                  className="w-3 h-3"
                  style={{ color: COLORS.primary }}
                />
              </div>
            </div>
          </button>
          {/* Manage Orders */}
          <button
            type="button"
            className={`group relative overflow-hidden w-full text-left p-4 rounded-xl border cursor-pointer transition-all duration-500 hover:scale-103 hover:-translate-y-1 hover:shadow-md hover:border-emerald-300`}
            style={{
              backgroundColor: COLORS.background,
              borderColor: COLORS.surfaceLight,
              animationDelay: `200ms`,
            }}
            onMouseEnter={(e) => {
              (
                e.currentTarget as HTMLButtonElement
              ).style.boxShadow = `0 8px 16px ${COLORS.primary}10`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
            onClick={(e) => {
              e.stopPropagation();
              router.push("/admin/dashboard/orders");
            }}
          >
            <div
              aria-hidden="true"
              className={`absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
            />
            <div className="relative">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm group-hover:shadow-md"
                style={{ backgroundColor: `${COLORS.primary}15` }}
              >
                <span className="text-lg">📦</span>
              </div>
              <h3
                className="text-sm font-bold mb-1 group-hover:text-opacity-90 transition-all duration-300"
                style={{ color: COLORS.text }}
              >
                Manage Orders
              </h3>
              <p
                className="text-xs leading-relaxed group-hover:text-opacity-80 transition-all duration-300"
                style={{ color: COLORS.textMuted }}
              >
                View and update order status
              </p>
              <div className="mt-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300">
                <span
                  className="text-xs font-semibold"
                  style={{ color: COLORS.primary }}
                >
                  Get started
                </span>
                <ArrowUpRightIcon
                  className="w-3 h-3"
                  style={{ color: COLORS.primary }}
                />
              </div>
            </div>
          </button>
          {/* View Analytics */}
          <button
            type="button"
            className={`group relative overflow-hidden w-full text-left p-4 rounded-xl border cursor-pointer transition-all duration-500 hover:scale-103 hover:-translate-y-1 hover:shadow-md hover:border-purple-300`}
            style={{
              backgroundColor: COLORS.background,
              borderColor: COLORS.surfaceLight,
              animationDelay: `400ms`,
            }}
            onMouseEnter={(e) => {
              (
                e.currentTarget as HTMLButtonElement
              ).style.boxShadow = `0 8px 16px ${COLORS.primary}10`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
            onClick={(e) => {
              e.stopPropagation();
              router.push("/admin/dashboard/analytics");
            }}
          >
            <div
              aria-hidden="true"
              className={`absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
            />
            <div className="relative">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm group-hover:shadow-md"
                style={{ backgroundColor: `${COLORS.primary}15` }}
              >
                <span className="text-lg">📊</span>
              </div>
              <h3
                className="text-sm font-bold mb-1 group-hover:text-opacity-90 transition-all duration-300"
                style={{ color: COLORS.text }}
              >
                View Analytics
              </h3>
              <p
                className="text-xs leading-relaxed group-hover:text-opacity-80 transition-all duration-300"
                style={{ color: COLORS.textMuted }}
              >
                Check sales and performance
              </p>
              <div className="mt-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300">
                <span
                  className="text-xs font-semibold"
                  style={{ color: COLORS.primary }}
                >
                  Get started
                </span>
                <ArrowUpRightIcon
                  className="w-3 h-3"
                  style={{ color: COLORS.primary }}
                />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>

      <ProductFormModal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        editing={null}
      />
    </div>
  );
}

export default AdminDashboardPage;

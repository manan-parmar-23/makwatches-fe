"use client";

import React from "react";
import {
  UserGroupIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";

const stats = [
  {
    name: "Total Users",
    value: "1,245",
    icon: UserGroupIcon,
    color: "bg-blue-100 text-blue-600",
  },
  {
    name: "Orders",
    value: "320",
    icon: ShoppingBagIcon,
    color: "bg-green-100 text-green-600",
  },
  {
    name: "Revenue",
    value: "$12,400",
    icon: CurrencyDollarIcon,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    name: "Products",
    value: "87",
    icon: CubeIcon,
    color: "bg-purple-100 text-purple-600",
  },
];

const recentOrders = [
  {
    id: "ORD-1001",
    customer: "John Doe",
    date: "2025-08-10",
    amount: "$120.00",
    status: "Completed",
  },
  {
    id: "ORD-1002",
    customer: "Jane Smith",
    date: "2025-08-09",
    amount: "$75.50",
    status: "Pending",
  },
  {
    id: "ORD-1003",
    customer: "Alice Brown",
    date: "2025-08-08",
    amount: "$210.00",
    status: "Completed",
  },
  {
    id: "ORD-1004",
    customer: "Bob Lee",
    date: "2025-08-07",
    amount: "$55.00",
    status: "Cancelled",
  },
];

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Page Title */}
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
            {recentOrders.map((order) => (
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
                    className={`px-2 py-1 rounded text-xs font-semibold
                      ${
                        order.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }
                    `}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

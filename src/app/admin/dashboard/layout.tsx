"use client";
// src/app/admin/layout.tsx
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
//import { UserCircleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'; // Uncomment if Heroicons installed

const navLinks = [
  { name: "Dashboard", href: "/admin/dashboard" },
  { name: "Categories", href: "/admin/dashboard/categories" },
  { name: "Products", href: "/admin/dashboard/products" },
  { name: "Orders", href: "/admin/dashboard/orders" },
  { name: "Users", href: "/admin/dashboard/customers" },
  { name: "Settings", href: "/admin/dashboard/settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, role, logout } = useAuth();

  // Real admin check
  if (role !== "admin") {
    return (
      <div className="flex items-center justify-center h-screen text-xl text-red-600">
        Access Denied: Admins Only
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white shadow-md sticky top-0 z-20">
        <div className="flex items-center gap-2">
          {/* Mobile sidebar toggle */}
          <button
            className="md:hidden text-[#531A1A] focus:outline-none mr-2"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            {/* <Bars3Icon className="h-7 w-7" /> */}
            <span className="text-2xl font-bold">≡</span>
          </button>
          <span className="text-xl font-bold text-[#531A1A]">Admin Panel</span>
        </div>
        {/* Profile/avatar section */}
        <div className="flex items-center gap-2">
          {/* <UserCircleIcon className="h-8 w-8 text-[#531A1A]" /> */}
          <span className="rounded-full bg-[#531A1A]/10 px-3 py-1 text-[#531A1A] font-semibold">
            {user?.name || user?.email || "Admin"}
          </span>
        </div>
      </header>
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`fixed md:static top-0 left-0 h-full md:h-auto w-64 bg-white shadow-lg z-30 transform transition-transform duration-300
            ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0`}
        >
          <nav className="flex flex-col pt-8 md:pt-6 gap-2 h-full">
            {/* Mobile close button */}
            <button
              className="md:hidden self-end mr-4 mb-2 text-[#531A1A]"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              {/* <XMarkIcon className="h-6 w-6" /> */}
              <span className="text-xl">×</span>
            </button>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-6 py-2 rounded-lg font-semibold text-[#531A1A] text-lg transition
                  hover:bg-[#531A1A]/10 hover:text-[#531A1A] focus:outline-none
                  ${
                    pathname === link.href
                      ? "bg-[#531A1A]/20 text-[#531A1A]"
                      : ""
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <button
              className="px-6 py-2 rounded-lg font-semibold text-[#531A1A] text-lg transition hover:bg-red-100 hover:text-red-600 mt-4 text-left"
              onClick={logout}
            >
              Logout
            </button>
          </nav>
        </aside>
        {/* Main content area */}
        <main className="flex-1 p-6 md:ml-64">{children}</main>
      </div>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import { useAccount } from "@/context/AccountContext";
import { useEffect, useState } from "react";
import {
  FiHome,
  FiUser,
  FiSettings,
  FiHeart,
  FiBox,
  FiStar,
  FiLogOut,
} from "react-icons/fi";

// Mak Watches brand palette
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

type ReviewItem = {
  id: string;
  productId?: string;
  productName?: string;
  productImage?: string;
  rating: number;
  title: string;
  comment: string;
  photoUrls?: string[];
  helpful?: number;
  createdAt: string | Date;
};

type WishlistItem = {
  wishlistId: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  inStock: boolean;
  size?: string;
};

export default function AccountPage() {
  const RAW_API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
  const API_BASE = RAW_API_BASE.replace(/\/+$/, "");
  // Replaced local state/fetch logic with the useAccount hook
  const {
    token,
    profile,
    wishlist,
    orders,
    reviews,
    loading,
    err,
    updatingProfile,
    updatingPrefs,
    mobileSidebarOpen,
    activeTab,
    editProfile,
    editPrefs,
    setEditProfile,
    setEditPrefs,
    setActiveTab,
    setMobileSidebarOpen,
    saveProfile,
    savePreferences,
    deleteReview,
    removeFromWishlist,
    logout,
  } = useAccount();

  // Local state to reflect review edits without reloading the whole context
  const [reviewsLocal, setReviewsLocal] = useState<ReviewItem[]>(
    Array.isArray(reviews) ? (reviews as unknown as ReviewItem[]) : []
  );
  useEffect(
    () =>
      setReviewsLocal(
        Array.isArray(reviews) ? (reviews as unknown as ReviewItem[]) : []
      ),
    [reviews]
  );

  // Edit review modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editReviewId, setEditReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editTitle, setEditTitle] = useState("");
  const [editComment, setEditComment] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const openEdit = (r: ReviewItem) => {
    setEditReviewId(r.id);
    setEditRating(Math.round(r.rating));
    setEditTitle(r.title || "");
    setEditComment(r.comment || "");
    setEditError(null);
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editReviewId) return;
    if (!token) return;
    if (editTitle.trim().length === 0 || editComment.trim().length < 5) {
      setEditError(
        "Please provide a title and a comment of at least 5 characters."
      );
      return;
    }
    setEditSubmitting(true);
    setEditError(null);
    try {
      const res = await fetch(`${API_BASE}/reviews/${editReviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: editRating,
          title: editTitle.trim(),
          comment: editComment.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data?.message || `Failed to update (status ${res.status})`
        );
      }
      // Optimistically update local list
      setReviewsLocal((prev: ReviewItem[]) =>
        prev.map((r) =>
          r.id === editReviewId
            ? {
                ...r,
                rating: editRating,
                title: editTitle.trim(),
                comment: editComment.trim(),
              }
            : r
        )
      );
      setEditOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update review";
      setEditError(msg);
    } finally {
      setEditSubmitting(false);
    }
  };

  // Wishlist -> Move to cart
  const [movingId, setMovingId] = useState<string | null>(null);
  const moveToCart = async (item: WishlistItem) => {
    if (!token) return;
    if (!item?.productId) return;
    try {
      setMovingId(item.wishlistId);
      const res = await fetch(`${API_BASE}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: String(item.productId),
          quantity: 1,
          size: item.size || "",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data?.message || `Failed to move to cart (status ${res.status})`
        );
      }
      // On success, remove from wishlist using context helper
      await removeFromWishlist(item.wishlistId);
    } catch (e) {
      console.error(e);
      // Optional: surface a toast in the future
    } finally {
      setMovingId(null);
    }
  };

  // Smooth scroll to top when changing tabs
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  if (loading)
    return (
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full border-3 border-t-transparent border-l-transparent border-r-[#1A1A1A]/70 border-b-[#1A1A1A] animate-spin mb-4"></div>
          <p
            className="font-medium animate-pulse tracking-wide"
            style={{ color: COLORS.primary }}
          >
            Loading your account...
          </p>
        </div>
      </main>
    );

  if (err)
    return (
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-600 flex items-center shadow-sm animate-fade-in">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-3 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="font-medium">{err}</span>
        </div>
      </main>
    );

  if (!token)
    return (
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="bg-[#F5F5F5] rounded-xl p-8 shadow-md text-center transform transition-all duration-300 hover:shadow-lg animate-fade-in">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-[#1A1A1A] mb-5 opacity-80"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h2
            className="text-2xl font-semibold mb-3"
            style={{ color: COLORS.primary }}
          >
            Authentication Required
          </h2>
          <p
            className="mb-7 max-w-md mx-auto"
            style={{ color: COLORS.textMuted }}
          >
            Please log in to view and manage your account information.
          </p>
          <a
            href="/login"
            className="inline-block px-8 py-3 rounded-full text-white font-medium text-sm transition-all duration-300 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2"
            style={{ backgroundColor: COLORS.primary }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = COLORS.primaryDark)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = COLORS.primary)
            }
          >
            Sign In
          </a>
        </div>
      </main>
    );

  // Navigation item definition for sidebar
  const navItems = [
    { id: "overview", label: "Overview", icon: <FiHome /> },
    { id: "profile", label: "Profile", icon: <FiUser /> },
    { id: "preferences", label: "Preferences", icon: <FiSettings /> },
    { id: "wishlist", label: "Wishlist", icon: <FiHeart /> },
    { id: "orders", label: "Orders", icon: <FiBox /> },
    { id: "reviews", label: "Reviews", icon: <FiStar /> },
  ] as const;

  return (
    <main className="max-w-6xl mx-auto" style={{ color: COLORS.text }}>
      {/* Mobile Header with hamburger */}
      <div
        className="lg:hidden flex items-center justify-between p-4 border-b sticky top-10 bg-white z-20 shadow-sm"
        style={{ borderColor: "#E5E5E5" }}
      >
        <h1
          className="text-xl font-semibold pt-6"
          style={{ color: COLORS.primary }}
        >
          My Account
        </h1>
        <button
          onClick={() => setMobileSidebarOpen((prev) => !prev)}
          className="w-10 h-10 pt-6 flex items-center justify-center rounded-lg transition-all duration-300 hover:shadow-sm"
          style={{ backgroundColor: "transparent" }}
          aria-label="Toggle navigation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke={COLORS.primary}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Mobile sidebar backdrop */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar navigation - collapsible on mobile */}
        <aside
          className={`w-full  lg:w-64 flex-shrink-0 bg-white lg:bg-gradient-to-br lg:from-white lg:to-[#F5F5F5]/80 p-5 border-r border-[#E5E5E5]/20 
            fixed lg:sticky top-12 md:top-28 h-full lg:h-fit md:z-10 z-50 transform transition-all duration-300 ease-in-out rounded-xl
            ${
              mobileSidebarOpen
                ? "translate-x-0 shadow-xl"
                : "-translate-x-full lg:translate-x-0"
            }`}
        >
          {/* User Profile Section */}
          <div className="flex items-center space-x-3 mb-8 p-2 bg-[#F5F5F5]/50 rounded-xl transition-all duration-300 hover:bg-[#E5E5E5]/80">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-[#F5F5F5] flex-shrink-0 border-2 border-[#1A1A1A]/10 shadow-md transition-transform duration-300 hover:scale-105">
              {profile?.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-xl font-bold"
                  style={{ color: `${COLORS.primary}66` }}
                >
                  {profile?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <h2 className="font-medium" style={{ color: COLORS.primary }}>
                {profile?.name || "User"}
              </h2>
              <p className="text-xs" style={{ color: COLORS.textMuted }}>
                {profile?.email || ""}
              </p>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden ml-auto p-1.5 rounded-full transition-all duration-300"
              style={{ backgroundColor: "transparent" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke={COLORS.primary}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2 mb-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-300
                  ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-[#1A1A1A] to-[#000000] text-white font-medium shadow-md transform scale-102"
                      : "hover:shadow-sm"
                  }`}
                style={
                  activeTab === item.id ? undefined : { color: COLORS.text }
                }
              >
                <span className="mr-3 text-lg w-6 flex-shrink-0">
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
                {item.id === "wishlist" && wishlist.length > 0 && (
                  <span
                    className="ml-auto text-white text-xs px-2 py-0.5 rounded-full min-w-[1.5rem] text-center shadow-sm animate-pulse"
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    {wishlist.length}
                  </span>
                )}
                {item.id === "orders" && orders.length > 0 && (
                  <span
                    className="ml-auto text-white text-xs px-2 py-0.5 rounded-full min-w-[1.5rem] text-center shadow-sm"
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    {orders.length}
                  </span>
                )}
                {item.id === "reviews" && reviews.length > 0 && (
                  <span
                    className="ml-auto text-white text-xs px-2 py-0.5 rounded-full min-w-[1.5rem] text-center shadow-sm"
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    {reviews.length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Logout Button */}
          <div
            className="mt-auto pt-4 border-t"
            style={{ borderColor: "#E5E5E5" }}
          >
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-3 rounded-xl text-left hover:bg-[#EF4444]/10 transition-all duration-300 group"
              style={{ color: "#EF4444" }}
            >
              <span className="mr-3 text-lg group-hover:rotate-12 transition-transform duration-300">
                <FiLogOut />
              </span>
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1 p-4 md:mt-24 mt-10 lg:p-4 overflow-hidden">
          <div className="mb-8">
            <h1
              className="text-2xl font-bold"
              style={{ color: COLORS.primary }}
            >
              {navItems.find((item) => item.id === activeTab)?.label}
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-[#1A1A1A] to-[#BFA5A5] rounded-full hidden lg:block transform transition-all duration-500"></div>
          </div>

          {/* Tab Content - Adding transition animations */}
          <div className="transition-all duration-500 transform animate-fade-in z-0">
            {activeTab === "overview" && (
              <section className="grid gap-6">
                {/* Profile card with avatar */}
                {profile && (
                  <div className="p-6 border rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-center gap-5">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-[#F0EBEB] to-[#F9F6F6] flex-shrink-0 border-2 border-[#531A1A]/10 shadow-md transition-transform duration-300 hover:scale-105">
                      {profile.avatarUrl ? (
                        <Image
                          src={profile.avatarUrl}
                          alt={profile.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-3xl font-bold"
                          style={{ color: `${COLORS.primary}30` }}
                        >
                          {profile.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex-grow text-center sm:text-left">
                      <h2
                        className="text-2xl font-semibold"
                        style={{ color: COLORS.primary }}
                      >
                        {profile.name}
                      </h2>
                      <div
                        className="text-sm"
                        style={{ color: COLORS.textMuted }}
                      >
                        {profile.email}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: COLORS.textMuted }}
                      >
                        Member since{" "}
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </div>
                      {profile.bio && (
                        <p
                          className="text-sm mt-3"
                          style={{ color: COLORS.text }}
                        >
                          {profile.bio}
                        </p>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      <button
                        onClick={() => setActiveTab("profile")}
                        className="text-sm px-6 py-2.5 rounded-full border border-[#531A1A] hover:bg-[#531A1A] hover:text-white transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#531A1A] focus:ring-opacity-50"
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                )}

                {/* Activity cards */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div
                    onClick={() => setActiveTab("wishlist")}
                    className="p-5 border rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:border-[#531A1A]/20"
                  >
                    <div className="font-medium mb-2 text-sm flex justify-between items-center">
                      <span>Wishlist</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div
                      className="text-3xl font-bold"
                      style={{ color: COLORS.primary }}
                    >
                      {wishlist.length}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: COLORS.textMuted }}
                    >
                      saved items
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab("orders")}
                    className="p-5 border rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:border-[#531A1A]/20"
                  >
                    <div className="font-medium mb-2 text-sm flex justify-between items-center">
                      <span>Orders</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                        <path
                          fillRule="evenodd"
                          d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div
                      className="text-3xl font-bold"
                      style={{ color: COLORS.primary }}
                    >
                      {orders.length}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: COLORS.textMuted }}
                    >
                      placed orders
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab("reviews")}
                    className="p-5 border rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:border-[#531A1A]/20"
                  >
                    <div className="font-medium mb-2 text-sm flex justify-between items-center">
                      <span>Reviews</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-yellow-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div
                      className="text-3xl font-bold"
                      style={{ color: COLORS.primary }}
                    >
                      {reviews.length}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: COLORS.textMuted }}
                    >
                      product reviews
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab("preferences")}
                    className="p-5 border rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:border-[#531A1A]/20"
                  >
                    <div className="font-medium mb-2 text-sm flex justify-between items-center">
                      <span>Preferences</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-blue-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div
                      className="text-3xl font-bold"
                      style={{ color: COLORS.primary }}
                    >
                      Settings
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: COLORS.textMuted }}
                    >
                      personalization options
                    </div>
                  </div>
                </div>

                {/* Recent activity */}
                {orders.length > 0 && (
                  <div className="border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all duration-300">
                    <h3
                      className="font-medium text-sm mb-4"
                      style={{ color: COLORS.primary }}
                    >
                      Recent Order
                    </h3>
                    <div className="text-sm">
                      <div className="flex justify-between pb-3 border-b">
                        <div className="font-medium">
                          Order #{orders[0].id.substring(0, 8)}...
                        </div>
                        <div className="text-[#7C5C5C]">
                          {new Date(orders[0].createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex justify-between mt-3">
                        <div>{orders[0].items.length} items</div>
                        <div
                          className="font-semibold"
                          style={{ color: COLORS.primary }}
                        >
                          ₹{orders[0].total.toFixed(2)}
                        </div>
                      </div>
                      <div className="mt-2">
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${
                            orders[0].status === "delivered"
                              ? "bg-green-100 text-green-700"
                              : orders[0].status === "shipped"
                              ? "bg-blue-100 text-blue-700"
                              : orders[0].status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {orders[0].status.toUpperCase()}
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveTab("orders")}
                        className="w-full mt-4 py-2 text-center text-[#531A1A] text-sm font-medium hover:bg-[#F9F6F6] rounded-lg transition-colors duration-300"
                      >
                        View All Orders
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {activeTab === "profile" && profile && (
              <section className="max-w-xl transition-all duration-300 animate-fade-in">
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                  <h2
                    className="text-lg font-semibold mb-5"
                    style={{ color: COLORS.primary }}
                  >
                    Profile Details
                  </h2>
                  <div className="grid gap-5 text-sm">
                    <div className="transition-all duration-300 hover:bg-[#F9F6F6] p-2 rounded-lg">
                      <label className="block text-xs mb-2 text-[#7C5C5C] font-medium">
                        Gender
                      </label>
                      <select
                        value={editProfile.gender || ""}
                        onChange={(e) =>
                          setEditProfile((p) => ({
                            ...p,
                            gender: e.target.value,
                          }))
                        }
                        className="w-full border border-[#BFA5A5]/30 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#531A1A]/30 focus:border-[#531A1A] transition-all duration-300"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="transition-all duration-300 hover:bg-[#F9F6F6] p-2 rounded-lg">
                      <label className="block text-xs mb-2 text-[#7C5C5C] font-medium">
                        Phone
                      </label>
                      <input
                        value={editProfile.phone || ""}
                        onChange={(e) =>
                          setEditProfile((p) => ({
                            ...p,
                            phone: e.target.value,
                          }))
                        }
                        className="w-full border border-[#BFA5A5]/30 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#531A1A]/30 focus:border-[#531A1A] transition-all duration-300"
                      />
                    </div>
                    <div className="transition-all duration-300 hover:bg-[#F9F6F6] p-2 rounded-lg">
                      <label className="block text-xs mb-2 text-[#7C5C5C] font-medium">
                        Avatar URL
                      </label>
                      <input
                        value={editProfile.avatarUrl || ""}
                        onChange={(e) =>
                          setEditProfile((p) => ({
                            ...p,
                            avatarUrl: e.target.value,
                          }))
                        }
                        className="w-full border border-[#BFA5A5]/30 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#531A1A]/30 focus:border-[#531A1A] transition-all duration-300"
                      />
                    </div>
                    <div className="transition-all duration-300 hover:bg-[#F9F6F6] p-2 rounded-lg">
                      <label className="block text-xs mb-2 text-[#7C5C5C] font-medium">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={editProfile.dateOfBirth || ""}
                        onChange={(e) =>
                          setEditProfile((p) => ({
                            ...p,
                            dateOfBirth: e.target.value,
                          }))
                        }
                        className="w-full border border-[#BFA5A5]/30 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#531A1A]/30 focus:border-[#531A1A] transition-all duration-300"
                      />
                    </div>
                    <div className="transition-all duration-300 hover:bg-[#F9F6F6] p-2 rounded-lg">
                      <label className="block text-xs mb-2 text-[#7C5C5C] font-medium">
                        Bio
                      </label>
                      <textarea
                        value={editProfile.bio || ""}
                        onChange={(e) =>
                          setEditProfile((p) => ({ ...p, bio: e.target.value }))
                        }
                        className="w-full border border-[#BFA5A5]/30 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#531A1A]/30 focus:border-[#531A1A] transition-all duration-300 min-h-[100px] resize-y"
                      />
                    </div>
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={saveProfile}
                        disabled={updatingProfile}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#531A1A] to-[#3B1212] text-white text-sm font-medium shadow-sm hover:shadow-md transform transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {updatingProfile ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Saving...
                          </span>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "preferences" && (
              <section className="max-w-2xl transition-all duration-300 animate-fade-in">
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                  <h2
                    className="text-lg font-semibold mb-5"
                    style={{ color: COLORS.primary }}
                  >
                    Shopping Preferences
                  </h2>
                  <div className="grid gap-5 text-sm">
                    <div className="transition-all duration-300 hover:bg-[#F9F6F6] p-2 rounded-lg">
                      <label className="block text-xs mb-2 text-[#7C5C5C] font-medium">
                        Favorite Categories
                      </label>
                      <input
                        value={(editPrefs.favoriteCategories || []).join(", ")}
                        onChange={(e) =>
                          setEditPrefs((p) => ({
                            ...p,
                            favoriteCategories: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          }))
                        }
                        placeholder="e.g. Shirts, Dresses, Jeans"
                        className="w-full border border-[#BFA5A5]/30 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#531A1A]/30 focus:border-[#531A1A] transition-all duration-300"
                      />
                      <p className="text-xs text-[#7C5C5C] mt-1 pl-1">
                        Separate with commas
                      </p>
                    </div>
                    <div className="transition-all duration-300 hover:bg-[#F9F6F6] p-2 rounded-lg">
                      <label className="block text-xs mb-2 text-[#7C5C5C] font-medium">
                        Favorite Brands
                      </label>
                      <input
                        value={(editPrefs.favoriteBrands || []).join(", ")}
                        onChange={(e) =>
                          setEditPrefs((p) => ({
                            ...p,
                            favoriteBrands: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          }))
                        }
                        placeholder="e.g. Nike, Adidas, Zara"
                        className="w-full border border-[#BFA5A5]/30 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#531A1A]/30 focus:border-[#531A1A] transition-all duration-300"
                      />
                      <p className="text-xs text-[#7C5C5C] mt-1 pl-1">
                        Separate with commas
                      </p>
                    </div>
                    <div className="transition-all duration-300 hover:bg-[#F9F6F6] p-2 rounded-lg">
                      <label className="block text-xs mb-2 text-[#7C5C5C] font-medium">
                        Color Preferences
                      </label>
                      <input
                        value={(editPrefs.colorPreferences || []).join(", ")}
                        onChange={(e) =>
                          setEditPrefs((p) => ({
                            ...p,
                            colorPreferences: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          }))
                        }
                        placeholder="e.g. Blue, Black, Red"
                        className="w-full border border-[#BFA5A5]/30 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#531A1A]/30 focus:border-[#531A1A] transition-all duration-300"
                      />
                      <p className="text-xs text-[#7C5C5C] mt-1 pl-1">
                        Separate with commas
                      </p>
                    </div>
                    <div className="transition-all duration-300 hover:bg-[#F9F6F6] p-2 rounded-lg">
                      <label className="block text-xs mb-2 text-[#7C5C5C] font-medium">
                        Price Range
                      </label>
                      <input
                        placeholder="e.g. 500-2000"
                        value={
                          editPrefs.priceRange
                            ? editPrefs.priceRange.join("-")
                            : ""
                        }
                        onChange={(e) => {
                          const parts = e.target.value
                            .split("-")
                            .map((p) => parseFloat(p.trim()))
                            .filter((n) => !isNaN(n));
                          setEditPrefs((p) => ({
                            ...p,
                            priceRange: parts.length
                              ? parts.slice(0, 2)
                              : undefined,
                          }));
                        }}
                        className="w-full border border-[#BFA5A5]/30 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#531A1A]/30 focus:border-[#531A1A] transition-all duration-300"
                      />
                      <p className="text-xs text-[#7C5C5C] mt-1 pl-1">
                        Format: min-max (e.g. 500-2000)
                      </p>
                    </div>
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={savePreferences}
                        disabled={updatingPrefs}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#531A1A] to-[#3B1212] text-white text-sm font-medium shadow-sm hover:shadow-md transform transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {updatingPrefs ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Saving...
                          </span>
                        ) : (
                          "Save Preferences"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "wishlist" && (
              <section className="transition-all duration-300 animate-fade-in">
                <h2 className="text-lg font-semibold mb-5 flex items-center">
                  <span className="mr-2">Wishlist</span>
                  {wishlist.length > 0 && (
                    <span className="bg-[#531A1A]/10 text-[#531A1A] text-xs px-2 py-0.5 rounded-full">
                      {wishlist.length}
                    </span>
                  )}
                </h2>
                {wishlist.length === 0 && (
                  <div className="text-sm bg-[#F9F6F6] p-6 rounded-xl text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto text-[#BFA5A5] mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <p className="text-[#7C5C5C]">
                      Your wishlist is empty. Browse products and add items you
                      love!
                    </p>
                  </div>
                )}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {wishlist.map((w) => (
                    <div
                      key={w.wishlistId}
                      className="border rounded-xl p-4 bg-white shadow-sm group hover:shadow-md transition-all duration-300 text-sm flex flex-col relative transform hover:-translate-y-1"
                    >
                      <button
                        onClick={() => removeFromWishlist(w.wishlistId)}
                        className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 z-10"
                        title="Remove from wishlist"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-red-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <div className="overflow-hidden rounded-lg mb-3 group-hover:shadow-md transition-all duration-300">
                        {w.image && (
                          <Image
                            src={w.image}
                            alt={w.name}
                            width={400}
                            height={400}
                            className="h-44 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                      </div>
                      <div
                        className="font-medium truncate"
                        style={{ color: COLORS.primary }}
                        title={w.name}
                      >
                        {w.name}
                      </div>
                      <div className="mt-auto flex justify-between items-center pt-3">
                        <span
                          className="font-semibold text-lg"
                          style={{ color: COLORS.primary }}
                        >
                          ₹{w.price.toFixed(0)}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            w.inStock
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {w.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => moveToCart(w)}
                          disabled={!w.inStock || movingId === w.wishlistId}
                          className={`flex-1 px-3 py-2 rounded-lg text-white text-xs font-medium transition-all duration-300 shadow-sm ${
                            !w.inStock || movingId === w.wishlistId
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-[#531A1A] hover:bg-[#3B1212]"
                          }`}
                        >
                          {movingId === w.wishlistId
                            ? "Moving..."
                            : "Move to cart"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "reviews" && (
              <section className="transition-all duration-300 animate-fade-in">
                <h2 className="text-lg font-semibold mb-5 flex items-center">
                  <span className="mr-2">My Reviews</span>
                  {reviews.length > 0 && (
                    <span className="bg-[#531A1A]/10 text-[#531A1A] text-xs px-2 py-0.5 rounded-full">
                      {reviews.length}
                    </span>
                  )}
                </h2>
                {reviews.length === 0 && (
                  <div className="text-sm bg-[#F9F6F6] p-6 rounded-xl text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto text-[#BFA5A5] mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                    <p className="text-[#7C5C5C]">
                      You haven&apos;t written any reviews yet. Share your
                      experience with products!
                    </p>
                  </div>
                )}
                <div className="space-y-5">
                  {reviewsLocal.map((review: ReviewItem) => (
                    <div
                      key={review.id}
                      className="border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        {review.productImage && (
                          <div className="flex-shrink-0 rounded-lg overflow-hidden shadow-sm">
                            <Image
                              src={review.productImage}
                              alt={review.productName || "Product"}
                              width={70}
                              height={70}
                              className="rounded object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="flex-grow">
                          <div
                            className="font-medium"
                            style={{ color: COLORS.primary }}
                          >
                            {review.productName}
                          </div>
                          <div className="flex items-center mt-1.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`text-lg ${
                                  i < review.rating
                                    ? "text-amber-500"
                                    : "text-gray-300"
                                } transition-colors duration-300`}
                              >
                                ★
                              </span>
                            ))}
                            <span className="ml-2 text-xs text-[#7C5C5C]">
                              {review.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-[#7C5C5C]">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mt-3 pl-3 border-l-2 border-[#531A1A]/10">
                        <h3 className="text-sm font-medium">{review.title}</h3>
                        <p className="text-sm mt-2 text-[#2D1B1B]/80 leading-relaxed">
                          {review.comment}
                        </p>

                        {review.photoUrls && review.photoUrls.length > 0 && (
                          <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#BFA5A5] scrollbar-track-[#F9F6F6]">
                            {review.photoUrls.map(
                              (url: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex-shrink-0 rounded-md overflow-hidden shadow-sm"
                                >
                                  <Image
                                    src={url}
                                    alt={`Review image ${idx + 1}`}
                                    width={80}
                                    height={80}
                                    className="rounded object-cover hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#BFA5A5]/20 text-xs">
                        <div className="text-[#7C5C5C]">
                          {(review.helpful ?? 0) > 0 &&
                            `${review.helpful ?? 0} ${
                              (review.helpful ?? 0) === 1 ? "person" : "people"
                            } found this helpful`}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(review)}
                            className="text-[#531A1A] hover:text-[#3B1212] px-3 py-1.5 rounded-md hover:bg-[#F9F6F6] transition-colors duration-300"
                          >
                            <span className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M17.414 2.586a2 2 0 010 2.828l-9.9 9.9a1 1 0 01-.39.242l-3.5 1a1 1 0 01-1.238-1.238l1-3.5a1 1 0 01.242-.39l9.9-9.9a2 2 0 012.828 0z" />
                                <path
                                  fillRule="evenodd"
                                  d="M2 13.5V18h4.5l9.9-9.9-4.5-4.5L2 13.5z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Edit
                            </span>
                          </button>
                          <button
                            onClick={() => deleteReview(review.id)}
                            className="text-red-500 hover:text-red-700 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors duration-300"
                          >
                            <span className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Delete
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "orders" && (
              <section className="transition-all duration-300 animate-fade-in">
                <h2 className="text-lg font-semibold mb-5 flex items-center">
                  <span className="mr-2">Order History</span>
                  {orders.length > 0 && (
                    <span className="bg-[#531A1A]/10 text-[#531A1A] text-xs px-2 py-0.5 rounded-full">
                      {orders.length}
                    </span>
                  )}
                </h2>
                {orders.length === 0 && (
                  <div className="text-sm bg-[#F9F6F6] p-6 rounded-xl text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto text-[#BFA5A5] mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <p className="text-[#7C5C5C]">
                      You haven&apos;t placed any orders yet.
                    </p>
                  </div>
                )}
                <div className="space-y-6">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="border rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 text-sm transform hover:-translate-y-0.5 overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-[#F9F6F6] to-white p-4 border-b flex flex-wrap gap-4 items-center">
                        <div>
                          <span className="text-xs text-[#7C5C5C]">
                            Order ID:
                          </span>
                          <div className="font-mono font-medium">
                            {o.id.substring(0, 8)}...
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-[#7C5C5C]">Date:</span>
                          <div>
                            {new Date(o.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-[#7C5C5C]">
                            Payment:
                          </span>
                          <div className="capitalize">
                            {o.paymentInfo.method}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-[#7C5C5C]">Total:</span>
                          <div
                            className="font-semibold"
                            style={{ color: COLORS.primary }}
                          >
                            ₹{o.total.toFixed(2)}
                          </div>
                        </div>
                        <div className="ml-auto">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                              o.status === "delivered"
                                ? "bg-green-100 text-green-700"
                                : o.status === "shipped"
                                ? "bg-blue-100 text-blue-700"
                                : o.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {o.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <h4 className="text-xs font-medium text-[#7C5C5C] mb-2">
                          Items
                        </h4>
                        <div className="divide-y rounded-lg overflow-hidden border">
                          {o.items.map((it) => (
                            <div
                              key={it.productId + it.size}
                              className="flex text-xs justify-between items-center gap-3 p-3 bg-[#F9F6F6]/50 hover:bg-[#F9F6F6] transition-colors duration-300"
                            >
                              <div className="truncate flex-1 font-medium">
                                {it.productName}
                              </div>
                              <div className="text-[#7C5C5C]">
                                Size: {it.size || "-"}
                              </div>
                              <div className="text-[#7C5C5C]">
                                Qty: {it.quantity}
                              </div>
                              <div
                                className="font-semibold"
                                style={{ color: COLORS.primary }}
                              >
                                ₹{it.price}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Edit Review Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setEditOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-fade-in">
            <h3
              className="text-lg font-semibold"
              style={{ color: COLORS.primary }}
            >
              Edit your review
            </h3>
            {editError && (
              <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {editError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <div className="text-xs text-[#7C5C5C] mb-1">Rating</div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setEditRating(i + 1)}
                      className={`text-2xl ${
                        i < editRating ? "text-amber-500" : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ml-2 text-xs text-[#7C5C5C]">
                    {editRating}/5
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#7C5C5C] mb-1">
                  Title
                </label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border border-[#BFA5A5]/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#531A1A]/30"
                  placeholder="Great quality!"
                />
              </div>
              <div>
                <label className="block text-xs text-[#7C5C5C] mb-1">
                  Comment
                </label>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full border border-[#BFA5A5]/30 rounded-lg px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#531A1A]/30"
                  placeholder="Share details of your experience..."
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 rounded-lg text-[#531A1A] hover:bg-[#F9F6F6]"
                disabled={editSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitEdit}
                disabled={editSubmitting}
                className={`px-4 py-2 rounded-lg text-white ${
                  editSubmitting
                    ? "bg-gray-400"
                    : "bg-[#531A1A] hover:bg-[#3B1212]"
                }`}
              >
                {editSubmitting ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import * as api from "../lib/Account-api";

// Types used by the page (kept local to the hook file for clarity)
type Profile = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
};

type WishlistItem = {
  wishlistId: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  inStock: boolean;
};

type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  size?: string;
};
type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  paymentInfo: { method: string };
  items: OrderItem[];
};

type Preferences = {
  favoriteCategories?: string[];
  favoriteBrands?: string[];
  sizePreferences?: Record<string, string>;
  colorPreferences?: string[];
  priceRange?: number[];
};

type Review = {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  rating: number;
  title: string;
  comment: string;
  photoUrls?: string[];
  helpful: number;
  verified: boolean;
  createdAt: string;
};

export function useAccount() {
  // Token + auth headers
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t =
      localStorage.getItem("customerToken") ||
      localStorage.getItem("adminToken") ||
      sessionStorage.getItem("adminAuthToken") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("authToken");
    setToken(t);
  }, []);

  const authHeaders = useMemo<HeadersInit | undefined>(() => {
    if (!token) return undefined;
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  // State originally in page.tsx
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPrefs, setUpdatingPrefs] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "profile" | "wishlist" | "orders" | "preferences" | "reviews"
  >("overview");

  // Editable forms
  const [editProfile, setEditProfile] = useState<{
    gender?: string;
    phone?: string;
    avatarUrl?: string;
    bio?: string;
    dateOfBirth?: string;
  }>({});
  const [editPrefs, setEditPrefs] = useState<Preferences>({});

  // Fetch helpers (mirror original logic)
  const fetchAccountOverview = useCallback(async () => {
    if (!token) return;
    const { res, body } = await api.getAccountOverview(authHeaders);
    if (res.ok && body?.success) {
      const overview = body.data;
      setProfile(overview.profile);
      setEditProfile({
        gender: overview.profile.gender || "",
        phone: overview.profile.phone || "",
        avatarUrl: overview.profile.avatarUrl || "",
        bio: overview.profile.bio || "",
        dateOfBirth: overview.profile.dateOfBirth
          ? overview.profile.dateOfBirth.substring(0, 10)
          : "",
      });
      if (overview.counts) {
        if (overview.counts.reviews === 0) setReviews([]);
        if (overview.counts.wishlist === 0) setWishlist([]);
        if (overview.counts.orders === 0) setOrders([]);
      }
    } else {
      throw new Error(body?.message || "Failed to load account overview");
    }
  }, [token, authHeaders]);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    const { res, body } = await api.getProfile(authHeaders);
    if (res.ok && body?.success) {
      setProfile(body.data);
      setEditProfile({
        gender: body.data.gender || "",
        phone: body.data.phone || "",
        avatarUrl: body.data.avatarUrl || "",
        bio: body.data.bio || "",
        dateOfBirth: body.data.dateOfBirth
          ? body.data.dateOfBirth.substring(0, 10)
          : "",
      });
    } else throw new Error(body?.message || "Failed profile");
  }, [token, authHeaders]);

  const fetchWishlist = useCallback(async () => {
    if (!token) return;
    const { res, body } = await api.getWishlist(authHeaders);
    if (res.ok && body?.success) setWishlist(body.data || []);
  }, [token, authHeaders]);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    try {
      const { res, body } = await api.getOrders(authHeaders);
      if (res.ok && body?.success) {
        setOrders(body.data || []);
      } else if (res.status === 400 || res.status === 404) {
        const userId = localStorage.getItem("userId") || profile?.id || "";
        if (userId) {
          const fallback = await api.getOrdersByUserId(userId, authHeaders);
          if (fallback.res.ok && fallback.body?.success) {
            setOrders(fallback.body.data || []);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching orders", error);
    }
  }, [token, authHeaders, profile?.id]);

  const fetchReviews = useCallback(async () => {
    if (!token) return;
    const { res, body } = await api.getReviews(authHeaders);
    if (res.ok && body?.success) setReviews(body.data || []);
  }, [token, authHeaders]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        await fetchAccountOverview();
        await Promise.all([
          fetchWishlist(),
          fetchOrders(),
          fetchReviews(),
          fetchProfile(),
        ]);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load account");
      } finally {
        setLoading(false);
      }
    })();
  }, [
    token,
    fetchAccountOverview,
    fetchProfile,
    fetchWishlist,
    fetchOrders,
    fetchReviews,
  ]);

  async function saveProfile() {
    if (!token) return;
    setUpdatingProfile(true);
    setErr(null);
    try {
      const body: Record<string, unknown> = {};
      if (editProfile.gender) body.gender = editProfile.gender;
      if (editProfile.phone) body.phone = editProfile.phone;
      if (editProfile.avatarUrl) body.avatarUrl = editProfile.avatarUrl;
      if (editProfile.bio) body.bio = editProfile.bio;
      if (editProfile.dateOfBirth)
        body.dateOfBirth = new Date(editProfile.dateOfBirth).toISOString();

      const { res, body: resp } = await api.updateProfile(body, authHeaders);
      if (!res.ok || !resp?.success)
        throw new Error(resp?.message || "Update failed");
      await fetchProfile();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdatingProfile(false);
    }
  }

  async function savePreferences() {
    if (!token) return;
    setUpdatingPrefs(true);
    setErr(null);
    try {
      const body: Record<string, unknown> = {};
      if (editPrefs.favoriteCategories?.length)
        body.favoriteCategories = editPrefs.favoriteCategories;
      if (editPrefs.favoriteBrands?.length)
        body.favoriteBrands = editPrefs.favoriteBrands;
      if (
        editPrefs.sizePreferences &&
        Object.keys(editPrefs.sizePreferences).length
      )
        body.sizePreferences = editPrefs.sizePreferences;
      if (editPrefs.colorPreferences?.length)
        body.colorPreferences = editPrefs.colorPreferences;
      if (editPrefs.priceRange?.length) body.priceRange = editPrefs.priceRange;

      const { res, body: resp } = await api.updatePreferences(
        body,
        authHeaders
      );
      if (!res.ok || !resp?.success)
        throw new Error(resp?.message || "Preferences update failed");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Preferences update failed");
    } finally {
      setUpdatingPrefs(false);
    }
  }

  async function deleteReview(reviewId: string) {
    if (!token) return;
    setErr(null);
    try {
      const { res, body } = await api.deleteReviewApi(reviewId, authHeaders);
      if (!res.ok || !body?.success)
        throw new Error(body?.message || "Failed to delete review");
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to delete review");
    }
  }

  async function removeFromWishlist(wishlistId: string) {
    if (!token) return;
    setErr(null);
    try {
      const { res, body } = await api.removeFromWishlistApi(
        wishlistId,
        authHeaders
      );
      if (!res.ok || !body?.success)
        throw new Error(body?.message || "Failed to remove from wishlist");
      setWishlist((prev) => prev.filter((i) => i.wishlistId !== wishlistId));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to remove from wishlist");
    }
  }

  function logout() {
    ["customerToken", "adminToken", "auth_token", "authToken"].forEach((k) =>
      localStorage.removeItem(k)
    );
    sessionStorage.removeItem("adminAuthToken");
    localStorage.removeItem("userId");
    window.location.href = "/";
  }

  return {
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
  } as const;
}

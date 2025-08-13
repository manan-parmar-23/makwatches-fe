"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

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

export default function AccountPage() {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  // preferences persisted (optional future enhancement) -- removing unused variable to satisfy linter
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPrefs, setUpdatingPrefs] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "profile" | "wishlist" | "orders" | "preferences"
  >("overview");

  // Local editable profile fields
  const [editProfile, setEditProfile] = useState<{
    gender?: string;
    phone?: string;
    avatarUrl?: string;
    bio?: string;
    dateOfBirth?: string;
  }>({});
  // Preferences form state
  const [editPrefs, setEditPrefs] = useState<Preferences>({});

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

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    const r = await fetch(`${API_BASE}/profiles/`, { headers: authHeaders });
    const j = await r.json();
    if (r.ok && j.success) {
      setProfile(j.data);
      setEditProfile({
        gender: j.data.gender || "",
        phone: j.data.phone || "",
        avatarUrl: j.data.avatarUrl || "",
        bio: j.data.bio || "",
        dateOfBirth: j.data.dateOfBirth
          ? j.data.dateOfBirth.substring(0, 10)
          : "",
      });
    } else throw new Error(j.message || "Failed profile");
  }, [token, authHeaders]);

  const fetchWishlist = useCallback(async () => {
    if (!token) return;
    const r = await fetch(`${API_BASE}/wishlist/`, { headers: authHeaders });
    const j = await r.json();
    if (r.ok && j.success) setWishlist(j.data || []);
  }, [token, authHeaders]);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    // Need userId stored
    const uid =
      localStorage.getItem("userId") || sessionStorage.getItem("userId");
    if (!uid) return;
    const r = await fetch(`${API_BASE}/orders/user/${uid}`, {
      headers: authHeaders,
    });
    const j = await r.json();
    if (r.ok && j.success) setOrders(j.data || []);
  }, [token, authHeaders]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        await Promise.all([fetchProfile(), fetchWishlist(), fetchOrders()]);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load account");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, fetchProfile, fetchWishlist, fetchOrders]);

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
      const r = await fetch(`${API_BASE}/profiles/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(authHeaders || {}) },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok || !j.success) throw new Error(j.message || "Update failed");
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
      const r = await fetch(`${API_BASE}/preferences/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(authHeaders || {}) },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok || !j.success)
        throw new Error(j.message || "Preferences update failed");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Preferences update failed");
    } finally {
      setUpdatingPrefs(false);
    }
  }

  function logout() {
    // Clear all known tokens
    ["customerToken", "adminToken", "auth_token", "authToken"].forEach((k) =>
      localStorage.removeItem(k)
    );
    sessionStorage.removeItem("adminAuthToken");
    // keep userId maybe or clear - clear to force login
    localStorage.removeItem("userId");
    window.location.href = "/";
  }

  if (loading)
    return <main className="max-w-6xl mx-auto p-6">Loading account...</main>;
  if (err)
    return <main className="max-w-6xl mx-auto p-6 text-red-600">{err}</main>;
  if (!token)
    return (
      <main className="max-w-6xl mx-auto p-6">
        Please log in to view your account.
      </main>
    );

  const tabBtn = (id: typeof activeTab, label: string) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-full text-sm ${
        activeTab === id ? "bg-[#531A1A] text-white" : "bg-neutral-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <main className="max-w-6xl mx-auto p-6 text-[#531A1A]">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-semibold">Account</h1>
        <div className="flex gap-2 flex-wrap">
          {tabBtn("overview", "Overview")}
          {tabBtn("profile", "Profile")}
          {tabBtn("preferences", "Preferences")}
          {tabBtn("wishlist", "Wishlist")}
          {tabBtn("orders", "Orders")}
        </div>
      </div>
      <div className="mb-6 flex justify-end">
        <button
          onClick={logout}
          className="text-xs px-3 py-2 rounded-full border border-[#531A1A]"
        >
          Logout
        </button>
      </div>

      {activeTab === "overview" && (
        <section className="grid md:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg bg-white shadow-sm">
            <h2 className="font-medium mb-2 text-sm">Profile</h2>
            {profile && (
              <div className="text-xs space-y-1">
                <div>
                  <span className="font-semibold">Name:</span> {profile.name}
                </div>
                <div>
                  <span className="font-semibold">Email:</span> {profile.email}
                </div>
                <div>
                  <span className="font-semibold">Role:</span> {profile.role}
                </div>
                <div>
                  <span className="font-semibold">Joined:</span>{" "}
                  {new Date(profile.createdAt).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border rounded-lg bg-white shadow-sm">
            <h2 className="font-medium mb-2 text-sm">Wishlist</h2>
            <div className="text-xs">{wishlist.length} items</div>
          </div>
          <div className="p-4 border rounded-lg bg-white shadow-sm">
            <h2 className="font-medium mb-2 text-sm">Orders</h2>
            <div className="text-xs">{orders.length} orders</div>
          </div>
        </section>
      )}

      {activeTab === "profile" && profile && (
        <section className="max-w-xl">
          <h2 className="text-lg font-semibold mb-4">Profile Details</h2>
          <div className="grid gap-4 text-sm">
            <div>
              <label className="block text-xs mb-1">Gender</label>
              <select
                value={editProfile.gender || ""}
                onChange={(e) =>
                  setEditProfile((p) => ({ ...p, gender: e.target.value }))
                }
                className="w-full border rounded-md px-3 py-2 bg-neutral-50"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Phone</label>
              <input
                value={editProfile.phone || ""}
                onChange={(e) =>
                  setEditProfile((p) => ({ ...p, phone: e.target.value }))
                }
                className="w-full border rounded-md px-3 py-2 bg-neutral-50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Avatar URL</label>
              <input
                value={editProfile.avatarUrl || ""}
                onChange={(e) =>
                  setEditProfile((p) => ({ ...p, avatarUrl: e.target.value }))
                }
                className="w-full border rounded-md px-3 py-2 bg-neutral-50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Date of Birth</label>
              <input
                type="date"
                value={editProfile.dateOfBirth || ""}
                onChange={(e) =>
                  setEditProfile((p) => ({ ...p, dateOfBirth: e.target.value }))
                }
                className="w-full border rounded-md px-3 py-2 bg-neutral-50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Bio</label>
              <textarea
                value={editProfile.bio || ""}
                onChange={(e) =>
                  setEditProfile((p) => ({ ...p, bio: e.target.value }))
                }
                className="w-full border rounded-md px-3 py-2 bg-neutral-50 min-h-[80px]"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={saveProfile}
                disabled={updatingProfile}
                className="px-5 py-2 rounded-full bg-[#531A1A] text-white text-xs disabled:opacity-50"
              >
                {updatingProfile ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </section>
      )}

      {activeTab === "preferences" && (
        <section className="max-w-2xl">
          <h2 className="text-lg font-semibold mb-4">Preferences</h2>
          <div className="grid gap-4 text-sm">
            <div>
              <label className="block text-xs mb-1">
                Favorite Categories (comma separated)
              </label>
              <input
                value={(editPrefs.favoriteCategories || []).join(",")}
                onChange={(e) =>
                  setEditPrefs((p) => ({
                    ...p,
                    favoriteCategories: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                className="w-full border rounded-md px-3 py-2 bg-neutral-50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">
                Favorite Brands (comma separated)
              </label>
              <input
                value={(editPrefs.favoriteBrands || []).join(",")}
                onChange={(e) =>
                  setEditPrefs((p) => ({
                    ...p,
                    favoriteBrands: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                className="w-full border rounded-md px-3 py-2 bg-neutral-50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">
                Colors (comma separated)
              </label>
              <input
                value={(editPrefs.colorPreferences || []).join(",")}
                onChange={(e) =>
                  setEditPrefs((p) => ({
                    ...p,
                    colorPreferences: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                className="w-full border rounded-md px-3 py-2 bg-neutral-50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">
                Price Range (min-max)
              </label>
              <input
                placeholder="e.g. 500-2000"
                value={
                  editPrefs.priceRange ? editPrefs.priceRange.join("-") : ""
                }
                onChange={(e) => {
                  const parts = e.target.value
                    .split("-")
                    .map((p) => parseFloat(p.trim()))
                    .filter((n) => !isNaN(n));
                  setEditPrefs((p) => ({
                    ...p,
                    priceRange: parts.length ? parts.slice(0, 2) : undefined,
                  }));
                }}
                className="w-full border rounded-md px-3 py-2 bg-neutral-50"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={savePreferences}
                disabled={updatingPrefs}
                className="px-5 py-2 rounded-full bg-[#531A1A] text-white text-xs disabled:opacity-50"
              >
                {updatingPrefs ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>
        </section>
      )}

      {activeTab === "wishlist" && (
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Wishlist ({wishlist.length})
          </h2>
          {wishlist.length === 0 && (
            <div className="text-sm">No items yet.</div>
          )}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlist.map((w) => (
              <div
                key={w.wishlistId}
                className="border rounded-lg p-3 bg-white shadow-sm text-xs flex flex-col"
              >
                {w.image && (
                  <Image
                    src={w.image}
                    alt={w.name}
                    width={400}
                    height={400}
                    className="h-32 w-full object-cover rounded mb-2"
                  />
                )}
                <div className="font-medium truncate" title={w.name}>
                  {w.name}
                </div>
                <div className="mt-auto flex justify-between items-center pt-2">
                  <span>₹{w.price.toFixed(0)}</span>
                  <span
                    className={`text-[10px] ${
                      w.inStock ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {w.inStock ? "In Stock" : "Out"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "orders" && (
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Orders ({orders.length})
          </h2>
          {orders.length === 0 && <div className="text-sm">No orders yet.</div>}
          <div className="space-y-4">
            {orders.map((o) => (
              <div
                key={o.id}
                className="border rounded-lg p-4 bg-white shadow-sm text-xs"
              >
                <div className="flex flex-wrap gap-4 mb-2">
                  <div>
                    <span className="font-medium">ID:</span> {o.id}
                  </div>
                  <div>
                    <span className="font-medium">Placed:</span>{" "}
                    {new Date(o.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {o.status}
                  </div>
                  <div>
                    <span className="font-medium">Total:</span> ₹
                    {o.total.toFixed(2)}
                  </div>
                  <div>
                    <span className="font-medium">Pay:</span>{" "}
                    {o.paymentInfo.method}
                  </div>
                </div>
                <div className="divide-y border rounded overflow-hidden">
                  {o.items.map((it) => (
                    <div
                      key={it.productId + it.size}
                      className="flex text-[11px] justify-between gap-2 px-2 py-1 bg-neutral-50"
                    >
                      <div className="truncate flex-1">{it.productName}</div>
                      <div>x{it.quantity}</div>
                      <div>₹{it.price}</div>
                      <div className="opacity-60">{it.size || "-"}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

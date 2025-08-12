"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// Types
interface Subcategory {
  id: string;
  name: string;
}
interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

const PRIMARY = "#531A1A";

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeMain, setActiveMain] = useState<"Men" | "Women">("Men");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<{
    categoryId?: string;
    subId?: string;
  } | null>(null);
  const [formName, setFormName] = useState("");
  const [formMainCategory, setFormMainCategory] = useState<"Men" | "Women">(
    "Men"
  );
  const [submitting, setSubmitting] = useState(false);

  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("adminAuthToken")
      : null;
  // Debug: log token value
  useEffect(() => {
    if (token) {
      console.log("[DEBUG] JWT token:", token);
    }
  }, [token]);

  // Fetch categories
  const fetchCategories = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/admin/categories/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.data) setCategories(res.data.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch categories"
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch categories");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchCategories();
  }, [token, fetchCategories]);

  const currentCategory = categories.find((c) => c.name === activeMain);
  const subcategories = currentCategory?.subcategories || [];

  // Open Add Subcategory modal
  const openAdd = () => {
    setEditing(null);
    setFormName("");
    setFormMainCategory(activeMain);
    setShowModal(true);
  };

  // Open Edit Subcategory modal
  const openEdit = (categoryId: string, subId: string, currentName: string) => {
    setEditing({ categoryId, subId });
    setFormName(currentName);
    setFormMainCategory(activeMain);
    setShowModal(true);
  };

  // Handle create or edit submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      if (editing) {
        // Update subcategory name
        await axios.patch(
          `${API_BASE}/admin/categories/${editing.categoryId}/subcategories/${editing.subId}/`,
          { name: formName },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // If category exists use add subcategory endpoint else create category
        const cat = categories.find((c) => c.name === formMainCategory);
        if (cat) {
          await axios.post(
            `${API_BASE}/admin/categories/${cat.id}/subcategories/`,
            { name: formName },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        } else {
          await axios.post(
            `${API_BASE}/admin/categories/`,
            { name: formMainCategory, subcategories: [formName] },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        }
      }
      await fetchCategories();
      setShowModal(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || err.message || "Operation failed"
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Operation failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSub = async (categoryId: string, subId: string) => {
    if (!confirm("Delete this subcategory?")) return;
    try {
      await axios.delete(
        `${API_BASE}/admin/categories/${categoryId}/subcategories/${subId}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchCategories();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || err.message || "Delete failed");
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Delete failed");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: PRIMARY }}>
          Categories
        </h1>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded text-white shadow"
          style={{ background: PRIMARY }}
        >
          <PlusIcon className="h-5 w-5" /> Add Subcategory
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        {(["Men", "Women"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveMain(tab)}
            className={`px-4 py-2 -mb-px border-b-2 font-medium transition ${
              activeMain === tab
                ? "border-b-2" // border color via style
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            style={
              activeMain === tab ? { color: PRIMARY, borderColor: PRIMARY } : {}
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="py-4 text-red-600 text-sm">{error}</div>
      ) : (
        <div className="bg-white rounded shadow-sm overflow-hidden">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2 font-semibold text-gray-600">
                  Subcategory
                </th>
                <th className="px-4 py-2 font-semibold text-gray-600 w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {subcategories.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    No subcategories yet
                  </td>
                </tr>
              )}
              {subcategories.map((s, idx) => (
                <tr
                  key={s.id}
                  className={`hover:bg-gray-50 ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  }`}
                >
                  <td className="px-4 py-2 font-medium">{s.name}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          openEdit(currentCategory!.id, s.id, s.name)
                        }
                        className="p-1 rounded hover:bg-gray-100"
                        aria-label="Edit"
                      >
                        <PencilIcon className="h-5 w-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteSub(currentCategory!.id, s.id)
                        }
                        className="p-1 rounded hover:bg-gray-100"
                        aria-label="Delete"
                      >
                        <TrashIcon className="h-5 w-5 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !submitting && setShowModal(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-6 space-y-4">
            <button
              className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded"
              onClick={() => !submitting && setShowModal(false)}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: PRIMARY }}>
              {editing ? "Edit Subcategory" : "Add Subcategory"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editing && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Main Category
                  </label>
                  <select
                    value={formMainCategory}
                    onChange={(e) =>
                      setFormMainCategory(e.target.value as "Men" | "Women")
                    }
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Subcategory Name
                </label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring"
                  placeholder="e.g. Shirts"
                />
              </div>
              {error && <div className="text-red-600 text-xs">{error}</div>}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !submitting && setShowModal(false)}
                  className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm rounded text-white shadow disabled:opacity-70"
                  style={{ background: PRIMARY }}
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;

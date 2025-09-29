"use client";
import React, { useEffect, useState } from "react";
import { useProductsStore } from "@/store/useProductsStore";
import ProductFormModal from "@/components/admin/ProductFormModal";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/utils/api";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  ExclamationCircleIcon,
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

const ProductsPage: React.FC = () => {
  const { products, fetchAll, loading, remove, error } = useProductsStore(
    (s: {
      products: Product[];
      fetchAll: () => Promise<void>;
      loading: boolean;
      remove: (id: string) => Promise<boolean>;
      error: string | null;
    }) => ({
      products: s.products,
      fetchAll: s.fetchAll,
      loading: s.loading,
      remove: s.remove,
      error: s.error,
    })
  );
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  // Defensive: ensure products is always an array before using .length
  const productList: Product[] = Array.isArray(products) ? products : [];
  const totalPages = Math.max(1, Math.ceil(productList.length / pageSize));

  useEffect(() => {
    // Run and catch 401 to redirect like categories page if needed
    fetchAll().catch((e: unknown) => {
      const err = e as { response?: { status?: number } };
      if (err?.response?.status === 401 && typeof window !== "undefined") {
        sessionStorage.removeItem("adminAuthToken");
        window.location.href = "/admin/login";
      }
    });
  }, [fetchAll]);

  const paginated = productList.slice((page - 1) * pageSize, page * pageSize);

  const onAdd = () => {
    setEditing(null);
    setOpenModal(true);
  };
  const onEdit = (p: Product) => {
    setEditing(p);
    setOpenModal(true);
  };

  const onDelete = async (p: Product) => {
    if (!confirm(`Delete product "${p.name}"?`)) return;
    await remove(p.id);
  };

  return (
    <div className="space-y-6 pt-18">
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
              Products
            </h1>
            <p
              className="text-xs sm:text-sm"
              style={{ color: COLORS.textMuted }}
            >
              Manage your product catalog
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

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Enhanced Add Button */}
        <button
          onClick={onAdd}
          className="group flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm transition-all duration-300 hover:scale-105 hover:shadow-md hover:-translate-y-0.5 self-end sm:self-auto"
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
          <PlusIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-8 space-y-3">
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
            Loading products...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          className="flex items-center gap-2 py-3 px-4 rounded-lg border-l-4"
          style={{
            backgroundColor: `${COLORS.error}10`,
            borderColor: COLORS.error,
          }}
        >
          <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Products Table */}
      <div
        className="rounded-xl shadow-md overflow-hidden border transition-all duration-300 hover:shadow-lg"
        style={{
          backgroundColor: COLORS.background,
          borderColor: `${COLORS.surfaceLight}60`,
        }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: `${COLORS.surface}30` }}>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold tracking-wider"
                  style={{ color: COLORS.textMuted }}
                >
                  Image
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold tracking-wider"
                  style={{ color: COLORS.textMuted }}
                >
                  Name
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold tracking-wider hidden sm:table-cell"
                  style={{ color: COLORS.textMuted }}
                >
                  Brand
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold tracking-wider hidden md:table-cell"
                  style={{ color: COLORS.textMuted }}
                >
                  Category
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold tracking-wider"
                  style={{ color: COLORS.textMuted }}
                >
                  Price
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold tracking-wider hidden sm:table-cell"
                  style={{ color: COLORS.textMuted }}
                >
                  Stock
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold tracking-wider w-24"
                  style={{ color: COLORS.textMuted }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paginated.map((p: Product) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="border-b transition-all duration-300 hover:bg-gray-50 group"
                    style={{ borderColor: `${COLORS.surfaceLight}60` }}
                  >
                    <td className="px-4 py-3">
                      {p.images && p.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-lg border group-hover:scale-105 transition-transform duration-300"
                          style={{ borderColor: COLORS.inputBorder }}
                        />
                      ) : (
                        <div
                          className="w-12 h-12 flex items-center justify-center text-[10px] rounded-lg"
                          style={{
                            backgroundColor: `${COLORS.surfaceLight}50`,
                            color: COLORS.textMuted,
                          }}
                        >
                          <PhotoIcon className="h-5 w-5" />
                        </div>
                      )}
                    </td>
                    <td
                      className="px-4 py-3 font-medium"
                      style={{ color: COLORS.text }}
                    >
                      <div className="line-clamp-2">{p.name}</div>
                    </td>
                    <td
                      className="px-4 py-3 hidden sm:table-cell"
                      style={{ color: COLORS.textMuted }}
                    >
                      {p.brand}
                    </td>
                    <td
                      className="px-4 py-3 hidden md:table-cell"
                      style={{ color: COLORS.textMuted }}
                    >
                      <span className="inline-flex flex-col">
                        <span>{p.mainCategory}</span>
                        <span className="text-xs opacity-70">
                          {p.subcategory}
                        </span>
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 font-semibold"
                      style={{ color: COLORS.primary }}
                    >
                      ₹{p.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span
                        className="px-2 py-1 rounded-lg text-xs font-medium"
                        style={{
                          backgroundColor:
                            p.stock > 10
                              ? `${COLORS.success}15`
                              : `${COLORS.error}15`,
                          color: p.stock > 10 ? COLORS.success : COLORS.error,
                        }}
                      >
                        {p.stock} in stock
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onEdit(p)}
                          className="p-1.5 rounded-lg transition-all duration-300 hover:scale-110"
                          style={{ backgroundColor: `${COLORS.primary}10` }}
                          aria-label="Edit"
                        >
                          <PencilIcon
                            className="h-3.5 w-3.5"
                            style={{ color: COLORS.primary }}
                          />
                        </button>
                        <button
                          onClick={() => onDelete(p)}
                          className="p-1.5 rounded-lg transition-all duration-300 hover:scale-110"
                          style={{ backgroundColor: `${COLORS.error}10` }}
                          aria-label="Delete"
                        >
                          <TrashIcon
                            className="h-3.5 w-3.5"
                            style={{ color: COLORS.error }}
                          />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {paginated.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center"
                      style={{ color: COLORS.textMuted }}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: `${COLORS.surfaceLight}50`,
                          }}
                        >
                          <PhotoIcon
                            className="h-8 w-8"
                            style={{ color: COLORS.textMuted }}
                          />
                        </div>
                        <p className="text-sm font-medium">No products found</p>
                        <button
                          onClick={onAdd}
                          className="text-xs px-3 py-1 rounded-lg mt-2 transition-all duration-300 hover:scale-105 flex items-center gap-1"
                          style={{
                            color: COLORS.primary,
                            backgroundColor: `${COLORS.primary}10`,
                          }}
                        >
                          <PlusIcon className="h-3 w-3" />
                          <span>Add your first product</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
            style={{
              backgroundColor: `${COLORS.primary}10`,
              color: COLORS.primary,
            }}
          >
            <ChevronLeftIcon className="h-3.5 w-3.5" />
            <span>Prev</span>
          </button>
          <span className="text-xs px-2" style={{ color: COLORS.textMuted }}>
            Page{" "}
            <span className="font-semibold" style={{ color: COLORS.text }}>
              {page}
            </span>{" "}
            of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
            style={{
              backgroundColor: `${COLORS.primary}10`,
              color: COLORS.primary,
            }}
          >
            <span>Next</span>
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Form Modal - Unchanged */}
      <ProductFormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        editing={editing}
      />

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
      `}</style>
    </div>
  );
};

export default ProductsPage;

"use client";
import React, { useEffect, useState } from "react";
import { useProductsStore } from "@/store/useProductsStore";
import ProductFormModal from "@/components/admin/ProductFormModal";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/utils/api";

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
    fetchAll();
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={onAdd}
          className="px-4 py-2 rounded bg-black text-white text-sm"
        >
          Add Product
        </button>
      </div>

      {loading && (
        <div className="text-sm text-gray-500">Loading products...</div>
      )}
      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-2">Image</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Brand</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2 w-28">Actions</th>
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
                  className="border-t"
                >
                  <td className="px-4 py-2">
                    {p.images && p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 rounded">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 font-medium">{p.name}</td>
                  <td className="px-4 py-2">{p.brand}</td>
                  <td className="px-4 py-2">
                    {p.mainCategory} / {p.subcategory}
                  </td>
                  <td className="px-4 py-2">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-2">{p.stock}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(p)}
                        className="text-xs px-2 py-1 rounded border"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(p)}
                        className="text-xs px-2 py-1 rounded border text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {paginated.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No products
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-2 py-1 text-xs border rounded disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-xs">
            Page {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-2 py-1 text-xs border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <ProductFormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        editing={editing}
      />
    </div>
  );
};

export default ProductsPage;

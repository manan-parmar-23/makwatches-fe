"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Category,
  Product,
  fetchCategories,
  uploadImages,
} from "../../utils/api";
import { useProductsStore } from "../../store/useProductsStore";

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Product | null;
}

const emptyForm = () => ({
  name: "",
  brand: "",
  mainCategory: "Men" as "Men" | "Women",
  subcategory: "",
  price: 0,
  stock: 0,
  description: "",
  images: [] as string[],
});

export const ProductFormModal: React.FC<Props> = ({
  open,
  onClose,
  editing,
}) => {
  const { add, update } = useProductsStore();
  const [form, setForm] = useState(emptyForm());
  const [categories, setCategories] = useState<Category[]>([]);
  const [subOptions, setSubOptions] = useState<{ id: string; name: string }[]>(
    []
  );
  const [loadingCats, setLoadingCats] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        // Parse category if it exists (format: "Men/Shirts" → mainCategory: "Men", subcategory: "Shirts")
        let mainCategory: "Men" | "Women" = "Men";
        let subcategory = "";

        if (editing.category) {
          const parts = editing.category.split("/");
          if (parts.length > 0) {
            mainCategory = parts[0] === "Women" ? "Women" : "Men";
            if (parts.length > 1) {
              subcategory = parts[1];
            }
          }
        } else if (editing.mainCategory) {
          // Handle existing format for backward compatibility
          mainCategory = editing.mainCategory;
          subcategory = editing.subcategory || "";
        }

        setForm({
          name: editing.name,
          brand: editing.brand || "",
          mainCategory: mainCategory,
          subcategory: subcategory,
          price: editing.price,
          stock: editing.stock,
          description: editing.description,
          images: editing.images || [],
        });
      } else {
        setForm(emptyForm());
      }
    }
  }, [open, editing]);

  useEffect(() => {
    if (!open) return;
    const run = async () => {
      setLoadingCats(true);
      try {
        const res = await fetchCategories();
        setCategories(res.data.data);
      } catch (e) {
        console.warn("Unable to fetch categories", e);
      } finally {
        setLoadingCats(false);
      }
    };
    run();
  }, [open]);

  useEffect(() => {
    const main = categories.find((c) => c.name === form.mainCategory);
    setSubOptions(main ? main.subcategories : []);
    if (main && !main.subcategories.find((s) => s.name === form.subcategory)) {
      setForm((f) => ({ ...f, subcategory: "" }));
    }
  }, [categories, form.mainCategory, form.subcategory]);

  // Lock background scroll when modal is open and avoid layout shift
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const docEl = document.documentElement;
    const originalOverflow = body.style.overflow;
    const originalPaddingRight = body.style.paddingRight;
    const originalDocOverflow = docEl.style.overflow;
    const originalDocOverscroll = docEl.style.getPropertyValue(
      "overscroll-behavior"
    );
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Also lock the root element to prevent scroll chaining (especially on mobile)
    docEl.style.overflow = "hidden";
    docEl.style.setProperty("overscroll-behavior", "none");

    return () => {
      body.style.overflow = originalOverflow;
      body.style.paddingRight = originalPaddingRight;
      docEl.style.overflow = originalDocOverflow;
      if (originalDocOverscroll) {
        docEl.style.setProperty("overscroll-behavior", originalDocOverscroll);
      } else {
        docEl.style.removeProperty("overscroll-behavior");
      }
    };
  }, [open]);

  const handleChange = <K extends keyof typeof form>(
    field: K,
    value: (typeof form)[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const arr = Array.from(files);
      const { data } = await uploadImages(arr);
      handleChange("images", [...form.images, ...(data.data.urls || [])]);
    } catch {
      console.error("Upload failed");
      setError("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Transform form data to match backend expectations
    const payload: Partial<Product> = {
      ...form,
      // Combine mainCategory and subcategory to create the category field
      category: form.subcategory
        ? `${form.mainCategory}/${form.subcategory}`
        : form.mainCategory,
      // Set imageUrl if we have at least one image
      imageUrl:
        form.images && form.images.length > 0 ? form.images[0] : undefined,
    };

    try {
      if (editing) await update(editing.id, payload);
      else await add(payload);
      onClose();
    } catch (e) {
      console.error("Save failed", e);
      setError(
        "Save failed: " + (e instanceof Error ? e.message : "Unknown error")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden overscroll-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ height: "100dvh" }}
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !saving && onClose()}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-xl shadow-lg max-h-[90vh] flex flex-col overflow-hidden"
            style={{ maxHeight: "min(90vh, 90dvh)" }}
          >
            <div className="sticky top-0 z-10 bg-white p-4 border-b">
              <h2 className="text-xl font-semibold">
                {editing ? "Edit Product" : "Add Product"}
              </h2>
            </div>
            <div
              className="flex-1 overflow-y-auto overscroll-contain p-4 min-h-0"
              style={
                { WebkitOverflowScrolling: "touch" } as React.CSSProperties
              }
            >
              <form id="product-form" onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Name
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Brand
                    </label>
                    <input
                      value={form.brand}
                      onChange={(e) => handleChange("brand", e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Main Category
                    </label>
                    <select
                      value={form.mainCategory}
                      onChange={(e) =>
                        handleChange(
                          "mainCategory",
                          e.target.value as "Men" | "Women"
                        )
                      }
                      className="w-full border rounded px-3 py-2 text-sm"
                    >
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                    </select>
                  </div>
                  <div>
                    <label className=" text-xs font-medium mb-1 flex items-center justify-between">
                      Subcategory{" "}
                      {loadingCats && (
                        <span className="text-[10px] text-gray-400">
                          loading...
                        </span>
                      )}
                    </label>
                    <select
                      value={form.subcategory}
                      onChange={(e) =>
                        handleChange("subcategory", e.target.value)
                      }
                      className="w-full border rounded px-3 py-2 text-sm"
                    >
                      <option value="">-- Select --</option>
                      {subOptions.map((sc) => (
                        <option key={sc.id} value={sc.name}>
                          {sc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={(e) =>
                        handleChange("price", parseFloat(e.target.value) || 0)
                      }
                      className="w-full border rounded px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) =>
                        handleChange("stock", parseInt(e.target.value) || 0)
                      }
                      className="w-full border rounded px-3 py-2 text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className=" text-xs font-medium mb-1 flex items-center gap-2">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    className="w-full border rounded px-3 py-2 text-sm min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Images
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => onFiles(e.target.files)}
                    className="text-sm"
                  />
                  {uploading && (
                    <div className="text-[10px] text-gray-500 mt-1">
                      Uploading...
                    </div>
                  )}
                  {form.images.length > 0 && (
                    <div className="mt-2 grid grid-cols-5 gap-2">
                      {form.images.map((url, i) => (
                        <div
                          key={i}
                          className="relative group border rounded overflow-hidden"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt="img"
                            className="object-cover w-full h-20"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleChange(
                                "images",
                                form.images.filter((_, idx) => idx !== i)
                              )
                            }
                            className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 transition"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {error && <div className="text-xs text-red-600">{error}</div>}
              </form>
            </div>
            <div className="sticky bottom-0 bg-white p-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => !saving && onClose()}
                className="px-4 py-2 text-sm rounded border"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="product-form"
                disabled={saving}
                className="px-4 py-2 text-sm rounded bg-black text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductFormModal;

"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Category,
  Product,
  fetchCategories,
  uploadImages,
} from "../../utils/api";
import { useProductsStore } from "../../store/useProductsStore";
import { DiscountSection } from "./DiscountSection";

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
  discountPercentage: null as number | null,
  discountAmount: null as number | null,
  discountStartDate: null as string | null,
  discountEndDate: null as string | null,
  // filter attributes
  gender: "",
  dialColor: "",
  dialShape: "",
  dialType: "",
  strapColor: "",
  strapMaterial: "",
  style: "",
  dialThickness: "",
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
  const [discountType, setDiscountType] = useState<"percentage" | "amount">(
    "percentage"
  );
  // Ref to the scrollable inner content so we can forward wheel events to it
  const contentRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Handle wheel events using native event listener to avoid passive event warning
  useEffect(() => {
    if (!open || !modalRef.current) return;

    const modalElement = modalRef.current;

    const handleWheel = (e: WheelEvent) => {
      const el = contentRef.current;
      if (!el) {
        e.preventDefault();
        return;
      }

      const delta = e.deltaY;
      const atTop = el.scrollTop === 0;
      const atBottom =
        Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 1;

      // If trying to scroll past bounds, prevent page/background from scrolling.
      if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
        e.preventDefault();
        return;
      }

      // Otherwise, manually scroll the inner container and prevent default so
      // the event doesn't bubble to the document.
      e.preventDefault();
      el.scrollTop += delta;
    };

    // Add as non-passive listener to allow preventDefault
    modalElement.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      modalElement.removeEventListener("wheel", handleWheel);
    };
  }, [open]);

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

        const extra: Record<string, unknown> = editing as unknown as Record<
          string,
          unknown
        >;
        setForm({
          name: editing.name,
          brand: editing.brand || "",
          mainCategory: mainCategory,
          subcategory: subcategory,
          price: editing.price,
          stock: editing.stock,
          description: editing.description,
          images: editing.images || [],
          discountPercentage: editing.discountPercentage ?? null,
          discountAmount: editing.discountAmount ?? null,
          discountStartDate: editing.discountStartDate ?? null,
          discountEndDate: editing.discountEndDate ?? null,
          // filter attributes
          gender: typeof extra.gender === "string" ? extra.gender : "",
          dialColor: typeof extra.dialColor === "string" ? extra.dialColor : "",
          dialShape: typeof extra.dialShape === "string" ? extra.dialShape : "",
          dialType: typeof extra.dialType === "string" ? extra.dialType : "",
          strapColor:
            typeof extra.strapColor === "string" ? extra.strapColor : "",
          strapMaterial:
            typeof extra.strapMaterial === "string" ? extra.strapMaterial : "",
          style: typeof extra.style === "string" ? extra.style : "",
          dialThickness:
            typeof extra.dialThickness === "string" ? extra.dialThickness : "",
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

    // Only lock body scroll and avoid layout shift by reserving scrollbar width.
    // Do NOT lock documentElement overflow — that prevents wheel scrolling
    // from reaching the modal on desktop in some browsers.
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = originalOverflow;
      body.style.paddingRight = originalPaddingRight;
      // Restore any documentElement changes only if we modified them earlier.
      // We intentionally avoid touching docEl.style.overflow here to prevent
      // interfering with desktop wheel event propagation to the modal.
      if (originalDocOverflow) {
        docEl.style.overflow = originalDocOverflow;
      }
      if (originalDocOverscroll) {
        docEl.style.setProperty("overscroll-behavior", originalDocOverscroll);
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

  // Discount handlers
  const handleDiscountTypeChange = (type: "percentage" | "amount") => {
    setDiscountType(type);
    if (type === "percentage") {
      handleChange("discountAmount", null);
    } else {
      handleChange("discountPercentage", null);
    }
  };

  const handleClearDiscount = () => {
    handleChange("discountPercentage", null);
    handleChange("discountAmount", null);
    handleChange("discountStartDate", null);
    handleChange("discountEndDate", null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Validate that at least one image is uploaded
    if (!form.images || form.images.length === 0) {
      setError("Please upload at least one product image");
      setSaving(false);
      return;
    }

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
          ref={modalRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // Allow pointer/touch/ wheel to reach the modal; the inner element
          // is responsible for scrolling. 'touchAction: pan-y' helps on touch devices.
          style={{ height: "100dvh", touchAction: "pan-y" }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !saving && onClose()}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden mx-auto"
            style={{
              maxHeight: "calc(100dvh - 16px)",
              height: "auto",
            }}
          >
            {/* Enhanced Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#D4AF37] to-[#A67C00] px-4 sm:px-6 py-4 sm:py-5 border-b border-[#A67C00]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      {editing ? "Edit Product" : "Add New Product"}
                    </h2>
                    <p className="text-xs sm:text-sm text-white/80 mt-0.5">
                      {editing
                        ? "Update product information"
                        : "Create a new product listing"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !saving && onClose()}
                  disabled={saving}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200 disabled:opacity-50"
                  aria-label="Close"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
            </div>
            {/* Scrollable Form Content */}
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-5 sm:py-6 min-h-0 bg-gray-50"
              style={
                { WebkitOverflowScrolling: "touch" } as React.CSSProperties
              }
            >
              <form
                id="product-form"
                onSubmit={onSubmit}
                className="space-y-5 sm:space-y-6"
              >
                {/* Basic Information Section */}
                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
                  <h3 className="text-base sm:text-lg font-semibold text-[#0F0F0F] mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[#D4AF37]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200"
                        placeholder="Enter product name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Brand <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={form.brand}
                        onChange={(e) => handleChange("brand", e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200"
                        placeholder="Enter brand name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Main Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={form.mainCategory}
                        onChange={(e) =>
                          handleChange(
                            "mainCategory",
                            e.target.value as "Men" | "Women"
                          )
                        }
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200 bg-white"
                      >
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
                        <span>Subcategory</span>
                        {loadingCats && (
                          <svg
                            className="animate-spin h-4 w-4 text-[#D4AF37]"
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
                        )}
                      </label>
                      <select
                        value={form.subcategory}
                        onChange={(e) =>
                          handleChange("subcategory", e.target.value)
                        }
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200 bg-white"
                      >
                        <option value="">-- Select Subcategory --</option>
                        {subOptions.map((sc) => (
                          <option key={sc.id} value={sc.name}>
                            {sc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                          ₹
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={form.price}
                          onChange={(e) =>
                            handleChange(
                              "price",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full border-2 border-gray-200 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Stock Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={form.stock}
                        onChange={(e) =>
                          handleChange("stock", parseInt(e.target.value) || 0)
                        }
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200"
                        placeholder="Enter stock quantity"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Watch Attributes (Filters) */}
                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
                  <h3 className="text-base sm:text-lg font-semibold text-[#0F0F0F] mb-4">
                    Watch Attributes (Optional)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        value={form.gender}
                        onChange={(e) => handleChange("gender", e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                      >
                        <option value="">—</option>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Unisex">Unisex</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Dial Color
                      </label>
                      <input
                        value={form.dialColor}
                        onChange={(e) =>
                          handleChange("dialColor", e.target.value)
                        }
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                        placeholder="e.g., Black, White"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Dial Shape
                      </label>
                      <input
                        value={form.dialShape}
                        onChange={(e) =>
                          handleChange("dialShape", e.target.value)
                        }
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                        placeholder="e.g., Round, Square"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Dial Type
                      </label>
                      <input
                        value={form.dialType}
                        onChange={(e) =>
                          handleChange("dialType", e.target.value)
                        }
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                        placeholder="e.g., Analog, Digital"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Strap Color
                      </label>
                      <input
                        value={form.strapColor}
                        onChange={(e) =>
                          handleChange("strapColor", e.target.value)
                        }
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                        placeholder="e.g., Black, Brown"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Strap Material
                      </label>
                      <input
                        value={form.strapMaterial}
                        onChange={(e) =>
                          handleChange("strapMaterial", e.target.value)
                        }
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                        placeholder="e.g., Leather, Metal"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Style
                      </label>
                      <input
                        value={form.style}
                        onChange={(e) => handleChange("style", e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                        placeholder="e.g., Casual, Luxury"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Dial Thickness
                      </label>
                      <input
                        value={form.dialThickness}
                        onChange={(e) =>
                          handleChange("dialThickness", e.target.value)
                        }
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                        placeholder="e.g., 8mm, Slim"
                      />
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
                  <h3 className="text-base sm:text-lg font-semibold text-[#0F0F0F] mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[#D4AF37]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                    Product Description
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200 resize-none"
                      placeholder="Enter product description..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Discount Section */}
                <DiscountSection
                  discountType={discountType}
                  discountPercentage={form.discountPercentage}
                  discountAmount={form.discountAmount}
                  discountStartDate={form.discountStartDate}
                  discountEndDate={form.discountEndDate}
                  onDiscountTypeChange={handleDiscountTypeChange}
                  onDiscountPercentageChange={(value) =>
                    handleChange("discountPercentage", value)
                  }
                  onDiscountAmountChange={(value) =>
                    handleChange("discountAmount", value)
                  }
                  onDiscountStartDateChange={(value) =>
                    handleChange("discountStartDate", value)
                  }
                  onDiscountEndDateChange={(value) =>
                    handleChange("discountEndDate", value)
                  }
                  onClearDiscount={handleClearDiscount}
                />

                {/* Images Section */}
                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
                  <h3 className="text-base sm:text-lg font-semibold text-[#0F0F0F] mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[#D4AF37]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Product Images
                    {form.images.length > 0 && (
                      <span className="text-sm font-normal text-gray-500">
                        ({form.images.length} uploaded)
                      </span>
                    )}
                  </h3>

                  <div className="space-y-4">
                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-[#D4AF37] transition-colors duration-200">
                      <div className="flex flex-col items-center justify-center text-center">
                        <svg
                          className="w-12 h-12 text-gray-400 mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <label
                          htmlFor="product-images-input"
                          className="cursor-pointer"
                        >
                          <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#A67C00] text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all duration-200 hover:scale-105">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            Choose Images
                          </span>
                        </label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => onFiles(e.target.files)}
                          className="hidden"
                          id="product-images-input"
                        />
                        <p className="text-xs text-gray-500 mt-3">
                          Upload multiple images at once. First image will be
                          the main product image.
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Supported formats: JPG, PNG, WebP (Max 5MB each)
                        </p>
                      </div>
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                        <svg
                          className="animate-spin h-5 w-5 text-blue-600"
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
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            Uploading images...
                          </p>
                          <p className="text-xs text-blue-600">
                            Please wait while we upload your images to Firebase
                            Storage
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Uploaded Images Grid */}
                    {form.images.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-700">
                            Uploaded Images
                          </p>
                          <p className="text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1">
                              <svg
                                className="w-3.5 h-3.5 text-[#D4AF37]"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              First image is main
                            </span>
                          </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {form.images.map((url, i) => (
                            <div
                              key={i}
                              className="relative group border-2 rounded-xl overflow-hidden hover:border-[#D4AF37] transition-all duration-200 hover:shadow-md aspect-square"
                              style={{
                                borderColor: i === 0 ? "#D4AF37" : "#e5e7eb",
                              }}
                            >
                              {i === 0 && (
                                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#D4AF37] to-[#A67C00] text-white text-[10px] px-2 py-1 font-bold z-10 text-center">
                                  MAIN IMAGE
                                </div>
                              )}
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={url}
                                alt={`Product ${i + 1}`}
                                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleChange(
                                    "images",
                                    form.images.filter((_, idx) => idx !== i)
                                  )
                                }
                                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-7 h-7 flex items-center justify-center rounded-full opacity-70 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-110"
                                title="Remove image"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
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
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-red-800">
                        Error
                      </p>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Enhanced Footer with Action Buttons */}
            <div className="sticky bottom-0 bg-white px-4 sm:px-6 py-4 border-t border-gray-200 shadow-lg">
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Info Text */}
                <p className="text-xs text-gray-500 text-center sm:text-left">
                  <span className="text-red-500">*</span> Required fields
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => !saving && onClose()}
                    disabled={saving}
                    className="flex-1 sm:flex-initial px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="product-form"
                    disabled={saving}
                    className="flex-1 sm:flex-initial px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#D4AF37] to-[#A67C00] rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
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
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Save Product</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductFormModal;

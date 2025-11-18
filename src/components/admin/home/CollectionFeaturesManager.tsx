"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  createAdminCollectionFeature,
  deleteAdminCollectionFeature,
  fetchAdminCollectionFeatures,
  updateAdminCollectionFeature,
  uploadImages,
} from "@/utils/api";
import type { HomeCollectionFeature } from "@/types/home-content";
import { ADMIN_COLORS } from "./constants";
import { parseErrorMessage } from "./utils";

const inputClasses =
  "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition";

type CollectionForm = Pick<
  HomeCollectionFeature,
  | "tagline"
  | "title"
  | "description"
  | "availability"
  | "ctaLabel"
  | "ctaHref"
  | "image"
  | "imageAlt"
  | "layout"
  | "position"
> & {
  brand: string;
  productPrice: number;
  category: string;
  mainCategory: "Men" | "Women";
  subcategory: string;
  images: string[];
  stock: number;
  gender: string;
  dialColor: string;
  dialShape: string;
  dialType: string;
  strapColor: string;
  strapMaterial: string;
  style: string;
  dialThickness: string;
  discountPercentage: number | null;
  discountAmount: number | null;
  discountStartDate: string | null;
  discountEndDate: string | null;
};

const defaultForm: CollectionForm = {
  tagline: "",
  title: "",
  description: "",
  availability: "",
  ctaLabel: "",
  ctaHref: "",
  image: "",
  imageAlt: "",
  layout: "image-left",
  position: 0,
  brand: "",
  productPrice: 0,
  category: "",
  mainCategory: "Men",
  subcategory: "",
  images: [],
  stock: 0,
  gender: "",
  dialColor: "",
  dialShape: "",
  dialType: "",
  strapColor: "",
  strapMaterial: "",
  style: "",
  dialThickness: "",
  discountPercentage: null,
  discountAmount: null,
  discountStartDate: null,
  discountEndDate: null,
};

const layoutOptions = [
  { value: "image-left", label: "Image Left" },
  { value: "image-right", label: "Image Right" },
  { value: "image-top", label: "Image Top" },
];

export default function CollectionFeaturesManager() {
  const [features, setFeatures] = useState<HomeCollectionFeature[]>([]);
  const [form, setForm] = useState<CollectionForm>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchAdminCollectionFeatures();
      setFeatures(response.data.data || []);
    } catch (err) {
      setError(parseErrorMessage(err, "Failed to fetch collections"));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    if (name === "position") {
      setForm((prev) => ({ ...prev, position: Number(value) || 0 }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const filesArray = Array.from(files);
      const response = await uploadImages(filesArray);
      const urls = response.data.data?.urls || [];
      if (urls.length === 0) throw new Error("Image upload failed");
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...urls],
        image: prev.image || urls[0],
      }));
      setSuccess(`${urls.length} image(s) uploaded successfully`);
    } catch (err) {
      setError(parseErrorMessage(err, "Failed to upload image"));
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (feature: HomeCollectionFeature) => {
    setEditingId(feature.id);
    const extra: Record<string, unknown> = feature as unknown as Record<string, unknown>;
    setForm({
      tagline: feature.tagline,
      title: feature.title,
      description: feature.description,
      availability: feature.availability,
      ctaLabel: feature.ctaLabel,
      ctaHref: feature.ctaHref,
      image: feature.image,
      imageAlt: feature.imageAlt,
      layout: feature.layout || "image-left",
      position: feature.position ?? 0,
      // Product fields
      brand: typeof extra.brand === "string" ? extra.brand : "",
      productPrice: typeof extra.productPrice === "number" ? extra.productPrice : 0,
      category: typeof extra.category === "string" ? extra.category : "",
      mainCategory: typeof extra.mainCategory === "string" && (extra.mainCategory === "Men" || extra.mainCategory === "Women") ? extra.mainCategory : "Men",
      subcategory: typeof extra.subcategory === "string" ? extra.subcategory : "",
      images: Array.isArray(extra.images) ? extra.images : [feature.image],
      stock: typeof extra.stock === "number" ? extra.stock : 0,
      gender: typeof extra.gender === "string" ? extra.gender : "",
      dialColor: typeof extra.dialColor === "string" ? extra.dialColor : "",
      dialShape: typeof extra.dialShape === "string" ? extra.dialShape : "",
      dialType: typeof extra.dialType === "string" ? extra.dialType : "",
      strapColor: typeof extra.strapColor === "string" ? extra.strapColor : "",
      strapMaterial: typeof extra.strapMaterial === "string" ? extra.strapMaterial : "",
      style: typeof extra.style === "string" ? extra.style : "",
      dialThickness: typeof extra.dialThickness === "string" ? extra.dialThickness : "",
      discountPercentage: typeof extra.discountPercentage === "number" ? extra.discountPercentage : null,
      discountAmount: typeof extra.discountAmount === "number" ? extra.discountAmount : null,
      discountStartDate: typeof extra.discountStartDate === "string" ? extra.discountStartDate : null,
      discountEndDate: typeof extra.discountEndDate === "string" ? extra.discountEndDate : null,
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const payload = {
      tagline: form.tagline.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      availability: form.availability.trim(),
      ctaLabel: form.ctaLabel.trim(),
      ctaHref: form.ctaHref.trim(),
      image: form.image.trim(),
      imageAlt: form.imageAlt.trim(),
      layout: form.layout || "image-left",
      position: Number(form.position) || 0,
      // Product fields
      brand: form.brand.trim(),
      productPrice: Number(form.productPrice) || 0,
      category: form.subcategory ? `${form.mainCategory}/${form.subcategory}` : form.mainCategory,
      mainCategory: form.mainCategory,
      subcategory: form.subcategory.trim(),
      images: form.images.length > 0 ? form.images : [form.image.trim()],
      stock: Number(form.stock) || 0,
      gender: form.gender.trim(),
      dialColor: form.dialColor.trim(),
      dialShape: form.dialShape.trim(),
      dialType: form.dialType.trim(),
      strapColor: form.strapColor.trim(),
      strapMaterial: form.strapMaterial.trim(),
      style: form.style.trim(),
      dialThickness: form.dialThickness.trim(),
      discountPercentage: form.discountPercentage,
      discountAmount: form.discountAmount,
      discountStartDate: form.discountStartDate,
      discountEndDate: form.discountEndDate,
    };

    if (!payload.title || !payload.description) {
      setError("Title and description are required");
      setSubmitting(false);
      return;
    }

    if (!payload.brand || payload.productPrice <= 0 || payload.stock < 0) {
      setError("Brand, product price, and stock are required for product creation");
      setSubmitting(false);
      return;
    }

    try {
      if (editingId) {
        await updateAdminCollectionFeature(editingId, payload);
        setSuccess("Collection feature updated");
      } else {
        await createAdminCollectionFeature(payload);
        setSuccess("Collection feature created");
      }
      resetForm();
      await loadFeatures();
    } catch (err) {
      setError(parseErrorMessage(err, "Failed to save collection feature"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this collection feature?")) return;
    setError("");
    setSuccess("");
    try {
      await deleteAdminCollectionFeature(id);
      setSuccess("Collection feature deleted");
      await loadFeatures();
    } catch (err) {
      setError(parseErrorMessage(err, "Failed to delete collection feature"));
    }
  };

  return (
    <section
      className="rounded-2xl border shadow-sm"
      style={{
        borderColor: `${ADMIN_COLORS.surfaceLight}80`,
        backgroundColor: ADMIN_COLORS.background,
      }}
    >
      <div
        className="flex flex-col gap-2 border-b px-4 py-4 md:px-6"
        style={{
          backgroundColor: ADMIN_COLORS.surface,
          borderColor: `${ADMIN_COLORS.surfaceLight}60`,
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              className="text-lg font-semibold"
              style={{ color: ADMIN_COLORS.primary }}
            >
              Collection Features
            </h2>
            <p className="text-sm" style={{ color: ADMIN_COLORS.textMuted }}>
              Manage the collection highlight sections on the homepage.
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm font-semibold"
            style={{
              backgroundColor: ADMIN_COLORS.primary,
              color: ADMIN_COLORS.background,
            }}
            onClick={resetForm}
            disabled={submitting || uploading}
          >
            {editingId ? "New Feature" : "Reset"}
          </button>
        </div>
        {(error || success) && (
          <div
            className="rounded-lg px-3 py-2 text-sm"
            style={{
              backgroundColor: error
                ? `${ADMIN_COLORS.error}10`
                : `${ADMIN_COLORS.success}10`,
              color: error ? ADMIN_COLORS.error : ADMIN_COLORS.success,
              border: `1px solid ${
                error ? ADMIN_COLORS.error : ADMIN_COLORS.success
              }40`,
            }}
          >
            {error || success}
          </div>
        )}
      </div>

      <div className="grid gap-6 px-4 py-6 md:px-6 md:grid-cols-1 xl:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border p-4 shadow-sm"
          style={{
            borderColor: `${ADMIN_COLORS.surfaceLight}80`,
            backgroundColor: ADMIN_COLORS.surface,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="text-sm font-medium"
                style={{ color: ADMIN_COLORS.text }}
              >
                Tagline
              </label>
              <input
                name="tagline"
                value={form.tagline}
                onChange={handleChange}
                className={inputClasses}
                style={{
                  borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                  backgroundColor: ADMIN_COLORS.background,
                }}
                placeholder="Immerse yourself in luxury"
              />
            </div>
            <div>
              <label
                className="text-sm font-medium"
                style={{ color: ADMIN_COLORS.text }}
              >
                Availability
              </label>
              <input
                name="availability"
                value={form.availability}
                onChange={handleChange}
                className={inputClasses}
                style={{
                  borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                  backgroundColor: ADMIN_COLORS.background,
                }}
                placeholder="Available in platinum..."
              />
            </div>
          </div>

          <div>
            <label
              className="text-sm font-medium"
              style={{ color: ADMIN_COLORS.text }}
            >
              Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className={inputClasses}
              style={{
                borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                backgroundColor: ADMIN_COLORS.background,
              }}
              placeholder="Mak Harmony X"
              required
            />
          </div>

          <div>
            <label
              className="text-sm font-medium"
              style={{ color: ADMIN_COLORS.text }}
            >
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={`${inputClasses} min-h-[96px]`}
              style={{
                borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                backgroundColor: ADMIN_COLORS.background,
              }}
              placeholder="Describe the collection feature"
              required
            />
          </div>

          {/* Product Information Section */}
          <div className="pt-4 border-t" style={{ borderColor: `${ADMIN_COLORS.surfaceLight}60` }}>
            <h4 className="text-sm font-semibold mb-3" style={{ color: ADMIN_COLORS.primary }}>
              Product Information (Required)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.brand}
                  onChange={(e) => setForm(prev => ({ ...prev, brand: e.target.value }))}
                  className={inputClasses}
                  style={{ borderColor: `${ADMIN_COLORS.surfaceLight}80`, backgroundColor: ADMIN_COLORS.background }}
                  placeholder="MAK Watches"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.productPrice}
                  onChange={(e) => setForm(prev => ({ ...prev, productPrice: parseFloat(e.target.value) || 0 }))}
                  className={inputClasses}
                  style={{ borderColor: `${ADMIN_COLORS.surfaceLight}80`, backgroundColor: ADMIN_COLORS.background }}
                  placeholder="450"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Main Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.mainCategory}
                  onChange={(e) => setForm(prev => ({ ...prev, mainCategory: e.target.value as "Men" | "Women" }))}
                  className={inputClasses}
                  style={{ borderColor: `${ADMIN_COLORS.surfaceLight}80`, backgroundColor: ADMIN_COLORS.background }}
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subcategory
                </label>
                <input
                  value={form.subcategory}
                  onChange={(e) => setForm(prev => ({ ...prev, subcategory: e.target.value }))}
                  className={inputClasses}
                  style={{ borderColor: `${ADMIN_COLORS.surfaceLight}80`, backgroundColor: ADMIN_COLORS.background }}
                  placeholder="Chronograph"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                  className={inputClasses}
                  style={{ borderColor: `${ADMIN_COLORS.surfaceLight}80`, backgroundColor: ADMIN_COLORS.background }}
                  placeholder="10"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm(prev => ({ ...prev, gender: e.target.value }))}
                  className={inputClasses}
                  style={{ borderColor: `${ADMIN_COLORS.surfaceLight}80`, backgroundColor: ADMIN_COLORS.background }}
                >
                  <option value="">—</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
            </div>

            <h4 className="text-sm font-semibold mt-4 mb-3" style={{ color: ADMIN_COLORS.primary }}>
              Watch Attributes (Optional)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dial Color</label>
                <input
                  value={form.dialColor}
                  onChange={(e) => setForm(prev => ({ ...prev, dialColor: e.target.value }))}
                  className={inputClasses}
                  style={{ borderColor: `${ADMIN_COLORS.surfaceLight}80`, backgroundColor: ADMIN_COLORS.background }}
                  placeholder="Black"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dial Shape</label>
                <input
                  value={form.dialShape}
                  onChange={(e) => setForm(prev => ({ ...prev, dialShape: e.target.value }))}
                  className={inputClasses}
                  style={{ borderColor: `${ADMIN_COLORS.surfaceLight}80`, backgroundColor: ADMIN_COLORS.background }}
                  placeholder="Round"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dial Type</label>
                <input
                  value={form.dialType}
                  onChange={(e) => setForm(prev => ({ ...prev, dialType: e.target.value }))}
                  className={inputClasses}
                  style={{ borderColor: `${ADMIN_COLORS.surfaceLight}80`, backgroundColor: ADMIN_COLORS.background }}
                  placeholder="Analog"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Strap Color</label>
                <input
                  value={form.strapColor}
                  onChange={(e) => setForm(prev => ({ ...prev, strapColor: e.target.value }))}
                  className={inputClasses}
                  style={{ borderColor: `${ADMIN_COLORS.surfaceLight}80`, backgroundColor: ADMIN_COLORS.background }}
                  placeholder="Brown"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Strap Material</label>
                <input
                  value={form.strapMaterial}
                  onChange={(e) => setForm(prev => ({ ...prev, strapMaterial: e.target.value }))}
                  className={inputClasses}
                  style={{ borderColor: `${ADMIN_COLORS.surfaceLight}80`, backgroundColor: ADMIN_COLORS.background }}
                  placeholder="Leather"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Style</label>
                <input
                  value={form.style}
                  onChange={(e) => setForm(prev => ({ ...prev, style: e.target.value }))}
                  className={inputClasses}
                  style={{ borderColor: `${ADMIN_COLORS.surfaceLight}80`, backgroundColor: ADMIN_COLORS.background }}
                  placeholder="Luxury"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dial Thickness</label>
                <input
                  value={form.dialThickness}
                  onChange={(e) => setForm(prev => ({ ...prev, dialThickness: e.target.value }))}
                  className={inputClasses}
                  style={{ borderColor: `${ADMIN_COLORS.surfaceLight}80`, backgroundColor: ADMIN_COLORS.background }}
                  placeholder="8mm"
                />
              </div>
            </div>

            <h4 className="text-sm font-semibold mt-4 mb-3" style={{ color: ADMIN_COLORS.primary }}>
              Discount (Optional)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Percentage (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.discountPercentage || ""}
                  onChange={(e) => setForm(prev => ({ ...prev, discountPercentage: e.target.value ? parseFloat(e.target.value) : null }))}
                  className={inputClasses}
                  style={{ borderColor: `${ADMIN_COLORS.surfaceLight}80`, backgroundColor: ADMIN_COLORS.background }}
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.discountAmount || ""}
                  onChange={(e) => setForm(prev => ({ ...prev, discountAmount: e.target.value ? parseFloat(e.target.value) : null }))}
                  className={inputClasses}
                  style={{ borderColor: `${ADMIN_COLORS.surfaceLight}80`, backgroundColor: ADMIN_COLORS.background }}
                  placeholder="50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Start Date</label>
                <input
                  type="datetime-local"
                  value={form.discountStartDate || ""}
                  onChange={(e) => setForm(prev => ({ ...prev, discountStartDate: e.target.value || null }))}
                  className={inputClasses}
                  style={{ borderColor: `${ADMIN_COLORS.surfaceLight}80`, backgroundColor: ADMIN_COLORS.background }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Discount End Date</label>
                <input
                  type="datetime-local"
                  value={form.discountEndDate || ""}
                  onChange={(e) => setForm(prev => ({ ...prev, discountEndDate: e.target.value || null }))}
                  className={inputClasses}
                  style={{ borderColor: `${ADMIN_COLORS.surfaceLight}80`, backgroundColor: ADMIN_COLORS.background }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="text-sm font-medium"
                style={{ color: ADMIN_COLORS.text }}
              >
                CTA Label
              </label>
              <input
                name="ctaLabel"
                value={form.ctaLabel}
                onChange={handleChange}
                className={inputClasses}
                style={{
                  borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                  backgroundColor: ADMIN_COLORS.background,
                }}
                placeholder="Pre-order"
              />
            </div>
            <div>
              <label
                className="text-sm font-medium"
                style={{ color: ADMIN_COLORS.text }}
              >
                CTA Link
              </label>
              <input
                name="ctaHref"
                value={form.ctaHref}
                onChange={handleChange}
                className={inputClasses}
                style={{
                  borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                  backgroundColor: ADMIN_COLORS.background,
                }}
                placeholder="/collection/luxury"
              />
            </div>
          </div>

          {/* Multiple Images Section */}
          <div className="pt-4 border-t" style={{ borderColor: `${ADMIN_COLORS.surfaceLight}60` }}>
            <h4 className="text-sm font-semibold mb-3" style={{ color: ADMIN_COLORS.primary }}>
              Product Images
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Images <span className="text-xs font-normal text-gray-500">(Multiple files supported)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUpload}
                  className="block w-full text-sm"
                  disabled={uploading}
                />
                {uploading && <p className="text-sm mt-2" style={{ color: ADMIN_COLORS.primary }}>Uploading...</p>}
              </div>

              {/* Uploaded Images Grid */}
              {form.images.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Uploaded Images ({form.images.length})
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Product ${idx + 1}`}
                          className="w-full h-32 object-cover rounded border"
                          style={{ borderColor: `${ADMIN_COLORS.surfaceLight}80` }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = form.images.filter((_, i) => i !== idx);
                            setForm(prev => ({ ...prev, images: updated }));
                          }}
                          className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legacy Image URL field (kept for backwards compatibility) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Or Enter Image URL
                </label>
                <input
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  className={inputClasses}
                  style={{ borderColor: `${ADMIN_COLORS.surfaceLight}80`, backgroundColor: ADMIN_COLORS.background }}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs mt-1" style={{ color: ADMIN_COLORS.textMuted }}>
                  Legacy field - prefer uploading files above.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label
              className="text-sm font-medium"
              style={{ color: ADMIN_COLORS.text }}
            >
              Image Alt Text
            </label>
            <input
              name="imageAlt"
              value={form.imageAlt}
              onChange={handleChange}
              className={inputClasses}
              style={{
                borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                backgroundColor: ADMIN_COLORS.background,
              }}
              placeholder="Mak Harmony X"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="text-sm font-medium"
                style={{ color: ADMIN_COLORS.text }}
              >
                Layout
              </label>
              <select
                name="layout"
                value={form.layout}
                onChange={handleChange}
                className={inputClasses}
                style={{
                  borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                  backgroundColor: ADMIN_COLORS.background,
                }}
              >
                {layoutOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="text-sm font-medium"
                style={{ color: ADMIN_COLORS.text }}
              >
                Position
              </label>
              <input
                type="number"
                name="position"
                value={form.position}
                onChange={handleChange}
                className={inputClasses}
                style={{
                  borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                  backgroundColor: ADMIN_COLORS.background,
                }}
                min={0}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm font-semibold"
              style={{
                backgroundColor: `${ADMIN_COLORS.primary}15`,
                color: ADMIN_COLORS.primary,
              }}
              onClick={resetForm}
              disabled={submitting || uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg px-4 py-2 text-sm font-semibold"
              style={{
                backgroundColor: ADMIN_COLORS.primary,
                color: ADMIN_COLORS.background,
              }}
              disabled={submitting || uploading}
            >
              {submitting
                ? "Saving..."
                : editingId
                ? "Update Feature"
                : "Add Feature"}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {loading ? (
            <div
              className="flex h-full items-center justify-center text-sm"
              style={{ color: ADMIN_COLORS.textMuted }}
            >
              Loading collection features...
            </div>
          ) : features.length === 0 ? (
            <div
              className="rounded-xl border p-6 text-center text-sm"
              style={{
                borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                backgroundColor: ADMIN_COLORS.surface,
                color: ADMIN_COLORS.textMuted,
              }}
            >
              No collection features configured yet.
            </div>
          ) : (
            <div className="grid gap-4">
              {features
                .slice()
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                .map((feature) => (
                  <div
                    key={feature.id}
                    className="rounded-xl border p-4 shadow-sm"
                    style={{
                      borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                      backgroundColor: ADMIN_COLORS.surface,
                    }}
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <span
                          className="inline-flex rounded-full px-2 py-1 text-xs"
                          style={{
                            backgroundColor: `${ADMIN_COLORS.primary}15`,
                            color: ADMIN_COLORS.primary,
                          }}
                        >
                          Position {feature.position ?? 0} · Layout{" "}
                          {feature.layout}
                        </span>
                        <h3
                          className="text-base font-semibold"
                          style={{ color: ADMIN_COLORS.text }}
                        >
                          {feature.title}
                        </h3>
                        <p
                          className="text-sm"
                          style={{ color: ADMIN_COLORS.textMuted }}
                        >
                          {feature.tagline}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: ADMIN_COLORS.textMuted }}
                        >
                          CTA: {feature.ctaLabel || "—"} →{" "}
                          {feature.ctaHref || "—"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-lg px-4 py-2 text-sm font-semibold"
                          style={{
                            backgroundColor: `${ADMIN_COLORS.primary}15`,
                            color: ADMIN_COLORS.primary,
                          }}
                          onClick={() => handleEdit(feature)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded-lg px-4 py-2 text-sm font-semibold"
                          style={{
                            backgroundColor: `${ADMIN_COLORS.error}15`,
                            color: ADMIN_COLORS.error,
                          }}
                          onClick={() => handleDelete(feature.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

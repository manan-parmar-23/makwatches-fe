"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  createAdminHeroSlide,
  deleteAdminHeroSlide,
  fetchAdminHeroSlides,
  updateAdminHeroSlide,
  uploadImages,
} from "@/utils/api";
import type { HeroSlide } from "@/types/home-content";
import { ADMIN_COLORS } from "./constants";
import { parseErrorMessage, parseListInput } from "./utils";

interface HeroSlideForm
  extends Pick<
    HeroSlide,
    | "title"
    | "subtitle"
    | "price"
    | "description"
    | "image"
    | "gradient"
    | "glowColor"
    | "position"
  > {
  featuresInput: string;
  // Product fields
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
}

const defaultForm: HeroSlideForm = {
  title: "",
  subtitle: "",
  price: "",
  description: "",
  image: "",
  gradient: "",
  glowColor: "",
  position: 0,
  featuresInput: "",
  // Product fields
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

const sectionCardStyles = {
  borderColor: `${ADMIN_COLORS.surfaceLight}80`,
  backgroundColor: ADMIN_COLORS.background,
};

const sectionHeaderStyles = {
  backgroundColor: ADMIN_COLORS.surface,
  borderColor: `${ADMIN_COLORS.surfaceLight}60`,
};

const inputBaseClasses =
  "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition";

const inputStyle = {
  backgroundColor: ADMIN_COLORS.background,
  borderColor: `${ADMIN_COLORS.surfaceLight}80`,
};

const focusStyle = {
  boxShadow: `0 0 0 1px ${ADMIN_COLORS.primary}25`,
};

const buttonPrimaryClasses =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed";

export default function HeroSlidesManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<HeroSlideForm>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchAdminHeroSlides();
      setSlides(response.data.data || []);
    } catch (err) {
      setError(parseErrorMessage(err, "Failed to fetch hero slides"));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    if (name === "position") {
      setForm((prev) => ({
        ...prev,
        [name]: Number(value) || 0,
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFeaturesChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => ({
      ...prev,
      featuresInput: event.target.value,
    }));
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    setError("");
    try {
      const filesArray = Array.from(files);
      const response = await uploadImages(filesArray);
      const urls = response.data.data?.urls || [];
      if (urls.length === 0) throw new Error("Image upload failed");
      // Add to images array and set first as main image if not set
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...urls],
        image: prev.image || urls[0],
      }));
      setSuccess(`${urls.length} image(s) uploaded successfully`);
    } catch (err) {
      setError(parseErrorMessage(err, "Failed to upload image"));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingId(slide.id);
    const extra: Record<string, unknown> = slide as unknown as Record<string, unknown>;
    setForm({
      title: slide.title,
      subtitle: slide.subtitle,
      price: slide.price || "",
      description: slide.description,
      image: slide.image,
      gradient: slide.gradient,
      glowColor: slide.glowColor,
      position: slide.position ?? 0,
      featuresInput: slide.features?.join("\n") || "",
      // Product fields
      brand: typeof extra.brand === "string" ? extra.brand : "",
      productPrice: typeof extra.productPrice === "number" ? extra.productPrice : 0,
      category: typeof extra.category === "string" ? extra.category : "",
      mainCategory: typeof extra.mainCategory === "string" && (extra.mainCategory === "Men" || extra.mainCategory === "Women") ? extra.mainCategory : "Men",
      subcategory: typeof extra.subcategory === "string" ? extra.subcategory : "",
      images: Array.isArray(extra.images) ? extra.images : [slide.image],
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
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      price: form.price?.trim() || "",
      description: form.description.trim(),
      image: form.image.trim(),
      gradient: form.gradient.trim(),
      glowColor: form.glowColor.trim(),
      position: Number(form.position) || 0,
      features: parseListInput(form.featuresInput),
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

    if (!payload.title || !payload.subtitle) {
      setError("Title and subtitle are required");
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
        await updateAdminHeroSlide(editingId, payload);
        setSuccess("Hero slide updated successfully");
      } else {
        await createAdminHeroSlide(payload);
        setSuccess("Hero slide created successfully");
      }
      resetForm();
      await loadSlides();
    } catch (err) {
      setError(parseErrorMessage(err, "Failed to save hero slide"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this hero slide?")) return;
    setError("");
    setSuccess("");
    try {
      await deleteAdminHeroSlide(id);
      setSuccess("Hero slide deleted");
      await loadSlides();
    } catch (err) {
      setError(parseErrorMessage(err, "Failed to delete hero slide"));
    }
  };

  return (
    <section className="rounded-2xl border shadow-sm" style={sectionCardStyles}>
      <div
        className="flex flex-col gap-2 border-b px-4 py-4 md:px-6"
        style={sectionHeaderStyles}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2
              className="text-lg font-semibold"
              style={{ color: ADMIN_COLORS.primary }}
            >
              Hero Slides
            </h2>
            <p className="text-sm" style={{ color: ADMIN_COLORS.textMuted }}>
              Manage carousel slides shown at the top of the homepage.
            </p>
          </div>
          <button
            type="button"
            className={`${buttonPrimaryClasses}`}
            style={{
              backgroundColor: ADMIN_COLORS.primary,
              color: ADMIN_COLORS.background,
            }}
            onClick={resetForm}
            disabled={submitting || uploadingImage}
          >
            {editingId ? "New Slide" : "Reset"}
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
          className="rounded-xl border p-4 shadow-sm space-y-4"
          style={{
            backgroundColor: ADMIN_COLORS.surface,
            borderColor: `${ADMIN_COLORS.surfaceLight}80`,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                onChange={handleInputChange}
                className={inputBaseClasses}
                style={inputStyle}
                onFocus={(e) =>
                  Object.assign(e.currentTarget.style, focusStyle)
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                placeholder="MAK Watches"
                required
              />
            </div>
            <div>
              <label
                className="text-sm font-medium"
                style={{ color: ADMIN_COLORS.text }}
              >
                Subtitle
              </label>
              <input
                name="subtitle"
                value={form.subtitle}
                onChange={handleInputChange}
                className={inputBaseClasses}
                style={inputStyle}
                onFocus={(e) =>
                  Object.assign(e.currentTarget.style, focusStyle)
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                placeholder="Supernova"
                required
              />
            </div>
            <div>
              <label
                className="text-sm font-medium"
                style={{ color: ADMIN_COLORS.text }}
              >
                Price Label
              </label>
              <input
                name="price"
                value={form.price}
                onChange={handleInputChange}
                className={inputBaseClasses}
                style={inputStyle}
                placeholder="₹450"
              />
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
                onChange={handleInputChange}
                className={inputBaseClasses}
                style={inputStyle}
                min={0}
              />
            </div>
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
              onChange={handleInputChange}
              className={`${inputBaseClasses} min-h-[96px]`}
              style={inputStyle}
              placeholder="Luxury watch description"
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
                  className={inputBaseClasses}
                  style={inputStyle}
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
                  className={inputBaseClasses}
                  style={inputStyle}
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
                  className={inputBaseClasses}
                  style={inputStyle}
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
                  className={inputBaseClasses}
                  style={inputStyle}
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
                  className={inputBaseClasses}
                  style={inputStyle}
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
                  className={inputBaseClasses}
                  style={inputStyle}
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dial Color
                </label>
                <input
                  value={form.dialColor}
                  onChange={(e) => setForm(prev => ({ ...prev, dialColor: e.target.value }))}
                  className={inputBaseClasses}
                  style={inputStyle}
                  placeholder="Black"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dial Shape
                </label>
                <input
                  value={form.dialShape}
                  onChange={(e) => setForm(prev => ({ ...prev, dialShape: e.target.value }))}
                  className={inputBaseClasses}
                  style={inputStyle}
                  placeholder="Round"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dial Type
                </label>
                <input
                  value={form.dialType}
                  onChange={(e) => setForm(prev => ({ ...prev, dialType: e.target.value }))}
                  className={inputBaseClasses}
                  style={inputStyle}
                  placeholder="Analog"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Strap Color
                </label>
                <input
                  value={form.strapColor}
                  onChange={(e) => setForm(prev => ({ ...prev, strapColor: e.target.value }))}
                  className={inputBaseClasses}
                  style={inputStyle}
                  placeholder="Brown"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Strap Material
                </label>
                <input
                  value={form.strapMaterial}
                  onChange={(e) => setForm(prev => ({ ...prev, strapMaterial: e.target.value }))}
                  className={inputBaseClasses}
                  style={inputStyle}
                  placeholder="Leather"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Style
                </label>
                <input
                  value={form.style}
                  onChange={(e) => setForm(prev => ({ ...prev, style: e.target.value }))}
                  className={inputBaseClasses}
                  style={inputStyle}
                  placeholder="Luxury"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dial Thickness
                </label>
                <input
                  value={form.dialThickness}
                  onChange={(e) => setForm(prev => ({ ...prev, dialThickness: e.target.value }))}
                  className={inputBaseClasses}
                  style={inputStyle}
                  placeholder="8mm"
                />
              </div>
            </div>

            <h4 className="text-sm font-semibold mt-4 mb-3" style={{ color: ADMIN_COLORS.primary }}>
              Discount (Optional)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.discountPercentage || ""}
                  onChange={(e) => setForm(prev => ({ ...prev, discountPercentage: e.target.value ? parseFloat(e.target.value) : null }))}
                  className={inputBaseClasses}
                  style={inputStyle}
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.discountAmount || ""}
                  onChange={(e) => setForm(prev => ({ ...prev, discountAmount: e.target.value ? parseFloat(e.target.value) : null }))}
                  className={inputBaseClasses}
                  style={inputStyle}
                  placeholder="50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Start Date
                </label>
                <input
                  type="datetime-local"
                  value={form.discountStartDate || ""}
                  onChange={(e) => setForm(prev => ({ ...prev, discountStartDate: e.target.value || null }))}
                  className={inputBaseClasses}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount End Date
                </label>
                <input
                  type="datetime-local"
                  value={form.discountEndDate || ""}
                  onChange={(e) => setForm(prev => ({ ...prev, discountEndDate: e.target.value || null }))}
                  className={inputBaseClasses}
                  style={inputStyle}
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
                Gradient Classes
              </label>
              <input
                name="gradient"
                value={form.gradient}
                onChange={handleInputChange}
                className={inputBaseClasses}
                style={inputStyle}
                placeholder="from-amber-600 to-transparent"
              />
            </div>
            <div>
              <label
                className="text-sm font-medium"
                style={{ color: ADMIN_COLORS.text }}
              >
                Glow Classes
              </label>
              <input
                name="glowColor"
                value={form.glowColor}
                onChange={handleInputChange}
                className={inputBaseClasses}
                style={inputStyle}
                placeholder="from-amber-500/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              style={{ color: ADMIN_COLORS.text }}
            >
              Features (one per line or comma separated)
            </label>
            <textarea
              name="features"
              value={form.featuresInput}
              onChange={handleFeaturesChange}
              className={`${inputBaseClasses} min-h-[88px]`}
              style={inputStyle}
              placeholder={`Water Resistant\nSwiss Movement`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                style={{ color: ADMIN_COLORS.text }}
              >
                Main Image URL
              </label>
              <input
                name="image"
                value={form.image}
                onChange={handleInputChange}
                className={inputBaseClasses}
                style={inputStyle}
                placeholder="https://..."
              />
              <p className="text-xs" style={{ color: ADMIN_COLORS.textMuted }}>
                Provide a direct URL or upload using the button below.
              </p>
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                style={{ color: ADMIN_COLORS.text }}
              >
                Upload Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="block w-full text-sm"
                disabled={uploadingImage}
              />
              <p className="text-xs" style={{ color: ADMIN_COLORS.textMuted }}>
                Upload multiple product images
              </p>
            </div>
          </div>

          {/* Uploaded Images Grid */}
          {form.images.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold" style={{ color: ADMIN_COLORS.text }}>
                  Uploaded Images ({form.images.length})
                </p>
                <p className="text-xs" style={{ color: ADMIN_COLORS.textMuted }}>
                  First image is main
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
                        MAIN
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
                        setForm(prev => ({
                          ...prev,
                          images: prev.images.filter((_, idx) => idx !== i),
                          image: i === 0 && prev.images.length > 1 ? prev.images[1] : prev.image,
                        }))
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

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className={`${buttonPrimaryClasses}`}
              style={{
                backgroundColor: `${ADMIN_COLORS.primary}15`,
                color: ADMIN_COLORS.primary,
              }}
              onClick={resetForm}
              disabled={submitting || uploadingImage}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={buttonPrimaryClasses}
              style={{
                backgroundColor: ADMIN_COLORS.primary,
                color: ADMIN_COLORS.background,
              }}
              disabled={submitting || uploadingImage}
            >
              {submitting
                ? "Saving..."
                : editingId
                ? "Update Slide"
                : "Add Slide"}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {loading ? (
            <div
              className="flex h-full items-center justify-center text-sm"
              style={{ color: ADMIN_COLORS.textMuted }}
            >
              Loading hero slides...
            </div>
          ) : slides.length === 0 ? (
            <div
              className="rounded-xl border p-6 text-center text-sm"
              style={{
                borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                backgroundColor: ADMIN_COLORS.surface,
                color: ADMIN_COLORS.textMuted,
              }}
            >
              No hero slides configured yet.
            </div>
          ) : (
            <div className="grid gap-4">
              {slides
                .slice()
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                .map((slide) => (
                  <div
                    key={slide.id}
                    className="rounded-xl border p-4 shadow-sm"
                    style={{
                      borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                      backgroundColor: ADMIN_COLORS.surface,
                    }}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="rounded-full px-2 py-1 text-xs"
                            style={{
                              backgroundColor: `${ADMIN_COLORS.primary}15`,
                              color: ADMIN_COLORS.primary,
                            }}
                          >
                            Position {slide.position ?? 0}
                          </span>
                        </div>
                        <h3
                          className="text-base font-semibold"
                          style={{ color: ADMIN_COLORS.text }}
                        >
                          {slide.title}
                        </h3>
                        <p
                          className="text-sm"
                          style={{ color: ADMIN_COLORS.textMuted }}
                        >
                          {slide.subtitle}
                        </p>
                        {slide.features?.length ? (
                          <ul
                            className="text-sm list-disc ml-4"
                            style={{ color: ADMIN_COLORS.textMuted }}
                          >
                            {slide.features.map((feature) => (
                              <li key={feature}>{feature}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                      <div className="flex items-end gap-2">
                        <button
                          type="button"
                          className={buttonPrimaryClasses}
                          style={{
                            backgroundColor: `${ADMIN_COLORS.primary}15`,
                            color: ADMIN_COLORS.primary,
                          }}
                          onClick={() => handleEdit(slide)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={buttonPrimaryClasses}
                          style={{
                            backgroundColor: `${ADMIN_COLORS.error}15`,
                            color: ADMIN_COLORS.error,
                          }}
                          onClick={() => handleDelete(slide.id)}
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

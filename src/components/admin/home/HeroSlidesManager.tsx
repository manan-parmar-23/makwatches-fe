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
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setError("");
    try {
      const response = await uploadImages([file]);
      const url = response.data.data?.urls?.[0];
      if (!url) throw new Error("Image upload failed");
      setForm((prev) => ({
        ...prev,
        image: url,
      }));
      setSuccess("Image uploaded successfully");
    } catch (err) {
      setError(parseErrorMessage(err, "Failed to upload image"));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingId(slide.id);
    setForm({
      title: slide.title,
      subtitle: slide.subtitle,
      price: slide.price,
      description: slide.description,
      image: slide.image,
      gradient: slide.gradient,
      glowColor: slide.glowColor,
      position: slide.position ?? 0,
      featuresInput: slide.features?.join("\n") || "",
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
      price: form.price.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      gradient: form.gradient.trim(),
      glowColor: form.glowColor.trim(),
      position: Number(form.position) || 0,
      features: parseListInput(form.featuresInput),
    };

    if (!payload.title || !payload.subtitle) {
      setError("Title and subtitle are required");
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
                Image URL
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
                Provide a direct URL or upload using the button.
              </p>
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                style={{ color: ADMIN_COLORS.text }}
              >
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm"
                disabled={uploadingImage}
              />
            </div>
          </div>

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

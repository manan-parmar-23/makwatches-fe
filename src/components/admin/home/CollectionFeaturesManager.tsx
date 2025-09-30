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
>;

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
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const response = await uploadImages([file]);
      const url = response.data.data?.urls?.[0];
      if (!url) throw new Error("Image upload failed");
      setForm((prev) => ({ ...prev, image: url }));
      setSuccess("Image uploaded successfully");
    } catch (err) {
      setError(parseErrorMessage(err, "Failed to upload image"));
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (feature: HomeCollectionFeature) => {
    setEditingId(feature.id);
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
    };

    if (!payload.title || !payload.description) {
      setError("Title and description are required");
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
                onChange={handleChange}
                className={inputClasses}
                style={{
                  borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                  backgroundColor: ADMIN_COLORS.background,
                }}
                placeholder="https://..."
              />
              <p className="text-xs" style={{ color: ADMIN_COLORS.textMuted }}>
                Provide a URL or upload below.
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
                onChange={handleUpload}
                className="block w-full text-sm"
                disabled={uploading}
              />
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

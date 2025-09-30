"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  createAdminCategoryCard,
  deleteAdminCategoryCard,
  fetchAdminCategoryCards,
  updateAdminCategoryCard,
  uploadImages,
} from "@/utils/api";
import type { HomeCategoryCard } from "@/types/home-content";
import { ADMIN_COLORS } from "./constants";
import { parseErrorMessage } from "./utils";

type CategoryForm = Pick<
  HomeCategoryCard,
  "title" | "subtitle" | "href" | "image" | "bgGradient" | "position"
>;

const defaultForm: CategoryForm = {
  title: "",
  subtitle: "",
  href: "",
  image: "",
  bgGradient: "",
  position: 0,
};

const inputClasses =
  "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition";

export default function CategoryCardsManager() {
  const [cards, setCards] = useState<HomeCategoryCard[]>([]);
  const [form, setForm] = useState<CategoryForm>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchAdminCategoryCards();
      setCards(response.data.data || []);
    } catch (err) {
      setError(parseErrorMessage(err, "Failed to fetch category cards"));
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
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  const handleEdit = (card: HomeCategoryCard) => {
    setEditingId(card.id);
    setForm({
      title: card.title,
      subtitle: card.subtitle,
      href: card.href,
      image: card.image,
      bgGradient: card.bgGradient,
      position: card.position ?? 0,
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
      href: form.href.trim(),
      image: form.image.trim(),
      bgGradient: form.bgGradient.trim(),
      position: Number(form.position) || 0,
    };

    if (!payload.title || !payload.href) {
      setError("Title and link are required");
      setSubmitting(false);
      return;
    }

    try {
      if (editingId) {
        await updateAdminCategoryCard(editingId, payload);
        setSuccess("Category card updated");
      } else {
        await createAdminCategoryCard(payload);
        setSuccess("Category card created");
      }
      resetForm();
      await loadCards();
    } catch (err) {
      setError(parseErrorMessage(err, "Failed to save category card"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this category card?")) return;
    setError("");
    setSuccess("");
    try {
      await deleteAdminCategoryCard(id);
      setSuccess("Category card deleted");
      await loadCards();
    } catch (err) {
      setError(parseErrorMessage(err, "Failed to delete category card"));
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
              Category Cards
            </h2>
            <p className="text-sm" style={{ color: ADMIN_COLORS.textMuted }}>
              Configure the men and women cards displayed on the homepage.
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
            {editingId ? "New Card" : "Reset"}
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
                placeholder="MEN"
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
                onChange={handleChange}
                className={inputClasses}
                style={{
                  borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                  backgroundColor: ADMIN_COLORS.background,
                }}
                placeholder="Sophisticated Timepieces"
              />
            </div>
          </div>

          <div>
            <label
              className="text-sm font-medium"
              style={{ color: ADMIN_COLORS.text }}
            >
              Link (href)
            </label>
            <input
              name="href"
              value={form.href}
              onChange={handleChange}
              className={inputClasses}
              style={{
                borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                backgroundColor: ADMIN_COLORS.background,
              }}
              placeholder="/men"
              required
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
              Background Gradient Classes
            </label>
            <textarea
              name="bgGradient"
              value={form.bgGradient}
              onChange={handleChange}
              className={`${inputClasses} min-h-[72px]`}
              style={{
                borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                backgroundColor: ADMIN_COLORS.background,
              }}
              placeholder="bg-gradient-to-br from-slate-900/70 ..."
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
              onChange={handleChange}
              className={inputClasses}
              style={{
                borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                backgroundColor: ADMIN_COLORS.background,
              }}
              min={0}
            />
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
                ? "Update Card"
                : "Add Card"}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {loading ? (
            <div
              className="flex h-full items-center justify-center text-sm"
              style={{ color: ADMIN_COLORS.textMuted }}
            >
              Loading category cards...
            </div>
          ) : cards.length === 0 ? (
            <div
              className="rounded-xl border p-6 text-center text-sm"
              style={{
                borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                backgroundColor: ADMIN_COLORS.surface,
                color: ADMIN_COLORS.textMuted,
              }}
            >
              No category cards configured yet.
            </div>
          ) : (
            <div className="grid gap-4">
              {cards
                .slice()
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                .map((card) => (
                  <div
                    key={card.id}
                    className="rounded-xl border p-4 shadow-sm"
                    style={{
                      borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                      backgroundColor: ADMIN_COLORS.surface,
                    }}
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <span
                          className="mb-1 inline-flex rounded-full px-2 py-1 text-xs"
                          style={{
                            backgroundColor: `${ADMIN_COLORS.primary}15`,
                            color: ADMIN_COLORS.primary,
                          }}
                        >
                          Position {card.position ?? 0}
                        </span>
                        <h3
                          className="text-base font-semibold"
                          style={{ color: ADMIN_COLORS.text }}
                        >
                          {card.title}
                        </h3>
                        <p
                          className="text-sm"
                          style={{ color: ADMIN_COLORS.textMuted }}
                        >
                          {card.subtitle}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: ADMIN_COLORS.textMuted }}
                        >
                          Link: {card.href}
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
                          onClick={() => handleEdit(card)}
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
                          onClick={() => handleDelete(card.id)}
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

"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  createAdminTechCard,
  deleteAdminTechCard,
  deleteAdminTechHighlight,
  fetchAdminTechCards,
  fetchAdminTechHighlight,
  upsertAdminTechHighlight,
  updateAdminTechCard,
  uploadImages,
} from "@/utils/api";
import type {
  TechShowcaseCard,
  TechShowcaseHighlight,
} from "@/types/home-content";
import { ADMIN_COLORS } from "./constants";
import { parseErrorMessage } from "./utils";

const inputClasses =
  "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition";

interface CardForm {
  title: string;
  subtitle: string;
  image: string;
  backgroundImage?: string;
  rating?: string;
  reviewCount?: string;
  badge?: string;
  color?: string;
  position: number;
}

const defaultCardForm: CardForm = {
  title: "",
  subtitle: "",
  image: "",
  backgroundImage: "",
  rating: "",
  reviewCount: "",
  badge: "",
  color: "amber",
  position: 0,
};

interface HighlightForm {
  value: string;
  title: string;
  subtitle: string;
  accentHex: string;
  background: string;
}

const defaultHighlightForm: HighlightForm = {
  value: "",
  title: "",
  subtitle: "",
  accentHex: "#F97316",
  background: "bg-gradient-to-r from-slate-900 via-gray-900 to-slate-800",
};

const colorOptions = [
  { value: "amber", label: "Amber" },
  { value: "blue", label: "Blue" },
  { value: "gray", label: "Gray" },
  { value: "slate", label: "Slate" },
];

export default function TechShowcaseManager() {
  const [cards, setCards] = useState<TechShowcaseCard[]>([]);
  const [cardForm, setCardForm] = useState<CardForm>(defaultCardForm);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<TechShowcaseHighlight | null>(
    null
  );
  const [highlightForm, setHighlightForm] =
    useState<HighlightForm>(defaultHighlightForm);

  const [loadingCards, setLoadingCards] = useState(false);
  const [loadingHighlight, setLoadingHighlight] = useState(false);
  const [cardSubmitting, setCardSubmitting] = useState(false);
  const [highlightSubmitting, setHighlightSubmitting] = useState(false);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [uploadingBackgroundImage, setUploadingBackgroundImage] =
    useState(false);

  const [cardError, setCardError] = useState("");
  const [cardSuccess, setCardSuccess] = useState("");
  const [highlightError, setHighlightError] = useState("");
  const [highlightSuccess, setHighlightSuccess] = useState("");

  useEffect(() => {
    loadCards();
    loadHighlight();
  }, []);

  const loadCards = async () => {
    setLoadingCards(true);
    setCardError("");
    try {
      const response = await fetchAdminTechCards();
      setCards(response.data.data || []);
    } catch (err) {
      setCardError(parseErrorMessage(err, "Failed to fetch tech cards"));
    } finally {
      setLoadingCards(false);
    }
  };

  const loadHighlight = async () => {
    setLoadingHighlight(true);
    setHighlightError("");
    try {
      const response = await fetchAdminTechHighlight();
      const data = response.data.data || null;
      setHighlight(data);
      if (data) {
        setHighlightForm({
          value: data.value,
          title: data.title,
          subtitle: data.subtitle,
          accentHex: data.accentHex,
          background: data.background,
        });
      } else {
        setHighlightForm(defaultHighlightForm);
      }
    } catch (err) {
      setHighlightError(parseErrorMessage(err, "Failed to fetch highlight"));
    } finally {
      setLoadingHighlight(false);
    }
  };

  const resetCardForm = () => {
    setCardForm(defaultCardForm);
    setEditingCardId(null);
    setCardError("");
    setCardSuccess("");
  };

  const handleCardChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    if (name === "position") {
      setCardForm((prev) => ({ ...prev, position: Number(value) || 0 }));
    } else {
      setCardForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCardUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    field: "image" | "backgroundImage"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (field === "image") {
      setUploadingMainImage(true);
    } else {
      setUploadingBackgroundImage(true);
    }
    setCardError("");
    try {
      const response = await uploadImages([file]);
      const url = response.data.data?.urls?.[0];
      if (!url) throw new Error("Image upload failed");
      setCardForm((prev) => ({ ...prev, [field]: url }));
      setCardSuccess("Image uploaded successfully");
    } catch (err) {
      setCardError(parseErrorMessage(err, "Failed to upload image"));
    } finally {
      if (field === "image") {
        setUploadingMainImage(false);
      } else {
        setUploadingBackgroundImage(false);
      }
    }
  };

  const handleCardEdit = (card: TechShowcaseCard) => {
    setEditingCardId(card.id);
    setCardForm({
      title: card.title,
      subtitle: card.subtitle,
      image: card.image,
      backgroundImage: card.backgroundImage || "",
      rating:
        card.rating === undefined || card.rating === null
          ? ""
          : String(card.rating),
      reviewCount:
        card.reviewCount === undefined || card.reviewCount === null
          ? ""
          : String(card.reviewCount),
      badge: card.badge || "",
      color: card.color || "amber",
      position: card.position ?? 0,
    });
    setCardError("");
    setCardSuccess("");
  };

  const handleCardSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCardSubmitting(true);
    setCardError("");
    setCardSuccess("");

    const payload: Partial<TechShowcaseCard> = {
      title: cardForm.title.trim(),
      subtitle: cardForm.subtitle.trim(),
      image: cardForm.image.trim(),
      backgroundImage: cardForm.backgroundImage?.trim() || undefined,
      badge: cardForm.badge?.trim() || undefined,
      color: cardForm.color?.trim(),
      position: Number(cardForm.position) || 0,
    };

    if (!payload.title || !payload.image) {
      setCardError("Title and image are required");
      setCardSubmitting(false);
      return;
    }

    if (cardForm.rating) {
      payload.rating = Number(cardForm.rating);
    } else {
      payload.rating = undefined;
    }
    if (cardForm.reviewCount) {
      payload.reviewCount = Number(cardForm.reviewCount);
    } else {
      payload.reviewCount = undefined;
    }

    try {
      if (editingCardId) {
        await updateAdminTechCard(editingCardId, payload);
        setCardSuccess("Tech card updated");
      } else {
        await createAdminTechCard(payload);
        setCardSuccess("Tech card created");
      }
      resetCardForm();
      await loadCards();
    } catch (err) {
      setCardError(parseErrorMessage(err, "Failed to save tech card"));
    } finally {
      setCardSubmitting(false);
    }
  };

  const handleCardDelete = async (id: string) => {
    if (!window.confirm("Delete this tech card?")) return;
    setCardError("");
    setCardSuccess("");
    try {
      await deleteAdminTechCard(id);
      setCardSuccess("Tech card deleted");
      await loadCards();
    } catch (err) {
      setCardError(parseErrorMessage(err, "Failed to delete tech card"));
    }
  };

  const handleHighlightChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setHighlightForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleHighlightSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHighlightSubmitting(true);
    setHighlightError("");
    setHighlightSuccess("");

    const payload = {
      value: highlightForm.value.trim(),
      title: highlightForm.title.trim(),
      subtitle: highlightForm.subtitle.trim(),
      accentHex: highlightForm.accentHex.trim(),
      background: highlightForm.background.trim(),
    };

    if (!payload.value || !payload.title) {
      setHighlightError("Highlight value and title are required");
      setHighlightSubmitting(false);
      return;
    }

    try {
      await upsertAdminTechHighlight(payload);
      setHighlightSuccess("Highlight saved");
      await loadHighlight();
    } catch (err) {
      setHighlightError(parseErrorMessage(err, "Failed to save highlight"));
    } finally {
      setHighlightSubmitting(false);
    }
  };

  const handleHighlightDelete = async () => {
    if (!window.confirm("Remove the highlight section?")) return;
    setHighlightError("");
    setHighlightSuccess("");
    try {
      await deleteAdminTechHighlight();
      setHighlightSuccess("Highlight removed");
      setHighlight(null);
      setHighlightForm(defaultHighlightForm);
    } catch (err) {
      setHighlightError(parseErrorMessage(err, "Failed to delete highlight"));
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
              Tech Showcase & Highlight
            </h2>
            <p className="text-sm" style={{ color: ADMIN_COLORS.textMuted }}>
              Manage technology cards and the featured highlight banner.
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm font-semibold"
            style={{
              backgroundColor: ADMIN_COLORS.primary,
              color: ADMIN_COLORS.background,
            }}
            onClick={resetCardForm}
            disabled={
              cardSubmitting || uploadingMainImage || uploadingBackgroundImage
            }
          >
            {editingCardId ? "New Tech Card" : "Reset"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 px-4 py-6 md:px-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-1">
          <div
            className="rounded-xl border p-4 shadow-sm"
            style={{
              borderColor: `${ADMIN_COLORS.surfaceLight}80`,
              backgroundColor: ADMIN_COLORS.surface,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3
                className="text-base font-semibold"
                style={{ color: ADMIN_COLORS.text }}
              >
                Highlight Section
              </h3>
              <button
                type="button"
                className="rounded-lg px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: `${ADMIN_COLORS.error}15`,
                  color: ADMIN_COLORS.error,
                }}
                onClick={handleHighlightDelete}
                disabled={highlightSubmitting || loadingHighlight || !highlight}
              >
                Remove
              </button>
            </div>
            {(highlightError || highlightSuccess) && (
              <div
                className="mb-3 rounded-lg px-3 py-2 text-xs"
                style={{
                  backgroundColor: highlightError
                    ? `${ADMIN_COLORS.error}10`
                    : `${ADMIN_COLORS.success}10`,
                  color: highlightError
                    ? ADMIN_COLORS.error
                    : ADMIN_COLORS.success,
                  border: `1px solid ${
                    highlightError ? ADMIN_COLORS.error : ADMIN_COLORS.success
                  }40`,
                }}
              >
                {highlightError || highlightSuccess}
              </div>
            )}
            {loadingHighlight ? (
              <div
                className="rounded-lg border px-3 py-6 text-center text-sm"
                style={{
                  borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                  backgroundColor: ADMIN_COLORS.background,
                  color: ADMIN_COLORS.textMuted,
                }}
              >
                Loading highlight...
              </div>
            ) : (
              <form className="space-y-3" onSubmit={handleHighlightSubmit}>
                <div>
                  <label
                    className="text-xs font-semibold"
                    style={{ color: ADMIN_COLORS.text }}
                  >
                    Value
                  </label>
                  <input
                    name="value"
                    value={highlightForm.value}
                    onChange={handleHighlightChange}
                    className={inputClasses}
                    style={{
                      borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                      backgroundColor: ADMIN_COLORS.background,
                    }}
                    placeholder="8ATM"
                    required
                  />
                </div>
                <div>
                  <label
                    className="text-xs font-semibold"
                    style={{ color: ADMIN_COLORS.text }}
                  >
                    Title
                  </label>
                  <input
                    name="title"
                    value={highlightForm.title}
                    onChange={handleHighlightChange}
                    className={inputClasses}
                    style={{
                      borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                      backgroundColor: ADMIN_COLORS.background,
                    }}
                    placeholder="Water Resistant"
                    required
                  />
                </div>
                <div>
                  <label
                    className="text-xs font-semibold"
                    style={{ color: ADMIN_COLORS.text }}
                  >
                    Subtitle
                  </label>
                  <textarea
                    name="subtitle"
                    value={highlightForm.subtitle}
                    onChange={handleHighlightChange}
                    className={`${inputClasses} min-h-[72px]`}
                    style={{
                      borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                      backgroundColor: ADMIN_COLORS.background,
                    }}
                    placeholder="Up to 80 meters"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label
                      className="text-xs font-semibold"
                      style={{ color: ADMIN_COLORS.text }}
                    >
                      Accent Hex
                    </label>
                    <input
                      name="accentHex"
                      value={highlightForm.accentHex}
                      onChange={handleHighlightChange}
                      className={inputClasses}
                      style={{
                        borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                        backgroundColor: ADMIN_COLORS.background,
                      }}
                      placeholder="#F97316"
                    />
                  </div>
                  <div>
                    <label
                      className="text-xs font-semibold"
                      style={{ color: ADMIN_COLORS.text }}
                    >
                      Background Classes
                    </label>
                    <input
                      name="background"
                      value={highlightForm.background}
                      onChange={handleHighlightChange}
                      className={inputClasses}
                      style={{
                        borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                        backgroundColor: ADMIN_COLORS.background,
                      }}
                      placeholder="bg-gradient-to-r ..."
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg px-4 py-2 text-sm font-semibold"
                  style={{
                    backgroundColor: ADMIN_COLORS.primary,
                    color: ADMIN_COLORS.background,
                  }}
                  disabled={highlightSubmitting}
                >
                  {highlightSubmitting ? "Saving..." : "Save Highlight"}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="space-y-4 xl:col-span-2">
          <div
            className="rounded-xl border p-4 shadow-sm"
            style={{
              borderColor: `${ADMIN_COLORS.surfaceLight}80`,
              backgroundColor: ADMIN_COLORS.surface,
            }}
          >
            {(cardError || cardSuccess) && (
              <div
                className="mb-3 rounded-lg px-3 py-2 text-sm"
                style={{
                  backgroundColor: cardError
                    ? `${ADMIN_COLORS.error}10`
                    : `${ADMIN_COLORS.success}10`,
                  color: cardError ? ADMIN_COLORS.error : ADMIN_COLORS.success,
                  border: `1px solid ${
                    cardError ? ADMIN_COLORS.error : ADMIN_COLORS.success
                  }40`,
                }}
              >
                {cardError || cardSuccess}
              </div>
            )}
            <form className="grid gap-4" onSubmit={handleCardSubmit}>
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
                    value={cardForm.title}
                    onChange={handleCardChange}
                    className={inputClasses}
                    style={{
                      borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                      backgroundColor: ADMIN_COLORS.background,
                    }}
                    placeholder="MAK Classic"
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
                    value={cardForm.subtitle}
                    onChange={handleCardChange}
                    className={inputClasses}
                    style={{
                      borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                      backgroundColor: ADMIN_COLORS.background,
                    }}
                    placeholder="Elegantly engineered"
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
                    value={cardForm.image}
                    onChange={handleCardChange}
                    className={inputClasses}
                    style={{
                      borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                      backgroundColor: ADMIN_COLORS.background,
                    }}
                    placeholder="https://..."
                    required
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleCardUpload(event, "image")}
                    className="block w-full text-sm"
                    disabled={uploadingMainImage}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium"
                    style={{ color: ADMIN_COLORS.text }}
                  >
                    Background Image URL
                  </label>
                  <input
                    name="backgroundImage"
                    value={cardForm.backgroundImage}
                    onChange={handleCardChange}
                    className={inputClasses}
                    style={{
                      borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                      backgroundColor: ADMIN_COLORS.background,
                    }}
                    placeholder="Optional"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      handleCardUpload(event, "backgroundImage")
                    }
                    className="block w-full text-sm"
                    disabled={uploadingBackgroundImage}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    className="text-sm font-medium"
                    style={{ color: ADMIN_COLORS.text }}
                  >
                    Rating
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    max={5}
                    name="rating"
                    value={cardForm.rating}
                    onChange={handleCardChange}
                    className={inputClasses}
                    style={{
                      borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                      backgroundColor: ADMIN_COLORS.background,
                    }}
                    placeholder="4.9"
                  />
                </div>
                <div>
                  <label
                    className="text-sm font-medium"
                    style={{ color: ADMIN_COLORS.text }}
                  >
                    Review Count
                  </label>
                  <input
                    type="number"
                    min={0}
                    name="reviewCount"
                    value={cardForm.reviewCount}
                    onChange={handleCardChange}
                    className={inputClasses}
                    style={{
                      borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                      backgroundColor: ADMIN_COLORS.background,
                    }}
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label
                    className="text-sm font-medium"
                    style={{ color: ADMIN_COLORS.text }}
                  >
                    Badge
                  </label>
                  <input
                    name="badge"
                    value={cardForm.badge}
                    onChange={handleCardChange}
                    className={inputClasses}
                    style={{
                      borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                      backgroundColor: ADMIN_COLORS.background,
                    }}
                    placeholder="Editor's Pick"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="text-sm font-medium"
                    style={{ color: ADMIN_COLORS.text }}
                  >
                    Color Theme
                  </label>
                  <select
                    name="color"
                    value={cardForm.color}
                    onChange={handleCardChange}
                    className={inputClasses}
                    style={{
                      borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                      backgroundColor: ADMIN_COLORS.background,
                    }}
                  >
                    {colorOptions.map((option) => (
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
                    value={cardForm.position}
                    onChange={handleCardChange}
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
                  onClick={resetCardForm}
                  disabled={
                    cardSubmitting ||
                    uploadingMainImage ||
                    uploadingBackgroundImage
                  }
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
                  disabled={
                    cardSubmitting ||
                    uploadingMainImage ||
                    uploadingBackgroundImage
                  }
                >
                  {cardSubmitting
                    ? "Saving..."
                    : editingCardId
                    ? "Update Card"
                    : "Add Card"}
                </button>
              </div>
            </form>
          </div>

          <div className="grid gap-4">
            {loadingCards ? (
              <div
                className="rounded-xl border p-6 text-center text-sm"
                style={{
                  borderColor: `${ADMIN_COLORS.surfaceLight}80`,
                  backgroundColor: ADMIN_COLORS.surface,
                  color: ADMIN_COLORS.textMuted,
                }}
              >
                Loading tech cards...
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
                No tech showcase cards configured yet.
              </div>
            ) : (
              cards
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
                      <div className="space-y-1">
                        <span
                          className="inline-flex rounded-full px-2 py-1 text-xs"
                          style={{
                            backgroundColor: `${ADMIN_COLORS.primary}15`,
                            color: ADMIN_COLORS.primary,
                          }}
                        >
                          Position {card.position ?? 0} · Theme{" "}
                          {card.color || "default"}
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
                        {card.badge && (
                          <p
                            className="text-xs"
                            style={{ color: ADMIN_COLORS.textMuted }}
                          >
                            Badge: {card.badge}
                          </p>
                        )}
                        {(card.rating || card.reviewCount) && (
                          <p
                            className="text-xs"
                            style={{ color: ADMIN_COLORS.textMuted }}
                          >
                            Rating: {card.rating ?? "—"} · Reviews:{" "}
                            {card.reviewCount ?? "—"}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-lg px-4 py-2 text-sm font-semibold"
                          style={{
                            backgroundColor: `${ADMIN_COLORS.primary}15`,
                            color: ADMIN_COLORS.primary,
                          }}
                          onClick={() => handleCardEdit(card)}
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
                          onClick={() => handleCardDelete(card.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

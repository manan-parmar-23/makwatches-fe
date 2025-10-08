"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  uploadImages,
  fetchAdminGallery,
  createAdminGalleryImage,
  updateAdminGalleryImage,
  deleteAdminGalleryImage,
  type ApiResponse,
} from "@/utils/api";
import type { GalleryImage } from "@/types/home-content";
import { ADMIN_COLORS } from "./constants";

export default function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchAdminGallery();
      const payload: ApiResponse<GalleryImage[] | null | undefined> = res.data;
      setImages(Array.isArray(payload.data) ? payload.data : []);
    } catch (e: unknown) {
      let msg = "Failed to load gallery";
      if (typeof e === "string") msg = e;
      else if (e && typeof e === "object") {
        const ex = e as Record<string, unknown>;
        const res = ex["response"] as Record<string, unknown> | undefined;
        const data = res?.["data"] as Record<string, unknown> | undefined;
        const m = (data?.["message"] || ex["message"]) as string | undefined;
        if (m) msg = m;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;
    setLoading(true);
    setError("");
    try {
      const res = await uploadImages(files);
      const urls = res.data.data.urls;
      // Create gallery entries for each URL
      for (const url of urls) {
        await createAdminGalleryImage({ url, alt: "", position: 0 });
      }
      await load();
    } catch (e: unknown) {
      let msg = "Upload failed";
      if (typeof e === "string") msg = e;
      else if (e && typeof e === "object") {
        const ex = e as Record<string, unknown>;
        const res = ex["response"] as Record<string, unknown> | undefined;
        const data = res?.["data"] as Record<string, unknown> | undefined;
        const m = (data?.["message"] || ex["message"]) as string | undefined;
        if (m) msg = m;
      }
      setError(msg);
    } finally {
      setLoading(false);
      if (e.target) e.target.value = "";
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this image?")) return;
    setLoading(true);
    try {
      await deleteAdminGalleryImage(id);
      await load();
    } catch (e: unknown) {
      let msg = "Delete failed";
      if (typeof e === "string") msg = e;
      else if (e && typeof e === "object") {
        const ex = e as Record<string, unknown>;
        const res = ex["response"] as Record<string, unknown> | undefined;
        const data = res?.["data"] as Record<string, unknown> | undefined;
        const m = (data?.["message"] || ex["message"]) as string | undefined;
        if (m) msg = m;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const onSave = async (img: GalleryImage) => {
    setLoading(true);
    try {
      await updateAdminGalleryImage(img.id, {
        alt: img.alt,
        position: img.position,
      });
      await load();
    } catch (e: unknown) {
      let msg = "Update failed";
      if (typeof e === "string") msg = e;
      else if (e && typeof e === "object") {
        const ex = e as Record<string, unknown>;
        const res = ex["response"] as Record<string, unknown> | undefined;
        const data = res?.["data"] as Record<string, unknown> | undefined;
        const m = (data?.["message"] || ex["message"]) as string | undefined;
        if (m) msg = m;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const sorted = useMemo(() => {
    const list = Array.isArray(images) ? images : [];
    return [...list].sort((a, b) => (a.position || 0) - (b.position || 0));
  }, [images]);

  return (
    <section
      className="space-y-4 p-4 rounded-lg"
      style={{ backgroundColor: ADMIN_COLORS.surface }}
    >
      <header className="flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-semibold"
            style={{ color: ADMIN_COLORS.text }}
          >
            Homepage Gallery
          </h2>
          <p className="text-sm" style={{ color: ADMIN_COLORS.textMuted }}>
            Upload images and manage their order and alt text.
          </p>
        </div>
        <label
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium"
          style={{ background: ADMIN_COLORS.primary, color: "white" }}
        >
          Upload Images
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onUpload}
          />
        </label>
      </header>

      {error && (
        <div
          className="text-sm rounded-md p-2"
          style={{
            color: "#721c24",
            background: "#f8d7da",
            border: "1px solid #f5c6cb",
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div className="text-sm" style={{ color: ADMIN_COLORS.textMuted }}>
          Processing...
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((img) => (
          <div key={img.id} className="rounded-md border p-3 space-y-2">
            <div className="relative w-full h-48 overflow-hidden rounded">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt || "Gallery"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={img.alt || ""}
                onChange={(e) =>
                  setImages((prev) =>
                    prev.map((g) =>
                      g.id === img.id ? { ...g, alt: e.target.value } : g
                    )
                  )
                }
                placeholder="Alt text"
                className="w-full border rounded px-2 py-1 text-sm"
              />
              <div className="flex items-center gap-2">
                <label
                  className="text-sm"
                  style={{ color: ADMIN_COLORS.textMuted }}
                >
                  Position
                </label>
                <input
                  type="number"
                  value={img.position}
                  onChange={(e) =>
                    setImages((prev) =>
                      prev.map((g) =>
                        g.id === img.id
                          ? { ...g, position: Number(e.target.value) }
                          : g
                      )
                    )
                  }
                  className="w-20 border rounded px-2 py-1 text-sm"
                />
                <button
                  onClick={() => onSave(img)}
                  className="ml-auto px-3 py-1 rounded text-sm"
                  style={{
                    background: ADMIN_COLORS.primaryLight,
                    color: ADMIN_COLORS.secondary,
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => onDelete(img.id)}
                  className="px-3 py-1 rounded text-sm"
                  style={{ background: "#fee2e2", color: "#991b1b" }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {!sorted.length && !loading && (
          <div
            className="col-span-full text-sm"
            style={{ color: ADMIN_COLORS.textMuted }}
          >
            No images yet. Use &quot;Upload Images&quot; to add some.
          </div>
        )}
      </div>
    </section>
  );
}

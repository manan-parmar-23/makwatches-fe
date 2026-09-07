/**
 * The admin side of the storefront document.
 *
 * The storefront config is what decides which sections the homepage shows,
 * what the menus contain and which slice of the catalogue each product rail
 * pulls. Until now it could only be edited with a direct PUT; this is the
 * client behind the editor that fixes that.
 *
 * Reads go through the *admin* endpoint rather than the public one, because
 * the public payload has already had disabled entries filtered out of it --
 * editing that would silently delete every switched-off item the moment it was
 * saved back.
 */

import { apiClient } from "./client";
import { normalizeStorefront, type StorefrontContent } from "./storefront";

/** A tile whose category reference no longer resolves against the live tree. */
export interface TileWarning {
  tileId: string;
  message: string;
}

export interface AdminStorefront {
  content: StorefrontContent;
  warnings: TileWarning[];
}

/**
 * Read the storefront document as stored, with any unresolved tiles reported.
 *
 * Deliberately does not run `normalizeStorefront`: that filters disabled items
 * for display, which is exactly what an editor must not do.
 */
export async function getAdminStorefront(): Promise<AdminStorefront> {
  const response = await apiClient().request<{
    success: boolean;
    message?: string;
    data: StorefrontContent;
    warnings?: TileWarning[];
  }>({ method: "GET", url: "/admin/storefront" });

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Could not load the storefront.");
  }

  return {
    content: response.data.data,
    warnings: response.data.warnings ?? [],
  };
}

/** Save the whole document. The API replaces the sections it recognises. */
export async function updateAdminStorefront(
  content: StorefrontContent
): Promise<AdminStorefront> {
  const response = await apiClient().request<{
    success: boolean;
    message?: string;
    data: StorefrontContent;
    warnings?: TileWarning[];
  }>({ method: "PUT", url: "/admin/storefront", data: content });

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Could not save the storefront.");
  }

  return {
    content: response.data.data,
    warnings: response.data.warnings ?? [],
  };
}

/** Restore the shipped defaults. Destructive: it discards the stored document. */
export async function resetAdminStorefront(): Promise<AdminStorefront> {
  const response = await apiClient().request<{
    success: boolean;
    message?: string;
    data: StorefrontContent;
    warnings?: TileWarning[];
  }>({ method: "POST", url: "/admin/storefront/reset" });

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Could not reset the storefront.");
  }

  return {
    content: response.data.data,
    warnings: response.data.warnings ?? [],
  };
}

/**
 * What the public storefront would show for this document.
 *
 * Used by the editor's preview so an admin can see the effect of switching an
 * item off without saving and loading the live site.
 */
export function previewPublic(content: StorefrontContent): StorefrontContent {
  return normalizeStorefront(content);
}

/** Move an item within a list, returning a new list. */
export function reorder<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length || from === to) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/**
 * Renumber a list's `order` fields to match its position.
 *
 * The API sorts by `order`, so the array's own sequence is not authoritative
 * until this has run. Called on every move rather than on save, so what the
 * editor shows and what the storefront will render never diverge.
 */
export function renumber<T extends { order: number }>(items: T[]): T[] {
  return items.map((item, index) => ({ ...item, order: index + 1 }));
}

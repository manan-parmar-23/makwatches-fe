/** Category reads for the storefront. */

import { http } from "./client";
import type { Category, Subcategory } from "./types";

/** Top-level categories with their subcategories. */
export function listCategories(): Promise<Category[]> {
  return http.get<Category[]>("/categories");
}

/** Subcategories of one named category. */
export function listSubcategories(name: string): Promise<Subcategory[]> {
  return http.get<Subcategory[]>(
    `/categories/${encodeURIComponent(name)}/subcategories`
  );
}

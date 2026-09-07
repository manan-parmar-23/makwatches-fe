/**
 * Catalog reads.
 *
 * These target the versioned /api/v1 surface introduced in Phase 1. The legacy
 * flat routes are still live on the backend, so the existing storefront keeps
 * working while new code migrates here.
 */

import { http, requestWithMeta, toQueryString } from "./client";
import type {
  CatalogFilters,
  CatalogQuery,
  PaginationMeta,
  Product,
} from "./types";

const BASE = "/api/v1/catalog";

export interface ProductPage {
  items: Product[];
  meta?: PaginationMeta;
}

/** List products with filtering, sorting and pagination. */
export async function listProducts(
  query: CatalogQuery = {}
): Promise<ProductPage> {
  const { data, meta } = await requestWithMeta<Product[]>({
    method: "GET",
    url: `${BASE}/products${toQueryString(query as Record<string, unknown>)}`,
  });
  return { items: data ?? [], meta };
}

/** Fetch one product by its database id. */
export function getProductById(id: string): Promise<Product> {
  return http.get<Product>(`${BASE}/products/${encodeURIComponent(id)}`);
}

/**
 * Fetch one product by slug.
 *
 * Slugs exist only on records that have been through the additive backfill
 * (makwatches-be/cmd/backfill-slugs), so callers should be prepared for a 404
 * and fall back to the id route.
 */
export function getProductBySlug(slug: string): Promise<Product> {
  return http.get<Product>(`${BASE}/products/slug/${encodeURIComponent(slug)}`);
}

/** Fetch the dynamic filter facets available for the current catalog scope. */
export function getFilters(
  scope: Pick<CatalogQuery, "category" | "mainCategory" | "subcategory"> = {}
): Promise<CatalogFilters> {
  return http.get<CatalogFilters>(
    `${BASE}/filters${toQueryString(scope as Record<string, unknown>)}`
  );
}

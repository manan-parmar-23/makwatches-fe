/**
 * Product reads, expressed as the intents the storefront actually has.
 *
 * Thin wrappers over the catalog listing rather than separate endpoints, so
 * filter semantics stay defined in exactly one place.
 */

import { listProducts, type ProductPage } from "./catalog";
import type { CatalogQuery, Product } from "./types";

export type { ProductPage };

/** Products flagged for the homepage feature slot. */
export function getFeaturedProducts(limit = 8): Promise<ProductPage> {
  return listProducts({ featured: true, limit });
}

/** Newest arrivals, most recent first. */
export function getNewArrivals(limit = 8): Promise<ProductPage> {
  return listProducts({ newArrival: true, limit, sortBy: "createdAt", order: "desc" });
}

/** Bestsellers. */
export function getBestsellers(limit = 8): Promise<ProductPage> {
  return listProducts({ bestseller: true, limit });
}

/** Products in one collection. */
export function getProductsByCollection(
  collection: string,
  query: CatalogQuery = {}
): Promise<ProductPage> {
  return listProducts({ ...query, collection });
}

/** Products in one category path (e.g. "Men/Chronograph"). */
export function getProductsByCategory(
  category: string,
  query: CatalogQuery = {}
): Promise<ProductPage> {
  return listProducts({ ...query, category });
}

/** Products scoped to a gender facet. */
export function getProductsByGender(
  gender: string,
  query: CatalogQuery = {}
): Promise<ProductPage> {
  return listProducts({ ...query, gender });
}

/**
 * Products related to another product.
 *
 * Approximated from the same collection, then the same category, excluding the
 * product itself. There is no dedicated relatedness endpoint yet; when one
 * exists only this function changes.
 */
export async function getRelatedProducts(
  product: Product,
  limit = 4
): Promise<Product[]> {
  const scope: CatalogQuery = product.collection
    ? { collection: product.collection }
    : { category: product.category };

  const { items } = await listProducts({ ...scope, limit: limit + 1 });
  return items.filter((p) => p.id !== product.id).slice(0, limit);
}

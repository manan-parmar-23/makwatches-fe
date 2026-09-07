/** Collection reads. */

import { http } from "./client";
import type { Collection } from "./types";

/** All collections present in the catalog, with product counts. */
export function listCollections(): Promise<Collection[]> {
  return http.get<Collection[]>("/api/v1/collections");
}

/**
 * Look up one collection by slug.
 *
 * Collections are currently derived from product records rather than stored in
 * their own table, so there is no per-collection endpoint to call; the list is
 * small and filtered client-side. Returns null when the slug is unknown.
 */
export async function getCollectionBySlug(
  slug: string
): Promise<Collection | null> {
  const collections = await listCollections();
  return collections.find((c) => c.slug === slug) ?? null;
}

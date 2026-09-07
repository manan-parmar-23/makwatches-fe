/** Storefront search. */

import { http, toQueryString } from "./client";
import type { SearchResult } from "./types";

/**
 * Search products, collections and categories in one call.
 *
 * An empty query resolves to an empty result rather than making a request, so
 * a search overlay can call this on every keystroke without a wasted round trip
 * on the initial empty state.
 */
export async function search(
  query: string,
  limit = 12
): Promise<SearchResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { query: "", products: [], collections: [], categories: [], total: 0 };
  }

  return http.get<SearchResult>(
    `/api/v1/search${toQueryString({ q: trimmed, limit })}`
  );
}

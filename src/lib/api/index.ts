/**
 * The canonical MAK Watches API surface.
 *
 * Import from `@/lib/api` and nothing else. This replaces the previous four
 * parallel clients (src/lib/api.ts, src/services/api.ts, src/utils/api.ts,
 * src/lib/Account-api.ts), each of which resolved its own base URL and carried
 * a hardcoded production fallback.
 */

export { ApiError, apiClient, http, request, requestWithMeta, toQueryString } from "./client";
export * from "./types";

export * as catalog from "./catalog";
export * as products from "./products";
export * as collections from "./collections";
export * as categories from "./categories";
export * as search from "./search";
export * as cart from "./cart";
export * as wishlist from "./wishlist";
export * as orders from "./orders";
export * as account from "./account";

import { apiClient } from "./client";

/**
 * The shared axios instance, as a default export.
 *
 * This is the compatibility surface for existing code that does
 * `import api from "@/lib/api"` -- the admin dashboard pages, AuthContext and
 * src/utils/api.ts. Those call sites are unchanged and keep working, but they
 * now share this module's single instance and its single base-URL resolution
 * instead of the separate client that used to live in src/lib/api.ts.
 *
 * New code should import the typed resource modules above rather than this.
 */
const api = new Proxy({} as ReturnType<typeof apiClient>, {
  // Resolved on first property access rather than at import time, so a missing
  // NEXT_PUBLIC_API_BASE_URL surfaces on the request that needed it instead of
  // crashing every page that imports this module.
  //
  // `receiver` is intentionally not forwarded: axios binds its instance methods
  // to their own context at construction, so they must not be rebound to the
  // proxy.
  get(_target, prop) {
    return Reflect.get(apiClient(), prop);
  },
});

export default api;

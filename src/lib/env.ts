/**
 * Canonical environment access for the MAK Watches frontend.
 *
 * There is exactly one API base URL variable: NEXT_PUBLIC_API_BASE_URL.
 *
 * The codebase previously read three interchangeable names
 * (NEXT_PUBLIC_API_BASE_URL / NEXT_PUBLIC_API_BASE / NEXT_PUBLIC_API_URL), each
 * with a hardcoded `|| "https://api.makwatches.in"` fallback. That meant a
 * missing or misspelled variable silently pointed local development at the
 * production API instead of failing. Both the aliases and the fallbacks are
 * gone: a missing variable now throws.
 *
 * Next.js inlines `process.env.NEXT_PUBLIC_*` at build time, so the property
 * must be read as a literal member expression -- never `process.env[name]`.
 */

/** Thrown when a required public environment variable is absent. */
export class MissingEnvError extends Error {
  constructor(name: string, hint: string) {
    super(
      `Missing required environment variable ${name}.\n\n${hint}\n\n` +
        `Set it in .env.local for development, or in your hosting provider's ` +
        `environment configuration. It is deliberately not defaulted: ` +
        `guessing an API origin silently sends local traffic to production.`
    );
    this.name = "MissingEnvError";
  }
}

const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/** Strip trailing slashes so callers can always join with a leading-slash path. */
function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

/**
 * The Go API origin, e.g. `http://127.0.0.1:8080` locally.
 *
 * Throws MissingEnvError when unset. Call it at the point of use rather than
 * caching the result at module scope, so a configuration problem surfaces as a
 * clear error in the request that needed it rather than as an import-time crash
 * that takes down unrelated pages.
 */
export function getApiBaseUrl(): string {
  if (!RAW_API_BASE_URL || RAW_API_BASE_URL.trim().length === 0) {
    throw new MissingEnvError(
      "NEXT_PUBLIC_API_BASE_URL",
      "This is the origin of the Go API (for example http://127.0.0.1:8080 " +
        "for local development, matching PORT in makwatches-be/.env)."
    );
  }
  return normalizeOrigin(RAW_API_BASE_URL);
}

/**
 * Non-throwing variant, for code paths that must degrade rather than fail
 * (for example a render that should show an error state instead of crashing).
 */
export function tryGetApiBaseUrl(): string | null {
  try {
    return getApiBaseUrl();
  } catch {
    return null;
  }
}

/** Whether the API origin is configured at all. */
export function isApiConfigured(): boolean {
  return tryGetApiBaseUrl() !== null;
}

/**
 * Build an absolute API URL from a path.
 *
 * @example apiUrl("/api/v1/catalog/products") -> "http://127.0.0.1:8080/api/v1/catalog/products"
 */
export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}

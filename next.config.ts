import type { NextConfig } from "next";

/**
 * The Firebase Storage bucket product media is served from.
 *
 * Read from the environment so the allow-list and the client-side media
 * resolver (src/lib/media) can never disagree about which bucket is in use.
 * Falls back to the project's bucket so a checkout without a .env.local still
 * builds; unlike the API origin, guessing wrong here degrades to a placeholder
 * image rather than sending traffic somewhere unintended.
 */
const STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  "mak-watches.firebasestorage.app";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,

  images: {
    remotePatterns: [
      // Product/catalog images live in Firebase Storage. Objects are written by
      // the Go backend to the bucket root and served publicly from the GCS
      // hostname, which is what the API returns.
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: `/${STORAGE_BUCKET}/**`,
      },
      // Firebase download-URL form (v0 endpoint), for objects addressed through
      // the Firebase SDK rather than the raw GCS path.
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: `/v0/b/${STORAGE_BUCKET}/**`,
      },
      // Static artwork referenced by the legacy storefront. These are retained
      // only for routes not yet rebuilt and should go with them.
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.picsum.photos" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  /**
   * Legacy route redirects.
   *
   * Deliberately empty. The replacement routes do not exist yet, and a
   * permanent redirect to a 404 is worse than the working legacy page: it is
   * cached by browsers and search engines and is painful to undo.
   *
   * Activate each entry below only once its target route ships, one at a time:
   *
   *   Phase 4 — /product/[slug] exists:
   *     { source: "/product_details", destination: "/shop", permanent: false }
   *     (a query-param id cannot be mapped to a slug in a static rule; the
   *      rebuilt /product_details page should look the product up and issue a
   *      307 to its slug, then this becomes a permanent rule)
   *
   *   Phase 3 — /category/[slug] exists:
   *     { source: "/men/category/:id", destination: "/category/:id", permanent: true }
   *     { source: "/women/category/:id", destination: "/category/:id", permanent: true }
   *
   * Until then, every legacy route keeps serving its existing page.
   */
  async redirects() {
    return [];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { Crumb } from "@/design-system";
import type { Product } from "@/lib/api/types";
import { resolveProductImages } from "@/lib/media";
import type { ReviewSummary } from "@/lib/api/server";

/**
 * Product and BreadcrumbList structured data.
 *
 * Built from the same product record and the same crumb array the page
 * renders, so the markup and the visible page can never disagree.
 *
 * Only fields the product genuinely carries are emitted. A missing brand, SKU,
 * image or rating is omitted rather than guessed: structured data that asserts
 * something untrue is worse than structured data that says less. In particular
 * `aggregateRating` is emitted only when a real review exists, since fabricating
 * one is both a lie to shoppers and a search-engine policy violation.
 */

export interface ProductJsonLdProps {
  product: Product;
  crumbs: Crumb[];
  reviews: ReviewSummary;
  /** Absolute site origin, when known, so URLs in the markup are absolute. */
  origin?: string;
}

export function ProductJsonLd({
  product,
  crumbs,
  reviews,
  origin = "https://makwatches.in",
}: ProductJsonLdProps) {
  const images = resolveProductImages(product)
    .map((media) => media.url)
    // Only real, absolute media belongs in structured data; the local
    // placeholder is not a photograph of the product.
    .filter((url) => url.startsWith("http"));

  const path = product.slug
    ? `/product/${product.slug}`
    : `/product/id/${product.id}`;

  const productLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url: `${origin}${path}`,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${origin}${path}`,
    },
  };

  if (product.description) productLd.description = product.description;
  if (images.length > 0) productLd.image = images;
  if (product.brand) {
    productLd.brand = { "@type": "Brand", name: product.brand };
  }
  if (product.sku) productLd.sku = product.sku;
  if (product.category) productLd.category = product.category;

  if (reviews.average !== null && reviews.total > 0) {
    productLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(reviews.average.toFixed(1)),
      reviewCount: reviews.total,
    };
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      ...(crumb.href ? { item: `${origin}${crumb.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // The payload is built from typed server data, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    </>
  );
}

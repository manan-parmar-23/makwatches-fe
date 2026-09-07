import type { CatalogFilters, Product, SearchResult } from "@/lib/api/types";

/**
 * Sample data for the component gallery.
 *
 * IMPORTANT: this file exists solely to render the gallery at /design-system.
 * It is never imported by the storefront and must never be.
 *
 * Everything here is explicitly labelled as a sample. Names are neutral
 * placeholders ("Sample Piece 01"), not invented product names, and no
 * specification is populated with a plausible-looking value -- doing so is
 * exactly the fabrication the reconstruction brief forbids. The `specs` field
 * is left empty on purpose so the gallery demonstrates the real behaviour:
 * components omit specifications they do not have.
 */

/** A neutral sample product. */
function sampleProduct(index: number, overrides: Partial<Product> = {}): Product {
  return {
    id: `sample-${index}`,
    name: `Sample Piece ${String(index).padStart(2, "0")}`,
    description:
      "Placeholder description. Real product copy is supplied from the catalog.",
    shortDescription: "Placeholder copy — not real product description.",
    price: 4999 * index,
    category: "Sample",
    stock: 12,
    // No image reference: the gallery deliberately exercises the branded
    // placeholder rather than dressing samples up with unrelated photography.
    media: [],
    images: [],
    ...overrides,
  };
}

export const SAMPLE_PRODUCTS: Product[] = [
  sampleProduct(1, { collection: "Sample collection" }),
  sampleProduct(2, { collection: "Sample collection", compareAtPrice: 12999 }),
  sampleProduct(3, { collection: "Sample collection", stock: 3 }),
  sampleProduct(4, { collection: "Sample collection", stock: 0 }),
];

export const SAMPLE_PRODUCT = SAMPLE_PRODUCTS[0];

export const SAMPLE_FILTERS: CatalogFilters = {
  priceRange: { min: 4999, max: 49999 },
  brands: [
    { value: "Sample brand A", count: 4 },
    { value: "Sample brand B", count: 2 },
  ],
  genders: [
    { value: "Men", count: 3 },
    { value: "Women", count: 3 },
  ],
  styles: [
    { value: "Sample style", count: 2 },
  ],
};

export const SAMPLE_SEARCH_RESULT: SearchResult = {
  query: "sample",
  products: SAMPLE_PRODUCTS.slice(0, 3),
  collections: [{ slug: "sample-collection", name: "Sample collection", count: 4 }],
  categories: ["Sample"],
  total: 3,
};

export const SAMPLE_EMPTY_SEARCH: SearchResult = {
  query: "no-such-thing",
  products: [],
  collections: [],
  categories: [],
  total: 0,
};

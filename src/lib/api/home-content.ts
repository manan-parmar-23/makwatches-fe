/**
 * Home content — the admin-managed CMS behind the homepage.
 *
 * These mirror makwatches-be/internal/models/home_content.go. The homepage
 * reads its editorial copy and imagery from here rather than hardcoding it,
 * so real MAK copy can be entered through the existing admin panel instead of
 * living in a component.
 *
 * Every field is treated as optional on this side regardless of what the Go
 * struct declares: records were written by an older admin form and many carry
 * empty strings. A section renders only the fields that actually have content.
 */

import type { Product } from "./types";

/** A hero slide. `image` and `title` are the only fields worth rendering alone. */
export interface HeroSlide {
  id: string;
  title?: string;
  subtitle?: string;
  /** Display price string as entered by the admin, e.g. "₹4,999". */
  price?: string;
  description?: string;
  image?: string;
  features?: string[];
  position?: number;
  productId?: string;
  product?: Product | null;
  brand?: string;
  productPrice?: number;
  category?: string;
  mainCategory?: string;
  subcategory?: string;
  images?: string[];
  stock?: number;
}

export interface HomeCategoryCard {
  id: string;
  title?: string;
  subtitle?: string;
  href?: string;
  image?: string;
  position?: number;
}

export interface HomeCollectionFeature {
  id: string;
  tagline?: string;
  title?: string;
  description?: string;
  price?: string;
  availability?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image?: string;
  imageAlt?: string;
  layout?: string;
  position?: number;
  productId?: string;
  product?: Product | null;
}

export interface TechShowcaseCard {
  id: string;
  title?: string;
  subtitle?: string;
  image?: string;
  backgroundImage?: string;
  badge?: string;
  position?: number;
}

export interface TechShowcaseHighlight {
  id: string;
  value?: string;
  title?: string;
  subtitle?: string;
}

export interface GalleryImage {
  id: string;
  url?: string;
  alt?: string;
  position?: number;
}

export interface HomeContent {
  heroSlides: HeroSlide[];
  categories: HomeCategoryCard[];
  collections: HomeCollectionFeature[];
  techCards: TechShowcaseCard[];
  highlight: TechShowcaseHighlight | null;
  gallery: GalleryImage[];
}

/** An empty payload, used when the CMS is unreachable or returns nothing. */
export const EMPTY_HOME_CONTENT: HomeContent = {
  heroSlides: [],
  categories: [],
  collections: [],
  techCards: [],
  highlight: null,
  gallery: [],
};

/**
 * Normalize the API payload.
 *
 * The endpoint returns `null` rather than `[]` for empty sections, so every
 * list is coerced. Entries are sorted by their admin-assigned position.
 */
export function normalizeHomeContent(raw: unknown): HomeContent {
  const data = (raw ?? {}) as Partial<HomeContent>;

  const byPosition = <T extends { position?: number }>(items: T[] | null | undefined): T[] =>
    [...(items ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  return {
    heroSlides: byPosition(data.heroSlides),
    categories: byPosition(data.categories),
    collections: byPosition(data.collections),
    techCards: byPosition(data.techCards),
    highlight: data.highlight ?? null,
    gallery: byPosition(data.gallery),
  };
}

/** Whether a slide carries enough content to render as a hero. */
export function isRenderableHero(slide: HeroSlide | undefined): slide is HeroSlide {
  if (!slide) return false;
  return Boolean(slide.title?.trim() || slide.subtitle?.trim() || slide.image?.trim());
}

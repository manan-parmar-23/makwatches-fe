export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  description: string;
  image: string;
  features: string[];
  gradient: string;
  glowColor: string;
  position: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomeCategoryCard {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  bgGradient: string;
  position: number;
  createdAt?: string;
  updatedAt?: string;
}

export type CollectionLayout = "image-left" | "image-right" | "image-top" | string;

export interface HomeCollectionFeature {
  id: string;
  tagline: string;
  title: string;
  description: string;
  availability: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  imageAlt: string;
  layout: CollectionLayout;
  position: number;
  createdAt?: string;
  updatedAt?: string;
}

export type TechCardColor = "amber" | "blue" | "gray" | "slate" | string;

export interface TechShowcaseCard {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  backgroundImage?: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  color?: TechCardColor;
  position: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TechShowcaseHighlight {
  id?: string;
  value: string;
  title: string;
  subtitle: string;
  accentHex: string;
  background: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomeContentResponse {
  heroSlides: HeroSlide[];
  categories: HomeCategoryCard[];
  collections: HomeCollectionFeature[];
  techCards: TechShowcaseCard[];
  highlight?: TechShowcaseHighlight | null;
}

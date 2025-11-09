export interface Product {
  id: string;
  name: string;
  brand?: string;
  description: string;
  price: number;
  category?: string;
  mainCategory?: string;
  subcategory?: string;
  imageUrl?: string;
  images: string[];
  stock: number;
  gender?: string;
  dialColor?: string;
  dialShape?: string;
  dialType?: string;
  strapColor?: string;
  strapMaterial?: string;
  style?: string;
  dialThickness?: string;
  discountPercentage?: number | null;
  discountAmount?: number | null;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  price?: string; // Deprecated - use product.price instead
  description: string;
  image: string;
  features: string[];
  gradient: string;
  glowColor: string;
  position: number;
  productId?: string; // Reference to actual product
  product?: Product; // Populated product details
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
  productId?: string; // Reference to actual product
  product?: Product; // Populated product details
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
  gallery?: GalleryImage[];
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  position: number;
  createdAt?: string;
  updatedAt?: string;
}

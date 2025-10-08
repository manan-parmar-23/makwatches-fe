import api from '@/lib/api';
import {
  HeroSlide,
  HomeCategoryCard,
  HomeCollectionFeature,
  HomeContentResponse,
  TechShowcaseCard,
  TechShowcaseHighlight,
  type GalleryImage,
} from '@/types/home-content';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Category {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  mainCategory?: 'Men' | 'Women';
  subcategory?: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  images: string[];
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const fetchCategories = () => api.get<ApiResponse<Category[]>>('/admin/categories/');
// Public (unauthenticated) category endpoints
export const fetchPublicCategories = (name?: string) =>
  api.get<ApiResponse<Category[]>>('/categories', { params: name ? { name } : undefined });
export const fetchPublicSubcategories = (name: string, strict?: boolean) =>
  api.get<ApiResponse<{ id: string; name: string }[]>>(`/categories/${encodeURIComponent(name)}/subcategories`, { params: strict ? { strict: 1 } : undefined });
export const fetchProducts = () => api.get<ApiResponse<Product[]>>('/products/');
// Public lightweight product listing (catalog)
export interface ProductQueryParams {
  category?: string;
  mainCategory?: string;
  subcategory?: string;
  page?: number | string;
  limit?: number | string;
}
export const fetchPublicProducts = (params?: ProductQueryParams) =>
  api.get<ApiResponse<Partial<Product>[]>>('/catalog/products', { params });
export const fetchPublicProductById = (id: string) =>
  api.get<ApiResponse<Partial<Product>>>(`/catalog/products/${id}`);
// Admin-protected product endpoints (backend mounts auth/role on /products group)
export const createProduct = (payload: Partial<Product>) => api.post<ApiResponse<Product>>('/products/', payload);
export const updateProduct = (id: string, payload: Partial<Product>) => api.put<ApiResponse<Product>>(`/products/${id}`, payload);
export const deleteProduct = (id: string) => api.delete<ApiResponse<null>>(`/products/${id}`);
export const uploadImages = (files: File[]) => {
  const formData = new FormData();
  files.forEach(f => formData.append('images', f));
  return api.post<ApiResponse<{ urls: string[] }>>('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// Home content endpoints
const ADMIN_HOME_BASE = '/admin/home-content';

export const fetchHomeContent = () =>
  api.get<ApiResponse<HomeContentResponse>>('/home-content');

export const fetchAdminHeroSlides = () =>
  api.get<ApiResponse<HeroSlide[]>>(`${ADMIN_HOME_BASE}/hero-slides`);

export const createAdminHeroSlide = (payload: Partial<HeroSlide>) =>
  api.post<ApiResponse<HeroSlide>>(`${ADMIN_HOME_BASE}/hero-slides`, payload);

export const updateAdminHeroSlide = (id: string, payload: Partial<HeroSlide>) =>
  api.put<ApiResponse<HeroSlide>>(`${ADMIN_HOME_BASE}/hero-slides/${id}`, payload);

export const deleteAdminHeroSlide = (id: string) =>
  api.delete<ApiResponse<null>>(`${ADMIN_HOME_BASE}/hero-slides/${id}`);

export const fetchAdminCategoryCards = () =>
  api.get<ApiResponse<HomeCategoryCard[]>>(`${ADMIN_HOME_BASE}/categories`);

export const createAdminCategoryCard = (payload: Partial<HomeCategoryCard>) =>
  api.post<ApiResponse<HomeCategoryCard>>(`${ADMIN_HOME_BASE}/categories`, payload);

export const updateAdminCategoryCard = (id: string, payload: Partial<HomeCategoryCard>) =>
  api.put<ApiResponse<HomeCategoryCard>>(`${ADMIN_HOME_BASE}/categories/${id}`, payload);

export const deleteAdminCategoryCard = (id: string) =>
  api.delete<ApiResponse<null>>(`${ADMIN_HOME_BASE}/categories/${id}`);

export const fetchAdminCollectionFeatures = () =>
  api.get<ApiResponse<HomeCollectionFeature[]>>(`${ADMIN_HOME_BASE}/collections`);

export const createAdminCollectionFeature = (payload: Partial<HomeCollectionFeature>) =>
  api.post<ApiResponse<HomeCollectionFeature>>(`${ADMIN_HOME_BASE}/collections`, payload);

export const updateAdminCollectionFeature = (id: string, payload: Partial<HomeCollectionFeature>) =>
  api.put<ApiResponse<HomeCollectionFeature>>(`${ADMIN_HOME_BASE}/collections/${id}`, payload);

export const deleteAdminCollectionFeature = (id: string) =>
  api.delete<ApiResponse<null>>(`${ADMIN_HOME_BASE}/collections/${id}`);

export const fetchAdminTechCards = () =>
  api.get<ApiResponse<TechShowcaseCard[]>>(`${ADMIN_HOME_BASE}/tech-cards`);

export const createAdminTechCard = (payload: Partial<TechShowcaseCard>) =>
  api.post<ApiResponse<TechShowcaseCard>>(`${ADMIN_HOME_BASE}/tech-cards`, payload);

export const updateAdminTechCard = (id: string, payload: Partial<TechShowcaseCard>) =>
  api.put<ApiResponse<TechShowcaseCard>>(`${ADMIN_HOME_BASE}/tech-cards/${id}`, payload);

export const deleteAdminTechCard = (id: string) =>
  api.delete<ApiResponse<null>>(`${ADMIN_HOME_BASE}/tech-cards/${id}`);

export const fetchAdminTechHighlight = () =>
  api.get<ApiResponse<TechShowcaseHighlight | null>>(`${ADMIN_HOME_BASE}/tech-highlight`);

export const upsertAdminTechHighlight = (payload: Partial<TechShowcaseHighlight>) =>
  api.put<ApiResponse<TechShowcaseHighlight>>(`${ADMIN_HOME_BASE}/tech-highlight`, payload);

export const deleteAdminTechHighlight = () =>
  api.delete<ApiResponse<null>>(`${ADMIN_HOME_BASE}/tech-highlight`);

// Admin gallery endpoints
export const fetchAdminGallery = () =>
  api.get<ApiResponse<GalleryImage[]>>(`${ADMIN_HOME_BASE}/gallery`);

export const createAdminGalleryImage = (payload: Partial<GalleryImage>) =>
  api.post<ApiResponse<GalleryImage>>(`${ADMIN_HOME_BASE}/gallery`, payload);

export const updateAdminGalleryImage = (id: string, payload: Partial<GalleryImage>) =>
  api.put<ApiResponse<GalleryImage>>(`${ADMIN_HOME_BASE}/gallery/${id}`, payload);

export const deleteAdminGalleryImage = (id: string) =>
  api.delete<ApiResponse<null>>(`${ADMIN_HOME_BASE}/gallery/${id}`);

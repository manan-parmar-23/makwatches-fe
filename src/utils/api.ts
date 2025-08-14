import api from '@/lib/api';

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

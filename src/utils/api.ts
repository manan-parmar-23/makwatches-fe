import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminAuthToken') || sessionStorage.getItem('adminAuthToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

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

export const fetchCategories = () => api.get<ApiResponse<Category[]>>('/admin/categories');
export const fetchProducts = () => api.get<ApiResponse<Product[]>>('/products');
// Admin-protected product endpoints (backend mounts auth/role on /products group)
export const createProduct = (payload: Partial<Product>) => api.post<ApiResponse<Product>>('/products', payload);
export const updateProduct = (id: string, payload: Partial<Product>) => api.put<ApiResponse<Product>>(`/products/${id}`, payload);
export const deleteProduct = (id: string) => api.delete<ApiResponse<null>>(`/products/${id}`);
export const uploadImages = (files: File[]) => {
  const formData = new FormData();
  files.forEach(f => formData.append('images', f));
  return api.post<ApiResponse<{ urls: string[] }>>('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

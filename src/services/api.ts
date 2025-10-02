// API service for making requests to the backend
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Support multiple token storage keys used across the app:
    // - auth_token (legacy)
    // - customerToken / adminToken (set by AuthProvider)
    const token =
      localStorage.getItem('auth_token') ||
      localStorage.getItem('customerToken') ||
      localStorage.getItem('adminToken') ||
      Cookies.get('customerToken') ||
      Cookies.get('adminToken');

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Product API
export const productApi = {
  // Get all products with optional filtering
  getProducts: async (params?: {
    category?: string;
    mainCategory?: string;
    subcategory?: string;
    brand?: string[] | string;
    gender?: string;
    dialColor?: string;
    dialShape?: string;
    dialType?: string;
    strapColor?: string;
    strapMaterial?: string;
    style?: string;
    dialThickness?: string;
    inStock?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get a single product by ID
  getProductById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
};

// Cart API
export const cartApi = {
  // Get current user's cart
  getCart: async (userId: string) => {
    const response = await api.get(`/cart/${userId}`);
    return response.data;
  },

  // Add a product to the cart
  addToCart: async (productId: string, quantity: number = 1) => {
    const response = await api.post('/cart', { productId, quantity });
    return response.data;
  },

  // Remove an item from the cart
  removeFromCart: async (userId: string, productId: string) => {
    const response = await api.delete(`/cart/${userId}/${productId}`);
    return response.data;
  },
};

// Wishlist API
export const wishlistApi = {
  // Get current user's wishlist
  getWishlist: async () => {
    const response = await api.get('/account/wishlist');
    return response.data;
  },

  // Add a product to the wishlist
  addToWishlist: async (productId: string) => {
    const response = await api.post('/wishlist', { productId });
    return response.data;
  },

  // Remove a product from the wishlist
  removeFromWishlist: async (itemId: string) => {
    const response = await api.delete(`/account/wishlist/${itemId}`);
    return response.data;
  },
};

// Category API
export const categoryApi = {
  // Get all categories
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
};

export default api;

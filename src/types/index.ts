// Product type definition
export interface Product {
  id: string;
  name: string;
  brand?: string;
  description: string;
  price: number;
  category: string;
  mainCategory?: string;
  subcategory?: string;
  imageUrl: string;
  images: string[];
  stock: number;
  createdAt: string;
  updatedAt: string;
}

// Cart item type
export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

// Cart type
export interface Cart {
  items: CartItem[];
  total: number;
}

// Wishlist item type
export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
  updatedAt: string;
}

// Category type
export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
  createdAt: string;
  updatedAt: string;
}

// Subcategory type
export interface Subcategory {
  id: string;
  name: string;
  imageUrl?: string;
}

// Filter type
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// API response type
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

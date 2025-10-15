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
  // Optional discount fields for storefront display
  discountPercentage?: number | null;
  discountAmount?: number | null;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
  // Optional filter attributes (watches)
  gender?: string | null;
  dialColor?: string | null;
  dialShape?: string | null;
  dialType?: string | null;
  strapColor?: string | null;
  strapMaterial?: string | null;
  style?: string | null;
  dialThickness?: string | null;
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
  brand?: string[];
  gender?: string;
  dialColor?: string;
  dialShape?: string;
  dialType?: string;
  strapColor?: string;
  strapMaterial?: string;
  style?: string;
  dialThickness?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  search?: string;
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

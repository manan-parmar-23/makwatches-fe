// src/lib/women-api.ts
import api from './api';
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
// Types
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
export interface Category {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
}

// Fallback data for when API fails
export const fallbackProducts: Product[] = [
  {
    id: '1',
    name: 'Pink Tie-Dye T-Shirt',
    description: 'Comfortable cotton t-shirt with tie-dye pattern',
    price: 1499,
    category: 'clothing',
    mainCategory: 'Women',
    subcategory: 'tops',
    imageUrl: '/products/women-tshirt-pink.jpg',
    images: ['/products/women-tshirt-pink.jpg'],
    brand: 'makwatches',
    stock: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Beige Classic Tee',
    description: 'Essential everyday t-shirt',
    price: 999,
    category: 'clothing',
    mainCategory: 'Women',
    subcategory: 'tops',
    imageUrl: '/products/women-tshirt-beige.jpg',
    images: ['/products/women-tshirt-beige.jpg'],
    brand: 'makwatches',
    stock: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Blue Graphic Tee',
    description: 'Statement graphic t-shirt',
    price: 1299,
    category: 'clothing',
    mainCategory: 'Women',
    subcategory: 'tops',
    imageUrl: '/products/women-tshirt-blue.jpg',
    images: ['/products/women-tshirt-blue.jpg'],
    brand: 'makwatches',
    stock: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Pink Crop Top',
    description: 'Trendy cropped t-shirt',
    price: 1199,
    category: 'clothing',
    mainCategory: 'Women',
    subcategory: 'tops',
    imageUrl: '/products/women-tshirt-pink-crop.jpg',
    images: ['/products/women-tshirt-pink-crop.jpg'],
    brand: 'makwatches',
    stock: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const fallbackCategories: Category[] = [
  {
    id: '1',
    name: 'Tops',
    subcategories: [
      { id: '1', name: 'T-Shirts' },
      { id: '2', name: 'Blouses' },
      { id: '3', name: 'Crop Tops' }
    ]
  },
  {
    id: '2',
    name: 'Dresses',
    subcategories: [
      { id: '4', name: 'Maxi Dresses' },
      { id: '5', name: 'Midi Dresses' },
      { id: '6', name: 'Mini Dresses' }
    ]
  }
];

export const fetchCategories = () => api.get<ApiResponse<Category[]>>('/admin/categories');
export const fetchProducts = () => api.get<ApiResponse<Product[]>>('/products');
// API functions with fallback
export async function getWomenProducts(limit = 8): Promise<Product[]> {
  try {
    const response = await api.get('/products', {
      params: {
        mainCategory: 'women',
        limit: limit
      }
    });
    return response.data.products || [];
  } catch (error) {
    console.error('Error fetching women products:', error);
    return fallbackProducts;
  }
}

export async function getWomenBestsellers(limit = 4): Promise<Product[]> {
  try {
    const response = await api.get('/products', {
      params: {
        mainCategory: 'women',
        sortBy: 'popularity',
        order: 'desc',
        limit: limit
      }
    });
    return response.data.products || [];
  } catch (error) {
    console.error('Error fetching women bestsellers:', error);
    return fallbackProducts;
  }
}

export async function getWomenCategories(): Promise<Category[]> {
  try {
    const response = await api.get('/categories', {
      params: {
        mainCategory: 'women'
      }
    });
    return response.data.categories || [];
  } catch (error) {
    console.error('Error fetching women categories:', error);
    return fallbackCategories;
  }
}

export async function getWomenMustHaveProducts(limit = 1): Promise<Product[]> {
  try {
    const response = await api.get('/products', {
      params: {
        mainCategory: 'women',
        tags: 'featured',
        limit: limit
      }
    });
    return response.data.products || [];
  } catch (error) {
    console.error('Error fetching women must-have products:', error);
    return [fallbackProducts[2]]; // Return one featured product as fallback
  }
}

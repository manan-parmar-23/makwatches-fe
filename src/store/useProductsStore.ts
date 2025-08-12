import { create, StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Product, fetchProducts, createProduct, updateProduct, deleteProduct } from '../utils/api';

// Minimal shape for Axios-like error to safely extract message
interface HttpErrorLike {
  response?: { data?: { message?: string } };
}

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  add: (p: Partial<Product>) => Promise<Product | null>;
  update: (id: string, p: Partial<Product>) => Promise<Product | null>;
  remove: (id: string) => Promise<boolean>;
}

const storeImpl: StateCreator<ProductsState> = (set, get) => ({
  products: [],
  loading: false,
  error: null,
  fetchAll: async (): Promise<void> => {
    set({ loading: true, error: null });
    try {
      const { data } = await fetchProducts();
      set({ products: data.data, loading: false });
    } catch (e) {
      console.warn('Fetch products failed, using placeholder list', e);
      // Placeholder data if backend unreachable
      set({
        products: [
          { id: 'placeholder-1', name: 'Classic Shirt', brand: 'BrandX', category: 'Apparel', mainCategory: 'Men', subcategory: 'Shirts', price: 49.99, stock: 120, description: 'A reliable classic shirt', images: [] },
          { id: 'placeholder-2', name: 'Denim Jacket', brand: 'BrandY', category: 'Apparel', mainCategory: 'Women', subcategory: 'Jackets', price: 89.5, stock: 40, description: 'Stylish denim jacket', images: [] }
        ],
        loading: false,
        error: 'Backend offline (placeholder data)'
      });
    }
  },
  add: async (p: Partial<Product>): Promise<Product | null> => {
    try {
      // Ensure required backend fields are present / transformed
      const transformed: Partial<Product> = {
        ...p,
        // If category not explicitly set but mainCategory exists, derive it
        category: p.category || (p.mainCategory && p.subcategory ? `${p.mainCategory}/${p.subcategory}` : p.mainCategory),
        // Backend requires price > 0 and description, name, category
      };
      if (!transformed.name || !transformed.description || !transformed.category || (typeof transformed.price !== 'number') || (transformed.price as number) <= 0) {
        console.warn('Validation failed before API call', transformed);
        set({ error: 'Please provide name, description, category and a price > 0' });
        return null;
      }
      const { data } = await createProduct(transformed);
      const current = Array.isArray(get().products) ? get().products : [];
      set({ products: [data.data, ...current] });
      return data.data;
    } catch (e: unknown) {
      console.error('Create product failed', e);
      let message = 'Create product failed';
      if (typeof e === 'object' && e) {
        const err = e as HttpErrorLike;
        if (err.response?.data?.message) message = err.response.data.message;
      }
      set({ error: message });
      return null;
    }
  },
  update: async (id: string, p: Partial<Product>): Promise<Product | null> => {
    try {
      const transformed: Partial<Product> = {
        ...p,
        category: p.category || (p.mainCategory && p.subcategory ? `${p.mainCategory}/${p.subcategory}` : p.mainCategory),
      };
      const { data } = await updateProduct(id, transformed);
      const current = Array.isArray(get().products) ? get().products : [];
      set({ products: current.map(pr => pr.id === id ? data.data : pr) });
      return data.data;
    } catch (e: unknown) {
      console.error('Update product failed', e);
      let message = 'Update product failed';
      if (typeof e === 'object' && e) {
        const err = e as HttpErrorLike;
        if (err.response?.data?.message) message = err.response.data.message;
      }
      set({ error: message });
      return null;
    }
  },
  remove: async (id: string): Promise<boolean> => {
    const current = Array.isArray(get().products) ? get().products : [];
    // If placeholder (not 24-char hex) remove locally without API call
    const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(id);
    if (!isValidObjectId) {
      set({ products: current.filter(p => p.id !== id) });
      return true;
    }
    try {
      await deleteProduct(id);
    } catch (e: unknown) {
      // Log but ignore (404 etc.)
      console.warn('Delete product API error (ignoring, removing locally):', e);
    }
    set({ products: current.filter(p => p.id !== id) });
    return true;
  }
});

export const useProductsStore = create<ProductsState>()(devtools(storeImpl));

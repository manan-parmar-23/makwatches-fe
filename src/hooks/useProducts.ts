// src/hooks/useProducts.ts
import { useState, useEffect, useRef } from 'react';
import { fetchPublicProducts, Product, ProductQueryParams } from '@/utils/api';

export interface UseProductsOptions extends ProductQueryParams {
  enabled?: boolean;
  isCollection?: boolean; // True for collection views (show all), false for strict filtering
}

export interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useProducts = (options: UseProductsOptions = {}): UseProductsReturn => {
  const { enabled = true, isCollection = false, ...queryParams } = options;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Use a ref to track if params have changed to prevent unnecessary fetches
  const prevParamsRef = useRef<string>('');
  const currentParamsStr = JSON.stringify({
    enabled,
    mainCategory: queryParams.mainCategory,
    category: queryParams.category,
    subcategory: queryParams.subcategory,
    page: queryParams.page,
    limit: queryParams.limit,
  });

  const fetchProducts = async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const baseParams = {
        page: queryParams.page || 1,
        limit: queryParams.limit || 20,
      };

      let params: ProductQueryParams;

      // Build params carefully to avoid over-filtering
      // Rule of thumb:
      // - If subcategory is provided: only send mainCategory (if any) + subcategory
      // - Else if category is provided: send mainCategory (if any) + category
      // - Else: send mainCategory only (if any)
      // Retries (for collection only) relax filters progressively
      if (retryCount === 0) {
        if (queryParams.subcategory) {
          params = { ...baseParams };
          if (queryParams.mainCategory) params.mainCategory = queryParams.mainCategory;
          params.subcategory = queryParams.subcategory;
        } else if (queryParams.category) {
          params = { ...baseParams };
          if (queryParams.mainCategory) params.mainCategory = queryParams.mainCategory;
          params.category = queryParams.category;
        } else {
          params = { ...baseParams };
          if (queryParams.mainCategory) params.mainCategory = queryParams.mainCategory;
        }
      } else if (retryCount === 1) {
        // Second try - relax to subcategory or category only if collection
        params = { ...baseParams };
        if (queryParams.subcategory) {
          params.subcategory = queryParams.subcategory;
        } else if (queryParams.category) {
          params.category = queryParams.category;
        } else if (queryParams.mainCategory) {
          params.mainCategory = queryParams.mainCategory;
        }
      } else {
        // Third try - just main category (if any)
        params = { ...baseParams };
        if (queryParams.mainCategory) params.mainCategory = queryParams.mainCategory;
      }

      console.debug('useProducts fetch attempt', retryCount + 1, ':', params);

      const response = await fetchPublicProducts(params);
      
      // Handle different response structures
      let productData: Product[] = [];
      if (response?.data?.data && Array.isArray(response.data.data)) {
        productData = response.data.data as Product[];
      } else if (response?.data && Array.isArray(response.data)) {
        productData = response.data as Product[];
      } else if (Array.isArray(response)) {
        productData = response as Product[];
      }
      
      if (productData.length > 0) {
        setProducts(productData);
        setLoading(false);
      } else if (retryCount < 2 && isCollection) {
        // Only retry for collection views, not for strict subcategory filtering
        console.debug('No products found in collection, retrying with different parameters...');
        setRetryCount((prev) => prev + 1);
        return; // Don't set loading to false yet
      } else {
        // Give up and show empty state (or for subcategory views, don't retry)
        setProducts([]);
        setLoading(false);
      }
    } catch (err: unknown) {
      console.warn('Failed to fetch products:', queryParams, err);
      
      if (retryCount < 2 && isCollection) {
        // Only retry on errors for collection views
        console.debug('Error occurred in collection, retrying with different parameters...');
        setRetryCount((prev) => prev + 1);
        return; // Don't set loading to false yet
      } else {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch products';
        setError(errorMessage);
        setProducts([]);
        setLoading(false);
      }
    }
  };

  const refetch = () => {
    setRetryCount(0);
    setError(null);
    fetchProducts();
  };

  useEffect(() => {
    // Only fetch if params have actually changed
    if (prevParamsRef.current !== currentParamsStr) {
      prevParamsRef.current = currentParamsStr;
      setRetryCount(0); // Reset retry count on param change
      fetchProducts();
    } else if (retryCount > 0) {
      // Only fetch on retry count change if params haven't changed
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentParamsStr, retryCount]);

  return {
    products,
    loading,
    error,
    refetch,
  };
};
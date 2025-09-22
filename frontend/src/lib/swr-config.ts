import useSWR from 'swr';
import { categoryApi, productApi } from './api';

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Custom hook for category products with SWR
export function useCategoryProducts(
  categoryId: number,
  page: number = 1,
  limit: number = 12,
  search?: string,
  sortBy?: string
) {
  // Build the SWR key
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.append('search', search);
  if (sortBy) params.append('sortBy', sortBy);
  
  const swrKey = `http://localhost:3001/api/categories/${categoryId}/products?${params.toString()}`;

  const { data, error, mutate } = useSWR(
    categoryId ? swrKey : null,
    fetcher,
    {
      refreshInterval: 0, // Don't auto-refresh
      revalidateOnFocus: false, // Don't revalidate on window focus
      revalidateOnReconnect: true, // Revalidate on reconnect
      errorRetryCount: 3, // Retry 3 times on error
      dedupingInterval: 2000, // Dedupe requests within 2 seconds
    }
  );

  // Process the data
  const products = data?.products || [];
  const category = data?.category || null;
  const totalPages = data?.totalPages || 0;
  const totalProducts = data?.total || 0;
  const loading = !error && !data;

  return {
    products,
    category,
    totalPages,
    totalProducts,
    loading,
    error,
    refetch: mutate, // SWR's mutate function for refetching
  };
}

// Custom hook for all categories
export function useCategories() {
  const { data, error, mutate } = useSWR(
    'http://localhost:3001/api/categories',
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      dedupingInterval: 2000,
    }
  );

  return {
    categories: data || [],
    loading: !error && !data,
    error,
    refetch: mutate,
  };
}

// Custom hook for all products
export function useProducts(
  page: number = 1,
  limit: number = 12,
  search?: string,
  sortBy?: string
) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.append('search', search);
  if (sortBy) params.append('sortBy', sortBy);
  
  const swrKey = `http://localhost:3001/api/products?${params.toString()}`;

  const { data, error, mutate } = useSWR(swrKey, fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    errorRetryCount: 3,
    dedupingInterval: 2000,
  });

  return {
    products: data?.products || [],
    totalPages: data?.totalPages || 0,
    totalProducts: data?.total || 0,
    loading: !error && !data,
    error,
    refetch: mutate,
  };
}

// Custom hook for single product
export function useProduct(productId: number) {
  const { data, error, mutate } = useSWR(
    productId ? `http://localhost:3001/api/products/${productId}` : null,
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      dedupingInterval: 2000,
    }
  );

  return {
    product: data || null,
    loading: !error && !data,
    error,
    refetch: mutate,
  };
}

// Custom hook for product reviews
export function useProductReviews(productId: number) {
  const { data, error, mutate } = useSWR(
    productId ? `http://localhost:3001/api/products/${productId}/reviews` : null,
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
    }
  );

  return {
    reviews: data || [],
    loading: !error && !data,
    error,
    refetch: mutate,
  };
}

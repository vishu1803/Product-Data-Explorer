import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  worldOfBooksUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  title: string;
  author?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  description?: string;
  isbn?: string;
  rating?: number;
  reviewCount: number;
  worldOfBooksUrl?: string;
  isAvailable: boolean;
  categoryId: number;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
}

// API functions
export const categoryApi = {
  getAll: () => api.get<Category[]>('/categories'),
  getById: (id: number) => api.get<Category>(`/categories/${id}`),
};

export const productApi = {
  getAll: (page: number = 1, limit: number = 20) => 
    api.get<ProductsResponse>(`/products?page=${page}&limit=${limit}`),
  getByCategory: (categoryId: number, page: number = 1, limit: number = 20) => 
    api.get<ProductsResponse>(`/products/category/${categoryId}?page=${page}&limit=${limit}`),
  getById: (id: number) => api.get<Product>(`/products/${id}`),
};

export const scrapingApi = {
  test: () => api.get('/scraping/test'),
  scrapeCategories: () => api.post('/scraping/categories', {}, { timeout: 60000 }),
  scrapeProducts: (categoryId: number) => 
    api.post(`/scraping/products/${categoryId}`, {}, { timeout: 60000 }),
};

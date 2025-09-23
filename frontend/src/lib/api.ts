import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000,
});

export interface Category {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  worldOfBooksUrl?: string;
  parentId?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  products?: Product[];
  subcategories?: Category[];
}

export interface ProductReview {
  id: number;
  reviewerName?: string;
  rating: number;
  reviewTitle?: string;
  reviewText?: string;
  isVerifiedPurchase: boolean;
  reviewDate?: string;
  helpfulCount?: string;
  createdAt: string;
}

export interface Product {
  id: number;
  title: string;
  originalTitle?: string;
  author?: string;
  description?: string;
  detailedDescription?: string;
  price?: number;
  currency?: string;
  rating?: number;
  reviewCount: number;
  isbn?: string;
  isbn13?: string;
  publisher?: string;
  publicationDate?: string;
  pages?: number;
  language?: string;
  dimensions?: string;
  weight?: string;
  imageUrl?: string;
  imageLocalPath?: string;
  imageFilename?: string;
  worldOfBooksUrl?: string;
  condition?: string;
  format?: string;
  tags?: string[];
  genres?: string[];
  synopsis?: string;
  tableOfContents?: string;
  aboutAuthor?: string;
  similarProducts?: string[];
  isAvailable: boolean;
  categoryId: number;
  category?: Category;
  reviews?: ProductReview[];
  createdAt: string;
  updatedAt: string;
}

// API functions
export const categoryApi = {
  getAll: () => api.get<Category[]>('/api/categories'),
  getById: (id: number) => api.get<Category>(`/api/categories/${id}`),
};

export const productApi = {
  getAll: (page: number = 1, limit: number = 12, search?: string, sortBy?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append('search', search);
    if (sortBy) params.append('sortBy', sortBy);
    
    return api.get(`/api/products?${params.toString()}`);
  },
  getById: (id: number) => api.get<Product>(`/api/products/${id}`),
  getByCategory: (categoryId: number, page: number = 1, limit: number = 12, search?: string, sortBy?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append('search', search);
    if (sortBy) params.append('sortBy', sortBy);
    
    return api.get(`/api/categories/${categoryId}/products?${params.toString()}`);
  },
  getReviews: (productId: number) => api.get<ProductReview[]>(`/api/products/${productId}/reviews`),
};

// ✅ FIXED: Added missing /api prefix to scraping endpoints
export const scrapingApi = {
  scrapeCategories: () => api.post('/api/scraping/categories'),
  scrapeProducts: (categoryId: number) => api.post(`/api/scraping/products/${categoryId}`),
  scrapeProductDetails: (productId: number) => api.post(`/api/scraping/product-details/${productId}`),
};

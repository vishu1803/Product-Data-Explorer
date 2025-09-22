'use client';

import { useState, useEffect } from 'react';
import { productApi, categoryApi, scrapingApi, Product, Category } from '@/lib/api';
import { Search, Grid, List, Package, Download, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

type SortOption = 'date' | 'price' | 'rating' | 'title';
type ViewMode = 'grid' | 'list';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [scrapingCategory, setScrapingCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const productsPerPage = 12;
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      loadProducts();
    }
  }, [currentPage, searchTerm, sortBy, categories]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load categories first
      const categoriesResponse = await categoryApi.getAll();
      setCategories(categoriesResponse.data);
      
      // Then load products
      const productsResponse = await productApi.getAll(currentPage, productsPerPage, searchTerm, sortBy);
      setProducts(productsResponse.data.products || []);
      setTotalProducts(productsResponse.data.total || 0);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Make sure the backend is running.');
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productApi.getAll(currentPage, productsPerPage, searchTerm, sortBy);
      setProducts(response.data.products || []);
      setTotalProducts(response.data.total || 0);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  const handleScrapeAllProducts = async () => {
    if (categories.length === 0) {
      setError('No categories found. Please scrape categories first from the home page.');
      return;
    }

    try {
      setScraping(true);
      setError(null);
      setSuccess(null);

      // Scrape products for each category
      for (const category of categories.slice(0, 3)) { // Limit to first 3 categories to avoid overwhelming
        setScrapingCategory(category.id);
        await scrapingApi.scrapeProducts(category.id);
      }

      // Reload products
      await loadProducts();
      setSuccess(`Successfully scraped products from ${Math.min(categories.length, 3)} categories!`);
      
    } catch (error: any) {
      console.error('Error scraping products:', error);
      setError(`Failed to scrape products: ${error.message || 'Unknown error'}`);
    } finally {
      setScraping(false);
      setScrapingCategory(null);
    }
  };

  const handleScrapeCategory = async (categoryId: number, categoryName: string) => {
    try {
      setScrapingCategory(categoryId);
      setError(null);
      await scrapingApi.scrapeProducts(categoryId);
      await loadProducts();
      setSuccess(`Successfully scraped products from ${categoryName}!`);
    } catch (error: any) {
      console.error('Error scraping category products:', error);
      setError(`Failed to scrape ${categoryName}: ${error.message || 'Unknown error'}`);
    } finally {
      setScrapingCategory(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-page min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-page min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">All Products</h1>
            <p className="text-xl text-gray-600 mb-6">
              {totalProducts} {totalProducts === 1 ? 'product' : 'products'} available
            </p>

            {/* Status Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <p className="text-green-700">{success}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => loadProducts()}
                disabled={loading}
                className="btn btn-secondary btn-md"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Products
              </button>

              {totalProducts === 0 && (
                <button
                  onClick={handleScrapeAllProducts}
                  disabled={scraping || categories.length === 0}
                  className="btn btn-success btn-md"
                >
                  <Download className={`w-4 h-4 mr-2 ${scraping ? 'animate-spin' : ''}`} />
                  {scraping ? 'Scraping...' : 'Scrape Products'}
                </button>
              )}

              {categories.length === 0 && (
                <Link href="/" className="btn btn-primary btn-md">
                  Scrape Categories First
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Quick Category Scraping */}
        {categories.length > 0 && totalProducts < 10 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Start - Scrape Products by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.slice(0, 6).map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleScrapeCategory(category.id, category.name)}
                  disabled={scrapingCategory === category.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  {scrapingCategory === category.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  ) : (
                    <Download className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Controls */}
        {totalProducts > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-20 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 px-2 py-1 text-sm font-medium hover:bg-gray-100 rounded transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-w-[160px]"
                >
                  <option value="date">Newest First</option>
                  <option value="price">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="title">Alphabetical</option>
                </select>

                {/* View Mode */}
                <div className="flex border border-gray-300 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'} transition-colors`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'} transition-colors`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {totalProducts === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-6">
              {categories.length === 0 
                ? "Start by scraping categories from the home page, then scrape products from those categories."
                : "Use the scrape buttons above to get products from your categories."
              }
            </p>
            {categories.length === 0 && (
              <Link href="/" className="btn btn-primary btn-lg">
                Go to Home Page
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6 mb-8`}>
              {products.map((product, index) => (
                <Link href={`/products/${product.id}`} key={product.id}>
                  <div className="card card-hover p-6 cursor-pointer">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    
                    {product.author && (
                      <p className="text-sm text-gray-600 mb-2">by {product.author}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      {product.price && (
                        <span className="font-bold text-blue-600">
                          £{product.price}
                        </span>
                      )}
                      
                      {product.rating && (
                        <div className="flex items-center">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm text-gray-600 ml-1">
                            {product.rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-3 rounded-xl border border-gray-300 disabled:opacity-50 hover:bg-gray-50 font-medium transition-colors"
                >
                  Previous
                </button>
                
                <span className="px-6 py-3 text-gray-600 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 rounded-xl border border-gray-300 disabled:opacity-50 hover:bg-gray-50 font-medium transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

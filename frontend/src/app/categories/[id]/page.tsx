'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCategoryProducts } from '@/lib/swr-config';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';
import { scrapingApi } from '@/lib/api';
import { ArrowLeft, Package, RefreshCw, Search, Grid, List, Clock } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { ProductSkeleton } from '@/components/ui/LoadingSkeleton';
import Link from 'next/link';

type SortOption = 'date' | 'price' | 'rating' | 'title';
type ViewMode = 'grid' | 'list';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = parseInt(params.id as string);
  const { getLastVisited } = useNavigationHistory();

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [scraping, setScraping] = useState(false);

  const productsPerPage = 12;

  // SWR data fetching with real-time updates
  const { 
    products = [], // ✅ Default to empty array
    category, 
    totalPages = 0, 
    totalProducts = 0, 
    loading, 
    error, 
    refetch 
  } = useCategoryProducts(categoryId, currentPage, productsPerPage, searchTerm, sortBy);

  // ✅ Use useMemo instead of useEffect to prevent infinite loops
  const filteredProducts = useMemo(() => {
    // Safety check - ensure products is an array
    if (!Array.isArray(products)) {
      return [];
    }

    let filtered = [...products];

    // Apply search filter
    if (searchTerm && searchTerm.length >= 2) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.title?.toLowerCase().includes(searchLower) ||
        product.author?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (b.price || 0) - (a.price || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'date':
        default:
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
      }
    });

    return filtered;
  }, [products, searchTerm, sortBy]);

  const handleScrapeProducts = async () => {
    if (!category) return;
    
    try {
      setScraping(true);
      await scrapingApi.scrapeProducts(categoryId);
      await refetch(); // SWR will refetch the data
    } catch (error) {
      console.error('Error scraping products:', error);
      alert('Failed to scrape products. Please try again.');
    } finally {
      setScraping(false);
    }
  };

  const lastVisited = getLastVisited(`/categories/${categoryId}`);

  if (loading) {
    return (
      <div className="bg-gradient-page min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading category...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-page min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-600 mb-4 text-lg">{error.message}</div>
            <button
              onClick={() => refetch()}
              className="btn btn-primary btn-md mr-4"
            >
              Try Again
            </button>
            <button
              onClick={() => router.back()}
              className="btn btn-secondary btn-md"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="bg-gradient-page min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 text-lg">Category not found</p>
            <Link href="/categories" className="text-blue-600 hover:underline mt-2 inline-block">
              Back to Categories
            </Link>
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
          <Link
            href="/categories"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 text-lg font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Categories
          </Link>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 relative">
            {/* Last Visited Badge */}
            {lastVisited && (
              <div className="absolute top-4 right-4">
                <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  <Clock className="w-3 h-3 mr-1" />
                  Previously visited
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">{category.name}</h1>
                <p className="text-xl text-gray-600">
                  {totalProducts} {totalProducts === 1 ? 'product' : 'products'} available
                </p>
                {category.description && (
                  <p className="text-gray-500 mt-2">{category.description}</p>
                )}
              </div>
              
              <button
                onClick={handleScrapeProducts}
                disabled={scraping}
                className="mt-4 lg:mt-0 btn btn-success btn-lg flex items-center"
              >
                {scraping ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5 mr-2" />
                    Scrape Products
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
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
                  title="Grid View"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'} transition-colors`}
                  title="List View"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Refresh */}
              <button
                onClick={() => refetch()}
                className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                title="Refresh products"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Search Results Info */}
          {searchTerm && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              {searchTerm.length === 1 ? (
                <p className="text-sm text-yellow-600">
                  Type at least 2 characters to search effectively
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found for &quot;{searchTerm}&quot;
                  {filteredProducts.length === 0 && (
                    <span className="ml-2">
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-blue-600 hover:underline"
                      >
                        Clear search
                      </button>
                    </span>
                  )}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading && products.length === 0 ? (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
            {[...Array(12)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            {searchTerm && searchTerm.length >= 2 ? (
              <>
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found for &quot;{searchTerm}&quot;
                </h3>
                <p className="text-gray-600 mb-4">Try searching with different keywords</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="btn btn-primary btn-md"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-6">Start by scraping some products for this category</p>
                <button
                  onClick={handleScrapeProducts}
                  disabled={scraping}
                  className="btn btn-success btn-md"
                >
                  {scraping ? 'Scraping...' : 'Scrape Products'}
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6 mb-8`}>
              {filteredProducts.map((product) => (
                <div key={product.id} className="animate-fade-in-up">
                  <ProductCard product={product} />
                </div>
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

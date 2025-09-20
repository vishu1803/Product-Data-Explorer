'use client';

import { useState, useEffect } from 'react';
import { productApi, Product } from '@/lib/api';
import { Package, Search, Grid, List, TrendingUp } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { ProductSkeleton } from '@/components/ui/LoadingSkeleton';
import Link from 'next/link';

type SortOption = 'date' | 'price' | 'rating' | 'title';
type ViewMode = 'grid' | 'list';

export default function AllProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const productsPerPage = 16;

  useEffect(() => {
    loadProducts();
  }, [currentPage]);

  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm && searchTerm.length >= 2) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchLower) ||
        product.author?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.category?.name.toLowerCase().includes(searchLower)
      );
    } else if (searchTerm.length < 2 && searchTerm.length > 0) {
      // Keep all products but show hint for short search
      filtered = [...products];
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (b.price || 0) - (a.price || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, sortBy]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productApi.getAll(currentPage, productsPerPage);
      setProducts(response.data.products);
      setTotalProducts(response.data.total);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  return (
    <div className="bg-gradient-page min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">All Products</h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover {totalProducts} amazing {totalProducts === 1 ? 'product' : 'products'} from our collection
          </p>

          {/* Stats */}
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              {totalProducts} Products
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Fresh Content
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
                placeholder="Search products, authors, categories..."
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
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found for "{searchTerm}"
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

        {/* Loading State */}
        {loading && currentPage === 1 ? (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
            {[...Array(16)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            {searchTerm && searchTerm.length >= 2 ? (
              <>
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found for "{searchTerm}"
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
                <p className="text-gray-600 mb-4">Start by scraping some categories to get products</p>
                <Link
                  href="/categories"
                  className="btn btn-primary btn-md"
                >
                  Browse Categories
                </Link>
              </>
            )}
          </div>
        ) : (
          <>
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6 mb-8`}>
              {filteredProducts.map((product) => (
                <div key={product.id} className="animate-fade-in-up">
                  <ProductCard product={product} showCategory={true} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || loading}
                  className="px-6 py-3 rounded-xl border border-gray-300 disabled:opacity-50 hover:bg-gray-50 font-medium transition-colors"
                >
                  Previous
                </button>
                
                <span className="px-6 py-3 text-gray-600 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || loading}
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

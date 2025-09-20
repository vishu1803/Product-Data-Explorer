'use client';

import { useState, useEffect } from 'react';
import { categoryApi, scrapingApi, Category } from '@/lib/api';
import { RefreshCw, Package, BookOpen, TrendingUp, Download, Search } from 'lucide-react';
import Link from 'next/link';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrapingProducts, setScrapingProducts] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (searchTerm && searchTerm.length >= 2) {
      const searchLower = searchTerm.toLowerCase().trim();
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchLower) ||
        category.description?.toLowerCase().includes(searchLower)
      );
      setFilteredCategories(filtered);
    } else if (searchTerm.length < 2) {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryApi.getAll();
      setCategories(response.data);
      setFilteredCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScrapeProducts = async (categoryId: number) => {
    try {
      setScrapingProducts(categoryId);
      await scrapingApi.scrapeProducts(categoryId);
    } catch (error) {
      console.error('Error scraping products:', error);
    } finally {
      setScrapingProducts(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-page min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-page min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Book Categories
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover amazing books across different genres and topics
          </p>

          {/* Search Bar */}
          <div className="max-w-lg mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-20 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 px-3 py-1 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            
            {/* Search Hints */}
            {searchTerm && searchTerm.length === 1 && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  Type at least 2 characters to search effectively
                </p>
              </div>
            )}
            
            {/* Search Results Info */}
            {searchTerm && searchTerm.length >= 2 && (
              <div className="mt-2 text-center">
                <p className="text-sm text-gray-600">
                  {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} found for "{searchTerm}"
                </p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              {filteredCategories.length} Categories
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending Now
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            {searchTerm && searchTerm.length >= 2 ? (
              <>
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No categories found for "{searchTerm}"
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
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Categories Found</h3>
                <p className="text-gray-600 mb-4">Start by scraping some categories from the home page</p>
                <Link
                  href="/"
                  className="btn btn-primary btn-md"
                >
                  Go to Home
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCategories.map((category, index) => (
              <div
                key={category.id}
                className={`card card-hover group animate-fade-in-up animate-delay-${Math.min(index * 100, 700)}`}
              >
                <div className="p-8">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                    Discover amazing {category.name.toLowerCase()} books, stories, and educational content.
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Recently updated
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Popular
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <Link
                      href={`/categories/${category.id}`}
                      className="btn btn-primary btn-md flex-1"
                    >
                      Explore Products
                    </Link>
                    
                    <button
                      onClick={() => handleScrapeProducts(category.id)}
                      disabled={scrapingProducts === category.id}
                      className="btn btn-success btn-md px-4"
                      title="Scrape new products"
                    >
                      {scrapingProducts === category.id ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Download className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

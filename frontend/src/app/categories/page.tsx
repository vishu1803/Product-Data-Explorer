'use client';

import { useState, useEffect } from 'react';
import { categoryApi, scrapingApi, Category } from '@/lib/api';
import { RefreshCw, Download, BookOpen, Search, AlertCircle, CheckCircle, Eye, ChevronDown, ChevronRight, Folder } from 'lucide-react';
import Link from 'next/link';

interface CategoryWithSubcategories extends Category {
  subcategories?: Category[];
  isExpanded?: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryWithSubcategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [scrapingProducts, setScrapingProducts] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (searchTerm && searchTerm.length >= 2) {
      const searchLower = searchTerm.toLowerCase().trim();
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchLower) ||
        category.description?.toLowerCase().includes(searchLower) ||
        category.subcategories?.some(sub => 
          sub.name.toLowerCase().includes(searchLower) ||
          sub.description?.toLowerCase().includes(searchLower)
        )
      );
      setFilteredCategories(filtered);
    } else if (searchTerm.length < 2) {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryApi.getAll();
      
      // Group categories and subcategories
      const categoriesData = response.data;
      const mainCategories = categoriesData.filter(cat => !cat.parentId);
      const subcategories = categoriesData.filter(cat => cat.parentId);
      
      const categoriesWithSubs = mainCategories.map(category => ({
        ...category,
        subcategories: subcategories.filter(sub => sub.parentId === category.id),
        isExpanded: false
      }));
      
      setCategories(categoriesWithSubs);
      setFilteredCategories(categoriesWithSubs);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Separate refresh function
  const handleRefresh = async () => {
    await loadCategories();
    setSuccess('Categories refreshed successfully!');
  };

  // Separate scrape function
  const handleScrapeCategories = async () => {
    try {
      setScraping(true);
      setError(null);
      setSuccess(null);
      
      const response = await scrapingApi.scrapeCategories();
      await loadCategories();
      
      if (response.data?.success) {
        setSuccess(`Successfully scraped ${response.data.data?.length || 0} categories!`);
      } else {
        setError('Failed to scrape categories');
      }
    } catch (error: any) {
      console.error('Error scraping categories:', error);
      setError(`Failed to scrape categories: ${error.message || 'Unknown error'}`);
    } finally {
      setScraping(false);
    }
  };

  // Scrape products for a specific category
  const handleScrapeProducts = async (categoryId: number, categoryName: string) => {
    try {
      setScrapingProducts(categoryId);
      setError(null);
      await scrapingApi.scrapeProducts(categoryId);
      setSuccess(`Successfully scraped products for ${categoryName}!`);
    } catch (error: any) {
      console.error('Error scraping products:', error);
      setError(`Failed to scrape products for ${categoryName}`);
    } finally {
      setScrapingProducts(null);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setCategories(categories.map(category => 
      category.id === categoryId 
        ? { ...category, isExpanded: !category.isExpanded }
        : category
    ));
    setFilteredCategories(filteredCategories.map(category => 
      category.id === categoryId 
        ? { ...category, isExpanded: !category.isExpanded }
        : category
    ));
  };

  const renderCategory = (category: CategoryWithSubcategories, isSubcategory = false) => (
    <div
      key={category.id}
      className={`${isSubcategory ? 'ml-6 mt-3' : ''} card card-hover group animate-fade-in-up`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {!isSubcategory && (
              <button
                onClick={() => toggleCategory(category.id)}
                className={`mr-3 p-1 rounded-lg hover:bg-gray-100 transition-colors ${
                  category.subcategories?.length ? '' : 'invisible'
                }`}
              >
                {category.isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            
            <div className={`${isSubcategory ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-primary rounded-xl flex items-center justify-center mr-4`}>
              {isSubcategory ? (
                <Folder className="w-5 h-5 text-white" />
              ) : (
                <BookOpen className="w-6 h-6 text-white" />
              )}
            </div>
            
            <div>
              <h3 className={`${isSubcategory ? 'text-lg' : 'text-xl'} font-bold text-gray-900`}>
                {category.name}
                {!isSubcategory && category.subcategories && category.subcategories.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({category.subcategories.length} subcategories)
                  </span>
                )}
              </h3>
              <p className={`text-gray-600 ${isSubcategory ? 'text-sm' : ''}`}>
                {category.description || `Explore ${category.name.toLowerCase()} books`}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Link
            href={`/categories/${category.id}`}
            className={`btn btn-primary ${isSubcategory ? 'btn-sm' : 'btn-md'} flex items-center flex-1`}
          >
            <Eye className={`${isSubcategory ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
            View Products
          </Link>
          
          <button
            onClick={() => handleScrapeProducts(category.id, category.name)}
            disabled={scrapingProducts === category.id}
            className={`btn btn-success ${isSubcategory ? 'btn-sm' : 'btn-md'} px-4`}
          >
            {scrapingProducts === category.id ? (
              <RefreshCw className={`${isSubcategory ? 'w-3 h-3' : 'w-4 h-4'} animate-spin`} />
            ) : (
              <Download className={`${isSubcategory ? 'w-3 h-3' : 'w-4 h-4'}`} />
            )}
          </button>
        </div>
      </div>
    </div>
  );

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
            Book Categories
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Explore organized book collections with categories and subcategories
          </p>

          {/* Status Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl max-w-2xl mx-auto">
              <div className="flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl max-w-2xl mx-auto">
              <div className="flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-700">{success}</p>
              </div>
            </div>
          )}

          {/* Separate Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="btn btn-secondary btn-md"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={handleScrapeCategories}
              disabled={scraping}
              className="btn btn-success btn-md"
            >
              <Download className={`w-4 h-4 mr-2 ${scraping ? 'animate-spin' : ''}`} />
              {scraping ? 'Scraping...' : 'Scrape Categories'}
            </button>
          </div>

          {/* Search Bar */}
          <div className="max-w-lg mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-20 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 px-2 py-1 text-sm hover:bg-gray-100 rounded"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center items-center space-x-6 text-sm text-gray-600">
            <span>{filteredCategories.length} Categories</span>
            <span>{filteredCategories.reduce((sum, cat) => sum + (cat.subcategories?.length || 0), 0)} Subcategories</span>
          </div>
        </div>

        {/* Categories List */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Categories Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'No categories match your search.' : 'Start by scraping categories.'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleScrapeCategories}
                className="btn btn-success btn-md"
              >
                <Download className="w-4 h-4 mr-2" />
                Scrape Categories
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCategories.map((category) => (
              <div key={category.id}>
                {/* Main Category */}
                {renderCategory(category)}
                
                {/* Subcategories */}
                {category.isExpanded && category.subcategories && category.subcategories.length > 0 && (
                  <div className="space-y-2">
                    {category.subcategories.map((subcategory) => 
                      renderCategory(subcategory, true)
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { categoryApi, scrapingApi, Category } from '@/lib/api';
import { RefreshCw, Download, BookOpen, Search, AlertCircle, CheckCircle, Eye, ChevronDown, ChevronRight, Folder, X } from 'lucide-react';
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
    <article
      key={category.id}
      className={`${isSubcategory ? 'ml-6 mt-3' : ''} card card-hover group animate-fade-in-up`}
      role="article"
      aria-labelledby={`category-title-${category.id}`}
    >
      <div className="p-6">
        {/* ✅ Accessibility: Header with proper structure */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {!isSubcategory && (
              <button
                onClick={() => toggleCategory(category.id)}
                className={`mr-3 p-1 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  category.subcategories?.length ? '' : 'invisible'
                }`}
                aria-expanded={category.isExpanded}
                aria-controls={`subcategories-${category.id}`}
                aria-label={`${category.isExpanded ? 'Collapse' : 'Expand'} subcategories for ${category.name}`}
                disabled={!category.subcategories?.length}
              >
                {category.isExpanded ? (
                  <ChevronDown className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            )}
            
            <div 
              className={`${isSubcategory ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-primary rounded-xl flex items-center justify-center mr-4`}
              role="img"
              aria-label={`${isSubcategory ? 'Subcategory' : 'Category'} icon`}
            >
              {isSubcategory ? (
                <Folder className="w-5 h-5 text-white" aria-hidden="true" />
              ) : (
                <BookOpen className="w-6 h-6 text-white" aria-hidden="true" />
              )}
            </div>
            
            <div>
              <h3 
                id={`category-title-${category.id}`}
                className={`${isSubcategory ? 'text-lg' : 'text-xl'} font-bold text-gray-900`}
              >
                {category.name}
                {!isSubcategory && category.subcategories && category.subcategories.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500" aria-label={`Contains ${category.subcategories.length} subcategories`}>
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

        {/* ✅ Accessibility: Actions with proper labels */}
        <div className="flex space-x-3" role="group" aria-label={`Actions for ${category.name}`}>
          <Link
            href={`/categories/${category.id}`}
            className={`btn btn-primary ${isSubcategory ? 'btn-sm' : 'btn-md'} flex items-center flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            aria-label={`View products in ${category.name} category`}
          >
            <Eye className={`${isSubcategory ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} aria-hidden="true" />
            View Products
          </Link>
          
          <button
            onClick={() => handleScrapeProducts(category.id, category.name)}
            disabled={scrapingProducts === category.id}
            className={`btn btn-success ${isSubcategory ? 'btn-sm' : 'btn-md'} px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={
              scrapingProducts === category.id 
                ? `Scraping products for ${category.name}...` 
                : `Scrape products for ${category.name}`
            }
            title={`Scrape latest products from World of Books for ${category.name}`}
          >
            {scrapingProducts === category.id ? (
              <>
                <RefreshCw className={`${isSubcategory ? 'w-3 h-3' : 'w-4 h-4'} animate-spin`} aria-hidden="true" />
                <span className="sr-only">Scraping in progress</span>
              </>
            ) : (
              <Download className={`${isSubcategory ? 'w-3 h-3' : 'w-4 h-4'}`} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </article>
  );

  if (loading) {
    return (
      <div className="bg-gradient-page min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ✅ Accessibility: Loading state with proper ARIA */}
          <div className="text-center" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" aria-hidden="true"></div>
            <p className="text-gray-600 mt-4">Loading categories...</p>
            <span className="sr-only">Loading categories, please wait</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-page min-h-screen">
      {/* ✅ Accessibility: Skip link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg border-2 border-blue-700"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ✅ Accessibility: Header with proper semantic structure */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Book Categories
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Explore organized book collections with categories and subcategories
          </p>

          {/* ✅ Accessibility: Status Messages with proper ARIA */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl max-w-2xl mx-auto" role="alert">
              <div className="flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" aria-hidden="true" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl max-w-2xl mx-auto" role="status" aria-live="polite">
              <div className="flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" aria-hidden="true" />
                <p className="text-green-700">{success}</p>
              </div>
            </div>
          )}

          {/* ✅ Accessibility: Action buttons with proper labels */}
          <div className="flex justify-center gap-4 mb-8" role="group" aria-label="Category management actions">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="btn btn-secondary btn-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Refresh categories from database"
              title="Refresh the current list of categories"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              {loading && <span className="sr-only">Refreshing...</span>}
              Refresh
            </button>

            <button
              onClick={handleScrapeCategories}
              disabled={scraping}
              className="btn btn-success btn-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={scraping ? "Scraping categories in progress" : "Scrape new categories from World of Books"}
              title="Fetch the latest categories from World of Books website"
            >
              <Download className={`w-4 h-4 mr-2 ${scraping ? 'animate-spin' : ''}`} aria-hidden="true" />
              {scraping ? (
                <>
                  Scraping...
                  <span className="sr-only">Scraping in progress, please wait</span>
                </>
              ) : (
                'Scrape Categories'
              )}
            </button>
          </div>

         {/* ✅ NUCLEAR OPTION: Complete inline positioning */}
<div style={{ maxWidth: '32rem', margin: '0 auto 1.5rem auto' }}>
  <label htmlFor="category-search" className="sr-only">
    Search categories
  </label>
  
  <div style={{ position: 'relative' }}>
    {/* Search Icon */}
    <div style={{
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      zIndex: 5
    }}>
      <Search style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
    </div>
    
    {/* Input Field with complete positioning override */}
    <input
      id="category-search"
      type="text"
      placeholder="Search categories and subcategories..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      style={{
        position: 'relative',    // ✅ Explicit positioning
        zIndex: 10,             // ✅ Explicit z-index
        width: '100%',
        height: '48px',
        paddingLeft: '40px',
        paddingRight: '40px',
        paddingTop: '12px',
        paddingBottom: '12px',
        fontSize: '16px',
        color: '#111827',
        backgroundColor: '#ffffff',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        outline: 'none',
        boxSizing: 'border-box',
        display: 'block'
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#3b82f6';
        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#d1d5db';
        e.target.style.boxShadow = 'none';
      }}
      autoComplete="off"
    />
    
    {/* Clear Button */}
    {searchTerm && (
      <button
        onClick={() => setSearchTerm('')}
        type="button"
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 15,
          width: '20px',
          height: '20px',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#9ca3af'
        }}
        aria-label="Clear search"
      >
        <X style={{ width: '16px', height: '16px' }} />
      </button>
    )}
  </div>
  
  {/* Status Messages */}
  <div style={{ marginTop: '8px' }}>
    {searchTerm.length > 0 && searchTerm.length < 2 && (
      <p style={{ fontSize: '14px', color: '#d97706', textAlign: 'center' }}>
        Type at least 2 characters to search
      </p>
    )}
    {searchTerm.length >= 2 && (
      <p style={{ fontSize: '14px', color: '#2563eb', textAlign: 'center' }}>
        Found {filteredCategories.length} categories matching "{searchTerm}"
      </p>
    )}
  </div>
</div>


          {/* ✅ Accessibility: Stats with proper labeling */}
          <div className="flex justify-center items-center space-x-6 text-sm text-gray-600" role="status" aria-live="polite">
            <span aria-label={`${filteredCategories.length} categories found`}>
              {filteredCategories.length} Categories
            </span>
            <span aria-label={`${filteredCategories.reduce((sum, cat) => sum + (cat.subcategories?.length || 0), 0)} subcategories found`}>
              {filteredCategories.reduce((sum, cat) => sum + (cat.subcategories?.length || 0), 0)} Subcategories
            </span>
          </div>
        </header>

        {/* ✅ Accessibility: Main content with proper landmark */}
        <main id="main-content" role="main">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Categories Found</h2>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'No categories match your search.' : 'Start by scraping categories.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleScrapeCategories}
                  className="btn btn-success btn-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  aria-label="Scrape categories from World of Books to get started"
                >
                  <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                  Scrape Categories
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4" role="list" aria-label="Categories list">
              {filteredCategories.map((category) => (
                <div key={category.id} role="listitem">
                  {/* Main Category */}
                  {renderCategory(category)}
                  
                  {/* ✅ Accessibility: Subcategories with proper ARIA */}
                  {category.isExpanded && category.subcategories && category.subcategories.length > 0 && (
                    <div 
                      id={`subcategories-${category.id}`}
                      className="space-y-2"
                      role="list"
                      aria-label={`Subcategories of ${category.name}`}
                    >
                      {category.subcategories.map((subcategory) => (
                        <div key={subcategory.id} role="listitem">
                          {renderCategory(subcategory, true)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

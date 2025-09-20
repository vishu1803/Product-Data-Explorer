'use client';

import { useState, useEffect } from 'react';
import { categoryApi, scrapingApi, Category } from '@/lib/api';
import { RefreshCw, Database, Globe, AlertCircle, CheckCircle } from 'lucide-react';

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleScrapeCategories = async () => {
    try {
      setScraping(true);
      setError(null);
      setSuccess(null);
      
      console.log('Starting scraping...');
      await scrapingApi.scrapeCategories();
      console.log('Scraping completed, reloading categories...');
      
      // Reload categories after scraping
      await loadCategories();
      setSuccess('Successfully scraped and saved new categories!');
    } catch (error: any) {
      console.error('Error scraping categories:', error);
      setError(`Failed to scrape categories: ${error.message || 'Unknown error'}`);
    } finally {
      setScraping(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Product Data Explorer
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Discover books and products scraped from World of Books
        </p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={loadCategories}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh Categories'}
          </button>
          
          <button
            onClick={handleScrapeCategories}
            disabled={scraping}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Globe className={`w-4 h-4 mr-2 ${scraping ? 'animate-spin' : ''}`} />
            {scraping ? 'Scraping...' : 'Scrape New Data'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Database className="w-5 h-5 mr-2 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Categories ({categories.length})
          </h2>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No categories found. Try scraping some data!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-600 mt-1">Slug: {category.slug}</p>
                {category.worldOfBooksUrl && (
                  <p className="text-xs text-blue-600 mt-2 truncate">
                    {category.worldOfBooksUrl}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

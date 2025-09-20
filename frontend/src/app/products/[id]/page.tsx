'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productApi, Product } from '@/lib/api';
import { ArrowLeft, Star, User, PoundSterling, Package, ExternalLink, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = parseInt(params.id as string);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productApi.getById(productId);
      setProduct(response.data);
    } catch (error) {
      console.error('Error loading product:', error);
      setError('Failed to load product. It may not exist.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error || 'Product not found'}</div>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        
        {product.category && (
          <nav className="text-sm text-gray-600">
            <Link href="/categories" className="hover:text-blue-600">Categories</Link>
            <span className="mx-2">›</span>
            <Link 
              href={`/categories/${product.category.id}`} 
              className="hover:text-blue-600"
            >
              {product.category.name}
            </Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">{product.title}</span>
          </nav>
        )}
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-w-4 aspect-h-3">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-96 object-cover rounded-lg shadow-md"
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
              <Package className="w-24 h-24 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
          
          {product.author && (
            <div className="flex items-center text-lg text-gray-700 mb-4">
              <User className="w-5 h-5 mr-2" />
              <span>by {product.author}</span>
            </div>
          )}

          {product.price && (
            <div className="flex items-center text-3xl font-bold text-green-600 mb-4">
              <PoundSterling className="w-6 h-6 mr-2" />
              {product.price}
              {product.currency && product.currency !== 'GBP' && (
                <span className="text-lg ml-1">{product.currency}</span>
              )}
            </div>
          )}

          {product.rating && (
            <div className="flex items-center mb-4">
              <div className="flex items-center mr-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating!)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-lg font-semibold">{product.rating}</span>
              </div>
              <span className="text-gray-600">({product.reviewCount} reviews)</span>
            </div>
          )}

          {product.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {product.isbn && (
                <div>
                  <span className="font-medium text-gray-700">ISBN:</span>
                  <span className="ml-2 text-gray-600">{product.isbn}</span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">Availability:</span>
                <span className={`ml-2 ${product.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Added:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>
              {product.category && (
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <Link 
                    href={`/categories/${product.category.id}`}
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    {product.category.name}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            {product.worldOfBooksUrl && (
              <a
                href={product.worldOfBooksUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on World of Books
              </a>
            )}
            
            {product.category && (
              <Link
                href={`/categories/${product.category.id}`}
                className="flex items-center bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Package className="w-4 h-4 mr-2" />
                View Similar Products
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

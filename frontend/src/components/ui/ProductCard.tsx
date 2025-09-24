'use client';

import { Product } from '@/lib/api';
import { Star, PoundSterling, User, Heart, ShoppingCart, Eye, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  showCategory?: boolean;
}

export default function ProductCard({ product, showCategory = false }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Determine the best image URL to use - FIXED FOR PRODUCTION
  const getImageUrl = () => {
    // Priority: Local image > Original image URL > Fallback
    if (product.imageLocalPath && !imageError) {
      // Use environment variable for backend URL
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const backendUrl = apiBaseUrl.replace('/api', '');
      return `${backendUrl}/static/images/products/${product.imageFilename}`;
    }
    if (product.imageUrl && !imageError) {
      return product.imageUrl;
    }
    return null;
  };

  const imageUrl = getImageUrl();

  // ✅ Accessibility: Format price for screen readers
  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'number' ? price : parseFloat(price);
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(numPrice);
  };

  // ✅ Accessibility: Get descriptive alt text
  const getImageAltText = () => {
    const title = product.originalTitle || product.title;
    const author = product.author ? ` by ${product.author}` : '';
    return `Book cover for "${title}"${author}`;
  };

  return (
    <article 
      className="card card-hover group"
      role="article"
      aria-labelledby={`product-title-${product.id}`}
      aria-describedby={`product-details-${product.id}`}
    >
      {/* Enhanced Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={getImageAltText()}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div 
            className="w-full h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center"
            role="img"
            aria-label={`No cover image available for ${product.originalTitle || product.title}`}
          >
            <div className="text-center p-4">
              <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full shadow-lg flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-blue-600" aria-hidden="true" />
              </div>
              <p className="text-sm text-gray-600 font-medium">
                {product.originalTitle || product.title}
              </p>
            </div>
          </div>
        )}

        {/* ✅ Accessibility: Overlay Actions with proper labels */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex space-x-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsLiked(!isLiked);
              }}
              className="p-3 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label={isLiked ? `Remove ${product.title} from favorites` : `Add ${product.title} to favorites`}
              title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-600'}`} aria-hidden="true" />
            </button>
            
            <Link
              href={`/products/${product.id}`}
              className="p-3 bg-white rounded-full shadow-lg hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`View details for ${product.title}`}
              title="View product details"
            >
              <Eye className="w-5 h-5 text-gray-600" aria-hidden="true" />
            </Link>
            
            {product.worldOfBooksUrl && (
              <a
                href={product.worldOfBooksUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white rounded-full shadow-lg hover:bg-green-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                onClick={(e) => e.stopPropagation()}
                aria-label={`Buy ${product.title} on World of Books (opens in new window)`}
                title="Buy on World of Books"
              >
                <ShoppingCart className="w-5 h-5 text-gray-600" aria-hidden="true" />
                <span className="sr-only">(opens in new window)</span>
              </a>
            )}
          </div>
        </div>

        {/* ✅ Accessibility: Price Badge with proper labeling */}
        {product.price && (
          <div className="absolute top-3 left-3">
            <div 
              className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center shadow-lg"
              aria-label={`Price: ${formatPrice(product.price)}`}
            >
              <PoundSterling className="w-3 h-3 mr-1" aria-hidden="true" />
              <span aria-hidden="true">
                {typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
              </span>
            </div>
          </div>
        )}

        {/* Category Badge */}
        {showCategory && product.category && (
          <div className="absolute top-3 right-3">
            <span 
              className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg"
              aria-label={`Category: ${product.category.name}`}
            >
              {product.category.name}
            </span>
          </div>
        )}

        {/* Condition Badge */}
        {product.condition && (
          <div className="absolute bottom-3 left-3">
            <span 
              className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg"
              aria-label={`Condition: ${product.condition}`}
            >
              {product.condition}
            </span>
          </div>
        )}
      </div>

      {/* Enhanced Content */}
      <div className="p-5" id={`product-details-${product.id}`}>
        {/* Original Title (if different from display title) */}
        {product.originalTitle && product.originalTitle !== product.title && (
          <p className="text-xs text-blue-600 mb-1 font-medium">
            <span className="sr-only">Original title: </span>
            Original: {product.originalTitle}
          </p>
        )}

        {/* ✅ Accessibility: Title with proper heading */}
        <h3 
          id={`product-title-${product.id}`}
          className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight text-lg"
        >
          <Link 
            href={`/products/${product.id}`}
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            {product.title}
          </Link>
        </h3>

        {/* ✅ Accessibility: Author with semantic markup */}
        {product.author && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <User className="w-3 h-3 mr-1 flex-shrink-0" aria-hidden="true" />
            <span className="truncate font-medium">
              <span className="sr-only">Author: </span>
              {product.author}
            </span>
          </div>
        )}

        {/* Format & Condition */}
        <div className="flex items-center gap-2 mb-3" role="group" aria-label="Product specifications">
          {product.format && (
            <span 
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
              aria-label={`Format: ${product.format}`}
            >
              {product.format}
            </span>
          )}
          {product.condition && (
            <span 
              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
              aria-label={`Condition: ${product.condition}`}
            >
              {product.condition}
            </span>
          )}
        </div>

        {/* ✅ Accessibility: Rating with proper ARIA labels */}
        {product.rating && (
          <div 
            className="flex items-center mb-4"
            role="img"
            aria-label={`Rating: ${product.rating} out of 5 stars${product.reviewCount ? ` based on ${product.reviewCount} reviews` : ''}`}
          >
            <div className="flex items-center mr-2" aria-hidden="true">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating!)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700" aria-hidden="true">
              {product.rating}
            </span>
            {product.reviewCount && (
              <span className="text-xs text-gray-500 ml-1" aria-hidden="true">
                ({product.reviewCount} reviews)
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            <span className="sr-only">Description: </span>
            {product.description}
          </p>
        )}

        {/* ✅ Accessibility: Actions with proper labels */}
        <div className="flex items-center justify-between">
          <Link
            href={`/products/${product.id}`}
            className="btn btn-primary btn-md flex-1 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`View full details for ${product.title}`}
          >
            View Details
          </Link>
          
          {product.worldOfBooksUrl ? (
            <a
              href={product.worldOfBooksUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 border border-green-300 bg-green-50 rounded-xl hover:bg-green-100 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              title="View on World of Books"
              aria-label={`Purchase ${product.title} on World of Books (opens in new window)`}
            >
              <ShoppingCart className="w-5 h-5 text-green-600" aria-hidden="true" />
              <span className="sr-only">(opens in new window)</span>
            </a>
          ) : (
            <button 
              className="p-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              disabled
              aria-label="Purchase option not available"
              title="Purchase option not available"
            >
              <ShoppingCart className="w-5 h-5 text-gray-600" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

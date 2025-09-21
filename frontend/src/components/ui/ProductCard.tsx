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

  // Determine the best image URL to use
  const getImageUrl = () => {
    // Priority: Local image > Original image URL > Fallback
    if (product.imageLocalPath && !imageError) {
      return `http://localhost:3001/static/images/products/${product.imageFilename}`;
    }
    if (product.imageUrl && !imageError) {
      return product.imageUrl;
    }
    return null;
  };

  const imageUrl = getImageUrl();

  return (
    <div className="card card-hover group">
      {/* Enhanced Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.originalTitle || product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full shadow-lg flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600 font-medium">
                {product.originalTitle || product.title}
              </p>
            </div>
          </div>
        )}

        {/* Overlay Actions */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">

          <div className="flex space-x-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsLiked(!isLiked);
              }}
              className="p-3 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
            </button>
            <Link
              href={`/products/${product.id}`}
              className="p-3 bg-white rounded-full shadow-lg hover:bg-blue-50 transition-colors"
            >
              <Eye className="w-5 h-5 text-gray-600" />
            </Link>
            {product.worldOfBooksUrl && (
              <a
                href={product.worldOfBooksUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white rounded-full shadow-lg hover:bg-green-50 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ShoppingCart className="w-5 h-5 text-gray-600" />
              </a>
            )}
          </div>
        </div>

        {/* Price Badge */}
        {product.price && (
          <div className="absolute top-3 left-3">
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center shadow-lg">
              <PoundSterling className="w-3 h-3 mr-1" />
              {typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
            </div>
          </div>
        )}

        {/* Category Badge */}
        {showCategory && product.category && (
          <div className="absolute top-3 right-3">
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
              {product.category.name}
            </span>
          </div>
        )}

        {/* Condition Badge */}
        {product.condition && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
              {product.condition}
            </span>
          </div>
        )}
      </div>

      {/* Enhanced Content */}
      <div className="p-5">
        {/* Original Title (if different from display title) */}
        {product.originalTitle && product.originalTitle !== product.title && (
          <p className="text-xs text-blue-600 mb-1 font-medium">
            Original: {product.originalTitle}
          </p>
        )}

        {/* Title */}
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight text-lg">
          {product.title}
        </h3>

        {/* Author */}
        {product.author && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <User className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate font-medium">{product.author}</span>
          </div>
        )}

        {/* Format & Condition */}
        <div className="flex items-center gap-2 mb-3">
          {product.format && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              {product.format}
            </span>
          )}
          {product.condition && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              {product.condition}
            </span>
          )}
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-4">
            <div className="flex items-center mr-2">
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
            <span className="text-sm font-medium text-gray-700">{product.rating}</span>
            <span className="text-xs text-gray-500 ml-1">({product.reviewCount} reviews)</span>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            href={`/products/${product.id}`}
            className="btn btn-primary btn-md flex-1 mr-2"
          >
            View Details
          </Link>
          {product.worldOfBooksUrl ? (
            <a
              href={product.worldOfBooksUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 border border-green-300 bg-green-50 rounded-xl hover:bg-green-100 transition-all"
              title="View on World of Books"
            >
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </a>
          ) : (
            <button className="p-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all">
              <ShoppingCart className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

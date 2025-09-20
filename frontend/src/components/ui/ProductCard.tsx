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

  return (
    <div className="card card-hover group">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-blue-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm text-gray-500">No Image</p>
            </div>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
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
          </div>
        </div>

        {/* Price Badge */}
        {product.price && (
          <div className="absolute top-3 left-3">
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center shadow-lg">
              <PoundSterling className="w-3 h-3 mr-1" />
              {product.price}
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
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
          {product.title}
        </h3>

        {product.author && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <User className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">{product.author}</span>
          </div>
        )}

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
          <button className="p-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all">
            <ShoppingCart className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

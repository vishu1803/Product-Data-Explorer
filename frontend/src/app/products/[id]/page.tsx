'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { productApi, scrapingApi, Product, ProductReview } from '@/lib/api';
import { 
  ArrowLeft, Star, Package, BookOpen, User, Calendar, 
  MapPin, Truck, Heart, Share2, Download, ExternalLink,
  MessageCircle, ThumbsUp, ShoppingCart, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = parseInt(params.id as string);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrapingDetails, setScrapingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'details'>('overview');

  useEffect(() => {
    if (productId) {
      loadProductDetails();
    }
  }, [productId]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productResponse, reviewsResponse] = await Promise.all([
        productApi.getById(productId),
        productApi.getReviews(productId)
      ]);
      
      setProduct(productResponse.data);
      setReviews(reviewsResponse.data);
    } catch (error) {
      console.error('Error loading product details:', error);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleScrapeDetails = async () => {
    if (!product) return;
    
    try {
      setScrapingDetails(true);
      await scrapingApi.scrapeProductDetails(productId);
      await loadProductDetails();
    } catch (error) {
      console.error('Error scraping product details:', error);
    } finally {
      setScrapingDetails(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="bg-gradient-page min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-gradient-page min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
            <Link href="/products" className="btn btn-primary btn-md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-page min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link 
            href="/products"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </div>

        {/* Product Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Product Image */}
              <div className="space-y-4">
                <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="w-24 h-24 text-gray-400" />
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button className="flex-1 btn btn-primary btn-md">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    View on World of Books
                  </button>
                  <button className="btn btn-secondary btn-md px-4">
                    <Heart className="w-4 h-4" />
                  </button>
                  <button className="btn btn-secondary btn-md px-4">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.title}</h1>
                  {product.author && (
                    <p className="text-xl text-gray-600 mb-4">by {product.author}</p>
                  )}
                  
                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex">{renderStars(product.rating)}</div>
                      <span className="text-lg font-semibold text-gray-900">{product.rating}</span>
                      <span className="text-gray-500">
                        ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  {product.price && (
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-blue-600">
                        £{product.price}
                      </span>
                      <span className="text-gray-500 ml-2">{product.currency}</span>
                    </div>
                  )}
                </div>

                {/* Quick Info */}
                <div className="space-y-3">
                  {product.condition && (
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-600">Condition:</span>
                      <span className="ml-2 font-medium text-gray-900">{product.condition}</span>
                    </div>
                  )}
                  
                  {product.format && (
                    <div className="flex items-center">
                      <BookOpen className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-600">Format:</span>
                      <span className="ml-2 font-medium text-gray-900">{product.format}</span>
                    </div>
                  )}

                  {product.category && (
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-600">Category:</span>
                      <Link 
                        href={`/categories/${product.category.id}`}
                        className="ml-2 font-medium text-blue-600 hover:text-blue-700"
                      >
                        {product.category.name}
                      </Link>
                    </div>
                  )}

                  <div className="flex items-center">
                    <Truck className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">Availability:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex space-x-4">
                    <button
                      onClick={handleScrapeDetails}
                      disabled={scrapingDetails}
                      className="btn btn-success btn-md"
                    >
                      {scrapingDetails ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      {scrapingDetails ? 'Updating...' : 'Update Details'}
                    </button>
                    
                    {product.worldOfBooksUrl && (
                      <a
                        href={product.worldOfBooksUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-md"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Original
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-100">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'overview', name: 'Overview', icon: BookOpen },
                { id: 'reviews', name: `Reviews (${reviews.length})`, icon: MessageCircle },
                { id: 'details', name: 'Details', icon: Package },
              ].map(({ id, name, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Description */}
                {(product.description || product.detailedDescription) && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
                    <div className="prose max-w-none text-gray-600 leading-relaxed">
                      <p>{product.detailedDescription || product.description}</p>
                    </div>
                  </div>
                )}

                {/* Key Features */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Key Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'Author', value: product.author },
                      { label: 'Publisher', value: product.publisher },
                      { label: 'Pages', value: product.pages },
                      { label: 'Language', value: product.language },
                      { label: 'ISBN', value: product.isbn },
                      { label: 'Publication Date', value: product.publicationDate },
                    ].filter(item => item.value).map(({ label, value }) => (
                      <div key={label} className="flex justify-between py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-600">{label}:</span>
                        <span className="text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Similar Products */}
                {product.similarProducts && product.similarProducts.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">You Might Also Like</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {product.similarProducts.slice(0, 3).map((similarProduct, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                          <h4 className="font-medium text-gray-900 mb-2">{similarProduct}</h4>
                          <p className="text-sm text-gray-600">Similar book recommendation</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                    <p className="text-gray-600">Be the first to review this product!</p>
                  </div>
                ) : (
                  <>
                    {/* Review Summary */}
                    {product.rating && (
                      <div className="bg-gray-50 rounded-xl p-6 mb-8">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-gray-900 mb-2">{product.rating}</div>
                          <div className="flex justify-center mb-2">{renderStars(product.rating)}</div>
                          <p className="text-gray-600">Based on {reviews.length} reviews</p>
                        </div>
                      </div>
                    )}

                    {/* Individual Reviews */}
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-900">
                                  {review.reviewerName || 'Anonymous'}
                                </span>
                                {review.isVerifiedPurchase && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                    Verified Purchase
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="flex">{renderStars(review.rating)}</div>
                                {review.reviewDate && (
                                  <span className="text-sm text-gray-500">
                                    <Calendar className="w-3 h-3 inline mr-1" />
                                    {new Date(review.reviewDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {review.reviewTitle && (
                            <h4 className="font-semibold text-gray-900 mb-2">{review.reviewTitle}</h4>
                          )}
                          
                          {review.reviewText && (
                            <p className="text-gray-600 mb-3 leading-relaxed">{review.reviewText}</p>
                          )}
                          
                          {review.helpfulCount && (
                            <div className="flex items-center text-sm text-gray-500">
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              {review.helpfulCount}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Technical Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Product Information</h4>
                    {[
                      { label: 'Product ID', value: product.id },
                      { label: 'ISBN', value: product.isbn },
                      { label: 'ISBN-13', value: product.isbn13 },
                      { label: 'Publisher', value: product.publisher },
                      { label: 'Publication Date', value: product.publicationDate },
                      { label: 'Language', value: product.language },
                      { label: 'Pages', value: product.pages },
                    ].filter(item => item.value).map(({ label, value }) => (
                      <div key={label} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">{label}:</span>
                        <span className="font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Physical Details</h4>
                    {[
                      { label: 'Format', value: product.format },
                      { label: 'Condition', value: product.condition },
                      { label: 'Dimensions', value: product.dimensions },
                      { label: 'Weight', value: product.weight },
                      { label: 'Added Date', value: new Date(product.createdAt).toLocaleDateString() },
                      { label: 'Last Updated', value: new Date(product.updatedAt).toLocaleDateString() },
                    ].filter(item => item.value).map(({ label, value }) => (
                      <div key={label} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">{label}:</span>
                        <span className="font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-semibold text-gray-900 mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

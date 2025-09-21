'use client';

import { BookOpen, Database, Globe, Search, Filter, Star, Users, Award, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl mb-8 shadow-xl">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">About Product Data Explorer</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A cutting-edge full-stack application that demonstrates modern web development practices 
            through intelligent book discovery, real-time web scraping, and intuitive user experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Real-Time Data</h3>
            <p className="text-sm text-gray-600">Live scraping from World of Books with intelligent data processing</p>
          </div>

          <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Search</h3>
            <p className="text-sm text-gray-600">Advanced filtering, sorting, and search across thousands of books</p>
          </div>

          <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Web Scraping</h3>
            <p className="text-sm text-gray-600">Automated data collection using Crawlee and Playwright</p>
          </div>

          <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-sm text-gray-600">Optimized performance with caching and efficient data loading</p>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-white rounded-3xl p-8 mb-16 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Technology Stack</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Frontend */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Frontend
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-3"></span>
                  Next.js 13+ with App Router
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-3"></span>
                  TypeScript for type safety
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-3"></span>
                  Tailwind CSS v4 for styling
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-3"></span>
                  Lucide React for icons
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-3"></span>
                  Responsive design principles
                </li>
              </ul>
            </div>

            {/* Backend */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Backend
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-3"></span>
                  NestJS with TypeScript
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-3"></span>
                  PostgreSQL database
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-3"></span>
                  TypeORM for database management
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-3"></span>
                  Crawlee & Playwright for scraping
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-3"></span>
                  RESTful API architecture
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Key Features</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">User-Centric Design</h3>
              <p className="text-gray-600">Intuitive interface designed with user experience as the top priority, making book discovery effortless and enjoyable.</p>
            </div>

            <div className="p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
              <Award className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Production Quality</h3>
              <p className="text-gray-600">Enterprise-grade code quality with proper error handling, security practices, and scalable architecture.</p>
            </div>

            <div className="p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
              <Star className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Modern Standards</h3>
              <p className="text-gray-600">Built using the latest web development standards and best practices for optimal performance and maintainability.</p>
            </div>
          </div>
        </div>

        {/* Project Goals */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Project Goals</h2>
          <p className="text-xl mb-8 opacity-90 max-w-4xl mx-auto">
            This project demonstrates comprehensive full-stack development skills, from database design 
            and API development to modern frontend practices and automated data collection.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/categories" 
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors"
            >
              Explore Categories
            </Link>
            <Link 
              href="/products" 
              className="bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-400 transition-colors border border-blue-400"
            >
              Browse Products
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

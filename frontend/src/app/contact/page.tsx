'use client';

import { Mail, MessageSquare, Github, Linkedin, Send, MapPin, Phone, Clock } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    alert('Thank you for your message! This is a demo form.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Get In Touch</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about the Product Data Explorer? Want to discuss the implementation 
            or provide feedback? I'd love to hear from you!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Send a Message</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Project Inquiry"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Tell me about your thoughts on the project, suggestions for improvements, or any questions you might have..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center shadow-lg"
              >
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            
            {/* Project Info */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <Github className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Source Code</h3>
                    <p className="text-gray-600 text-sm mb-2">View the complete implementation on GitHub</p>
                    <a 
                      href="https://github.com/vishu1803/Product-Data-Explorer" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      github.com/vishu1803/product-data-explorer →
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Development Time</h3>
                    <p className="text-gray-600 text-sm">Full-stack application built with modern technologies</p>
                    <p className="text-blue-600 text-sm font-medium">Completed in 2024</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Response Time</h3>
                    <p className="text-gray-600 text-sm">I typically respond to messages within 24 hours</p>
                    <p className="text-purple-600 text-sm font-medium">Usually much faster!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Stack */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Technical Highlights</h2>
              <div className="space-y-3 text-sm opacity-90">
                <p>✓ Full-stack TypeScript application</p>
                <p>✓ Real-time web scraping with Crawlee & Playwright</p>
                <p>✓ Modern Next.js 13+ with App Router</p>
                <p>✓ NestJS backend with PostgreSQL</p>
                <p>✓ Responsive UI with Tailwind CSS</p>
                <p>✓ Production-ready deployment setup</p>
              </div>
            </div>

          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Is this a real production application?</h3>
              <p className="text-gray-600 text-sm">This is a demonstration project showcasing full-stack development skills with real working features and production-quality code.</p>
            </div>
            
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-2">What technologies were used?</h3>
              <p className="text-gray-600 text-sm">Next.js, TypeScript, NestJS, PostgreSQL, Crawlee, Playwright, and Tailwind CSS - all modern, industry-standard technologies.</p>
            </div>
            
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Can I use this code?</h3>
              <p className="text-gray-600 text-sm">This is primarily a portfolio project. Please contact me if you're interested in discussing the implementation or similar projects.</p>
            </div>
            
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-2">How does the scraping work?</h3>
              <p className="text-gray-600 text-sm">The application uses Crawlee with Playwright to extract book data from World of Books, demonstrating real web scraping capabilities.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

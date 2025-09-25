// Centralized API configuration
const getApiBaseUrl = (): string => {
  // In production, try environment variable first
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_API_URL || 'https://product-explorer-backend-eaj3.onrender.com/api';
  }
  
  // In development, use localhost
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
};

export const API_BASE_URL = getApiBaseUrl();
export const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');

// Debug function (remove in production)
export const debugEnvVars = () => {
  if (typeof window !== 'undefined') {
    console.log('🔧 Environment Variables Debug:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('Computed API_BASE_URL:', API_BASE_URL);
    console.log('Computed BACKEND_BASE_URL:', BACKEND_BASE_URL);
  }
};

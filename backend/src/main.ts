import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';

// Enhanced crypto polyfill for Docker containers
const cryptoModule = require('crypto');

// Ensure crypto is available globally
if (typeof globalThis.crypto === 'undefined') {
  if (cryptoModule.webcrypto) {
    globalThis.crypto = cryptoModule.webcrypto;
  } else {
    // Fallback for older Node.js versions
    globalThis.crypto = {
      randomUUID: () => cryptoModule.randomBytes(16).toString('hex'),
      getRandomValues: (array: any) => {
        const buffer = cryptoModule.randomBytes(array.length);
        for (let i = 0; i < array.length; i++) {
          array[i] = buffer[i];
        }
        return array;
      },
      webcrypto: cryptoModule.webcrypto
    } as any;
  }
}

// Also ensure crypto.randomUUID is available
if (!cryptoModule.randomUUID) {
  cryptoModule.randomUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
}

// Security and Rate Limiting with require (safer for now)
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const fs = require('fs');

// Conditional import for Swagger
let DocumentBuilder: any, SwaggerModule: any;
try {
  const swagger = require('@nestjs/swagger');
  DocumentBuilder = swagger.DocumentBuilder;
  SwaggerModule = swagger.SwaggerModule;
} catch (error) {
  console.warn('Swagger not available, skipping API documentation setup');
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ✅ AUTO-CREATE DATABASE TABLES (NEW ADDITION)
  try {
    console.log('🔄 Checking database schema synchronization...');
    const { DataSource } = require('typeorm');
    const dataSource = app.get(DataSource);
    
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Synchronizing database schema for production...');
      await dataSource.synchronize();
      console.log('✅ Database schema synchronized successfully');
    } else {
      console.log('🔄 Running database migrations for development...');
      await dataSource.runMigrations();
      console.log('✅ Database migrations completed successfully');
    }
  } catch (error) {
    console.error('❌ Database schema setup failed:', error);
    console.log('⚠️  Continuing without schema sync - manual setup may be required');
  }

  // ✅ Security headers
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );

  // ✅ Global input validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ✅ Rate limiting
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      error: 'Too many requests from this IP',
      message: 'Please try again after 15 minutes',
      statusCode: 429,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const scrapingLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: {
      error: 'Scraping rate limit exceeded',
      message: 'Please wait 5 minutes before making another scraping request',
      statusCode: 429,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(generalLimiter);
  app.use('/api/scraping', scrapingLimiter);

  // ✅ CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3002',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3002',
      ];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: [
      'X-Total-Count',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
    ],
  });

  // Global API prefix
  app.setGlobalPrefix('api');

  // Setup Swagger if available
  if (DocumentBuilder && SwaggerModule) {
    const config = new DocumentBuilder()
      .setTitle('Product Data Explorer API')
      .setDescription('API for managing categories and products scraped from World of Books')
      .setVersion('1.0')
      .addTag('categories', 'Category management endpoints')
      .addTag('products', 'Product management endpoints')
      .addTag('scraping', 'Web scraping endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'Product Explorer API Documentation',
      customCss: '.swagger-ui .topbar { display: none }',
    });
  }

  // Serve static images
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/static/',
  });

  // Create public directory if it doesn't exist
  const publicPath = join(__dirname, '..', 'public', 'images', 'products');
  
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
    console.log('📁 Created public/images/products directory');
  }

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Backend server is running on http://localhost:${port}`);
  console.log(`📋 API available at http://localhost:${port}/api`);
  console.log(`🗂️  Categories: http://localhost:${port}/api/categories`);
  console.log(`🔒 Security: Rate limiting and input validation enabled`);
  console.log(`🌐 CORS: Enabled for ${allowedOrigins.join(', ')}`);

  if (DocumentBuilder && SwaggerModule) {
    console.log(`📚 Swagger Docs available at http://localhost:${port}/api/docs`);
  }

  console.log(`📁 Static images: http://localhost:${port}/static/images/products/`);
}

bootstrap().catch((error: unknown) => {
  console.error('💥 Failed to start server:', error);
  process.exit(1);
});

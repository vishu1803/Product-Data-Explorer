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

if (!cryptoModule.randomUUID) {
  cryptoModule.randomUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
}

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const fs = require('fs');

// ✅ ALWAYS import Swagger (not conditional)
let DocumentBuilder: any, SwaggerModule: any;
try {
  const swagger = require('@nestjs/swagger');
  DocumentBuilder = swagger.DocumentBuilder;
  SwaggerModule = swagger.SwaggerModule;
} catch (error) {
  console.warn('Swagger not available, skipping API documentation setup');
}

async function bootstrap(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.NODE_OPTIONS) {
      process.env.NODE_OPTIONS = '--max_old_space_size=512';
    }
    
    if (global.gc) {
      setInterval(() => {
        global.gc();
      }, 30000);
    }
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : undefined
  });

  // ✅ FIXED: Use specific trusted proxies instead of true
  app.set('trust proxy', ['127.0.0.1', '::1', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16']);

  const gracefulShutdown = async (signal: string) => {
    console.log(`🛑 ${signal} received, shutting down gracefully...`);
    try {
      await app.close();
      console.log('✅ Application closed successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));

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

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: {
      error: 'Too many requests from this IP',
      message: 'Please try again after 15 minutes',
      statusCode: 429,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const scrapingLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    message: {
      error: 'Scraping rate limit exceeded',
      message: 'Please wait 10 minutes before making another scraping request',
      statusCode: 429,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(generalLimiter);
  app.use('/api/scraping', scrapingLimiter);

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'https://product-explorer-frontend-qp3m.onrender.com',
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

  app.setGlobalPrefix('api');

  // ✅ FIXED: Enable Swagger in production too
  if (DocumentBuilder && SwaggerModule) {
    const config = new DocumentBuilder()
      .setTitle('Product Data Explorer API')
      .setDescription('API for managing categories and products scraped from World of Books')
      .setVersion('1.0')
      .addTag('categories', 'Category management endpoints')
      .addTag('products', 'Product management endpoints')
      .addTag('scraping', 'Web scraping endpoints')
      .addServer(process.env.NODE_ENV === 'production' 
        ? 'https://product-explorer-backend-eaj3.onrender.com' 
        : 'http://localhost:3001', 'API Server')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'Product Explorer API Documentation',
      customCss: '.swagger-ui .topbar { display: none }',
    });

    console.log('📚 Swagger documentation enabled at /api/docs');
  }

  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/static/',
  });

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

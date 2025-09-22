const crypto = require('crypto');
if (!global.crypto) {
  global.crypto = crypto.webcrypto;
}
if (!crypto.randomUUID) {
  crypto.randomUUID = () => crypto.randomBytes(16).toString('hex');
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

// Conditional import for Swagger
let DocumentBuilder, SwaggerModule;
try {
  const swagger = require('@nestjs/swagger');
  DocumentBuilder = swagger.DocumentBuilder;
  SwaggerModule = swagger.SwaggerModule;
} catch (error) {
  console.warn('Swagger not available, skipping API documentation setup');
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3002',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3002'
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
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
    SwaggerModule.setup('api/docs', app, document);
  }

  // Serve static images
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/static/',
  });

  // Create public directory if it doesn't exist
  const publicPath = join(__dirname, '..', 'public', 'images', 'products');
  const fs = require('fs');
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
    console.log('📁 Created public/images/products directory');
  }

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Backend server is running on http://localhost:${port}`);
  console.log(`📋 API available at http://localhost:${port}/api`);
  console.log(`🗂️  Categories: http://localhost:${port}/api/categories`);
  
  if (DocumentBuilder && SwaggerModule) {
    console.log(`📚 Swagger Docs available at http://localhost:${port}/api/docs`);
  }
  
  console.log(`📁 Static images: http://localhost:${port}/static/images/products/`);
}
bootstrap();

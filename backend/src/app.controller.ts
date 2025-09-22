import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API root endpoint' })
  @ApiResponse({ status: 200, description: 'API information' })
  getRoot() {
    return {
      message: 'Product Data Explorer API is running',
      version: '1.0.0',
      endpoints: {
        categories: '/api/categories',
        products: '/api/products',
        docs: '/api/docs',
      },
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service health status' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Product Data Explorer API',
    };
  }
}

import { Controller, Post, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ScrapingService } from './scraping.service';

@Controller('scraping')
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) {}

  // ✅ Add temporary GET route for browser testing
  @Get('categories')
  async testScrapeCategories() {
    return {
      message:
        'Scraping endpoint is working! Use POST method to actually scrape.',
      endpoint: 'POST /api/scraping/categories',
      status: 'ready',
    };
  }

  @Post('categories')
  async scrapeCategories() {
    try {
      const categories = await this.scrapingService.scrapeCategories();
      return {
        success: true,
        message: `Successfully scraped ${categories.length} categories`,
        data: categories,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to scrape categories: ${error.message}`,
        data: [],
      };
    }
  }

  @Post('products/:categoryId')
  async scrapeProducts(@Param('categoryId', ParseIntPipe) categoryId: number) {
    try {
      const products = await this.scrapingService.scrapeProducts(categoryId);
      return {
        success: true,
        message: `Successfully scraped ${products.length} products with detailed information`,
        data: products,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to scrape products: ${error.message}`,
        data: [],
      };
    }
  }

  @Post('product-details/:productId')
  async scrapeProductDetails(
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    try {
      const product =
        await this.scrapingService.scrapeProductDetails(productId);
      return {
        success: true,
        message: 'Successfully scraped detailed product information',
        data: product,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to scrape product details: ${error.message}`,
        data: null,
      };
    }
  }
}

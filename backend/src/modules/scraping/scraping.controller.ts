import { Controller, Post, Get, Logger, Param } from '@nestjs/common';
import { WorldOfBooksScraper } from './world-of-books.scraper';
import { CategoriesService } from '../categories/categories.service';
import { ProductsService } from '../products/products.service';
import { Category } from '../categories/category.entity';
import { Product } from '../products/product.entity';

@Controller('scraping')
export class ScrapingController {
  private readonly logger = new Logger(ScrapingController.name);

  constructor(
    private worldOfBooksScraper: WorldOfBooksScraper,
    private categoriesService: CategoriesService,
    private productsService: ProductsService,
  ) {}

  @Post('categories')
  async scrapeAndSaveCategories() {
    try {
      this.logger.log('Starting category scraping...');
      
      const scrapedCategories = await this.worldOfBooksScraper.scrapeCategories();
      const savedCategories: Category[] = [];
      const errors: string[] = [];

      for (const categoryData of scrapedCategories) {
        try {
          const category = await this.categoriesService.createFromScrapedData(categoryData);
          savedCategories.push(category);
          this.logger.log(`Successfully processed category: ${category.name}`);
        } catch (error) {
          this.logger.warn(`Failed to save category ${categoryData.name}: ${error.message}`);
          errors.push(`${categoryData.name}: ${error.message}`);
        }
      }

      return {
        success: true,
        message: `Successfully processed ${savedCategories.length} categories`,
        categories: savedCategories,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      this.logger.error(`Failed to scrape categories: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Post('products/:categoryId')
  async scrapeAndSaveProducts(@Param('categoryId') categoryId: string) {
    try {
      this.logger.log(`Starting product scraping for category ${categoryId}...`);
      
      const category = await this.categoriesService.findOne(+categoryId);
      if (!category) {
        throw new Error(`Category with ID ${categoryId} not found`);
      }

      const scrapedProducts = await this.worldOfBooksScraper.scrapeProductsFromCategory(
        category.worldOfBooksUrl || `https://www.worldofbooks.com/category/${category.slug}`,
        20
      );

      const savedProducts: Product[] = []; // Fix: Properly type the array
      const errors: string[] = [];

      for (const productData of scrapedProducts) {
        try {
          const product = await this.productsService.createFromScrapedData({
            ...productData,
            categoryId: category.id,
          });
          savedProducts.push(product);
          this.logger.log(`Successfully processed product: ${product.title}`);
        } catch (error) {
          this.logger.warn(`Failed to save product ${productData.title}: ${error.message}`);
          errors.push(`${productData.title}: ${error.message}`);
        }
      }

      return {
        success: true,
        message: `Successfully processed ${savedProducts.length} products for ${category.name}`,
        products: savedProducts,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      this.logger.error(`Failed to scrape products: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get('test')
  async testScraping() {
    return {
      message: 'Scraping service is ready',
      timestamp: new Date().toISOString(),
    };
  }
}

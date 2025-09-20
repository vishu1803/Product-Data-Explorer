import { Module } from '@nestjs/common';
import { ScrapingService } from './scraping.service';
import { WorldOfBooksScraper } from './world-of-books.scraper';
import { ScrapingController } from './scraping.controller';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [CategoriesModule, ProductsModule],
  controllers: [ScrapingController],
  providers: [ScrapingService, WorldOfBooksScraper],
  exports: [ScrapingService, WorldOfBooksScraper],
})
export class ScrapingModule {}

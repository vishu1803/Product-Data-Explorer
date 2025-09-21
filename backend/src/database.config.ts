import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { ScrapingModule } from './modules/scraping/scraping.module';
import { Category } from './modules/categories/category.entity';
import { Product } from './modules/products/product.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433, // Fixed: Your database is on port 5433, not 5432
      username: 'admin',
      password: 'password',
      database: 'product_explorer',
      entities: [Category, Product],
      synchronize: true,
      logging: false,
      autoLoadEntities: true,
    }),
    CategoriesModule,
    ProductsModule,
    ScrapingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { ScrapingModule } from './modules/scraping/scraping.module';
import { Category } from './modules/categories/category.entity';
import { Product } from './modules/products/product.entity';
import { NavigationModule } from './modules/navigation/navigation.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: parseInt(configService.get('DB_PORT', '5433')),
        username: configService.get('DB_USERNAME', 'admin'),
        password: configService.get('DB_PASSWORD', 'password123'),
        database: configService.get('DB_DATABASE', 'product_explorer'),
        entities: [Category, Product],
        synchronize: true, // Only for development
        logging: false,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    CategoriesModule,
    ProductsModule,
    ScrapingModule,
    NavigationModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

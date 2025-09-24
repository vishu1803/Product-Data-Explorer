import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { ScrapingModule } from './modules/scraping/scraping.module';
import { NavigationModule } from './modules/navigation/navigation.module';
import { AppCacheModule } from './common/cache/cache.module';
import { Category } from './modules/categories/category.entity';
import { Product } from './modules/products/product.entity';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ✅ FIXED: Working Throttler configuration
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: parseInt(configService.get('THROTTLE_TTL') || '60', 10),
          limit: parseInt(configService.get('THROTTLE_LIMIT') || '100', 10),
        },
      ],
      inject: [ConfigService],
    }),

    // ✅ FIXED: Database configuration with SSL disabled for Docker
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const nodeEnv = configService.get('NODE_ENV') || 'development';

        return {
          type: 'postgres',
          host: configService.get('DB_HOST') || 'localhost',
          port: parseInt(configService.get('DB_PORT') || '5433', 10),
          username: configService.get('DB_USERNAME') || 'postgres',
          password: configService.get('DB_PASSWORD') || 'password',
          database: configService.get('DB_DATABASE') || 'product_explorer',
          entities: [Category, Product],

          // ✅ SECURE: Only sync in development
          synchronize: nodeEnv === 'development',

          // ✅ SECURE: Appropriate logging
          logging: nodeEnv === 'development' ? ['error'] : false,

          autoLoadEntities: true,

          // ✅ FIXED: SSL configuration for Docker
          ssl: false, // Disable SSL for local Docker
          
          // Alternative SSL config if needed:
          // ssl: nodeEnv === 'production' ? { rejectUnauthorized: false } : false,

          // ✅ SECURE: Connection pool settings
          extra: {
            max: parseInt(configService.get('DB_MAX_CONNECTIONS') || '20', 10),
            idleTimeoutMillis: parseInt(
              configService.get('DB_IDLE_TIMEOUT') || '30000',
              10,
            ),
            connectionTimeoutMillis: parseInt(
              configService.get('DB_CONNECTION_TIMEOUT') || '2000',
              10,
            ),
          },
        };
      },
      inject: [ConfigService],
    }),

    CategoriesModule,
    ProductsModule,
    ScrapingModule,
    NavigationModule,
    AppCacheModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

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

    // ✅ DUAL ENVIRONMENT: Supports both local Docker and Render production
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const nodeEnv = configService.get('NODE_ENV') || 'development';
        const databaseUrl = configService.get('DATABASE_URL');

        console.log(`🔧 Database Config - Environment: ${nodeEnv}`);
        console.log(`🔧 DATABASE_URL provided: ${!!databaseUrl}`);

        // ✅ PRODUCTION: Use Render's DATABASE_URL (handles all connection details)
        if (nodeEnv === 'production' && databaseUrl) {
          console.log('📡 Using production DATABASE_URL configuration');
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [Category, Product],
            synchronize: false, // Never sync in production for safety
            logging: false,
            autoLoadEntities: true,
            ssl: { rejectUnauthorized: false }, // Required for Render
            extra: {
              max: parseInt(configService.get('DB_MAX_CONNECTIONS') || '10', 10),
              idleTimeoutMillis: parseInt(configService.get('DB_IDLE_TIMEOUT') || '30000', 10),
              connectionTimeoutMillis: parseInt(configService.get('DB_CONNECTION_TIMEOUT') || '5000', 10),
            },
          };
        }

        // ✅ DEVELOPMENT: Use existing local Docker configuration
        console.log('🐳 Using local Docker database configuration');
        return {
          type: 'postgres',
          host: configService.get('DB_HOST') || 'localhost',
          port: parseInt(configService.get('DB_PORT') || '5433', 10),
          username: configService.get('DB_USERNAME') || 'postgres', // Keep for local
          password: configService.get('DB_PASSWORD') || 'postgres_admin_password', // Keep for local
          database: configService.get('DB_DATABASE') || 'product_explorer',
          entities: [Category, Product],

          // ✅ SECURE: Only sync in development
          synchronize: nodeEnv === 'development',

          // ✅ SECURE: Appropriate logging
          logging: nodeEnv === 'development' ? ['error'] : false,

          autoLoadEntities: true,

          // ✅ LOCAL: SSL disabled for local Docker
          ssl: false,

          // ✅ SECURE: Connection pool settings
          extra: {
            max: parseInt(configService.get('DB_MAX_CONNECTIONS') || '20', 10),
            idleTimeoutMillis: parseInt(configService.get('DB_IDLE_TIMEOUT') || '30000', 10),
            connectionTimeoutMillis: parseInt(configService.get('DB_CONNECTION_TIMEOUT') || '2000', 10),
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

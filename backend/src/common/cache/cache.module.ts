import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager'; // ✅ Correct import
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

interface CacheConfig {
  store: any;
  host: string;
  port: number;
  ttl: number;
  max: number;
  isGlobal: boolean;
}

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): CacheConfig => {
        const cacheConfig: CacheConfig = {
          store: redisStore,
          host: configService.get('REDIS_HOST') || 'localhost',
          port: parseInt(configService.get('REDIS_PORT') || '6379', 10),
          ttl: parseInt(configService.get('CACHE_TTL') || '300', 10), // 5 minutes default
          max: 100, // Maximum number of items in cache
          isGlobal: true,
        };

        console.log('🔧 Cache configuration:', {
          host: cacheConfig.host,
          port: cacheConfig.port,
          ttl: cacheConfig.ttl,
        });

        return cacheConfig;
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  exports: [CacheModule],
})
export class AppCacheModule {}

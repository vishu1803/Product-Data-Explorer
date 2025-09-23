import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager'; // ✅ Correct import
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          store: redisStore,
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          ttl: parseInt(configService.get('CACHE_TTL', '300')), // 5 minutes default
          max: 100, // Maximum number of items in cache
          isGlobal: true,
        };
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  exports: [CacheModule],
})
export class AppCacheModule {}

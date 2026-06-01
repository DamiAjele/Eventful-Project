import { Module } from '@nestjs/common';
import redisProvider from './redis.provider';
import { CacheService } from './cache.service';

@Module({
  providers: [redisProvider, CacheService],
  exports: [CacheService, redisProvider],
})
export class CacheModule {}

export default CacheModule;

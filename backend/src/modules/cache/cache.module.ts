import { Module } from '@nestjs/common';
import redisProvider, { REDIS_CLIENT } from './redis.provider';
import { CacheService } from './cache.service';

@Module({
  providers: [redisProvider, CacheService],
  exports: [CacheService, REDIS_CLIENT],
})
export class CacheModule {}

export default CacheModule;

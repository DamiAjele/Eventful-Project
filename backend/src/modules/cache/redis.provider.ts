import Redis from 'ioredis';
import { Provider } from '@nestjs/common';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const redisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: () => {
    const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
    return new Redis(url);
  },
};

export default redisProvider;

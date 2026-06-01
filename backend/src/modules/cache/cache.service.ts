import { Inject, Injectable, Logger } from '@nestjs/common';
import { REDIS_CLIENT } from './redis.provider';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  constructor(@Inject(REDIS_CLIENT) private readonly client: any) {}

  async set(key: string, value: unknown, ttlSeconds?: number) {
    const payload = JSON.stringify(value);
    if (ttlSeconds && ttlSeconds > 0) {
      await this.client.set(key, payload, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, payload);
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch (err) {
      this.logger.warn(`Failed to parse cache value for key ${key}: ${err}`);
      return null;
    }
  }

  async del(key: string) {
    await this.client.del(key);
  }

  async exists(key: string) {
    const res = await this.client.exists(key);
    return res === 1;
  }
}

export default CacheService;

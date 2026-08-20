import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  readonly client: Redis | null;

  constructor(configService: ConfigService) {
    const redisUrl = configService.get<string>('REDIS_URL')?.trim();
    if (!redisUrl) {
      this.logger.warn(
        'REDIS_URL unset — running without Redis (fine for a single free API).',
      );
      this.client = null;
      return;
    }

    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.client.on('connect', () => this.logger.log('Redis client connected'));
    this.client.on('error', (err: Error) =>
      this.logger.error(`Redis client error: ${err.message}`),
    );
  }

  get enabled(): boolean {
    return this.client !== null;
  }

  async connect(): Promise<void> {
    if (!this.client) return;
    if (this.client.status === 'wait' || this.client.status === 'end') {
      await this.client.connect();
    }
  }

  async ping(): Promise<boolean> {
    if (!this.client) return false;
    try {
      await this.connect();
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) await this.client.quit();
  }
}

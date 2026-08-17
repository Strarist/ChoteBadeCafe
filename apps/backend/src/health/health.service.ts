import { Injectable } from '@nestjs/common';
import type { HealthResponse } from '@cafe/shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async check(): Promise<HealthResponse> {
    const [database, redis] = await Promise.all([this.checkDatabase(), this.checkRedis()]);

    // Redis is optional (socket fan-out). Do not take the API out of rotation if Redis is down.
    const ok = database === 'up';
    const base: HealthResponse = {
      status: ok ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
    };

    // Public production health stays opaque — detailed probes belong on authenticated admin routes.
    if (process.env.NODE_ENV === 'production') {
      return base;
    }

    return { ...base, database, redis };
  }

  private async checkDatabase(): Promise<'up' | 'down'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'up';
    } catch {
      return 'down';
    }
  }

  private async checkRedis(): Promise<'up' | 'down' | 'skipped'> {
    if (!this.redis.enabled) return 'skipped';
    const ok = await this.redis.ping();
    return ok ? 'up' : 'down';
  }
}

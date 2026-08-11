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

    const ok = database === 'up' && redis === 'up';
    return {
      status: ok ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database,
      redis,
    };
  }

  private async checkDatabase(): Promise<'up' | 'down'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'up';
    } catch {
      return 'down';
    }
  }

  private async checkRedis(): Promise<'up' | 'down'> {
    const ok = await this.redis.ping();
    return ok ? 'up' : 'down';
  }
}

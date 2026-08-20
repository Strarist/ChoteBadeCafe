import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import type { HealthResponse } from '@cafe/shared-types';
import { HealthService } from './health.service';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('health')
  async check(
    @Res({ passthrough: true }) res: Response,
  ): Promise<HealthResponse> {
    const result = await this.healthService.check();
    res.status(result.status === 'ok' ? 200 : 503);
    return result;
  }

  /** Browser warmup — `/health` is commonly blocked by ad blockers. */
  @Get('ping')
  ping(): { ok: true } {
    return { ok: true };
  }
}

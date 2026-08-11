import { Controller, Get } from '@nestjs/common';
import { IntegrationsConfigService } from './integrations-config.service';

@Controller('health')
export class IntegrationsHealthController {
  constructor(private readonly integrations: IntegrationsConfigService) {}

  @Get('integrations')
  readiness() {
    if (process.env.NODE_ENV === 'production') {
      return { timestamp: new Date().toISOString(), ok: true };
    }
    return {
      timestamp: new Date().toISOString(),
      ...this.integrations.getReadiness(),
    };
  }
}

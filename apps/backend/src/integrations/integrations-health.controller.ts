import { Controller, Get } from '@nestjs/common';
import { IntegrationsConfigService } from './integrations-config.service';

@Controller('health')
export class IntegrationsHealthController {
  constructor(private readonly integrations: IntegrationsConfigService) {}

  @Get('integrations')
  readiness() {
    return {
      timestamp: new Date().toISOString(),
      ...this.integrations.getReadiness(),
    };
  }
}

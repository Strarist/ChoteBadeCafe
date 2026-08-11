import { Global, Module } from '@nestjs/common';
import { IntegrationsConfigService } from './integrations-config.service';
import { IntegrationsHealthController } from './integrations-health.controller';

@Global()
@Module({
  controllers: [IntegrationsHealthController],
  providers: [IntegrationsConfigService],
  exports: [IntegrationsConfigService],
})
export class IntegrationsModule {}

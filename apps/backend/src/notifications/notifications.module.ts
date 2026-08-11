import { Module, forwardRef } from '@nestjs/common';
import { READY_NOTIFIER } from './ready-notifier.interface';
import { FakeReadyNotifier } from './fake-ready-notifier';
import { LiveReadyNotifier } from './live-ready-notifier';
import { NotificationsService } from './notifications.service';
import { OrderModule } from '../order/order.module';
import { IntegrationsConfigService } from '../integrations/integrations-config.service';

@Module({
  imports: [forwardRef(() => OrderModule)],
  providers: [
    FakeReadyNotifier,
    LiveReadyNotifier,
    {
      provide: READY_NOTIFIER,
      inject: [IntegrationsConfigService, FakeReadyNotifier, LiveReadyNotifier],
      useFactory: (
        integrations: IntegrationsConfigService,
        fake: FakeReadyNotifier,
        live: LiveReadyNotifier,
      ) => (integrations.notificationMode() === 'live' ? live : fake),
    },
    NotificationsService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}

import { Module, forwardRef } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderTokenService } from './order-token.service';
import { OrderAccessService } from './order-access.service';
import { RealtimeModule } from '../realtime/realtime.module';
import { PetPoojaOrderModule } from '../petpooja/petpooja-order.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrderEventsListener } from './order-events.listener';
import { AuthModule } from '../auth/auth.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [
    RealtimeModule,
    AuthModule,
    IntegrationsModule,
    forwardRef(() => PetPoojaOrderModule),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderTokenService, OrderAccessService, OrderEventsListener],
  exports: [OrderService, OrderAccessService],
})
export class OrderModule {}

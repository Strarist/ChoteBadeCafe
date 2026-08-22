import { Module, forwardRef } from '@nestjs/common';
import { PETPOOJA_ORDER_PUSH } from './petpooja-order-push.interface';
import { FakePetPoojaOrderPush } from './fake-petpooja-order-push';
import { LivePetPoojaOrderPush } from './live-petpooja-order-push';
import { PetPoojaOrderService } from './petpooja-order.service';
import { PetPoojaWebhookService } from './petpooja-webhook.service';
import { PetPoojaController } from './petpooja.controller';
import { OrderModule } from '../order/order.module';
import { MenuModule } from '../menu/menu.module';
import { IntegrationsConfigService } from '../integrations/integrations-config.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => OrderModule),
    forwardRef(() => MenuModule),
    AuthModule,
  ],
  controllers: [PetPoojaController],
  providers: [
    FakePetPoojaOrderPush,
    LivePetPoojaOrderPush,
    {
      provide: PETPOOJA_ORDER_PUSH,
      inject: [
        IntegrationsConfigService,
        FakePetPoojaOrderPush,
        LivePetPoojaOrderPush,
      ],
      useFactory: (
        integrations: IntegrationsConfigService,
        fake: FakePetPoojaOrderPush,
        live: LivePetPoojaOrderPush,
      ) => (integrations.petpoojaMode() === 'live' ? live : fake),
    },
    PetPoojaOrderService,
    PetPoojaWebhookService,
  ],
  exports: [PetPoojaOrderService],
})
export class PetPoojaOrderModule {}

import { Module, forwardRef } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { OrderModule } from '../order/order.module';
import { AuthModule } from '../auth/auth.module';
import { PAYMENT_GATEWAY } from './payment-gateway.interface';
import { FakePaymentGateway } from './fake-payment.gateway';
import { RazorpayPaymentGateway } from './razorpay-payment.gateway';
import { IntegrationsConfigService } from '../integrations/integrations-config.service';

@Module({
  imports: [forwardRef(() => OrderModule), AuthModule],
  controllers: [PaymentController],
  providers: [
    FakePaymentGateway,
    RazorpayPaymentGateway,
    {
      provide: PAYMENT_GATEWAY,
      inject: [IntegrationsConfigService, FakePaymentGateway, RazorpayPaymentGateway],
      useFactory: (
        integrations: IntegrationsConfigService,
        fake: FakePaymentGateway,
        live: RazorpayPaymentGateway,
      ) => (integrations.paymentMode() === 'live' ? live : fake),
    },
    PaymentService,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}

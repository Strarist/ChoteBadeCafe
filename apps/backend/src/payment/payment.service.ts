import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { OrderDetail, RazorpayCheckoutPayload } from '@cafe/shared-types';
import { OrderService } from '../order/order.service';
import { PAYMENT_GATEWAY, type PaymentGateway } from './payment-gateway.interface';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGateway,
    private readonly orders: OrderService,
  ) {
    this.logger.log(`Payment gateway mode: ${gateway.mode}`);
  }

  async createCheckout(orderId: string): Promise<RazorpayCheckoutPayload> {
    const order = await this.orders.findById(orderId);
    if (order.status !== 'awaiting_payment') {
      throw new BadRequestException('Order is not awaiting payment');
    }
    if (order.payments.some((p) => p.method === 'pay_at_counter' && p.status === 'pending')) {
      throw new BadRequestException('This order is pay-at-counter; do not use Razorpay');
    }
    return this.gateway.createCheckout({
      orderId,
      amountPaise: order.totalAmount,
      receipt: order.token,
    });
  }

  /** Dev-only confirm when using FakePaymentGateway. */
  async mockConfirm(orderId: string, razorpayOrderId: string): Promise<OrderDetail> {
    if (this.gateway.mode !== 'fake') {
      throw new BadRequestException('Mock confirm only available with PAYMENT_ADAPTER=fake');
    }
    if (process.env.ALLOW_FAKE_PAYMENTS !== '1') {
      throw new BadRequestException(
        'Mock confirm disabled — set ALLOW_FAKE_PAYMENTS=1 for local fake checkout',
      );
    }
    return this.orders.markPaymentPaid(orderId, razorpayOrderId, 'upi');
  }

  async handleWebhook(rawBody: Buffer, signature: string | undefined) {
    const parsed = await this.gateway.verifyAndParseWebhook(rawBody, signature);
    if (!parsed.cafeOrderId || !parsed.paymentId) {
      this.logger.warn(`Webhook ignored (missing ids): ${parsed.event}`);
      return { ok: true, ignored: true };
    }

    if (
      parsed.event === 'payment.captured' ||
      parsed.status === 'captured' ||
      parsed.event === 'order.paid'
    ) {
      await this.orders.markPaymentPaid(parsed.cafeOrderId, parsed.paymentId, 'upi');
      return { ok: true, orderId: parsed.cafeOrderId };
    }

    if (parsed.event === 'payment.failed' || parsed.status === 'failed') {
      await this.orders.markPaymentFailed(parsed.cafeOrderId);
      return { ok: true, orderId: parsed.cafeOrderId, failed: true };
    }

    return { ok: true, ignored: true };
  }
}

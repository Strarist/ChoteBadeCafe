import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import type {
  OrderDetail,
  PaymentMethod,
  RazorpayCheckoutPayload,
  RazorpayConfirmInput,
} from '@cafe/shared-types';
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

  onlinePayEnabled(): boolean {
    return this.gateway.mode === 'live' || process.env.ALLOW_FAKE_PAYMENTS === '1';
  }

  async createCheckout(orderId: string): Promise<RazorpayCheckoutPayload> {
    if (!this.onlinePayEnabled()) {
      throw new BadRequestException(
        'Online payment is not available yet. Please pay at the counter.',
      );
    }

    const order = await this.orders.findById(orderId);
    if (order.status !== 'awaiting_payment') {
      throw new BadRequestException('Order is not awaiting payment');
    }
    if (order.payments.some((p) => p.method === 'pay_at_counter' && p.status === 'pending')) {
      throw new BadRequestException('This order is pay-at-counter; do not use Razorpay');
    }
    if (!Number.isInteger(order.totalAmount) || order.totalAmount < 100) {
      throw new BadRequestException(
        `Order total must be at least 100 paise (₹1). Got ${order.totalAmount}.`,
      );
    }

    const payload = await this.gateway.createCheckout({
      orderId,
      amountPaise: order.totalAmount,
      receipt: order.token,
      customer: {
        name: order.customer.name,
        email: order.customer.email,
        mobile: order.customer.mobile,
      },
    });

    await this.orders.attachGatewayOrderId(orderId, payload.razorpayOrderId);
    return payload;
  }

  /** Checkout.js success handler — verifies payment signature then marks paid. */
  async confirmPayment(orderId: string, input: RazorpayConfirmInput): Promise<OrderDetail> {
    if (!this.onlinePayEnabled()) {
      throw new BadRequestException(
        'Online payment is not available yet. Please pay at the counter.',
      );
    }
    if (!input.razorpayOrderId || !input.razorpayPaymentId || !input.razorpaySignature) {
      throw new BadRequestException('Missing Razorpay payment confirmation fields');
    }

    const order = await this.orders.findById(orderId);
    if (order.status !== 'awaiting_payment' && order.paymentStatus !== 'paid') {
      throw new BadRequestException('Order is not awaiting payment');
    }
    if (order.paymentStatus === 'paid') {
      return order;
    }

    const pending = order.payments.find((p) => p.status === 'pending');
    if (!pending) {
      throw new BadRequestException('No pending payment for this order');
    }
    if (pending.method === 'pay_at_counter') {
      throw new BadRequestException('This order is pay-at-counter; do not use Razorpay');
    }
    if (pending.gatewayOrderId && pending.gatewayOrderId !== input.razorpayOrderId) {
      throw new BadRequestException('Razorpay order id does not match this cafe order');
    }
    if (!Number.isInteger(pending.amount) || pending.amount < 100) {
      throw new BadRequestException('Invalid payment amount (minimum 100 paise)');
    }

    if (!this.gateway.verifyCheckoutSignature(input)) {
      throw new BadRequestException('Invalid Razorpay payment signature');
    }

    return this.orders.markPaymentPaid(orderId, input.razorpayPaymentId, pending.method);
  }

  /** Dev-only confirm when using FakePaymentGateway. */
  async mockConfirm(orderId: string, razorpayOrderId: string): Promise<OrderDetail> {
    if (this.gateway.mode !== 'fake') {
      throw new BadRequestException('Mock confirm only available with PAYMENT_ADAPTER=fake');
    }
    if (process.env.ALLOW_FAKE_PAYMENTS !== '1') {
      throw new BadRequestException(
        'Online payment is not available yet. Please pay at the counter.',
      );
    }
    await this.orders.attachGatewayOrderId(orderId, razorpayOrderId);
    return this.orders.markPaymentPaid(orderId, razorpayOrderId, 'upi');
  }

  async handleWebhook(rawBody: Buffer, signature: string | undefined) {
    const parsed = await this.gateway.verifyAndParseWebhook(rawBody, signature);
    if (!parsed.cafeOrderId) {
      this.logger.warn(`Webhook ignored (missing cafe_order_id): ${parsed.event}`);
      return { ok: true, ignored: true };
    }

    if (
      parsed.event === 'payment.captured' ||
      parsed.status === 'captured' ||
      parsed.event === 'order.paid'
    ) {
      if (!parsed.paymentId && !parsed.razorpayOrderId) {
        this.logger.warn(`Webhook ignored (missing payment/order id): ${parsed.event}`);
        return { ok: true, ignored: true };
      }

      const order = await this.orders.findById(parsed.cafeOrderId);
      const pending = order.payments.find((p) => p.status === 'pending');
      if (pending && typeof parsed.amountPaise === 'number' && parsed.amountPaise !== pending.amount) {
        this.logger.error(
          `Webhook amount mismatch for ${parsed.cafeOrderId}: got ${parsed.amountPaise}, expected ${pending.amount}`,
        );
        throw new BadRequestException('Webhook amount does not match order payment');
      }
      if (
        pending?.gatewayOrderId &&
        parsed.razorpayOrderId &&
        pending.gatewayOrderId !== parsed.razorpayOrderId
      ) {
        this.logger.error(
          `Webhook Razorpay order mismatch for ${parsed.cafeOrderId}: got ${parsed.razorpayOrderId}, expected ${pending.gatewayOrderId}`,
        );
        throw new BadRequestException('Webhook Razorpay order id does not match');
      }

      // Prefer payment id; fall back to razorpay order id for order.paid without payment entity
      const gatewayRef = parsed.paymentId ?? `order_paid:${parsed.razorpayOrderId}`;
      const method: PaymentMethod = parsed.method ?? pending?.method ?? 'upi';
      await this.orders.markPaymentPaid(parsed.cafeOrderId, gatewayRef, method);
      return { ok: true, orderId: parsed.cafeOrderId };
    }

    if (parsed.event === 'payment.failed' || parsed.status === 'failed') {
      await this.orders.markPaymentFailed(parsed.cafeOrderId);
      return { ok: true, orderId: parsed.cafeOrderId, failed: true };
    }

    return { ok: true, ignored: true };
  }
}

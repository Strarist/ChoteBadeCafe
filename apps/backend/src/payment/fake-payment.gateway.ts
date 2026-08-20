import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type {
  RazorpayCheckoutPayload,
  RazorpayConfirmInput,
} from '@cafe/shared-types';
import type {
  ParsedPaymentWebhook,
  PaymentGateway,
} from './payment-gateway.interface';
import { parseRazorpayWebhookPayload } from './razorpay-webhook.parser';

/** Local/dev gateway — no network. Swap out when Razorpay keys are live. */
@Injectable()
export class FakePaymentGateway implements PaymentGateway {
  readonly mode = 'fake' as const;

  constructor(private readonly config: ConfigService) {}

  publicKeyId(): string {
    return 'mock';
  }

  createCheckout(input: {
    orderId: string;
    amountPaise: number;
    receipt: string;
    customer?: { name?: string; email?: string | null; mobile?: string };
  }): Promise<RazorpayCheckoutPayload> {
    const name =
      this.config.get<string>('RAZORPAY_CHECKOUT_NAME')?.trim() ||
      'Chote Bade Café';
    const customer = input.customer;
    return Promise.resolve({
      orderId: input.orderId,
      razorpayOrderId: `order_mock_${input.orderId.slice(-8)}_${Date.now()}`,
      amount: input.amountPaise,
      currency: 'INR',
      keyId: 'mock',
      name,
      description: `Order ${input.receipt}`,
      prefill: {
        ...(customer?.name ? { name: customer.name } : {}),
        ...(customer?.email ? { email: customer.email } : {}),
        ...(customer?.mobile ? { contact: customer.mobile } : {}),
      },
    });
  }

  /** Accepts HMAC with secret `mock`, matching Checkout confirm shape for local tests. */
  verifyCheckoutSignature(input: RazorpayConfirmInput): boolean {
    const expected = createHmac('sha256', 'mock')
      .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
      .digest('hex');
    const a = Buffer.from(expected);
    const b = Buffer.from(input.razorpaySignature);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }

  verifyAndParseWebhook(
    rawBody: Buffer,
    signature: string | undefined,
  ): Promise<ParsedPaymentWebhook> {
    void signature;
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException(
        'Unsigned fake payment webhooks are disabled in production',
      );
    }
    return Promise.resolve(parseRazorpayWebhookPayload(rawBody));
  }
}

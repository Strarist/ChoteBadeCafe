import type { RazorpayCheckoutPayload } from '@cafe/shared-types';

export interface PaymentGateway {
  readonly mode: 'fake' | 'live';
  createCheckout(input: {
    orderId: string;
    amountPaise: number;
    receipt: string;
  }): Promise<RazorpayCheckoutPayload>;
  verifyAndParseWebhook(
    rawBody: Buffer,
    signature: string | undefined,
  ): Promise<{
    event: string;
    cafeOrderId?: string;
    paymentId?: string;
    status?: string;
  }>;
}

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

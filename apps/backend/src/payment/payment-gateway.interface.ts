import type {
  PaymentMethod,
  RazorpayCheckoutPayload,
  RazorpayConfirmInput,
} from '@cafe/shared-types';

export type ParsedPaymentWebhook = {
  event: string;
  cafeOrderId?: string;
  paymentId?: string;
  razorpayOrderId?: string;
  status?: string;
  amountPaise?: number;
  method?: PaymentMethod;
};

export interface PaymentGateway {
  readonly mode: 'fake' | 'live';
  createCheckout(input: {
    orderId: string;
    amountPaise: number;
    receipt: string;
    customer?: { name?: string; email?: string | null; mobile?: string };
  }): Promise<RazorpayCheckoutPayload>;
  verifyCheckoutSignature(input: RazorpayConfirmInput): boolean;
  verifyAndParseWebhook(
    rawBody: Buffer,
    signature: string | undefined,
  ): Promise<ParsedPaymentWebhook>;
}

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

/** Map Razorpay payment.method → cafe PaymentMethod. */
export function mapRazorpayMethod(method: string | undefined): PaymentMethod {
  if (method === 'card') return 'card';
  if (method === 'upi') return 'upi';
  if (method === 'qr') return 'qr';
  // netbanking / wallet / emi / etc. — treat as online card-like capture
  if (method === 'netbanking' || method === 'wallet' || method === 'emi') return 'card';
  return 'upi';
}

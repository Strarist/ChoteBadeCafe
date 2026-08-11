import { ForbiddenException, Injectable } from '@nestjs/common';
import type { RazorpayCheckoutPayload } from '@cafe/shared-types';
import type { PaymentGateway } from './payment-gateway.interface';

/** Local/dev gateway — no network. Swap out when Razorpay keys are live. */
@Injectable()
export class FakePaymentGateway implements PaymentGateway {
  readonly mode = 'fake' as const;

  async createCheckout(input: {
    orderId: string;
    amountPaise: number;
    receipt: string;
  }): Promise<RazorpayCheckoutPayload> {
    return {
      orderId: input.orderId,
      razorpayOrderId: `order_mock_${input.orderId.slice(-8)}_${Date.now()}`,
      amount: input.amountPaise,
      currency: 'INR',
      keyId: 'mock',
    };
  }

  async verifyAndParseWebhook(rawBody: Buffer, _signature: string | undefined) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Unsigned fake payment webhooks are disabled in production');
    }
    const payload = JSON.parse(rawBody.toString('utf8')) as {
      event?: string;
      payload?: {
        payment?: {
          entity?: {
            id?: string;
            status?: string;
            notes?: { cafe_order_id?: string };
          };
        };
      };
    };
    return {
      event: payload.event ?? '',
      cafeOrderId: payload.payload?.payment?.entity?.notes?.cafe_order_id,
      paymentId: payload.payload?.payment?.entity?.id,
      status: payload.payload?.payment?.entity?.status,
    };
  }
}

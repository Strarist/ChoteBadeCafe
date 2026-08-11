import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { RazorpayCheckoutPayload } from '@cafe/shared-types';
import type { PaymentGateway } from './payment-gateway.interface';

/**
 * Live Razorpay Orders API + webhook HMAC.
 * Selected when PAYMENT_ADAPTER=live and credentials are present.
 */
@Injectable()
export class RazorpayPaymentGateway implements PaymentGateway {
  readonly mode = 'live' as const;

  constructor(private readonly config: ConfigService) {}

  async createCheckout(input: {
    orderId: string;
    amountPaise: number;
    receipt: string;
  }): Promise<RazorpayCheckoutPayload> {
    const keyId = this.require('RAZORPAY_KEY_ID');
    const keySecret = this.require('RAZORPAY_KEY_SECRET');
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: input.amountPaise,
        currency: 'INR',
        receipt: input.receipt,
        notes: { cafe_order_id: input.orderId },
      }),
    });
    if (!res.ok) {
      throw new ServiceUnavailableException(`Razorpay order create failed: ${await res.text()}`);
    }
    const data = (await res.json()) as { id: string; amount: number };
    return {
      orderId: input.orderId,
      razorpayOrderId: data.id,
      amount: data.amount,
      currency: 'INR',
      keyId,
    };
  }

  async verifyAndParseWebhook(rawBody: Buffer, signature: string | undefined) {
    const secret = this.require('RAZORPAY_WEBHOOK_SECRET');
    if (!signature) {
      throw new ServiceUnavailableException('Missing Razorpay signature');
    }
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new ServiceUnavailableException('Invalid Razorpay signature');
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

  private require(key: string): string {
    const value = this.config.get<string>(key);
    if (!value || value === 'mock') {
      throw new ServiceUnavailableException(
        `${key} is missing. Required for live Razorpay. Refusing payment operation.`,
      );
    }
    return value;
  }
}

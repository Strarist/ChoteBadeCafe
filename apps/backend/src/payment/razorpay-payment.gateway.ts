import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
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

const MIN_AMOUNT_PAISE = 100;

/**
 * Live Razorpay Orders API + Checkout signature + webhook HMAC.
 * Selected when PAYMENT_ADAPTER=live and credentials are present.
 */
@Injectable()
export class RazorpayPaymentGateway implements PaymentGateway {
  readonly mode = 'live' as const;
  private readonly logger = new Logger(RazorpayPaymentGateway.name);

  constructor(private readonly config: ConfigService) {}

  publicKeyId(): string {
    return this.require('RAZORPAY_KEY_ID');
  }

  async createCheckout(input: {
    orderId: string;
    amountPaise: number;
    receipt: string;
    customer?: { name?: string; email?: string | null; mobile?: string };
  }): Promise<RazorpayCheckoutPayload> {
    if (
      !Number.isInteger(input.amountPaise) ||
      input.amountPaise < MIN_AMOUNT_PAISE
    ) {
      throw new BadRequestException(
        `Amount must be at least ${MIN_AMOUNT_PAISE} paise (₹1). Got ${input.amountPaise}.`,
      );
    }

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
        receipt: input.receipt.slice(0, 40),
        notes: { cafe_order_id: input.orderId },
      }),
    });

    if (res.status === 401 || res.status === 403) {
      this.logger.error(
        `Razorpay order create rejected (${res.status}) — check live keys`,
      );
      throw new ServiceUnavailableException(
        'Online payment is temporarily unavailable. Please pay at the counter or try again.',
      );
    }
    if (!res.ok) {
      this.logger.error(
        `Razorpay order create failed (${res.status}): ${await res.text()}`,
      );
      throw new ServiceUnavailableException(
        'Online payment is temporarily unavailable. Please pay at the counter or try again.',
      );
    }

    const data = (await res.json()) as {
      id: string;
      amount: number;
      currency?: string;
    };
    return {
      orderId: input.orderId,
      razorpayOrderId: data.id,
      amount: data.amount,
      currency: 'INR',
      keyId,
      ...this.checkoutBranding(input),
    };
  }

  verifyCheckoutSignature(input: RazorpayConfirmInput): boolean {
    const keySecret = this.require('RAZORPAY_KEY_SECRET');
    const expected = createHmac('sha256', keySecret)
      .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
      .digest('hex');
    return timingSafeEqualUtf8(expected, input.razorpaySignature);
  }

  verifyAndParseWebhook(
    rawBody: Buffer,
    signature: string | undefined,
  ): Promise<ParsedPaymentWebhook> {
    const secret = this.require('RAZORPAY_WEBHOOK_SECRET');
    if (!signature) {
      throw new UnauthorizedException('Missing Razorpay signature');
    }
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    if (!timingSafeEqualUtf8(expected, signature)) {
      throw new UnauthorizedException('Invalid Razorpay signature');
    }
    return Promise.resolve(parseRazorpayWebhookPayload(rawBody));
  }

  private checkoutBranding(input: {
    receipt: string;
    customer?: { name?: string; email?: string | null; mobile?: string };
  }): Pick<
    RazorpayCheckoutPayload,
    'name' | 'description' | 'logo' | 'themeColor' | 'prefill'
  > {
    const name =
      this.config.get<string>('RAZORPAY_CHECKOUT_NAME')?.trim() ||
      'Chote Bade Café';
    const logo =
      this.config.get<string>('RAZORPAY_CHECKOUT_LOGO')?.trim() || undefined;
    const themeColor =
      this.config.get<string>('RAZORPAY_CHECKOUT_THEME_COLOR')?.trim() ||
      undefined;
    const customer = input.customer;
    return {
      name,
      description: `Order ${input.receipt}`,
      ...(logo ? { logo } : {}),
      ...(themeColor ? { themeColor } : {}),
      prefill: {
        ...(customer?.name ? { name: customer.name } : {}),
        ...(customer?.email ? { email: customer.email } : {}),
        ...(customer?.mobile ? { contact: customer.mobile } : {}),
      },
    };
  }

  private require(key: string): string {
    const value = stripEnv(this.config.get<string>(key));
    if (!value || value === 'mock') {
      this.logger.error(
        `${key} is missing or mock — refusing live Razorpay operation`,
      );
      throw new ServiceUnavailableException(
        'Online payment is temporarily unavailable. Please pay at the counter or try again.',
      );
    }
    return value;
  }
}

function timingSafeEqualUtf8(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function stripEnv(value: string | undefined): string {
  return (value ?? '').trim().replace(/^["']|["']$/g, '');
}

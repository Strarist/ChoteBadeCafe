import {
  mapRazorpayMethod,
  type ParsedPaymentWebhook,
} from './payment-gateway.interface';

type RazorpayNotes = { cafe_order_id?: string };

/** Shared parser for live + fake webhook payloads. */
export function parseRazorpayWebhookPayload(
  rawBody: Buffer,
): ParsedPaymentWebhook {
  const payload = JSON.parse(rawBody.toString('utf8')) as {
    event?: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          status?: string;
          amount?: number;
          method?: string;
          notes?: RazorpayNotes;
        };
      };
      order?: {
        entity?: {
          id?: string;
          amount?: number;
          status?: string;
          notes?: RazorpayNotes;
        };
      };
    };
  };

  const payment = payload.payload?.payment?.entity;
  const order = payload.payload?.order?.entity;
  const cafeOrderId =
    payment?.notes?.cafe_order_id ?? order?.notes?.cafe_order_id ?? undefined;
  const amountPaise = payment?.amount ?? order?.amount;

  return {
    event: payload.event ?? '',
    cafeOrderId,
    paymentId: payment?.id,
    razorpayOrderId: payment?.order_id ?? order?.id,
    status: payment?.status ?? order?.status,
    amountPaise: typeof amountPaise === 'number' ? amountPaise : undefined,
    method: payment?.method ? mapRazorpayMethod(payment.method) : undefined,
  };
}

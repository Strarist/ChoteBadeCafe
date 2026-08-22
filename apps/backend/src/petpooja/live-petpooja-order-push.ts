import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OrderDetail, PaymentMethod } from '@cafe/shared-types';
import type {
  PetPoojaOrderPush,
  PetPoojaPushResult,
} from './petpooja-order-push.interface';
import {
  PETPOOJA_SAVE_ORDER_URL,
  isPetPoojaSuccess,
  paiseToRupeeString,
  type PetPoojaCredentials,
  type PetPoojaSaveOrderResponse,
} from './petpooja-api';

/**
 * Live PetPooja order push via Online Ordering API `save_order`.
 * Flip PETPOOJA_ADAPTER=live once PETPOOJA_APP_KEY/SECRET/ACCESS_TOKEN/REST_ID
 * and PUBLIC_API_URL (for callback_url) are set.
 */
@Injectable()
export class LivePetPoojaOrderPush implements PetPoojaOrderPush {
  private readonly logger = new Logger(LivePetPoojaOrderPush.name);

  constructor(private readonly config: ConfigService) {}

  async pushOrder(order: OrderDetail): Promise<PetPoojaPushResult> {
    const creds = this.requireCredentials();
    const callbackUrl = this.callbackUrl();
    const payload = this.buildSaveOrderPayload(order, creds, callbackUrl);

    this.logger.log(
      `PetPooja save_order for cafe order ${order.id} token=${order.token}`,
    );

    let res: Response;
    try {
      res = await fetch(PETPOOJA_SAVE_ORDER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new ServiceUnavailableException(
        `PetPooja save_order network error: ${message}`,
      );
    }

    const text = await res.text();
    let body: PetPoojaSaveOrderResponse = {};
    try {
      body = text ? (JSON.parse(text) as PetPoojaSaveOrderResponse) : {};
    } catch {
      throw new ServiceUnavailableException(
        `PetPooja save_order returned non-JSON (HTTP ${res.status})`,
      );
    }

    if (!res.ok || !isPetPoojaSuccess(body) || !body.orderID) {
      const detail = body.message || text.slice(0, 240) || `HTTP ${res.status}`;
      this.logger.error(`PetPooja save_order rejected: ${detail}`);
      throw new ServiceUnavailableException(
        `PetPooja save_order failed: ${detail}`,
      );
    }

    return {
      petpoojaOrderId: String(body.orderID),
      petpoojaBillId: body.billID
        ? String(body.billID)
        : body.bill_id
          ? String(body.bill_id)
          : undefined,
    };
  }

  private requireCredentials(): PetPoojaCredentials {
    const appKey = this.config.get<string>('PETPOOJA_APP_KEY')?.trim();
    const appSecret = this.config.get<string>('PETPOOJA_APP_SECRET')?.trim();
    const accessToken = this.config.get<string>('PETPOOJA_ACCESS_TOKEN')?.trim();
    const restId = this.config.get<string>('PETPOOJA_REST_ID')?.trim();
    if (!appKey || !appSecret || !accessToken || !restId) {
      throw new ServiceUnavailableException(
        'PetPooja live credentials incomplete. Set PETPOOJA_APP_KEY, PETPOOJA_APP_SECRET, PETPOOJA_ACCESS_TOKEN, PETPOOJA_REST_ID.',
      );
    }
    return { appKey, appSecret, accessToken, restId };
  }

  private callbackUrl(): string {
    const explicit = this.config.get<string>('PETPOOJA_CALLBACK_URL')?.trim();
    if (explicit) return explicit.replace(/\/+$/, '');
    const publicApi = this.config.get<string>('PUBLIC_API_URL')?.trim();
    if (publicApi) {
      return `${publicApi.replace(/\/+$/, '')}/petpooja/webhooks/order-status`;
    }
    throw new ServiceUnavailableException(
      'Set PUBLIC_API_URL (API origin, no trailing slash) or PETPOOJA_CALLBACK_URL so PetPooja can POST status updates.',
    );
  }

  private buildSaveOrderPayload(
    order: OrderDetail,
    creds: PetPoojaCredentials,
    callbackUrl: string,
  ) {
    const createdOn = formatPetPoojaDateTime(new Date(order.createdAt));
    const total = paiseToRupeeString(order.totalAmount);
    const paymentType = mapPaymentType(order);
    const orderType = mapOrderType(order);
    const missingIds = order.items.filter((i) => !i.menuItem.petpoojaItemId);
    if (missingIds.length) {
      throw new ServiceUnavailableException(
        `Cannot push to PetPooja: ${missingIds.length} line item(s) missing petpoojaItemId. Run menu sync first.`,
      );
    }

    const orderItems = order.items.map((item) => {
      const unit = paiseToRupeeString(item.menuItem.price);
      const line = paiseToRupeeString(item.lineTotal);
      return {
        id: item.menuItem.petpoojaItemId!,
        name: item.menuItem.name,
        quantity: String(item.quantity),
        price: unit,
        final_price: line,
        description: item.instructions ?? '',
        variation_name: '',
        variation_id: '',
        gst_liability: '',
        item_discount: '0.00',
        item_tax: [],
      };
    });

    return {
      app_key: creds.appKey,
      app_secret: creds.appSecret,
      access_token: creds.accessToken,
      orderinfo: {
        OrderInfo: {
          Restaurant: {
            details: {
              restID: creds.restId,
            },
          },
          Customer: {
            details: {
              name: order.customer.name,
              phone: order.customer.mobile,
              email: order.customer.email ?? '',
              address: '',
            },
          },
          Order: {
            details: {
              orderID: order.id,
              preorder_date: '',
              preorder_time: '',
              service_charge: '0.00',
              delivery_charges: '0.00',
              packing_charges: '0.00',
              order_type: orderType,
              payment_type: paymentType,
              table_no: order.tableId ?? '',
              discount_total: '0.00',
              tax_total: '0.00',
              total,
              description: `CBC token ${order.token}`,
              created_on: createdOn,
              enable_delivery: orderType === 'D' ? '1' : '0',
              min_prep_time: '15',
              callback_url: callbackUrl,
              collect_cash: paymentType === 'COD' ? '1' : '0',
            },
          },
          OrderItem: {
            details: orderItems,
          },
          Tax: {
            details: [],
          },
          Discount: {
            details: [],
          },
        },
      },
    };
  }
}

function mapPaymentType(order: OrderDetail): string {
  if (order.paymentStatus === 'paid') {
    const method = order.payments.find((p) => p.status === 'success')?.method;
    if (method && isOnlineMethod(method)) return 'ONLINE';
    if (method === 'cash' || method === 'pay_at_counter') return 'COD';
    return 'ONLINE';
  }
  return 'COD';
}

function isOnlineMethod(method: PaymentMethod): boolean {
  return method === 'upi' || method === 'card' || method === 'qr';
}

/** PetPooja: H = dine-in/hotel, P = pickup, D = delivery. */
function mapOrderType(order: OrderDetail): string {
  if (order.source === 'swiggy' || order.source === 'zomato') return 'D';
  if (order.tableId) return 'H';
  if (order.source === 'counter') return 'P';
  return 'P';
}

function formatPetPoojaDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

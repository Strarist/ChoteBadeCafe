import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { OrderDetail, OrderStatus } from '@cafe/shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { OrderService } from '../order/order.service';
import { IntegrationsConfigService } from '../integrations/integrations-config.service';

/**
 * Map PetPooja + legacy status strings → internal OrderStatus.
 * Native PetPooja callbacks use Accept / Reject / Food Ready.
 */
const STATUS_MAP: Record<string, OrderStatus> = {
  // PetPooja Online Ordering callbacks
  accept: 'preparing',
  accepted: 'preparing',
  reject: 'cancelled',
  rejected: 'cancelled',
  foodready: 'ready_for_handover',
  food_ready: 'ready_for_handover',
  // Legacy / internal aliases (fake + smoke)
  preparing: 'preparing',
  prepared: 'preparing',
  in_kitchen: 'preparing',
  ready: 'ready_for_handover',
  ready_for_handover: 'ready_for_handover',
  cancelled: 'cancelled',
  void: 'cancelled',
  unavailable: 'cancelled',
};

@Injectable()
export class PetPoojaWebhookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orders: OrderService,
    private readonly integrations: IntegrationsConfigService,
  ) {}

  /**
   * Authenticate inbound PetPooja webhooks.
   * Accepts (any one):
   * - x-petpooja-signature = HMAC-SHA256 hex of raw body (our smoke/fake contract)
   * - Authorization: Bearer <PETPOOJA_WEBHOOK_SECRET>
   * - x-api-key / x-petpooja-token header equal to the secret
   *
   * PetPooja's public samples omit a signature; ask support to send the Bearer
   * secret on callback, or keep HMAC if they can add a custom header.
   */
  verifyRequest(
    rawBody: Buffer,
    headers: {
      signature?: string;
      authorization?: string;
      apiKey?: string;
      token?: string;
    },
  ): void {
    const secret = this.integrations.petpoojaWebhookSecret();
    if (!secret) {
      throw new UnauthorizedException(
        'PETPOOJA_WEBHOOK_SECRET is required for all PetPooja webhooks',
      );
    }

    const bearer = extractBearer(headers.authorization);
    const headerToken = headers.apiKey || headers.token || bearer;
    if (headerToken && timingSafeEqualString(headerToken, secret)) {
      return;
    }

    if (headers.signature) {
      const expected = createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');
      if (timingSafeEqualString(headers.signature, expected)) {
        return;
      }
      throw new UnauthorizedException('Invalid PetPooja webhook signature');
    }

    throw new UnauthorizedException(
      'Missing PetPooja webhook auth (Bearer/x-api-key/x-petpooja-signature)',
    );
  }

  /** @deprecated use verifyRequest — kept for call-site clarity in older smoke helpers */
  verifySignature(rawBody: Buffer, signature: string | undefined): void {
    this.verifyRequest(rawBody, { signature });
  }

  async handleStatusWebhook(body: Record<string, unknown>): Promise<OrderDetail> {
    const normalized = normalizeStatusBody(body);
    const rawStatus = normalized.status ?? '';
    const mapped = STATUS_MAP[canonicalizeStatus(rawStatus)];
    if (!mapped) {
      throw new BadRequestException(`Unmapped PetPooja status: ${rawStatus}`);
    }

    const orderId = await this.resolveOrderId(normalized);
    if (!orderId) {
      throw new BadRequestException('Order not found for PetPooja webhook');
    }

    const order = await this.orders.findById(orderId);
    const raw = JSON.stringify(body);

    if (mapped === 'ready_for_handover' && order.status === 'confirmed') {
      await this.orders.transition(
        orderId,
        'preparing',
        'petpooja_webhook',
        null,
        { petpoojaStatusRaw: raw },
      );
    }

    // Accept on an already-preparing order is a no-op transition target —
    // transition() itself enforces the state machine.
    const extras =
      mapped === 'ready_for_handover'
        ? {
            petpoojaStatusRaw: raw,
            readyAt: new Date(),
            readyNotificationStatus: 'pending' as const,
          }
        : { petpoojaStatusRaw: raw };

    return this.orders.transition(
      orderId,
      mapped,
      'petpooja_webhook',
      null,
      extras,
    );
  }

  async handleAggregatorOrder(body: {
    source: 'swiggy' | 'zomato';
    customer: { name: string; mobile: string };
    items: Array<{
      menuItemId: string;
      quantity: number;
      instructions?: string;
    }>;
  }): Promise<OrderDetail> {
    return this.orders.create({
      source: body.source,
      customer: body.customer,
      items: body.items,
    });
  }

  /**
   * Optional restID check for live callbacks so a mis-aimed webhook is rejected.
   */
  assertRestIdIfPresent(body: Record<string, unknown>): void {
    const restId = stringField(body, 'restID', 'restId', 'rest_id');
    const expected = this.integrations.petpoojaRestId();
    if (restId && expected && restId !== expected) {
      throw new UnauthorizedException('PetPooja restID does not match this cafe');
    }
  }

  private async resolveOrderId(
    body: NormalizedStatusBody,
  ): Promise<string | undefined> {
    if (body.cafeOrderId) {
      const byId = await this.prisma.order.findUnique({
        where: { id: body.cafeOrderId },
        select: { id: true },
      });
      if (byId) return byId.id;
      const byToken = await this.prisma.order.findFirst({
        where: { token: body.cafeOrderId },
        select: { id: true },
      });
      if (byToken) return byToken.id;
    }

    if (body.petpoojaOrderId) {
      const found = await this.prisma.order.findFirst({
        where: { petpoojaOrderId: body.petpoojaOrderId },
        select: { id: true },
      });
      if (found) return found.id;
    }

    // Native callback only sends orderID — try as cafe id, token, then petpooja id.
    if (body.orderId) {
      const byId = await this.prisma.order.findUnique({
        where: { id: body.orderId },
        select: { id: true },
      });
      if (byId) return byId.id;
      const byToken = await this.prisma.order.findFirst({
        where: { token: body.orderId },
        select: { id: true },
      });
      if (byToken) return byToken.id;
      const byPp = await this.prisma.order.findFirst({
        where: { petpoojaOrderId: body.orderId },
        select: { id: true },
      });
      if (byPp) return byPp.id;
    }

    return undefined;
  }
}

interface NormalizedStatusBody {
  status?: string;
  cafeOrderId?: string;
  petpoojaOrderId?: string;
  orderId?: string;
}

function normalizeStatusBody(body: Record<string, unknown>): NormalizedStatusBody {
  return {
    status: stringField(body, 'status', 'order_status', 'orderStatus'),
    cafeOrderId: stringField(
      body,
      'cafe_order_id',
      'clientOrderID',
      'client_order_id',
    ),
    petpoojaOrderId: stringField(body, 'petpooja_order_id', 'petpoojaOrderId'),
    orderId: stringField(body, 'orderID', 'orderId', 'order_id'),
  };
}

function canonicalizeStatus(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function stringField(
  body: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const v = body[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  }
  return undefined;
}

function extractBearer(authorization: string | undefined): string | undefined {
  if (!authorization) return undefined;
  const m = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  return m?.[1]?.trim();
}

function timingSafeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

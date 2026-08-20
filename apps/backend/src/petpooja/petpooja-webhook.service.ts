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

const STATUS_MAP: Record<string, OrderStatus> = {
  preparing: 'preparing',
  prepared: 'preparing',
  in_kitchen: 'preparing',
  ready: 'ready_for_handover',
  food_ready: 'ready_for_handover',
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
   * Verify PetPooja webhook authenticity when a secret is configured.
   * Exact header/algorithm TBD from partner docs (§9) — HMAC-SHA256 of raw body is the placeholder contract.
   */
  verifySignature(rawBody: Buffer, signature: string | undefined): void {
    const secret = this.integrations.petpoojaWebhookSecret();
    if (!secret) {
      throw new UnauthorizedException(
        'PETPOOJA_WEBHOOK_SECRET is required for all PetPooja webhooks (set a dev secret in fake mode)',
      );
    }
    if (!signature) {
      throw new UnauthorizedException('Missing PetPooja webhook signature');
    }
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Invalid PetPooja webhook signature');
    }
  }

  async handleStatusWebhook(body: {
    petpooja_order_id?: string;
    cafe_order_id?: string;
    status?: string;
    raw?: unknown;
  }): Promise<OrderDetail> {
    const rawStatus = body.status ?? '';
    const mapped = STATUS_MAP[rawStatus.toLowerCase()];
    if (!mapped) {
      throw new BadRequestException(`Unmapped PetPooja status: ${rawStatus}`);
    }

    let orderId = body.cafe_order_id;
    if (!orderId && body.petpooja_order_id) {
      const found = await this.prisma.order.findFirst({
        where: { petpoojaOrderId: body.petpooja_order_id },
      });
      orderId = found?.id;
    }
    if (!orderId)
      throw new BadRequestException('Order not found for PetPooja webhook');

    const order = await this.orders.findById(orderId);
    const raw = JSON.stringify(body.raw ?? body);

    if (mapped === 'ready_for_handover' && order.status === 'confirmed') {
      await this.orders.transition(
        orderId,
        'preparing',
        'petpooja_webhook',
        null,
        {
          petpoojaStatusRaw: raw,
        },
      );
    }

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
}

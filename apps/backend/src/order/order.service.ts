import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type {
  OrderDetail,
  OrderSource,
  OrderStatus,
  OrderStatusLogSource,
  PaymentMethod,
} from '@cafe/shared-types';
import {
  OrderStatus as PrismaOrderStatus,
  OrderStatusLogSource as PrismaLogSource,
  PaymentMethod as PrismaPaymentMethod,
  PaymentRecordStatus,
  PaymentStatus,
  Prisma,
} from '@cafe/database';
import { PrismaService } from '../prisma/prisma.service';
import { OrderTokenService } from './order-token.service';
import { OrderAccessService } from './order-access.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

const ALLOWED: Record<OrderStatus, OrderStatus[]> = {
  cart_building: ['awaiting_payment', 'cancelled'],
  awaiting_payment: ['payment_failed', 'confirmed', 'cancelled'],
  payment_failed: ['awaiting_payment', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready_for_handover', 'cancelled'],
  ready_for_handover: ['collected', 'cancelled'],
  collected: [],
  cancelled: [],
};

type OrderInclude = Prisma.OrderGetPayload<{
  include: {
    customer: true;
    items: { include: { menuItem: true } };
    payments: true;
    statusLogs: { orderBy: { timestamp: 'asc' } };
  };
}>;

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: OrderTokenService,
    private readonly orderAccess: OrderAccessService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async create(input: {
    source: OrderSource;
    customer: { name: string; mobile: string; email?: string | null };
    items: Array<{
      menuItemId: string;
      quantity: number;
      instructions?: string | null;
      name?: string | null;
    }>;
    tableId?: string | null;
  }): Promise<OrderDetail> {
    if (!input.items.length) {
      throw new BadRequestException('Order must include at least one item');
    }

    const resolved = await this.resolveAvailableItems(input.items);

    const token = await this.tokens.nextToken();
    const customer = await this.prisma.customer.create({
      data: {
        name: input.customer.name.trim(),
        mobile: input.customer.mobile.trim(),
        email: input.customer.email?.trim() || null,
      },
    });

    const initialStatus: OrderStatus =
      input.source === 'swiggy' || input.source === 'zomato' ? 'confirmed' : 'cart_building';

    const order = await this.prisma.order.create({
      data: {
        token,
        source: input.source,
        status: initialStatus,
        paymentStatus:
          input.source === 'swiggy' || input.source === 'zomato'
            ? PaymentStatus.paid
            : PaymentStatus.pending,
        customerId: customer.id,
        tableId: input.tableId ?? null,
        items: {
          create: resolved.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            instructions: item.instructions ?? null,
          })),
        },
        statusLogs: {
          create: {
            status: initialStatus,
            source: PrismaLogSource.system,
          },
        },
      },
      include: this.detailInclude(),
    });

    const detail = this.toDetail(order);
    detail.accessToken = this.orderAccess.issue(detail.id);
    if (initialStatus === 'confirmed') {
      this.realtime.emitOrderCreated({
        orderId: detail.id,
        token: detail.token,
        status: detail.status,
        source: detail.source,
      });
    }
    return detail;
  }

  async findById(id: string): Promise<OrderDetail> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: this.detailInclude(),
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return this.toDetail(order);
  }

  async listByStatus(status?: OrderStatus): Promise<OrderDetail[]> {
    const orders = await this.prisma.order.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: this.detailInclude(),
    });
    return orders.map((o) => this.toDetail(o));
  }

  async replaceItems(
    orderId: string,
    items: Array<{
      menuItemId: string;
      quantity: number;
      instructions?: string | null;
      name?: string | null;
    }>,
  ): Promise<OrderDetail> {
    const order = await this.requireOrder(orderId);
    if (order.status !== 'cart_building' && order.status !== 'payment_failed') {
      throw new BadRequestException('Items can only be changed before payment');
    }
    if (!items.length) throw new BadRequestException('Order must include at least one item');

    const resolved = await this.resolveAvailableItems(items);

    await this.prisma.$transaction([
      this.prisma.orderItem.deleteMany({ where: { orderId } }),
      this.prisma.orderItem.createMany({
        data: resolved.map((item) => ({
          orderId,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          instructions: item.instructions ?? null,
        })),
      }),
    ]);

    return this.findById(orderId);
  }

  async updateCustomer(
    orderId: string,
    customer: { name: string; mobile: string; email?: string | null },
  ): Promise<OrderDetail> {
    const order = await this.requireOrder(orderId);
    if (order.status !== 'cart_building' && order.status !== 'payment_failed') {
      throw new BadRequestException('Customer details can only be changed before payment');
    }
    await this.prisma.customer.update({
      where: { id: order.customerId },
      data: {
        name: customer.name.trim(),
        mobile: customer.mobile.trim(),
        email: customer.email?.trim() || null,
      },
    });
    return this.findById(orderId);
  }

  async checkout(
    orderId: string,
    method: PaymentMethod,
  ): Promise<OrderDetail> {
    const order = await this.findById(orderId);
    if (order.status !== 'cart_building' && order.status !== 'payment_failed') {
      throw new BadRequestException(`Cannot checkout from status ${order.status}`);
    }
    if (!order.items.length) throw new BadRequestException('Cart is empty');

    await this.prisma.payment.create({
      data: {
        orderId,
        method,
        amount: order.totalAmount,
        status: PaymentRecordStatus.pending,
      },
    });

    return this.transition(orderId, 'awaiting_payment', 'system');
  }

  async confirmCounterPayment(
    orderId: string,
    method: 'upi' | 'card' | 'qr' | 'cash',
    staffUserId?: string,
  ): Promise<OrderDetail> {
    const order = await this.findById(orderId);
    if (order.status !== 'awaiting_payment') {
      throw new BadRequestException('Order is not awaiting payment');
    }

    const pending = order.payments.find(
      (p) => p.status === 'pending' && p.method === 'pay_at_counter',
    );
    if (!pending) {
      throw new BadRequestException('No pending pay-at-counter payment');
    }

    await this.prisma.payment.update({
      where: { id: pending.id },
      data: {
        method,
        status: PaymentRecordStatus.success,
      },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: PaymentStatus.paid },
    });

    return this.transition(orderId, 'confirmed', staffUserId ? 'staff' : 'system', staffUserId);
  }

  /** Persist Razorpay order id on the pending payment row (idempotent). */
  async attachGatewayOrderId(orderId: string, gatewayOrderId: string): Promise<void> {
    const order = await this.findById(orderId);
    const pending = order.payments.find((p) => p.status === 'pending');
    if (!pending) {
      throw new BadRequestException('No pending payment to attach gateway order id');
    }
    if (pending.gatewayOrderId && pending.gatewayOrderId !== gatewayOrderId) {
      throw new BadRequestException('Payment already linked to a different Razorpay order');
    }
    if (pending.gatewayOrderId === gatewayOrderId) return;
    await this.prisma.payment.update({
      where: { id: pending.id },
      data: { gatewayOrderId },
    });
  }

  async markPaymentFailed(orderId: string): Promise<OrderDetail> {
    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: PaymentStatus.failed },
    });
    const detail = await this.transition(orderId, 'payment_failed', 'system');
    this.realtime.emitOrderPaymentFailed({
      orderId: detail.id,
      token: detail.token,
    });
    return detail;
  }

  async markPaymentPaid(
    orderId: string,
    gatewayRef: string,
    method: PaymentMethod = 'upi',
  ): Promise<OrderDetail> {
    const existing = await this.prisma.payment.findUnique({ where: { gatewayRef } });
    if (existing?.status === PaymentRecordStatus.success) {
      return this.findById(orderId);
    }

    const order = await this.findById(orderId);
    const pending = order.payments.find((p) => p.status === 'pending');
    if (pending) {
      await this.prisma.payment.update({
        where: { id: pending.id },
        data: {
          status: PaymentRecordStatus.success,
          gatewayRef,
          method,
        },
      });
    } else {
      await this.prisma.payment.create({
        data: {
          orderId,
          method,
          amount: order.totalAmount,
          gatewayRef,
          status: PaymentRecordStatus.success,
        },
      });
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: PaymentStatus.paid },
    });

    return this.transition(orderId, 'confirmed', 'system');
  }

  async transition(
    orderId: string,
    newStatus: OrderStatus,
    source: OrderStatusLogSource,
    staffUserId?: string | null,
    extras?: {
      petpoojaStatusRaw?: string;
      readyAt?: Date | null;
      readyNotificationStatus?: 'pending' | 'sent' | 'failed' | null;
      readyNotificationChannel?: 'whatsapp' | 'sms' | null;
    },
  ): Promise<OrderDetail> {
    const order = await this.requireOrder(orderId);
    const previous = order.status as OrderStatus;
    if (previous === newStatus) {
      return this.findById(orderId);
    }
    const allowed = ALLOWED[previous] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(`Illegal transition ${previous} → ${newStatus}`);
    }

    await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: newStatus as PrismaOrderStatus,
          petpoojaStatusRaw: extras?.petpoojaStatusRaw ?? undefined,
          readyAt: extras?.readyAt === undefined ? undefined : extras.readyAt,
          readyNotificationStatus: extras?.readyNotificationStatus ?? undefined,
          readyNotificationChannel: extras?.readyNotificationChannel ?? undefined,
          claimLockedUntil: newStatus === 'collected' ? null : undefined,
          claimLockedBy: newStatus === 'collected' ? null : undefined,
        },
      }),
      this.prisma.orderStatusLog.create({
        data: {
          orderId,
          status: newStatus as PrismaOrderStatus,
          source: source as PrismaLogSource,
          staffUserId: staffUserId ?? null,
        },
      }),
    ]);

    this.logger.log(`Order ${orderId}: ${previous} → ${newStatus} (${source})`);
    this.realtime.emitOrderStatusChanged({
      orderId,
      previousStatus: previous,
      newStatus,
    });

    if (newStatus === 'confirmed') {
      const detail = await this.findById(orderId);
      this.realtime.emitOrderCreated({
        orderId: detail.id,
        token: detail.token,
        status: detail.status,
        source: detail.source,
      });
      return detail;
    }

    return this.findById(orderId);
  }

  async claimForCollect(orderId: string, staffUserId: string): Promise<OrderDetail> {
    const order = await this.requireOrder(orderId);
    if (order.status !== 'ready_for_handover') {
      throw new BadRequestException('Order is not ready for handover');
    }
    const now = new Date();
    const lockUntil = new Date(now.getTime() + 30_000);

    const result = await this.prisma.order.updateMany({
      where: {
        id: orderId,
        status: 'ready_for_handover',
        OR: [
          { claimLockedUntil: null },
          { claimLockedUntil: { lte: now } },
          { claimLockedBy: staffUserId },
        ],
      },
      data: {
        claimLockedBy: staffUserId,
        claimLockedUntil: lockUntil,
      },
    });
    if (result.count === 0) {
      throw new BadRequestException('Order is locked by another staff member');
    }
    return this.findById(orderId);
  }

  async collect(orderId: string, staffUserId: string, _staffSessionId?: string): Promise<OrderDetail> {
    const order = await this.requireOrder(orderId);
    if (order.status !== 'ready_for_handover') {
      throw new BadRequestException('Order is not ready for handover');
    }
    const now = new Date();
    if (
      order.claimLockedUntil &&
      order.claimLockedUntil > now &&
      order.claimLockedBy &&
      order.claimLockedBy !== staffUserId
    ) {
      throw new BadRequestException('Order is locked by another staff member');
    }
    return this.transition(orderId, 'collected', 'staff', staffUserId);
  }

  async setPetpoojaPushResult(
    orderId: string,
    result: { orderId?: string; billId?: string; error?: string },
  ): Promise<OrderDetail> {
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        petpoojaOrderId: result.orderId ?? undefined,
        petpoojaBillId: result.billId ?? undefined,
        petpoojaPushFailed: Boolean(result.error),
        petpoojaPushError: result.error ?? null,
      },
    });
    return this.findById(orderId);
  }

  async setReadyNotification(
    orderId: string,
    status: 'pending' | 'sent' | 'failed',
    channel: 'whatsapp' | 'sms',
  ): Promise<OrderDetail> {
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        readyNotificationStatus: status,
        readyNotificationChannel: channel,
      },
    });
    return this.findById(orderId);
  }

  async totalPaise(orderId: string): Promise<number> {
    const detail = await this.findById(orderId);
    return detail.totalAmount;
  }

  private async resolveAvailableItems(
    items: Array<{
      menuItemId: string;
      quantity: number;
      instructions?: string | null;
      name?: string | null;
    }>,
  ) {
    const uniqueIds = [...new Set(items.map((item) => item.menuItemId))];
    const byId = await this.prisma.menuItem.findMany({
      where: { id: { in: uniqueIds }, isAvailable: true },
    });
    const found = new Map(byId.map((item) => [item.id, item]));
    const missing: string[] = [];

    for (const item of items) {
      if (found.has(item.menuItemId)) continue;
      const label = item.name?.trim();
      if (label) {
        const named = await this.prisma.menuItem.findFirst({
          where: { isAvailable: true, name: { equals: label, mode: 'insensitive' } },
        });
        if (named) {
          found.set(item.menuItemId, named);
          continue;
        }
      }
      missing.push(label || item.menuItemId);
    }

    if (missing.length) {
      throw new BadRequestException(
        `One or more menu items are unavailable (${missing.join(', ')}). Clear the cart and add them again from the menu.`,
      );
    }

    return items.map((item) => ({
      menuItemId: found.get(item.menuItemId)!.id,
      quantity: item.quantity,
      instructions: item.instructions ?? null,
    }));
  }

  private async requireOrder(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  private detailInclude() {
    return {
      customer: true,
      items: { include: { menuItem: true } },
      payments: true,
      statusLogs: { orderBy: { timestamp: 'asc' as const } },
    };
  }

  private toDetail(order: OrderInclude): OrderDetail {
    const items = order.items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      instructions: item.instructions,
      menuItem: {
        id: item.menuItem.id,
        name: item.menuItem.name,
        price: item.menuItem.price,
        category: item.menuItem.category,
      },
      lineTotal: item.menuItem.price * item.quantity,
    }));
    const totalAmount = items.reduce((sum, i) => sum + i.lineTotal, 0);

    return {
      id: order.id,
      token: order.token,
      source: order.source,
      status: order.status,
      paymentStatus: order.paymentStatus,
      customerId: order.customerId,
      petpoojaOrderId: order.petpoojaOrderId,
      petpoojaBillId: order.petpoojaBillId,
      petpoojaStatusRaw: order.petpoojaStatusRaw,
      petpoojaPushFailed: Boolean(order.petpoojaPushFailed),
      petpoojaPushError: order.petpoojaPushError,
      readyAt: order.readyAt?.toISOString() ?? null,
      readyNotificationStatus: order.readyNotificationStatus,
      readyNotificationChannel: order.readyNotificationChannel,
      tableId: order.tableId,
      claimLockedUntil: order.claimLockedUntil?.toISOString() ?? null,
      claimLockedBy: order.claimLockedBy,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      customer: {
        id: order.customer.id,
        name: order.customer.name,
        mobile: order.customer.mobile,
        email: order.customer.email,
        createdAt: order.customer.createdAt.toISOString(),
      },
      items,
      payments: order.payments.map((p) => ({
        id: p.id,
        orderId: p.orderId,
        method: p.method,
        amount: p.amount,
        gatewayRef: p.gatewayRef,
        gatewayOrderId: p.gatewayOrderId ?? null,
        status: p.status,
      })),
      statusLogs: order.statusLogs.map((l) => ({
        id: l.id,
        orderId: l.orderId,
        status: l.status,
        staffUserId: l.staffUserId,
        source: l.source,
        timestamp: l.timestamp.toISOString(),
      })),
      totalAmount,
    };
  }
}

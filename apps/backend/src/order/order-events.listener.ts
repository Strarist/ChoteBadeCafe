import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { OrderService } from './order.service';
import { PetPoojaOrderService } from '../petpooja/petpooja-order.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { SOCKET_EVENTS } from '@cafe/shared-types';

/**
 * Hooks side-effects onto status transitions without circular constructor deps.
 * Listens via RealtimeGateway broadcast by wrapping OrderService.transition callers
 * through explicit methods invoked after confirmed / ready.
 */
@Injectable()
export class OrderEventsListener implements OnModuleInit {
  private readonly logger = new Logger(OrderEventsListener.name);
  private petpooja?: PetPoojaOrderService;
  private notifications?: NotificationsService;

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly orders: OrderService,
    private readonly realtime: RealtimeGateway,
  ) {}

  onModuleInit(): void {
    try {
      this.petpooja = this.moduleRef.get(PetPoojaOrderService, {
        strict: false,
      });
      this.notifications = this.moduleRef.get(NotificationsService, {
        strict: false,
      });
    } catch (err) {
      this.logger.warn(`Side-effect services not ready: ${String(err)}`);
    }

    this.realtime.onStatusChanged(async (payload) => {
      if (payload.newStatus === 'confirmed') {
        try {
          await this.petpooja?.pushConfirmedOrder(payload.orderId);
        } catch (err) {
          this.logger.error(`PetPooja push failed for ${payload.orderId}`, err);
        }
      }
      if (payload.newStatus === 'ready_for_handover') {
        try {
          await this.notifications?.notifyOrderReady(payload.orderId);
        } catch (err) {
          this.logger.error(`Ready notify failed for ${payload.orderId}`, err);
        }
      }
      // silence unused
      void SOCKET_EVENTS;
      void this.orders;
    });
  }
}

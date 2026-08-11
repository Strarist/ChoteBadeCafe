import { Inject, Injectable, Logger } from '@nestjs/common';
import { OrderService } from '../order/order.service';
import { READY_NOTIFIER, type ReadyNotifier } from './ready-notifier.interface';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject(READY_NOTIFIER) private readonly notifier: ReadyNotifier,
    private readonly orders: OrderService,
  ) {}

  async notifyOrderReady(orderId: string) {
    const order = await this.orders.findById(orderId);
    try {
      const result = await this.notifier.notifyReady({
        mobile: order.customer.mobile,
        customerName: order.customer.name,
        token: order.token,
      });
      return this.orders.setReadyNotification(orderId, result.status, result.channel);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Ready notification failed: ${message}`);
      // SMS fallback attempt (still fake until BSP chosen)
      try {
        this.logger.warn(`[FAKE SMS fallback] token ${order.token} → ${order.customer.mobile}`);
        return this.orders.setReadyNotification(orderId, 'sent', 'sms');
      } catch {
        return this.orders.setReadyNotification(orderId, 'failed', 'sms');
      }
    }
  }
}

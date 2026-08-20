import { Inject, Injectable, Logger } from '@nestjs/common';
import { OrderService } from '../order/order.service';
import {
  PETPOOJA_ORDER_PUSH,
  type PetPoojaOrderPush,
} from './petpooja-order-push.interface';

@Injectable()
export class PetPoojaOrderService {
  private readonly logger = new Logger(PetPoojaOrderService.name);

  constructor(
    @Inject(PETPOOJA_ORDER_PUSH)
    private readonly pushAdapter: PetPoojaOrderPush,
    private readonly orders: OrderService,
  ) {}

  async pushConfirmedOrder(orderId: string) {
    const order = await this.orders.findById(orderId);
    try {
      const result = await this.pushAdapter.pushOrder(order);
      return this.orders.setPetpoojaPushResult(orderId, {
        orderId: result.petpoojaOrderId,
        billId: result.petpoojaBillId,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Push failed for ${orderId}: ${message}`);
      return this.orders.setPetpoojaPushResult(orderId, { error: message });
    }
  }

  async retryPush(orderId: string) {
    return this.pushConfirmedOrder(orderId);
  }
}

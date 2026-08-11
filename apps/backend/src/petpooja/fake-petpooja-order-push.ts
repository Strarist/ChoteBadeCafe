import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OrderDetail } from '@cafe/shared-types';
import type { PetPoojaOrderPush, PetPoojaPushResult } from './petpooja-order-push.interface';

@Injectable()
export class FakePetPoojaOrderPush implements PetPoojaOrderPush {
  private readonly logger = new Logger(FakePetPoojaOrderPush.name);

  constructor(private readonly config: ConfigService) {}

  async pushOrder(order: OrderDetail): Promise<PetPoojaPushResult> {
    if (this.config.get<string>('PETPOOJA_FORCE_FAIL') === '1') {
      throw new Error('Forced PetPooja push failure (PETPOOJA_FORCE_FAIL=1)');
    }
    const petpoojaOrderId = `pp_ord_${order.token}_${Date.now()}`;
    const petpoojaBillId = `pp_bill_${order.token}`;
    this.logger.log(
      `Fake PetPooja push for ${order.id} token=${order.token} → ${petpoojaOrderId}`,
    );
    return { petpoojaOrderId, petpoojaBillId };
  }
}

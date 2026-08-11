import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OrderDetail } from '@cafe/shared-types';
import type { PetPoojaOrderPush, PetPoojaPushResult } from './petpooja-order-push.interface';

/**
 * Live PetPooja push — scaffold only until partner API docs/credentials (§9).
 * Selecting PETPOOJA_ADAPTER=live without a finished impl fails loudly on push.
 */
@Injectable()
export class LivePetPoojaOrderPush implements PetPoojaOrderPush {
  private readonly logger = new Logger(LivePetPoojaOrderPush.name);

  constructor(private readonly config: ConfigService) {}

  async pushOrder(order: OrderDetail): Promise<PetPoojaPushResult> {
    const appKey = this.config.get<string>('PETPOOJA_APP_KEY');
    const restId = this.config.get<string>('PETPOOJA_REST_ID');
    const token = this.config.get<string>('PETPOOJA_ACCESS_TOKEN');
    if (!appKey || !restId || !token) {
      throw new ServiceUnavailableException(
        'PetPooja live credentials incomplete. Refusing push.',
      );
    }

    // Payload shape reserved for real contract — do not invent endpoints.
    this.logger.warn(
      `Live PetPooja push requested for ${order.id} but HTTP mapping is not implemented yet (awaiting partner docs).`,
    );
    throw new ServiceUnavailableException(
      'Live PetPooja push is not implemented yet. Keep PETPOOJA_ADAPTER=fake until sandbox docs arrive (§9).',
    );
  }
}

import {
  Body,
  Controller,
  Headers,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { OrderDetail } from '@cafe/shared-types';
import { PetPoojaOrderService } from './petpooja-order.service';
import { PetPoojaWebhookService } from './petpooja-webhook.service';
import { MenuService } from '../menu/menu.service';
import { StaffAuthGuard } from '../auth/staff-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('petpooja')
export class PetPoojaController {
  constructor(
    private readonly orders: PetPoojaOrderService,
    private readonly webhooks: PetPoojaWebhookService,
    private readonly menu: MenuService,
  ) {}

  @Post('orders/:orderId/retry-push')
  @UseGuards(StaffAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  retry(@Param('orderId') orderId: string): Promise<OrderDetail> {
    return this.orders.retryPush(orderId);
  }

  /** Order status callback_url target (PetPooja → us). */
  @Post('webhooks/order-status')
  async statusWebhook(
    @Req() req: { rawBody?: Buffer; body: unknown },
    @Headers('x-petpooja-signature') signature: string | undefined,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-api-key') apiKey: string | undefined,
    @Headers('x-petpooja-token') token: string | undefined,
    @Body() body: Record<string, unknown>,
  ): Promise<OrderDetail> {
    this.authenticate(req, { signature, authorization, apiKey, token });
    this.webhooks.assertRestIdIfPresent(body ?? {});
    return this.webhooks.handleStatusWebhook(body ?? {});
  }

  /**
   * Push Menu callback — PetPooja POSTs when the restaurant catalog changes.
   * We re-pull via mapped_restaurant_menus (same shape) so mapping stays one place.
   */
  @Post('webhooks/push-menu')
  async pushMenuWebhook(
    @Req() req: { rawBody?: Buffer; body: unknown },
    @Headers('x-petpooja-signature') signature: string | undefined,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-api-key') apiKey: string | undefined,
    @Headers('x-petpooja-token') token: string | undefined,
    @Body() body: Record<string, unknown>,
  ): Promise<{ ok: true; upserted: number }> {
    this.authenticate(req, { signature, authorization, apiKey, token });
    this.webhooks.assertRestIdIfPresent(body ?? {});
    const upserted = await this.menu.syncFromPetPooja();
    return { ok: true, upserted };
  }

  @Post('webhooks/aggregator-order')
  aggregatorWebhook(
    @Req() req: { rawBody?: Buffer; body: unknown },
    @Headers('x-petpooja-signature') signature: string | undefined,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-api-key') apiKey: string | undefined,
    @Headers('x-petpooja-token') token: string | undefined,
    @Body()
    body: {
      source: 'swiggy' | 'zomato';
      customer: { name: string; mobile: string };
      items: Array<{
        menuItemId: string;
        quantity: number;
        instructions?: string;
      }>;
    },
  ): Promise<OrderDetail> {
    this.authenticate(req, { signature, authorization, apiKey, token });
    return this.webhooks.handleAggregatorOrder(body);
  }

  private authenticate(
    req: { rawBody?: Buffer; body: unknown },
    headers: {
      signature?: string;
      authorization?: string;
      apiKey?: string;
      token?: string;
    },
  ): void {
    const raw =
      req.rawBody ??
      Buffer.from(
        typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body ?? {}),
      );
    try {
      this.webhooks.verifyRequest(raw, headers);
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('PetPooja webhook rejected');
    }
  }
}

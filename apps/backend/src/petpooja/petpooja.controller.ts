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
import { StaffAuthGuard } from '../auth/staff-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('petpooja')
export class PetPoojaController {
  constructor(
    private readonly orders: PetPoojaOrderService,
    private readonly webhooks: PetPoojaWebhookService,
  ) {}

  @Post('orders/:orderId/retry-push')
  @UseGuards(StaffAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  retry(@Param('orderId') orderId: string): Promise<OrderDetail> {
    return this.orders.retryPush(orderId);
  }

  @Post('webhooks/order-status')
  statusWebhook(
    @Req() req: { rawBody?: Buffer; body: unknown },
    @Headers('x-petpooja-signature') signature: string | undefined,
    @Body()
    body: {
      petpooja_order_id?: string;
      cafe_order_id?: string;
      status?: string;
      raw?: unknown;
    },
  ): Promise<OrderDetail> {
    const raw =
      req.rawBody ??
      Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {}));
    try {
      this.webhooks.verifySignature(raw, signature);
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('PetPooja webhook rejected');
    }
    return this.webhooks.handleStatusWebhook(body);
  }

  @Post('webhooks/aggregator-order')
  aggregatorWebhook(
    @Req() req: { rawBody?: Buffer; body: unknown },
    @Headers('x-petpooja-signature') signature: string | undefined,
    @Body()
    body: {
      source: 'swiggy' | 'zomato';
      customer: { name: string; mobile: string };
      items: Array<{ menuItemId: string; quantity: number; instructions?: string }>;
    },
  ): Promise<OrderDetail> {
    const raw =
      req.rawBody ??
      Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {}));
    this.webhooks.verifySignature(raw, signature);
    return this.webhooks.handleAggregatorOrder(body);
  }
}

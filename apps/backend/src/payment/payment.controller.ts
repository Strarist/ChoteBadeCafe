import {
  Body,
  Controller,
  Headers,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { OrderDetail, RazorpayCheckoutPayload } from '@cafe/shared-types';
import { PaymentService } from './payment.service';
import { OrderOrStaffAccessGuard } from '../auth/order-or-staff.guard';

@Controller('payments')
export class PaymentController {
  constructor(private readonly payments: PaymentService) {}

  @Post('orders/:orderId/checkout')
  @UseGuards(OrderOrStaffAccessGuard('orderId'))
  createCheckout(@Param('orderId') orderId: string): Promise<RazorpayCheckoutPayload> {
    return this.payments.createCheckout(orderId);
  }

  @Post('orders/:orderId/mock-confirm')
  @UseGuards(OrderOrStaffAccessGuard('orderId'))
  mockConfirm(
    @Param('orderId') orderId: string,
    @Body() body: { razorpayOrderId: string },
  ): Promise<OrderDetail> {
    return this.payments.mockConfirm(orderId, body.razorpayOrderId);
  }

  @Post('webhooks/razorpay')
  async razorpayWebhook(
    @Req() req: { rawBody?: Buffer; body: unknown },
    @Headers('x-razorpay-signature') signature?: string,
  ) {
    const raw =
      req.rawBody ??
      Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {}));
    return this.payments.handleWebhook(raw, signature);
  }
}

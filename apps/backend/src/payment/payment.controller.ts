import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type {
  OrderDetail,
  RazorpayCheckoutPayload,
  RazorpayConfirmInput,
} from '@cafe/shared-types';
import { PaymentService } from './payment.service';
import { OrderOrStaffAccessGuard } from '../auth/order-or-staff.guard';

@Controller('payments')
export class PaymentController {
  constructor(private readonly payments: PaymentService) {}

  @Get('online')
  onlineAvailability(): { available: boolean } {
    return { available: this.payments.onlinePayEnabled() };
  }

  @Post('orders/:orderId/checkout')
  @UseGuards(OrderOrStaffAccessGuard('orderId'))
  createCheckout(
    @Param('orderId') orderId: string,
  ): Promise<RazorpayCheckoutPayload> {
    return this.payments.createCheckout(orderId);
  }

  @Post('orders/:orderId/confirm')
  @UseGuards(OrderOrStaffAccessGuard('orderId'))
  confirmPayment(
    @Param('orderId') orderId: string,
    @Body() body: RazorpayConfirmInput,
  ): Promise<OrderDetail> {
    return this.payments.confirmPayment(orderId, {
      razorpayOrderId: body.razorpayOrderId,
      razorpayPaymentId: body.razorpayPaymentId,
      razorpaySignature: body.razorpaySignature,
    });
  }

  @Post('orders/:orderId/mock-confirm')
  @UseGuards(OrderOrStaffAccessGuard('orderId'))
  mockConfirm(
    @Param('orderId') orderId: string,
    @Body() body: { razorpayOrderId: string },
  ): Promise<OrderDetail> {
    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException(
        'Online payment is not available yet. Please pay at the counter.',
      );
    }
    return this.payments.mockConfirm(orderId, body.razorpayOrderId);
  }

  @Post('webhooks/razorpay')
  async razorpayWebhook(
    @Req() req: { rawBody?: Buffer; body: unknown },
    @Headers('x-razorpay-signature') signature?: string,
  ) {
    const raw =
      req.rawBody ??
      Buffer.from(
        typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body ?? {}),
      );
    return this.payments.handleWebhook(raw, signature);
  }
}

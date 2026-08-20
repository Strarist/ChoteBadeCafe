import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { OrderDetail, OrderStatus } from '@cafe/shared-types';
import { OrderService } from './order.service';
import {
  CheckoutDto,
  ClaimOrderDto,
  CollectOrderDto,
  ConfirmCounterPaymentDto,
  CreateOrderDto,
  ReplaceItemsDto,
  UpdateCustomerDto,
} from './dto/order.dto';
import {
  StaffAuthGuard,
  type AuthenticatedRequest,
} from '../auth/staff-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrderOrStaffAccessGuard } from '../auth/order-or-staff.guard';
import { InMemoryRateLimit } from '../common/in-memory-rate-limit';
import type { Request } from 'express';

@Controller('orders')
export class OrderController {
  private readonly createIpLimit = new InMemoryRateLimit(120, 60 * 1000);

  constructor(private readonly orders: OrderService) {}

  @Post()
  create(
    @Req() req: Request,
    @Body() dto: CreateOrderDto,
  ): Promise<OrderDetail> {
    this.createIpLimit.hit(`orders:${req.ip ?? 'unknown'}`);
    return this.orders.create(dto);
  }

  @Get()
  @UseGuards(StaffAuthGuard, RolesGuard)
  @Roles('admin', 'manager', 'cashier')
  list(@Query('status') status?: OrderStatus): Promise<OrderDetail[]> {
    return this.orders.listByStatus(status);
  }

  @Get(':id')
  @UseGuards(OrderOrStaffAccessGuard('id'))
  get(@Param('id') id: string): Promise<OrderDetail> {
    return this.orders.findById(id);
  }

  @Patch(':id/items')
  @UseGuards(OrderOrStaffAccessGuard('id'))
  replaceItems(
    @Param('id') id: string,
    @Body() dto: ReplaceItemsDto,
  ): Promise<OrderDetail> {
    return this.orders.replaceItems(id, dto.items);
  }

  @Patch(':id/customer')
  @UseGuards(OrderOrStaffAccessGuard('id'))
  updateCustomer(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ): Promise<OrderDetail> {
    return this.orders.updateCustomer(id, dto.customer);
  }

  @Post(':id/checkout')
  @UseGuards(OrderOrStaffAccessGuard('id'))
  checkout(
    @Param('id') id: string,
    @Body() dto: CheckoutDto,
  ): Promise<OrderDetail> {
    return this.orders.checkout(id, dto.method);
  }

  @Post(':id/confirm-counter-payment')
  @UseGuards(StaffAuthGuard, RolesGuard)
  @Roles('admin', 'manager', 'cashier')
  confirmCounterPayment(
    @Param('id') id: string,
    @Body() dto: ConfirmCounterPaymentDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<OrderDetail> {
    return this.orders.confirmCounterPayment(
      id,
      dto.method,
      req.staff!.staffUserId,
    );
  }

  @Post(':id/preparing')
  @UseGuards(StaffAuthGuard, RolesGuard)
  @Roles('admin', 'manager', 'cashier')
  markPreparing(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<OrderDetail> {
    return this.orders.markPreparing(id, req.staff!.staffUserId);
  }

  @Post(':id/ready')
  @UseGuards(StaffAuthGuard, RolesGuard)
  @Roles('admin', 'manager', 'cashier')
  markReady(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<OrderDetail> {
    return this.orders.markReady(id, req.staff!.staffUserId);
  }

  @Post(':id/claim')
  @UseGuards(StaffAuthGuard, RolesGuard)
  @Roles('admin', 'manager', 'cashier')
  claim(
    @Param('id') id: string,
    @Body() dto: ClaimOrderDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<OrderDetail> {
    return this.orders.claimForCollect(id, req.staff!.staffUserId);
  }

  @Post(':id/collect')
  @UseGuards(StaffAuthGuard, RolesGuard)
  @Roles('admin', 'manager', 'cashier')
  collect(
    @Param('id') id: string,
    @Body() dto: CollectOrderDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<OrderDetail> {
    return this.orders.collect(id, req.staff!.staffUserId, dto.staffSessionId);
  }

  @Post(':id/cancel')
  @UseGuards(StaffAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  cancel(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<OrderDetail> {
    return this.orders.transition(
      id,
      'cancelled',
      'staff',
      req.staff!.staffUserId,
    );
  }
}

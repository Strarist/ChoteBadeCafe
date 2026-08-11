import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import type { OrderDetail, StaffRole, StaffUser } from '@cafe/shared-types';
import { AuthService } from '../auth/auth.service';
import { StaffAuthGuard, type AuthenticatedRequest } from '../auth/staff-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MenuService } from '../menu/menu.service';
import { OrderService } from '../order/order.service';
import { PetPoojaOrderService } from '../petpooja/petpooja-order.service';
import { IntegrationsConfigService } from '../integrations/integrations-config.service';
import { ROLE_PERMISSIONS } from '@cafe/shared-types';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

class CreateStaffDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsIn(['admin', 'manager', 'cashier'])
  role!: StaffRole;

  @IsString()
  @MinLength(4)
  pin!: string;
}

class UpdateStaffDto {
  @IsOptional()
  @IsIn(['admin', 'manager', 'cashier'])
  role?: StaffRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(4)
  pin?: string;
}

@Controller('admin')
@UseGuards(StaffAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly auth: AuthService,
    private readonly menu: MenuService,
    private readonly orders: OrderService,
    private readonly petpooja: PetPoojaOrderService,
    private readonly integrations: IntegrationsConfigService,
  ) {}

  @Get('me')
  @Roles('admin', 'manager', 'cashier')
  me(@Req() req: AuthenticatedRequest) {
    const role = req.staff!.role;
    return {
      staff: req.staff,
      permissions: ROLE_PERMISSIONS[role],
    };
  }

  @Get('integrations')
  @Roles('admin', 'manager')
  integrationsStatus() {
    return this.integrations.getReadiness();
  }

  @Get('orders')
  @Roles('admin', 'manager')
  listOrders(): Promise<OrderDetail[]> {
    return this.orders.listByStatus();
  }

  @Post('menu/sync')
  @Roles('admin', 'manager')
  syncMenu() {
    return this.menu.syncFromPetPooja();
  }

  @Post('orders/:id/retry-push')
  @Roles('admin', 'manager')
  retryPush(@Param('id') id: string) {
    return this.petpooja.retryPush(id);
  }

  @Post('orders/:id/cancel')
  @Roles('admin', 'manager')
  cancel(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.orders.transition(id, 'cancelled', 'staff', req.staff!.staffUserId);
  }

  @Get('staff')
  @Roles('admin')
  listStaff(): Promise<StaffUser[]> {
    return this.auth.listStaff();
  }

  @Post('staff')
  @Roles('admin')
  createStaff(@Body() dto: CreateStaffDto): Promise<StaffUser> {
    return this.auth.createStaff(dto);
  }

  @Patch('staff/:id')
  @Roles('admin')
  updateStaff(@Param('id') id: string, @Body() dto: UpdateStaffDto): Promise<StaffUser> {
    return this.auth.updateStaff(id, dto);
  }
}

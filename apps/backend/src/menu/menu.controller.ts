import { Controller, Get, Post, HttpCode, UseGuards } from '@nestjs/common';
import type { MenuItem } from '@cafe/shared-types';
import { MenuService } from './menu.service';
import { StaffAuthGuard } from '../auth/staff-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  async list(): Promise<MenuItem[]> {
    return this.menuService.listAvailable();
  }

  /** Ops trigger — admin/manager only (also available via /admin/menu/sync). */
  @Post('sync')
  @HttpCode(200)
  @UseGuards(StaffAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  async sync(): Promise<{ upserted: number }> {
    const upserted = await this.menuService.syncFromPetPooja();
    return { upserted };
  }
}

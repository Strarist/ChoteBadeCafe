import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { StaffAuthGuard } from './staff-auth.guard';
import { RolesGuard } from './roles.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, StaffAuthGuard, RolesGuard],
  exports: [AuthService, StaffAuthGuard, RolesGuard],
})
export class AuthModule {}

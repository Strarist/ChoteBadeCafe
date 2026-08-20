import { Body, Controller, Post, Req } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import type { Request } from 'express';
import type { StaffLoginResponse } from '@cafe/shared-types';
import { AuthService } from './auth.service';
import { InMemoryRateLimit } from '../common/in-memory-rate-limit';

class LoginDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(4)
  pin!: string;
}

@Controller('auth')
export class AuthController {
  private readonly loginIpLimit = new InMemoryRateLimit(20, 15 * 60 * 1000);

  constructor(private readonly auth: AuthService) {}

  @Post('staff/login')
  login(
    @Req() req: Request,
    @Body() dto: LoginDto,
  ): Promise<StaffLoginResponse> {
    this.loginIpLimit.hit(`login:${req.ip ?? 'unknown'}`);
    return this.auth.login(dto.name, dto.pin);
  }
}

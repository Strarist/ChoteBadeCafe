import { Body, Controller, Post } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import type { StaffLoginResponse } from '@cafe/shared-types';
import { AuthService } from './auth.service';

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
  constructor(private readonly auth: AuthService) {}

  @Post('staff/login')
  login(@Body() dto: LoginDto): Promise<StaffLoginResponse> {
    return this.auth.login(dto.name, dto.pin);
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { StaffSessionPayload } from '@cafe/shared-types';

export type AuthenticatedRequest = {
  headers: { authorization?: string };
  staff?: StaffSessionPayload;
};

@Injectable()
export class StaffAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Staff token required');
    }
    req.staff = await this.auth.verifyTokenLive(header.slice(7));
    return true;
  }
}

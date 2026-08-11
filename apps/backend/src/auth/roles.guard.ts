import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { StaffRole } from '@cafe/shared-types';
import { ROLES_KEY } from './roles.decorator';
import type { AuthenticatedRequest } from './staff-auth.guard';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<StaffRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!req.staff || !roles.includes(req.staff.role)) {
      throw new ForbiddenException(`Requires role: ${roles.join(' | ')}`);
    }
    return true;
  }
}

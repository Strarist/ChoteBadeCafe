import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  mixin,
  type Type,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { OrderAccessService } from '../order/order-access.service';
import type { StaffSessionPayload } from '@cafe/shared-types';

type AccessRequest = {
  headers: { authorization?: string; 'x-order-access'?: string };
  params: { id?: string; orderId?: string };
  staff?: StaffSessionPayload;
};

/**
 * Allows either a valid staff Bearer token OR an X-Order-Access token for the order id param.
 */
export function OrderOrStaffAccessGuard(
  paramName: 'id' | 'orderId' = 'id',
): Type<CanActivate> {
  @Injectable()
  class MixedGuard implements CanActivate {
    constructor(
      private readonly auth: AuthService,
      private readonly orderAccess: OrderAccessService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const req = context.switchToHttp().getRequest<AccessRequest>();
      const orderId = req.params[paramName];
      if (!orderId) throw new UnauthorizedException('Order id required');

      const header = req.headers.authorization;
      if (header?.startsWith('Bearer ')) {
        req.staff = await this.auth.verifyTokenLive(header.slice(7));
        return true;
      }

      const access = req.headers['x-order-access'];
      if (access && this.orderAccess.verify(access, orderId)) {
        return true;
      }

      throw new UnauthorizedException('Order access or staff token required');
    }
  }

  return mixin(MixedGuard);
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { IntegrationsConfigService } from '../integrations/integrations-config.service';

const ACCESS_TTL_MS = 24 * 60 * 60 * 1000;

type AccessPayload = { orderId: string; exp: number };

@Injectable()
export class OrderAccessService {
  constructor(private readonly integrations: IntegrationsConfigService) {}

  issue(orderId: string): string {
    const payload: AccessPayload = {
      orderId,
      exp: Date.now() + ACCESS_TTL_MS,
    };
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${body}.${this.hmac(body)}`;
  }

  verify(token: string, orderId: string): boolean {
    try {
      const [body, sig] = token.split('.');
      if (!body || !sig) return false;
      const expected = this.hmac(body);
      const a = Buffer.from(expected);
      const b = Buffer.from(sig);
      if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
      const payload = JSON.parse(
        Buffer.from(body, 'base64url').toString('utf8'),
      ) as AccessPayload;
      if (payload.exp < Date.now()) return false;
      return payload.orderId === orderId;
    } catch {
      return false;
    }
  }

  assert(token: string | undefined, orderId: string): void {
    if (!token || !this.verify(token, orderId)) {
      throw new UnauthorizedException('Invalid or missing order access token');
    }
  }

  private hmac(body: string): string {
    return createHmac('sha256', `${this.integrations.sessionSecret()}:order-access`)
      .update(body)
      .digest('base64url');
  }
}

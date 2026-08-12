import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import type {
  StaffLoginResponse,
  StaffRole,
  StaffSessionPayload,
  StaffUser,
} from '@cafe/shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { IntegrationsConfigService } from '../integrations/integrations-config.service';
import { assertPinPolicy } from './pin-policy';

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12h
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;

@Injectable()
export class AuthService {
  private readonly loginAttempts = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly integrations: IntegrationsConfigService,
  ) {}

  async login(name: string, pin: string): Promise<StaffLoginResponse> {
    const key = name.trim().toLowerCase();
    this.assertLoginAllowed(key);

    const staff = await this.prisma.staffUser.findFirst({
      where: { name: { equals: name.trim(), mode: 'insensitive' }, isActive: true },
    });
    if (!staff) {
      this.recordLoginFailure(key);
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(pin, staff.pinHash);
    if (!ok) {
      this.recordLoginFailure(key);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.loginAttempts.delete(key);
    await this.prisma.staffUser.update({
      where: { id: staff.id },
      data: { lastLoginAt: new Date() },
    });

    const exp = Date.now() + TOKEN_TTL_MS;
    const payload: StaffSessionPayload = {
      staffUserId: staff.id,
      name: staff.name,
      role: staff.role,
      exp,
    };
    const token = this.sign(payload);
    return {
      token,
      expiresAt: new Date(exp).toISOString(),
      staff: this.toStaff(staff),
    };
  }

  verifyToken(token: string): StaffSessionPayload {
    const [body, sig] = token.split('.');
    if (!body || !sig) throw new UnauthorizedException('Malformed token');
    const expected = this.hmac(body);
    const a = Buffer.from(expected);
    const b = Buffer.from(sig);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Invalid token');
    }
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as StaffSessionPayload;
    if (payload.exp < Date.now()) throw new UnauthorizedException('Token expired');
    return payload;
  }

  /** Verify HMAC + re-check staff is still active with current role. */
  async verifyTokenLive(token: string): Promise<StaffSessionPayload> {
    const payload = this.verifyToken(token);
    const staff = await this.prisma.staffUser.findUnique({
      where: { id: payload.staffUserId },
    });
    if (!staff || !staff.isActive) {
      throw new UnauthorizedException('Staff session revoked');
    }
    return {
      ...payload,
      name: staff.name,
      role: staff.role,
    };
  }

  private assertLoginAllowed(key: string): void {
    const entry = this.loginAttempts.get(key);
    if (!entry) return;
    if (entry.resetAt < Date.now()) {
      this.loginAttempts.delete(key);
      return;
    }
    if (entry.count >= LOGIN_MAX_ATTEMPTS) {
      throw new UnauthorizedException('Too many login attempts — try again later');
    }
  }

  private recordLoginFailure(key: string): void {
    const now = Date.now();
    const entry = this.loginAttempts.get(key);
    if (!entry || entry.resetAt < now) {
      this.loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
      return;
    }
    entry.count += 1;
  }

  async listStaff(): Promise<StaffUser[]> {
    const rows = await this.prisma.staffUser.findMany({ orderBy: { createdAt: 'asc' } });
    return rows.map((r) => this.toStaff(r));
  }

  async createStaff(input: {
    name: string;
    role: StaffRole;
    pin: string;
  }): Promise<StaffUser> {
    assertPinPolicy(input.pin);
    const existing = await this.prisma.staffUser.findFirst({
      where: { name: { equals: input.name.trim(), mode: 'insensitive' } },
    });
    if (existing) throw new BadRequestException('Staff name already exists');
    const pinHash = await bcrypt.hash(input.pin, 10);
    const created = await this.prisma.staffUser.create({
      data: {
        name: input.name.trim(),
        role: input.role,
        pinHash,
      },
    });
    return this.toStaff(created);
  }

  async updateStaff(
    id: string,
    input: { role?: StaffRole; isActive?: boolean; pin?: string },
  ): Promise<StaffUser> {
    const existing = await this.prisma.staffUser.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Staff not found');
    if (input.pin) assertPinPolicy(input.pin);
    if (input.isActive === false && existing.role === 'admin') {
      const adminCount = await this.prisma.staffUser.count({
        where: { role: 'admin', isActive: true },
      });
      if (adminCount <= 1) {
        throw new ForbiddenException('Cannot deactivate the last active admin');
      }
    }
    const pinHash = input.pin ? await bcrypt.hash(input.pin, 10) : undefined;
    const updated = await this.prisma.staffUser.update({
      where: { id },
      data: {
        role: input.role,
        isActive: input.isActive,
        pinHash,
      },
    });
    return this.toStaff(updated);
  }

  private sign(payload: StaffSessionPayload): string {
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${body}.${this.hmac(body)}`;
  }

  private hmac(body: string): string {
    return createHmac('sha256', this.integrations.sessionSecret()).update(body).digest('base64url');
  }

  private toStaff(row: {
    id: string;
    name: string;
    role: StaffRole;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
  }): StaffUser {
    return {
      id: row.id,
      name: row.name,
      role: row.role,
      isActive: row.isActive,
      lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    };
  }
}

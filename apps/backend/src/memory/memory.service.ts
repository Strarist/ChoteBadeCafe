import { randomBytes } from 'node:crypto';
import { mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { MemoryPin as MemoryPinDto } from '@cafe/shared-types';
import { MemoryPinStatus } from '@cafe/database';
import { PrismaService } from '../prisma/prisma.service';

const MAX_BYTES = 2.5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

@Injectable()
export class MemoryService {
  constructor(private readonly prisma: PrismaService) {}

  uploadRoot() {
    return process.env.MEMORY_UPLOAD_DIR?.trim() || join(process.cwd(), 'uploads', 'memory');
  }

  private ensureUploadDir() {
    mkdirSync(this.uploadRoot(), { recursive: true });
  }

  private toDto(row: {
    id: string;
    names: string;
    story: string;
    imageUrl: string;
    status: MemoryPinStatus;
    staffPick: boolean;
    createdAt: Date;
    moderatedAt: Date | null;
    rejectReason: string | null;
  }): MemoryPinDto {
    return {
      id: row.id,
      names: row.names,
      story: row.story,
      imageUrl: row.imageUrl,
      status: row.status,
      staffPick: row.staffPick,
      createdAt: row.createdAt.toISOString(),
      moderatedAt: row.moderatedAt?.toISOString() ?? null,
      rejectReason: row.rejectReason,
    };
  }

  listApproved(staffPickOnly = false): Promise<MemoryPinDto[]> {
    return this.prisma.memoryPin
      .findMany({
        where: {
          status: MemoryPinStatus.approved,
          ...(staffPickOnly ? { staffPick: true } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: 60,
      })
      .then((rows) => rows.map((r) => this.toDto(r)));
  }

  listForAdmin(status?: MemoryPinStatus): Promise<MemoryPinDto[]> {
    return this.prisma.memoryPin
      .findMany({
        where: status ? { status } : undefined,
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
      .then((rows) => rows.map((r) => this.toDto(r)));
  }

  saveImage(buffer: Buffer, mime: string): string {
    if (!ALLOWED_MIME.has(mime)) {
      throw new BadRequestException('Photo must be JPEG, PNG, or WebP');
    }
    if (buffer.length > MAX_BYTES) {
      throw new BadRequestException('Photo must be under 2.5 MB');
    }
    this.ensureUploadDir();
    const ext =
      mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
    const name = `${Date.now()}-${randomBytes(6).toString('hex')}.${ext}`;
    writeFileSync(join(this.uploadRoot(), name), buffer);
    return `/uploads/memory/${name}`;
  }

  async submit(input: {
    names: string;
    story: string;
    imageBuffer: Buffer;
    mime: string;
  }): Promise<MemoryPinDto> {
    const names = input.names.trim();
    const story = input.story.trim();
    if (names.length < 2 || names.length > 80) {
      throw new BadRequestException('Names must be 2–80 characters');
    }
    if (story.length < 8 || story.length > 600) {
      throw new BadRequestException('Story must be 8–600 characters');
    }

    const imageUrl = this.saveImage(input.imageBuffer, input.mime);
    const row = await this.prisma.memoryPin.create({
      data: {
        names,
        story,
        imageUrl,
        status: MemoryPinStatus.pending,
      },
    });
    return this.toDto(row);
  }

  async approve(id: string, staffUserId: string, staffPick = false) {
    const row = await this.prisma.memoryPin.update({
      where: { id },
      data: {
        status: MemoryPinStatus.approved,
        staffPick,
        moderatedAt: new Date(),
        moderatedById: staffUserId,
        rejectReason: null,
      },
    });
    return this.toDto(row);
  }

  async reject(id: string, staffUserId: string, reason?: string) {
    const row = await this.prisma.memoryPin.update({
      where: { id },
      data: {
        status: MemoryPinStatus.rejected,
        moderatedAt: new Date(),
        moderatedById: staffUserId,
        rejectReason: reason?.trim() || null,
        staffPick: false,
      },
    });
    return this.toDto(row);
  }

  async setStaffPick(id: string, staffPick: boolean) {
    const existing = await this.prisma.memoryPin.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Memory pin not found');
    if (existing.status !== MemoryPinStatus.approved) {
      throw new BadRequestException('Only approved pins can be staff picks');
    }
    const row = await this.prisma.memoryPin.update({
      where: { id },
      data: { staffPick },
    });
    return this.toDto(row);
  }

  async remove(id: string) {
    const existing = await this.prisma.memoryPin.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Memory pin not found');

    await this.prisma.memoryPin.delete({ where: { id } });

    const match = existing.imageUrl.match(/\/uploads\/memory\/([^/?#]+)$/);
    if (match) {
      try {
        unlinkSync(join(this.uploadRoot(), match[1]));
      } catch {
        /* file may already be gone */
      }
    }
    return { ok: true as const };
  }
}

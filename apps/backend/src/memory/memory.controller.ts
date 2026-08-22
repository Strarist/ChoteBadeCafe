import { memoryStorage } from 'multer';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { MemoryPinStatus } from '@cafe/database';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  StaffAuthGuard,
  type AuthenticatedRequest,
} from '../auth/staff-auth.guard';
import { InMemoryRateLimit } from '../common/in-memory-rate-limit';
import { MemoryService } from './memory.service';

class SubmitMemoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  names!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(600)
  story!: string;
}

class RejectDto {
  @IsOptional()
  @IsString()
  @MaxLength(240)
  reason?: string;
}

class StaffPickDto {
  @IsBoolean()
  staffPick!: boolean;
}

class AcceptDto {
  @IsOptional()
  @IsBoolean()
  staffPick?: boolean;
}

const submitLimit = new InMemoryRateLimit(8, 60_000);

@Controller()
export class MemoryController {
  constructor(private readonly memory: MemoryService) {}

  /** Public — approved pins only */
  @Get('memory')
  listPublic(@Query('staffPick') staffPick?: string) {
    return this.memory.listApproved(staffPick === '1' || staffPick === 'true');
  }

  /** Public — guest submission (pending until admin/manager accepts) */
  @Post('memory')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: { fileSize: 2.5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!/^image\/(jpeg|png|webp)$/.test(file.mimetype)) {
          cb(new BadRequestException('Photo must be JPEG, PNG, or WebP') as never, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async submit(
    @Req() req: { ip?: string; headers: Record<string, string | string[] | undefined> },
    @UploadedFile() photo: Express.Multer.File | undefined,
    @Body() dto: SubmitMemoryDto,
  ) {
    const ip =
      (typeof req.headers['x-forwarded-for'] === 'string'
        ? req.headers['x-forwarded-for'].split(',')[0]?.trim()
        : undefined) ||
      req.ip ||
      'unknown';
    if (!photo?.buffer?.length) {
      throw new BadRequestException('Photo is required');
    }
    submitLimit.hit(ip);
    return this.memory.submit({
      names: dto.names,
      story: dto.story,
      imageBuffer: photo.buffer,
      mime: photo.mimetype,
    });
  }

  @Get('admin/memory')
  @UseGuards(StaffAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  listAdmin(@Query('status') status?: string) {
    const allowed = ['pending', 'approved', 'rejected'] as const;
    const parsed =
      status && (allowed as readonly string[]).includes(status)
        ? (status as MemoryPinStatus)
        : undefined;
    return this.memory.listForAdmin(parsed);
  }

  @Post('admin/memory/:id/accept')
  @UseGuards(StaffAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  accept(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: AcceptDto,
  ) {
    return this.memory.approve(id, req.staff!.staffUserId, Boolean(body?.staffPick));
  }

  @Post('admin/memory/:id/reject')
  @UseGuards(StaffAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  reject(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: RejectDto,
  ) {
    return this.memory.reject(id, req.staff!.staffUserId, body?.reason);
  }

  @Patch('admin/memory/:id/staff-pick')
  @UseGuards(StaffAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  staffPick(@Param('id') id: string, @Body() body: StaffPickDto) {
    return this.memory.setStaffPick(id, body.staffPick);
  }

  @Delete('admin/memory/:id')
  @UseGuards(StaffAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  remove(@Param('id') id: string) {
    return this.memory.remove(id);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import type { MenuItem } from '@cafe/shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { PetPoojaMenuSyncService } from '../petpooja/petpooja-menu-sync.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class MenuService {
  private readonly logger = new Logger(MenuService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly petPoojaMenuSync: PetPoojaMenuSyncService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async listAvailable(): Promise<MenuItem[]> {
    const items = await this.prisma.menuItem.findMany({
      where: { isAvailable: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return items.map((item) => this.toDto(item));
  }

  async syncFromPetPooja(): Promise<number> {
    const remoteItems = await this.petPoojaMenuSync.pull();
    let upserted = 0;

    for (const remote of remoteItems) {
      await this.upsertFromSyncSource(remote);
      upserted += 1;
    }

    this.logger.log(`Menu sync upserted ${upserted} item(s)`);
    this.realtime.emitMenuUpdated();
    return upserted;
  }

  /**
   * Internal upsert used by any sync source (stub today, real PetPooja later).
   * Matching key: petpoojaItemId when present, otherwise name+category.
   */
  async upsertFromSyncSource(input: {
    petpoojaItemId: string | null;
    name: string;
    description: string | null;
    price: number;
    category: string;
    isAvailable: boolean;
  }): Promise<MenuItem> {
    const now = new Date();

    if (input.petpoojaItemId) {
      const existing = await this.prisma.menuItem.findFirst({
        where: { petpoojaItemId: input.petpoojaItemId },
      });

      if (existing) {
        const updated = await this.prisma.menuItem.update({
          where: { id: existing.id },
          data: {
            name: input.name,
            description: input.description,
            price: input.price,
            category: input.category,
            isAvailable: input.isAvailable,
            syncedAt: now,
          },
        });
        return this.toDto(updated);
      }
    }

    const created = await this.prisma.menuItem.create({
      data: {
        petpoojaItemId: input.petpoojaItemId,
        name: input.name,
        description: input.description,
        price: input.price,
        category: input.category,
        isAvailable: input.isAvailable,
        syncedAt: now,
      },
    });

    return this.toDto(created);
  }

  private toDto(item: {
    id: string;
    petpoojaItemId: string | null;
    name: string;
    description: string | null;
    price: number;
    category: string;
    isAvailable: boolean;
    syncedAt: Date | null;
  }): MenuItem {
    return {
      id: item.id,
      petpoojaItemId: item.petpoojaItemId,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      isAvailable: item.isAvailable,
      syncedAt: item.syncedAt?.toISOString() ?? null,
    };
  }
}

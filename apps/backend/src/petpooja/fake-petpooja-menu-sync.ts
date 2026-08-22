import { Injectable } from '@nestjs/common';
import type { MenuItem } from '@cafe/shared-types';
import { CAFE_MENU_SEED } from '@cafe/shared-types';
import type { PetPoojaMenuSync } from './petpooja-menu-sync.interface';

/**
 * Local/fake menu sync source — mirrors the live Chote Bade menu catalog
 * when PETPOOJA_ADAPTER=fake.
 */
@Injectable()
export class FakePetPoojaMenuSync implements PetPoojaMenuSync {
  pull(): Promise<Array<Omit<MenuItem, 'id' | 'syncedAt'>>> {
    return Promise.resolve(
      CAFE_MENU_SEED.map((item) => ({
        petpoojaItemId: item.petpoojaItemId,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        isAvailable: item.isAvailable,
      })),
    );
  }
}

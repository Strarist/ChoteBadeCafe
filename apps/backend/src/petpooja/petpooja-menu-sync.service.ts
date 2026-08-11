import { Inject, Injectable } from '@nestjs/common';
import type { MenuItem } from '@cafe/shared-types';
import {
  PETPOOJA_MENU_SYNC,
  type PetPoojaMenuSync,
} from './petpooja-menu-sync.interface';

@Injectable()
export class PetPoojaMenuSyncService {
  constructor(
    @Inject(PETPOOJA_MENU_SYNC)
    private readonly adapter: PetPoojaMenuSync,
  ) {}

  pull(): Promise<Array<Omit<MenuItem, 'id' | 'syncedAt'>>> {
    return this.adapter.pull();
  }
}

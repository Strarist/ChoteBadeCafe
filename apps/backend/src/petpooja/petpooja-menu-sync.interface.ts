import type { MenuItem } from '@cafe/shared-types';

/**
 * Adapter contract for pulling menu data from PetPooja.
 * Live impl: POST mapped_restaurant_menus (Online Ordering API V2.1.0).
 */
export interface PetPoojaMenuSync {
  pull(): Promise<Array<Omit<MenuItem, 'id' | 'syncedAt'>>>;
}

export const PETPOOJA_MENU_SYNC = Symbol('PETPOOJA_MENU_SYNC');

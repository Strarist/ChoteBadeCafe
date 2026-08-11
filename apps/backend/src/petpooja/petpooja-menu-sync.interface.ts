import type { MenuItem } from '@cafe/shared-types';

/**
 * Adapter contract for pulling menu data from PetPooja.
 * Exact PetPooja endpoint/payload/auth is intentionally deferred (§9) —
 * swap FakePetPoojaMenuSync for a real implementation once sandbox credentials exist.
 */
export interface PetPoojaMenuSync {
  pull(): Promise<Array<Omit<MenuItem, 'id' | 'syncedAt'>>>;
}

export const PETPOOJA_MENU_SYNC = Symbol('PETPOOJA_MENU_SYNC');

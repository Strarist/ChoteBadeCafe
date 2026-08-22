import type { OrderDetail } from '@cafe/shared-types';

export interface PetPoojaPushResult {
  petpoojaOrderId: string;
  petpoojaBillId?: string;
}

/**
 * Port for pushing a paid/confirmed cafe order into PetPooja POS (save_order).
 */
export interface PetPoojaOrderPush {
  pushOrder(order: OrderDetail): Promise<PetPoojaPushResult>;
}

export const PETPOOJA_ORDER_PUSH = Symbol('PETPOOJA_ORDER_PUSH');

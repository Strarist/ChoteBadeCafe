import type { OrderDetail } from '@cafe/shared-types';

export interface PetPoojaPushResult {
  petpoojaOrderId: string;
  petpoojaBillId?: string;
}

/**
 * Only place that knows PetPooja's paid-order request shape (§9 — real HTTP deferred).
 */
export interface PetPoojaOrderPush {
  pushOrder(order: OrderDetail): Promise<PetPoojaPushResult>;
}

export const PETPOOJA_ORDER_PUSH = Symbol('PETPOOJA_ORDER_PUSH');

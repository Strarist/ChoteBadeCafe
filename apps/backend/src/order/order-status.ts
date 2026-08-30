import type { OrderStatus } from '@cafe/shared-types';

export const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  /** Pay-at-counter submits straight to PetPooja (confirmed); UPI goes awaiting_payment. */
  cart_building: ['awaiting_payment', 'confirmed', 'cancelled'],
  awaiting_payment: ['payment_failed', 'confirmed', 'cancelled'],
  payment_failed: ['awaiting_payment', 'confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready_for_handover', 'cancelled'],
  ready_for_handover: ['collected', 'cancelled'],
  collected: [],
  cancelled: [],
};

const PAID_OR_BEYOND: OrderStatus[] = [
  'confirmed',
  'preparing',
  'ready_for_handover',
  'collected',
];

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;
  return (ALLOWED_ORDER_TRANSITIONS[from] ?? []).includes(to);
}

export function isPaidKitchenStatus(status: OrderStatus): boolean {
  return PAID_OR_BEYOND.includes(status);
}

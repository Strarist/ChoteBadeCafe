import { ALLOWED_ORDER_TRANSITIONS, canTransition, isPaidKitchenStatus } from './order-status';

describe('order status machine', () => {
  it('allows the kitchen path after payment', () => {
    expect(canTransition('confirmed', 'preparing')).toBe(true);
    expect(canTransition('preparing', 'ready_for_handover')).toBe(true);
    expect(canTransition('ready_for_handover', 'collected')).toBe(true);
  });

  it('allows capture after a failed payment', () => {
    expect(canTransition('payment_failed', 'confirmed')).toBe(true);
    expect(canTransition('payment_failed', 'awaiting_payment')).toBe(true);
  });

  it('rejects skipping kitchen steps', () => {
    expect(canTransition('confirmed', 'ready_for_handover')).toBe(false);
    expect(canTransition('confirmed', 'collected')).toBe(false);
    expect(canTransition('awaiting_payment', 'preparing')).toBe(false);
  });

  it('treats same-status as a no-op', () => {
    expect(canTransition('confirmed', 'confirmed')).toBe(true);
  });

  it('has no exits from collected or cancelled', () => {
    expect(ALLOWED_ORDER_TRANSITIONS.collected).toEqual([]);
    expect(ALLOWED_ORDER_TRANSITIONS.cancelled).toEqual([]);
  });

  it('marks kitchen statuses as paid-or-beyond', () => {
    expect(isPaidKitchenStatus('confirmed')).toBe(true);
    expect(isPaidKitchenStatus('awaiting_payment')).toBe(false);
    expect(isPaidKitchenStatus('payment_failed')).toBe(false);
  });
});

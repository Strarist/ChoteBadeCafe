import type { RazorpayConfirmInput } from '@cafe/shared-types';

export type PendingCheckoutStep = 'created' | 'checked_out';

export type PendingCheckout = {
  orderId: string;
  accessToken?: string;
  payMethod: 'pay_at_counter' | 'upi';
  step: PendingCheckoutStep;
  name: string;
  mobile: string;
  savedAt: number;
  razorpay?: RazorpayConfirmInput;
};

const CHECKOUT_KEY = 'chote-bade-checkout-pending';
const TTL_MS = 2 * 60 * 60 * 1000;

function write(state: PendingCheckout, storage: Storage): void {
  try {
    storage.setItem(CHECKOUT_KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota */
  }
}

export function savePendingCheckout(state: PendingCheckout): void {
  write(state, localStorage);
  try {
    sessionStorage.removeItem(CHECKOUT_KEY);
  } catch {
    /* ignore */
  }
}

export function loadPendingCheckout(): PendingCheckout | null {
  const raw =
    (typeof localStorage !== 'undefined' ? localStorage.getItem(CHECKOUT_KEY) : null) ??
    (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(CHECKOUT_KEY) : null);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingCheckout;
    if (!parsed.orderId || !parsed.step) return null;
    if (parsed.savedAt && Date.now() - parsed.savedAt > TTL_MS) {
      clearPendingCheckout();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingCheckout(): void {
  try {
    localStorage.removeItem(CHECKOUT_KEY);
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.removeItem(CHECKOUT_KEY);
  } catch {
    /* ignore */
  }
}

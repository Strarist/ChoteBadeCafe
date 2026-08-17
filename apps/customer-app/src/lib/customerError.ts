/** Customer-facing copy — never leak env var names or gateway internals. */

const SECRET_HINT =
  /RAZORPAY_|KEY_SECRET|KEY_ID|VITE_|STAFF_SESSION|PETPOOJA_|webhook secret|authentication failed/i;

const ONLINE_UNAVAILABLE =
  'Online payment isn’t available right now. Pay at the counter or try again in a moment.';

export function toCustomerError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (SECRET_HINT.test(raw) || /html|VITE_API_URL|non-JSON/i.test(raw)) {
    return ONLINE_UNAVAILABLE;
  }
  if (/temporarily unavailable|Online payment is not available/i.test(raw)) {
    return ONLINE_UNAVAILABLE;
  }
  if (/not awaiting payment|already linked|Cannot checkout/i.test(raw)) {
    return 'This order may already be in progress. Resume checkout or check order status — don’t place a new one.';
  }
  if (/Payment cancelled|Payment failed/i.test(raw)) {
    return 'Payment was not completed. You can try again or pay at the counter.';
  }
  if (raw.length > 180) {
    return 'Something went wrong placing the order. Try again or pay at the counter.';
  }
  return raw;
}

export function isPaidOrderStatus(status: string): boolean {
  return (
    status === 'confirmed' ||
    status === 'preparing' ||
    status === 'ready_for_handover' ||
    status === 'collected'
  );
}

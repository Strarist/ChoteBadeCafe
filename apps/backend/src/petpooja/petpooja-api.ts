/**
 * PetPooja Online Ordering API (V2.1.0) — shared endpoints & credential helpers.
 * Docs: https://onlineorderingapisv210.docs.apiary.io/
 * Credentials: email support@petpooja.com (app-key, app-secret, access-token, restID).
 */

export const PETPOOJA_MENU_API_BASE =
  'https://qle1yy2ydc.execute-api.ap-southeast-1.amazonaws.com/V1';

export const PETPOOJA_ORDER_API_BASE =
  'https://47pfzh5sf2.execute-api.ap-southeast-1.amazonaws.com/V1';

export const PETPOOJA_SAVE_ORDER_URL = `${PETPOOJA_ORDER_API_BASE}/save_order`;
export const PETPOOJA_MAPPED_MENU_URL = `${PETPOOJA_MENU_API_BASE}/mapped_restaurant_menus`;

export interface PetPoojaCredentials {
  appKey: string;
  appSecret: string;
  accessToken: string;
  restId: string;
}

export interface PetPoojaSaveOrderResponse {
  success?: string | number | boolean;
  message?: string;
  restID?: string;
  clientOrderID?: string;
  orderID?: string;
  billID?: string;
  bill_id?: string;
}

export function paiseToRupeeString(paise: number): string {
  return (paise / 100).toFixed(2);
}

export function rupeeStringToPaise(raw: string | number | undefined | null): number {
  if (raw === undefined || raw === null || raw === '') return 0;
  const n = typeof raw === 'number' ? raw : Number.parseFloat(String(raw).replace(/,/g, ''));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export function isPetPoojaSuccess(body: { success?: string | number | boolean }): boolean {
  const s = body.success;
  return s === 1 || s === '1' || s === true || s === 'true' || s === 'Success';
}

export function petpoojaAuthHeaders(creds: PetPoojaCredentials): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'app-key': creds.appKey,
    'app-secret': creds.appSecret,
    'access-token': creds.accessToken,
  };
}

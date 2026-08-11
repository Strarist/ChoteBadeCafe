export type OrderSource = 'qr' | 'counter' | 'swiggy' | 'zomato';

export type {
  StaffRole,
  StaffLoginResponse,
  StaffSessionPayload,
} from './staff';
export { STAFF_ROLES, ROLE_PERMISSIONS } from './staff';
export type { StaffUser } from './staff';

export type OrderStatus =
  | 'cart_building'
  | 'awaiting_payment'
  | 'payment_failed'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_handover'
  | 'collected'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'upi' | 'card' | 'qr' | 'cash' | 'pay_at_counter';

export type PaymentRecordStatus = 'pending' | 'success' | 'failed' | 'refunded';

export type ReadyNotificationStatus = 'pending' | 'sent' | 'failed';

export type ReadyNotificationChannel = 'whatsapp' | 'sms';

export type OrderStatusLogSource = 'staff' | 'petpooja_webhook' | 'system';

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  petpoojaItemId: string | null;
  name: string;
  description: string | null;
  /** Price in paise (integer). Never use floating point for money. */
  price: number;
  category: string;
  isAvailable: boolean;
  syncedAt: string | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  instructions: string | null;
}

export interface OrderItemWithMenu extends OrderItem {
  menuItem: Pick<MenuItem, 'id' | 'name' | 'price' | 'category'>;
  /** Line total in paise. */
  lineTotal: number;
}

export interface Order {
  id: string;
  token: string;
  source: OrderSource;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customerId: string;
  petpoojaOrderId: string | null;
  petpoojaBillId: string | null;
  petpoojaStatusRaw: string | null;
  petpoojaPushFailed: boolean;
  petpoojaPushError: string | null;
  readyAt: string | null;
  readyNotificationStatus: ReadyNotificationStatus | null;
  readyNotificationChannel: ReadyNotificationChannel | null;
  tableId: string | null;
  claimLockedUntil: string | null;
  claimLockedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetail extends Order {
  customer: Customer;
  items: OrderItemWithMenu[];
  payments: Payment[];
  statusLogs: OrderStatusLog[];
  /** Order total in paise. */
  totalAmount: number;
  /**
   * Opaque capability token for customer order mutations (issued on create only).
   * Store client-side and send as X-Order-Access.
   */
  accessToken?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  /** Amount in paise (integer). */
  amount: number;
  gatewayRef: string | null;
  status: PaymentRecordStatus;
}

export interface OrderStatusLog {
  id: string;
  orderId: string;
  status: OrderStatus;
  staffUserId: string | null;
  source: OrderStatusLogSource;
  timestamp: string;
}

/** Socket.IO event names — keep in sync across all apps. */
export const SOCKET_EVENTS = {
  PING: 'ping',
  PONG: 'pong',
  ORDER_CREATED: 'order:created',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  ORDER_PAYMENT_FAILED: 'order:payment_failed',
  MENU_UPDATED: 'menu:updated',
} as const;

export type SocketEventName = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export interface OrderStatusChangedPayload {
  orderId: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
}

export interface OrderCreatedPayload {
  orderId: string;
  token: string;
  status: OrderStatus;
  source: OrderSource;
}

export interface OrderPaymentFailedPayload {
  orderId: string;
  token: string;
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  database: 'up' | 'down';
  redis: 'up' | 'down' | 'skipped';
}

export interface CreateOrderItemInput {
  menuItemId: string;
  quantity: number;
  instructions?: string | null;
}

export interface CreateOrderCustomerInput {
  name: string;
  mobile: string;
  email?: string | null;
}

export interface RazorpayCheckoutPayload {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: 'INR';
  keyId: string;
}

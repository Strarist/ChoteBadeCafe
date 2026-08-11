export type StaffRole = 'admin' | 'manager' | 'cashier';

export const STAFF_ROLES = ['admin', 'manager', 'cashier'] as const;

export interface StaffUser {
  id: string;
  name: string;
  role: StaffRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface StaffSessionPayload {
  staffUserId: string;
  name: string;
  role: StaffRole;
  exp: number;
}

export interface StaffLoginResponse {
  token: string;
  staff: StaffUser;
  expiresAt: string;
}

/** Role capability matrix — single source of truth for admin + counter. */
export const ROLE_PERMISSIONS: Record<
  StaffRole,
  {
    counterPos: boolean;
    confirmPayment: boolean;
    collectOrders: boolean;
    cancelOrders: boolean;
    menuSync: boolean;
    retryPetpoojaPush: boolean;
    viewIntegrations: boolean;
    manageStaff: boolean;
    viewAllOrders: boolean;
  }
> = {
  cashier: {
    counterPos: true,
    confirmPayment: true,
    collectOrders: true,
    cancelOrders: false,
    menuSync: false,
    retryPetpoojaPush: false,
    viewIntegrations: false,
    manageStaff: false,
    viewAllOrders: false,
  },
  manager: {
    counterPos: true,
    confirmPayment: true,
    collectOrders: true,
    cancelOrders: true,
    menuSync: true,
    retryPetpoojaPush: true,
    viewIntegrations: true,
    manageStaff: false,
    viewAllOrders: true,
  },
  admin: {
    counterPos: true,
    confirmPayment: true,
    collectOrders: true,
    cancelOrders: true,
    menuSync: true,
    retryPetpoojaPush: true,
    viewIntegrations: true,
    manageStaff: true,
    viewAllOrders: true,
  },
};

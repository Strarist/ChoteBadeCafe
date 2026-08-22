import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type AdapterMode = 'fake' | 'live';

export type IntegrationStatus =
  | 'ready_fake'
  | 'ready_live'
  | 'credentials_missing'
  | 'impl_pending'
  | 'misconfigured';

export interface IntegrationReadiness {
  petpooja: {
    adapter: AdapterMode;
    status: IntegrationStatus;
    detail: string;
    hasCredentials: boolean;
  };
  payment: {
    adapter: AdapterMode;
    status: IntegrationStatus;
    detail: string;
    hasCredentials: boolean;
  };
  notifications: {
    adapter: AdapterMode;
    status: IntegrationStatus;
    detail: string;
    hasCredentials: boolean;
    provider: string | null;
  };
  auth: {
    sessionSecretConfigured: boolean;
  };
  tables: {
    allowlistConfigured: boolean;
    detail: string;
  };
  memoryWall: {
    status: 'ready';
    detail: string;
  };
}

@Injectable()
export class IntegrationsConfigService implements OnModuleInit {
  private readonly logger = new Logger(IntegrationsConfigService.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const secret = this.config.get<string>('STAFF_SESSION_SECRET');
    if (!secret || secret.length < 16) {
      throw new Error(
        'STAFF_SESSION_SECRET is missing or too short (min 16 chars). Refusing to start.',
      );
    }

    if (process.env.NODE_ENV === 'production') {
      const weak =
        /change-me|dev-cafe|session-secret-change/i.test(secret) ||
        secret.length < 32;
      if (weak) {
        throw new Error(
          'STAFF_SESSION_SECRET looks like a dev default. Set a random 32+ char secret before production.',
        );
      }
      if (process.env.ALLOW_FAKE_PAYMENTS === '1') {
        throw new Error(
          'ALLOW_FAKE_PAYMENTS=1 is forbidden in production. On Render/hosting, set ALLOW_FAKE_PAYMENTS=0 or remove the variable (see DEPLOY-CLOUD.md). Mock checkout must stay off.',
        );
      }
    }

    const readiness = this.getReadiness();
    this.logger.log(
      `PetPooja: ${readiness.petpooja.status} — ${readiness.petpooja.detail}`,
    );
    this.logger.log(
      `Payment: ${readiness.payment.status} — ${readiness.payment.detail}`,
    );
    this.logger.log(
      `Notifications: ${readiness.notifications.status} — ${readiness.notifications.detail}`,
    );

    if (this.petpoojaMode() === 'live' && !this.hasPetpoojaCredentials()) {
      throw new Error(
        'PETPOOJA_ADAPTER=live but PetPooja credentials are missing. Set PETPOOJA_* or use fake.',
      );
    }
    if (this.petpoojaMode() === 'live' && !this.hasPetpoojaCallbackTarget()) {
      throw new Error(
        'PETPOOJA_ADAPTER=live requires PUBLIC_API_URL (API origin) or PETPOOJA_CALLBACK_URL so save_order can register status callbacks.',
      );
    }
    if (this.notificationMode() === 'live' && process.env.NOTIFICATION_LIVE_OK !== '1') {
      throw new Error(
        'NOTIFICATION_ADAPTER=live refused: live WhatsApp/SMS is not implemented yet. Keep NOTIFICATION_ADAPTER=fake, or set NOTIFICATION_LIVE_OK=1 after the provider is wired.',
      );
    }
    if (this.paymentMode() === 'live' && !this.hasRazorpayCredentials()) {
      throw new Error(
        'PAYMENT_ADAPTER=live but Razorpay credentials are missing. Set RAZORPAY_* or use fake.',
      );
    }
    if (
      this.paymentMode() === 'live' &&
      !stripEnv(this.config.get<string>('RAZORPAY_WEBHOOK_SECRET'))
    ) {
      this.logger.warn(
        'PAYMENT_ADAPTER=live has no RAZORPAY_WEBHOOK_SECRET. Checkout.js signature confirm still works; webhook backup is disabled until you add the secret in Razorpay Dashboard → Webhooks.',
      );
    }
    if (
      this.notificationMode() === 'live' &&
      !this.hasNotificationCredentials()
    ) {
      throw new Error(
        'NOTIFICATION_ADAPTER=live but WhatsApp/SMS credentials are missing. Configure BSP keys or use fake.',
      );
    }
  }

  petpoojaMode(): AdapterMode {
    return this.mode('PETPOOJA_ADAPTER');
  }

  paymentMode(): AdapterMode {
    // Real Razorpay keys win over a leftover PAYMENT_ADAPTER=fake from first deploy.
    if (
      this.hasRazorpayCredentials() &&
      process.env.ALLOW_FAKE_PAYMENTS !== '1'
    ) {
      return 'live';
    }
    const explicit = this.config.get<string>('PAYMENT_ADAPTER');
    if (explicit === 'live' || explicit === 'fake') return explicit;
    return 'fake';
  }

  notificationMode(): AdapterMode {
    return this.mode('NOTIFICATION_ADAPTER');
  }

  sessionSecret(): string {
    return this.config.getOrThrow<string>('STAFF_SESSION_SECRET');
  }

  hasPetpoojaCredentials(): boolean {
    return Boolean(
      stripEnv(this.config.get<string>('PETPOOJA_APP_KEY')) &&
        stripEnv(this.config.get<string>('PETPOOJA_APP_SECRET')) &&
        stripEnv(this.config.get<string>('PETPOOJA_ACCESS_TOKEN')) &&
        stripEnv(this.config.get<string>('PETPOOJA_REST_ID')),
    );
  }

  hasPetpoojaCallbackTarget(): boolean {
    return Boolean(
      stripEnv(this.config.get<string>('PETPOOJA_CALLBACK_URL')) ||
        stripEnv(this.config.get<string>('PUBLIC_API_URL')),
    );
  }

  petpoojaRestId(): string | undefined {
    return stripEnv(this.config.get<string>('PETPOOJA_REST_ID')) || undefined;
  }

  hasRazorpayCredentials(): boolean {
    const keyId = stripEnv(this.config.get<string>('RAZORPAY_KEY_ID'));
    const keySecret = stripEnv(this.config.get<string>('RAZORPAY_KEY_SECRET'));
    return Boolean(
      keyId && keyId !== 'mock' && keySecret && keySecret !== 'mock',
    );
  }

  hasNotificationCredentials(): boolean {
    return Boolean(
      this.config.get('WHATSAPP_BSP_PROVIDER') &&
        this.config.get('WHATSAPP_BSP_API_KEY') &&
        this.config.get('SMS_FALLBACK_API_KEY'),
    );
  }

  petpoojaWebhookSecret(): string | undefined {
    return stripEnv(this.config.get<string>('PETPOOJA_WEBHOOK_SECRET')) || undefined;
  }

  getReadiness(): IntegrationReadiness {
    const petMode = this.petpoojaMode();
    const payMode = this.paymentMode();
    const noteMode = this.notificationMode();
    const petLiveReady =
      this.hasPetpoojaCredentials() && this.hasPetpoojaCallbackTarget();

    return {
      petpooja: this.describe(
        petMode,
        this.hasPetpoojaCredentials(),
        petLiveReady,
        'Live save_order + mapped_restaurant_menus + status/push-menu webhooks ready. Set PETPOOJA_* + PUBLIC_API_URL, then PETPOOJA_ADAPTER=live.',
      ),
      payment: this.describe(
        payMode,
        this.hasRazorpayCredentials(),
        payMode === 'live' && this.hasRazorpayCredentials(),
        'Checkout + webhook HMAC path ready; set live keys and PAYMENT_ADAPTER=live for Razorpay.',
      ),
      notifications: {
        ...this.describe(
          noteMode,
          this.hasNotificationCredentials(),
          false,
          'ReadyNotifier port + SMS fallback contract ready; pick BSP (gupshup|twilio) then implement live provider.',
        ),
        provider: this.config.get<string>('WHATSAPP_BSP_PROVIDER') ?? null,
      },
      auth: {
        sessionSecretConfigured: Boolean(
          this.config.get('STAFF_SESSION_SECRET'),
        ),
      },
      tables: {
        allowlistConfigured: Boolean(
          (process.env.TABLE_IDS ?? '').split(',').some((s) => s.trim()),
        ),
        detail: (process.env.TABLE_IDS ?? '').trim()
          ? 'TABLE_IDS allowlist active for QR orders'
          : 'TABLE_IDS unset — any tableId accepted (set before production QR print)',
      },
      memoryWall: {
        status: 'ready' as const,
        detail:
          'Public submit + admin/manager moderate (accept / reject / delete / staff pick)',
      },
    };
  }

  private mode(key: string): AdapterMode {
    const value = (this.config.get<string>(key) ?? 'fake').toLowerCase();
    return value === 'live' ? 'live' : 'fake';
  }

  private describe(
    mode: AdapterMode,
    hasCredentials: boolean,
    liveImplReady: boolean,
    detail: string,
  ): {
    adapter: AdapterMode;
    status: IntegrationStatus;
    detail: string;
    hasCredentials: boolean;
  } {
    if (mode === 'fake') {
      return { adapter: mode, status: 'ready_fake', detail, hasCredentials };
    }
    if (!hasCredentials) {
      return {
        adapter: mode,
        status: 'credentials_missing',
        detail: 'Live mode selected but required env vars are empty.',
        hasCredentials,
      };
    }
    if (!liveImplReady) {
      return {
        adapter: mode,
        status: 'impl_pending',
        detail: `${detail} Credentials present; callback URL / PUBLIC_API_URL still required.`,
        hasCredentials,
      };
    }
    return { adapter: mode, status: 'ready_live', detail, hasCredentials };
  }
}

function stripEnv(value: string | undefined): string {
  return (value ?? '').trim().replace(/^["']|["']$/g, '');
}

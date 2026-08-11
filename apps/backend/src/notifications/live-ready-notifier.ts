import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NotifyReadyResult, ReadyNotifier } from './ready-notifier.interface';

/**
 * Live BSP notifier scaffold. Provider chosen via WHATSAPP_BSP_PROVIDER (gupshup|twilio|...).
 * Fails loudly until the chosen provider client is implemented (§9).
 */
@Injectable()
export class LiveReadyNotifier implements ReadyNotifier {
  private readonly logger = new Logger(LiveReadyNotifier.name);

  constructor(private readonly config: ConfigService) {}

  async notifyReady(input: {
    mobile: string;
    customerName: string;
    token: string;
  }): Promise<NotifyReadyResult> {
    const provider = this.config.get<string>('WHATSAPP_BSP_PROVIDER');
    const apiKey = this.config.get<string>('WHATSAPP_BSP_API_KEY');
    if (!provider || !apiKey) {
      throw new ServiceUnavailableException(
        'WhatsApp BSP credentials missing. Refusing live notification.',
      );
    }

    this.logger.warn(
      `Live ${provider} WhatsApp notify requested for ${input.mobile} / token ${input.token} — provider client not implemented yet.`,
    );

    // Automatic SMS fallback contract (still stub until SMS_FALLBACK_* wired)
    const smsKey = this.config.get<string>('SMS_FALLBACK_API_KEY');
    if (!smsKey) {
      return {
        channel: 'whatsapp',
        status: 'failed',
        error: 'WhatsApp live impl pending and SMS fallback key missing',
      };
    }

    this.logger.warn(
      `[SMS fallback scaffold] Would SMS token ${input.token} to ${input.mobile} via ${this.config.get('SMS_FALLBACK_PROVIDER') ?? 'unspecified'}`,
    );
    throw new ServiceUnavailableException(
      `Live notification provider "${provider}" is not implemented yet. Keep NOTIFICATION_ADAPTER=fake until BSP is chosen and wired (§9).`,
    );
  }
}

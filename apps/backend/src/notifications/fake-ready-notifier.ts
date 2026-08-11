import { Injectable, Logger } from '@nestjs/common';
import type { NotifyReadyResult, ReadyNotifier } from './ready-notifier.interface';

/** Console/fake BSP until WhatsApp provider is chosen (§9). */
@Injectable()
export class FakeReadyNotifier implements ReadyNotifier {
  private readonly logger = new Logger(FakeReadyNotifier.name);

  async notifyReady(input: {
    mobile: string;
    customerName: string;
    token: string;
  }): Promise<NotifyReadyResult> {
    this.logger.log(
      `[FAKE WhatsApp] Hi ${input.customerName}, token ${input.token} is ready for pickup. → ${input.mobile}`,
    );
    return { channel: 'whatsapp', status: 'sent' };
  }
}

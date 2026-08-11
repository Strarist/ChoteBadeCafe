export interface NotifyReadyResult {
  channel: 'whatsapp' | 'sms';
  status: 'sent' | 'failed';
  error?: string;
}

export interface ReadyNotifier {
  notifyReady(input: {
    mobile: string;
    customerName: string;
    token: string;
  }): Promise<NotifyReadyResult>;
}

export const READY_NOTIFIER = Symbol('READY_NOTIFIER');

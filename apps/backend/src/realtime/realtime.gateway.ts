import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { Server, Socket } from 'socket.io';
import {
  SOCKET_EVENTS,
  type OrderCreatedPayload,
  type OrderPaymentFailedPayload,
  type OrderStatusChangedPayload,
} from '@cafe/shared-types';
import { ConfigService } from '@nestjs/config';

type StatusListener = (payload: OrderStatusChangedPayload) => void | Promise<void>;

@WebSocketGateway({
  cors: {
    origin: (
      process.env.CORS_ORIGINS ??
      'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174'
    )
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);
  private pubClient: Redis | null = null;
  private subClient: Redis | null = null;
  private statusListeners: StatusListener[] = [];

  @WebSocketServer()
  server!: Server;

  constructor(private readonly configService: ConfigService) {}

  async afterInit(server: Server): Promise<void> {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      this.logger.warn('REDIS_URL missing — Socket.IO using in-memory adapter only');
      return;
    }

    try {
      this.pubClient = new Redis(redisUrl);
      this.subClient = this.pubClient.duplicate();
      server.adapter(createAdapter(this.pubClient, this.subClient));
      this.logger.log('Socket.IO Redis adapter attached');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Socket.IO Redis adapter not attached (${message}). Falling back to in-memory adapter.`,
      );
    }
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(SOCKET_EVENTS.PING)
  handlePing(client: Socket): void {
    client.emit(SOCKET_EVENTS.PONG, {
      ok: true,
      at: new Date().toISOString(),
    });
  }

  onStatusChanged(listener: StatusListener): void {
    this.statusListeners.push(listener);
  }

  emitOrderCreated(payload: OrderCreatedPayload): void {
    this.server?.emit(SOCKET_EVENTS.ORDER_CREATED, payload);
  }

  emitOrderStatusChanged(payload: OrderStatusChangedPayload): void {
    this.server?.emit(SOCKET_EVENTS.ORDER_STATUS_CHANGED, payload);
    for (const listener of this.statusListeners) {
      void Promise.resolve(listener(payload)).catch((err: unknown) => {
        this.logger.error(`Status listener error: ${String(err)}`);
      });
    }
  }

  emitOrderPaymentFailed(payload: OrderPaymentFailedPayload): void {
    this.server?.emit(SOCKET_EVENTS.ORDER_PAYMENT_FAILED, payload);
  }

  emitMenuUpdated(): void {
    this.server?.emit(SOCKET_EVENTS.MENU_UPDATED, { at: new Date().toISOString() });
  }
}

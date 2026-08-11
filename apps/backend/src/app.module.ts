import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { RealtimeModule } from './realtime/realtime.module';
import { MenuModule } from './menu/menu.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { PetPoojaOrderModule } from './petpooja/petpooja-order.module';
import { NotificationsModule } from './notifications/notifications.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    IntegrationsModule,
    PrismaModule,
    RedisModule,
    HealthModule,
    RealtimeModule,
    MenuModule,
    OrderModule,
    PaymentModule,
    PetPoojaOrderModule,
    NotificationsModule,
    AuthModule,
    AdminModule,
  ],
})
export class AppModule {}

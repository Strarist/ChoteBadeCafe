import { Module, forwardRef } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';
import { MenuModule } from '../menu/menu.module';
import { OrderModule } from '../order/order.module';
import { PetPoojaOrderModule } from '../petpooja/petpooja-order.module';

@Module({
  imports: [
    AuthModule,
    MenuModule,
    forwardRef(() => OrderModule),
    forwardRef(() => PetPoojaOrderModule),
  ],
  controllers: [AdminController],
})
export class AdminModule {}

import { Module } from '@nestjs/common';
import { PetPoojaMenuSyncService } from './petpooja-menu-sync.service';
import { FakePetPoojaMenuSync } from './fake-petpooja-menu-sync';
import { PETPOOJA_MENU_SYNC } from './petpooja-menu-sync.interface';

@Module({
  providers: [
    {
      provide: PETPOOJA_MENU_SYNC,
      useClass: FakePetPoojaMenuSync,
    },
    PetPoojaMenuSyncService,
  ],
  exports: [PetPoojaMenuSyncService],
})
export class PetPoojaMenuSyncModule {}

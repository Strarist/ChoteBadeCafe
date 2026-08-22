import { Module } from '@nestjs/common';
import { PETPOOJA_MENU_SYNC } from './petpooja-menu-sync.interface';
import { FakePetPoojaMenuSync } from './fake-petpooja-menu-sync';
import { LivePetPoojaMenuSync } from './live-petpooja-menu-sync';
import { PetPoojaMenuSyncService } from './petpooja-menu-sync.service';
import { IntegrationsConfigService } from '../integrations/integrations-config.service';

@Module({
  providers: [
    FakePetPoojaMenuSync,
    LivePetPoojaMenuSync,
    {
      provide: PETPOOJA_MENU_SYNC,
      inject: [
        IntegrationsConfigService,
        FakePetPoojaMenuSync,
        LivePetPoojaMenuSync,
      ],
      useFactory: (
        integrations: IntegrationsConfigService,
        fake: FakePetPoojaMenuSync,
        live: LivePetPoojaMenuSync,
      ) => (integrations.petpoojaMode() === 'live' ? live : fake),
    },
    PetPoojaMenuSyncService,
  ],
  exports: [PetPoojaMenuSyncService],
})
export class PetPoojaMenuSyncModule {}

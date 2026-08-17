import { Injectable } from '@nestjs/common';
import type { MenuItem } from '@cafe/shared-types';
import type { PetPoojaMenuSync } from './petpooja-menu-sync.interface';

/**
 * Local/fake menu sync source — mirrors the Chote Bade design-demo catalog
 * until real PetPooja sandbox credentials arrive (§9).
 */
@Injectable()
export class FakePetPoojaMenuSync implements PetPoojaMenuSync {
  async pull(): Promise<Array<Omit<MenuItem, 'id' | 'syncedAt'>>> {
    return [
      { petpoojaItemId: 'pp-test-one-rupee', name: 'TEST CHECKOUT ₹1', description: 'Mock item for payment testing. Do not serve.', price: 100, category: 'Test', isAvailable: true },
      { petpoojaItemId: 'pp-babas-espresso', name: "BABA'S ESPRESSO", description: null, price: 16000, category: 'Coffee', isAvailable: true },
      { petpoojaItemId: 'pp-americano', name: 'AMERICANO', description: null, price: 18000, category: 'Coffee', isAvailable: true },
      { petpoojaItemId: 'pp-cortado', name: 'CORTADO', description: null, price: 19000, category: 'Coffee', isAvailable: true },
      { petpoojaItemId: 'pp-cappuccino', name: 'CAPPUCCINO', description: null, price: 21000, category: 'Coffee', isAvailable: true },
      { petpoojaItemId: 'pp-chota-cortado', name: 'CHOTA CORTADO', description: null, price: 19000, category: 'Coffee', isAvailable: true },
      { petpoojaItemId: 'pp-walnut-staircase', name: 'WALNUT STAIRCASE LATTE', description: null, price: 24000, category: 'Coffee', isAvailable: true },
      { petpoojaItemId: 'pp-cold-sukoon', name: 'COLD SUKOON BREW', description: null, price: 22000, category: 'Coffee', isAvailable: true },
      { petpoojaItemId: 'pp-oat-almond-soy', name: 'OAT / ALMOND / SOY', description: null, price: 5000, category: 'Milk Options', isAvailable: true },
      { petpoojaItemId: 'pp-full-cream', name: 'FULL CREAM / TONED', description: 'no extra charge', price: 0, category: 'Milk Options', isAvailable: true },
      { petpoojaItemId: 'pp-coconut-whip', name: 'COCONUT WHIP', description: null, price: 6000, category: 'Milk Options', isAvailable: true },
      { petpoojaItemId: 'pp-house-malai', name: 'HOUSE MALAI', description: 'made fresh each morning', price: 6000, category: 'Milk Options', isAvailable: true },
      { petpoojaItemId: 'pp-masala-chai', name: 'MASALA CHAI', description: null, price: 12000, category: 'Chai & Tea', isAvailable: true },
      { petpoojaItemId: 'pp-kadak-cutting', name: 'KADAK CUTTING', description: null, price: 9000, category: 'Chai & Tea', isAvailable: true },
      { petpoojaItemId: 'pp-matcha', name: 'MATCHA', description: 'Ceremonial grade, whisked slow', price: 26000, category: 'Chai & Tea', isAvailable: true },
      { petpoojaItemId: 'pp-syrups', name: 'SYRUPS', description: 'Vanilla, Caramel, Cardamom, Rose, Walnut, Gulkand', price: 4000, category: 'Chai & Tea', isAvailable: true },
      { petpoojaItemId: 'pp-toasted-walnut', name: 'TOASTED WALNUT LATTE', description: null, price: 25000, category: 'Seasonal Specials', isAvailable: true },
      { petpoojaItemId: 'pp-rose-pista', name: 'ROSE PISTA CLOUD', description: null, price: 27000, category: 'Seasonal Specials', isAvailable: true },
      { petpoojaItemId: 'pp-masala-cold-brew', name: 'MASALA COLD BREW', description: null, price: 23000, category: 'Seasonal Specials', isAvailable: true },
      { petpoojaItemId: 'pp-filter-kaapi-float', name: 'FILTER KAAPI FLOAT', description: null, price: 24000, category: 'Seasonal Specials', isAvailable: true },
    ];
  }
}

import { PrismaClient } from '@cafe/database';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/** Design-demo menu (rupees → paise). Matches the Chote Bade brand site. */
const PLACEHOLDER_ITEMS = [
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
] as const;

const STAFF = [
  { name: 'Admin', role: 'admin' as const, pin: '1234' },
  { name: 'Manager', role: 'manager' as const, pin: '2345' },
  { name: 'Cashier', role: 'cashier' as const, pin: '3456' },
];

async function main() {
  const now = new Date();
  const isProd = process.env.NODE_ENV === 'production';
  const reset = !isProd && process.env.SEED_RESET !== '0';

  if (reset) {
    await prisma.orderItem.deleteMany();
    await prisma.menuItem.deleteMany();
  }

  if (reset || (await prisma.menuItem.count()) === 0) {
    for (const item of PLACEHOLDER_ITEMS) {
      await prisma.menuItem.create({
        data: { ...item, syncedAt: now },
      });
    }
  } else {
    console.log('Menu already present — skipping item insert');
  }

  for (const s of STAFF) {
    const existing = await prisma.staffUser.findFirst({ where: { name: s.name } });
    if (existing) {
      if (!isProd) {
        const pinHash = await bcrypt.hash(s.pin, 10);
        await prisma.staffUser.update({
          where: { id: existing.id },
          data: { role: s.role, pinHash, isActive: true },
        });
      }
      continue;
    }
    await prisma.staffUser.create({
      data: { name: s.name, role: s.role, pinHash: await bcrypt.hash(s.pin, 10), isActive: true },
    });
  }

  const count = await prisma.menuItem.count();
  const staffCount = await prisma.staffUser.count();
  console.log(`Seeded menu items: ${count}; staff users: ${staffCount}`);
  if (!isProd) {
    console.log('Default PINs — Admin/1234, Manager/2345, Cashier/3456 (change in production)');
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

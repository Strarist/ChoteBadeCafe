import { PrismaClient } from '@cafe/database';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/** Design-demo menu (rupees → paise). Matches the Chote Bade brand site. */
const PLACEHOLDER_ITEMS = [
  { petpoojaItemId: 'pp-test-one-rupee', name: 'TEST CHECKOUT ₹1', description: 'Mock item for payment testing. Do not serve.', price: 100, category: 'Test', isAvailable: true },
  { petpoojaItemId: 'pp-babas-espresso', name: "BABA'S ESPRESSO", description: 'Short, strong, no small talk.', price: 16000, category: 'Coffee', isAvailable: true },
  { petpoojaItemId: 'pp-americano', name: 'AMERICANO', description: 'Long black, quietly certain.', price: 18000, category: 'Coffee', isAvailable: true },
  { petpoojaItemId: 'pp-cortado', name: 'CORTADO', description: 'Equal parts heat and hush.', price: 19000, category: 'Coffee', isAvailable: true },
  { petpoojaItemId: 'pp-cappuccino', name: 'CAPPUCCINO', description: 'Foam first, then the day begins.', price: 21000, category: 'Coffee', isAvailable: true },
  { petpoojaItemId: 'pp-chota-cortado', name: 'CHOTA CORTADO', description: 'Small cup, big comfort.', price: 19000, category: 'Coffee', isAvailable: true },
  { petpoojaItemId: 'pp-walnut-staircase', name: 'WALNUT STAIRCASE LATTE', description: 'Toasted walnut, slow climb of warmth.', price: 24000, category: 'Coffee', isAvailable: true },
  { petpoojaItemId: 'pp-cold-sukoon', name: 'COLD SUKOON BREW', description: 'Steeped overnight. Soft on the nerves.', price: 22000, category: 'Coffee', isAvailable: true },
  { petpoojaItemId: 'pp-oat-almond-soy', name: 'OAT / ALMOND / SOY', description: 'Plant milk, same ritual.', price: 5000, category: 'Milk Options', isAvailable: true },
  { petpoojaItemId: 'pp-full-cream', name: 'FULL CREAM / TONED', description: 'no extra charge', price: 0, category: 'Milk Options', isAvailable: true },
  { petpoojaItemId: 'pp-coconut-whip', name: 'COCONUT WHIP', description: 'A soft tropical cloud on top.', price: 6000, category: 'Milk Options', isAvailable: true },
  { petpoojaItemId: 'pp-house-malai', name: 'HOUSE MALAI', description: 'made fresh each morning', price: 6000, category: 'Milk Options', isAvailable: true },
  { petpoojaItemId: 'pp-masala-chai', name: 'MASALA CHAI', description: 'Spice, milk, and a long conversation.', price: 12000, category: 'Chai & Tea', isAvailable: true },
  { petpoojaItemId: 'pp-kadak-cutting', name: 'KADAK CUTTING', description: 'Half a glass. Full of nerve.', price: 9000, category: 'Chai & Tea', isAvailable: true },
  { petpoojaItemId: 'pp-matcha', name: 'MATCHA', description: 'Ceremonial grade, whisked slow', price: 26000, category: 'Chai & Tea', isAvailable: true },
  { petpoojaItemId: 'pp-syrups', name: 'SYRUPS', description: 'Vanilla, Caramel, Cardamom, Rose, Walnut, Gulkand', price: 4000, category: 'Chai & Tea', isAvailable: true },
  { petpoojaItemId: 'pp-toasted-walnut', name: 'TOASTED WALNUT LATTE', description: 'The seasonal one. Warm, nutty, a little proud.', price: 25000, category: 'Seasonal Specials', isAvailable: true },
  { petpoojaItemId: 'pp-rose-pista', name: 'ROSE PISTA CLOUD', description: 'Pink, pistachio, and a little theatre.', price: 27000, category: 'Seasonal Specials', isAvailable: true },
  { petpoojaItemId: 'pp-masala-cold-brew', name: 'MASALA COLD BREW', description: 'Spice meeting ice, on purpose.', price: 23000, category: 'Seasonal Specials', isAvailable: true },
  { petpoojaItemId: 'pp-filter-kaapi-float', name: 'FILTER KAAPI FLOAT', description: 'South Indian filter, a scoop of cool.', price: 24000, category: 'Seasonal Specials', isAvailable: true },
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
    const testCheckout = PLACEHOLDER_ITEMS.find((item) => item.petpoojaItemId === 'pp-test-one-rupee');
    if (testCheckout) {
      const existingTest = await prisma.menuItem.findFirst({
        where: { petpoojaItemId: testCheckout.petpoojaItemId },
      });
      if (!existingTest) {
        await prisma.menuItem.create({
          data: { ...testCheckout, syncedAt: now },
        });
      }
    }
  }

  const staffCountBefore = await prisma.staffUser.count();
  const bootstrapPin = process.env.BOOTSTRAP_ADMIN_PIN?.trim();
  const bootstrapName = (process.env.BOOTSTRAP_ADMIN_NAME ?? 'Admin').trim() || 'Admin';

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
    if (isProd) {
      console.log(`Skipping default staff "${s.name}" in production — create staff via Admin with a strong PIN`);
      continue;
    }
    await prisma.staffUser.create({
      data: { name: s.name, role: s.role, pinHash: await bcrypt.hash(s.pin, 10), isActive: true },
    });
  }

  if (isProd && staffCountBefore === 0 && (await prisma.staffUser.count()) === 0) {
    if (!bootstrapPin || !/^\d{4,8}$/.test(bootstrapPin) || bootstrapPin === '1234') {
      console.warn(
        'No staff users. Set BOOTSTRAP_ADMIN_PIN (4–8 digits, not 1234) once, redeploy, then unset it.',
      );
    } else {
      await prisma.staffUser.create({
        data: {
          name: bootstrapName,
          role: 'admin',
          pinHash: await bcrypt.hash(bootstrapPin, 10),
          isActive: true,
        },
      });
      console.log(`Created bootstrap admin "${bootstrapName}" — unset BOOTSTRAP_ADMIN_PIN after first login`);
    }
  }

  const count = await prisma.menuItem.count();
  const staffCount = await prisma.staffUser.count();
  console.log(`Seeded menu items: ${count}; staff users: ${staffCount}`);
  if (!isProd) {
    console.log('Default PINs — Admin/1234, Manager/2345, Cashier/3456 (change in production)');
  } else if (staffCount === 0) {
    console.warn('No staff users in production DB — create an admin via a one-time bootstrap before go-live');
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

import { PrismaClient } from '@cafe/database';
import {
  CAFE_MENU_SEED,
  CANONICAL_MENU_IDS,
} from '../packages/shared-types/src/cafeMenu';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const STAFF = [
  { name: 'Admin', role: 'admin' as const, pin: '1234' },
  { name: 'Manager', role: 'manager' as const, pin: '2345' },
  { name: 'Cashier', role: 'cashier' as const, pin: '3456' },
];

function toMenuRow(item: (typeof CAFE_MENU_SEED)[number], syncedAt: Date) {
  return {
    petpoojaItemId: item.petpoojaItemId,
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    isAvailable: item.isAvailable,
    syncedAt,
  };
}

async function main() {
  const now = new Date();
  const isProd = process.env.NODE_ENV === 'production';
  const reset = !isProd && process.env.SEED_RESET !== '0';

  if (reset) {
    await prisma.orderItem.deleteMany();
    await prisma.menuItem.deleteMany();
  }

  if (reset || (await prisma.menuItem.count()) === 0) {
    for (const item of CAFE_MENU_SEED) {
      await prisma.menuItem.create({
        data: toMenuRow(item, now),
      });
    }
  } else {
    // Keep DB in sync with the canonical menu without wiping order history.
    for (const item of CAFE_MENU_SEED) {
      const existing = await prisma.menuItem.findFirst({
        where: { petpoojaItemId: item.petpoojaItemId },
      });
      if (existing) {
        await prisma.menuItem.update({
          where: { id: existing.id },
          data: toMenuRow(item, now),
        });
      } else {
        await prisma.menuItem.create({
          data: toMenuRow(item, now),
        });
      }
    }
    console.log('Menu upserted from CAFE_MENU_SEED');
  }

  // Hide every item that is not on the current printed menu (old IDs / demo rows).
  const retired = await prisma.menuItem.updateMany({
    where: {
      isAvailable: true,
      OR: [
        { petpoojaItemId: null },
        { petpoojaItemId: { notIn: [...CANONICAL_MENU_IDS] } },
      ],
    },
    data: { isAvailable: false, syncedAt: now },
  });
  if (retired.count > 0) {
    console.log(`Retired ${retired.count} non-canonical menu item(s)`);
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

  const count = await prisma.menuItem.count({ where: { isAvailable: true } });
  const staffCount = await prisma.staffUser.count();
  console.log(`Available menu items: ${count}; staff users: ${staffCount}`);
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

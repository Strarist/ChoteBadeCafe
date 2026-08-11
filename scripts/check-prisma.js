const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
console.log('menuItem', typeof p.menuItem);
console.log('order', typeof p.order);
p.$disconnect().then(() => console.log('disconnected'));

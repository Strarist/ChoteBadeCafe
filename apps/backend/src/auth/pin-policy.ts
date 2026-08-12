import { BadRequestException } from '@nestjs/common';

const WEAK_PINS = new Set([
  '0000',
  '1111',
  '2222',
  '3333',
  '4444',
  '5555',
  '6666',
  '7777',
  '8888',
  '9999',
  '0123',
  '1234',
  '2345',
  '3456',
  '4567',
  '5678',
  '6789',
  '9876',
  '4321',
  '1212',
  '1122',
  '2121',
]);

/** PIN policy: 4–8 digits; block common PINs in production. */
export function assertPinPolicy(pin: string): void {
  if (!/^\d{4,8}$/.test(pin)) {
    throw new BadRequestException('PIN must be 4–8 digits');
  }
  if (process.env.NODE_ENV === 'production' && WEAK_PINS.has(pin)) {
    throw new BadRequestException('PIN is too common — choose a stronger PIN');
  }
}

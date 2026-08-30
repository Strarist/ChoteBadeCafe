import { BadRequestException } from '@nestjs/common';
import { resolveOfferPricing } from './offer-pricing';

describe('resolveOfferPricing', () => {
  const pasta = {
    menuItemId: 'p1',
    quantity: 1,
    price: 30000,
    category: 'PASTA',
    name: 'Red Sauce Pasta',
  };
  const burger = {
    menuItemId: 'b1',
    quantity: 2,
    price: 25000,
    category: 'BURGERS',
    name: 'Paneer Burger',
  };
  const dessert = {
    menuItemId: 'd1',
    quantity: 1,
    price: 18000,
    category: 'DESSERTS',
    name: 'Brownie',
  };

  it('returns zero for better_luck', () => {
    const r = resolveOfferPricing('better_luck', [pasta]);
    expect(r.discountAmount).toBe(0);
    expect(r.offerLabel).toBe('Better Luck Next Time');
  });

  it('caps flat_50 at ₹50 or subtotal', () => {
    expect(resolveOfferPricing('flat_50', [pasta]).discountAmount).toBe(5000);
    expect(
      resolveOfferPricing('flat_50', [
        { ...pasta, price: 3000, quantity: 1 },
      ]).discountAmount,
    ).toBe(3000);
  });

  it('applies bogo when two burgers present', () => {
    const r = resolveOfferPricing('bogo_burger', [burger]);
    expect(r.discountAmount).toBe(25000);
  });

  it('rejects bogo without two burgers', () => {
    expect(() =>
      resolveOfferPricing('bogo_burger', [{ ...burger, quantity: 1 }]),
    ).toThrow(BadRequestException);
  });

  it('rejects unknown offer codes', () => {
    expect(() => resolveOfferPricing('fake_offer', [pasta])).toThrow(
      BadRequestException,
    );
  });

  it('applies free dessert when dessert line exists', () => {
    const r = resolveOfferPricing('free_dessert', [pasta, dessert]);
    expect(r.discountAmount).toBe(18000);
  });
});

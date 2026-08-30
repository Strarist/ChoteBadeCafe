import { BadRequestException } from '@nestjs/common';
import { OFFER_CATALOG, type OfferCode } from '@cafe/shared-types';

export type OfferLineInput = {
  menuItemId: string;
  quantity: number;
  /** Unit price in paise. */
  price: number;
  category: string;
  name: string;
};

const OFFER_CODES = Object.keys(OFFER_CATALOG) as OfferCode[];

function isBurger(category: string, name: string): boolean {
  return /burger/i.test(category) || /burger/i.test(name);
}

function isDessert(category: string, name: string): boolean {
  return (
    /dessert|waffle|pancake/i.test(category) ||
    /dessert|waffle|pancake/i.test(name)
  );
}

function subtotalPaise(lines: OfferLineInput[]): number {
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}

/** Server-side offer math — never trust client discountAmount. */
export function resolveOfferPricing(
  offerCodeRaw: string | null | undefined,
  lines: OfferLineInput[],
): {
  offerCode: string | null;
  offerLabel: string | null;
  discountAmount: number;
} {
  if (!offerCodeRaw?.trim()) {
    return { offerCode: null, offerLabel: null, discountAmount: 0 };
  }

  const code = offerCodeRaw.trim() as OfferCode;
  if (!OFFER_CODES.includes(code)) {
    throw new BadRequestException(`Unknown offer code: ${offerCodeRaw}`);
  }

  const def = OFFER_CATALOG[code];
  const subtotal = subtotalPaise(lines);

  if (code === 'better_luck') {
    return { offerCode: code, offerLabel: def.label, discountAmount: 0 };
  }

  if (code === 'flat_50') {
    return {
      offerCode: code,
      offerLabel: def.label,
      discountAmount: Math.min(5000, subtotal),
    };
  }

  if (code === 'mystery_25') {
    return {
      offerCode: code,
      offerLabel: def.label,
      discountAmount: Math.min(2500, subtotal),
    };
  }

  if (code === 'bogo_burger') {
    const burgers = lines.filter((l) => isBurger(l.category, l.name));
    const burgerQty = burgers.reduce((s, l) => s + l.quantity, 0);
    if (burgerQty < 2) {
      throw new BadRequestException(
        'BOGO burger offer requires at least two burgers in the order (one paid + one free).',
      );
    }
    const cheapest = [...burgers].sort((a, b) => a.price - b.price)[0]!;
    return {
      offerCode: code,
      offerLabel: def.label,
      discountAmount: cheapest.price,
    };
  }

  if (code === 'free_dessert') {
    const desserts = lines.filter((l) => isDessert(l.category, l.name));
    if (!desserts.length) {
      throw new BadRequestException(
        'Free dessert offer requires a dessert item in the order.',
      );
    }
    const cheapest = Math.min(...desserts.map((l) => l.price));
    return {
      offerCode: code,
      offerLabel: def.label,
      discountAmount: cheapest,
    };
  }

  return { offerCode: null, offerLabel: null, discountAmount: 0 };
}

/** Spin-wheel / table-visit offers applied at checkout. */

export type OfferCode =
  | 'better_luck'
  | 'flat_50'
  | 'bogo_burger'
  | 'free_dessert'
  | 'mystery_25';

export interface OfferDefinition {
  code: OfferCode;
  label: string;
  shortLabel: string;
  description: string;
  /** Wheel segment fill. */
  color: string;
  /** Label color on the wheel. */
  textColor: string;
}

/**
 * Exact 12-segment order from the Chote Bade Spin & Win wheel
 * (clockwise from the top pointer).
 */
export const WHEEL_SEGMENTS: OfferCode[] = [
  'better_luck',
  'flat_50',
  'better_luck',
  'free_dessert',
  'better_luck',
  'bogo_burger',
  'better_luck',
  'flat_50',
  'better_luck',
  'mystery_25',
  'better_luck',
  'bogo_burger',
];

const GOLD = '#d4a84b';
const GOLD_DEEP = '#c4933a';
const BURGUNDY = '#6b1a28';
const BURGUNDY_DEEP = '#4a1018';

export const OFFER_CATALOG: Record<OfferCode, OfferDefinition> = {
  better_luck: {
    code: 'better_luck',
    label: 'Better Luck Next Time',
    shortLabel: 'Better Luck Next Time',
    description: 'No discount this visit — try again next time you sit down.',
    color: BURGUNDY_DEEP,
    textColor: '#f5e6c8',
  },
  flat_50: {
    code: 'flat_50',
    label: '₹50 OFF',
    shortLabel: '₹50 OFF',
    description: '₹50 off your bill at checkout.',
    color: GOLD,
    textColor: '#3a1518',
  },
  free_dessert: {
    code: 'free_dessert',
    label: 'Free Dessert',
    shortLabel: 'Free Dessert',
    description: 'Add one dessert to your cart free of cost.',
    color: GOLD_DEEP,
    textColor: '#3a1518',
  },
  bogo_burger: {
    code: 'bogo_burger',
    label: 'Buy 1 Get 1',
    shortLabel: 'Buy 1 Get 1',
    description: 'Order one burger and get a second burger free.',
    color: BURGUNDY,
    textColor: '#f5e6c8',
  },
  mystery_25: {
    code: 'mystery_25',
    label: 'Mystery Prize',
    shortLabel: 'Mystery Prize',
    description: 'Mystery unlocked — ₹25 off your bill.',
    color: BURGUNDY,
    textColor: '#f5e6c8',
  },
};

export interface AppliedOffer {
  code: OfferCode;
  label: string;
  /** Discount in paise. */
  discountAmount: number;
  /** Human hint when offer cannot fully apply yet (e.g. no dessert in cart). */
  hint?: string | null;
}

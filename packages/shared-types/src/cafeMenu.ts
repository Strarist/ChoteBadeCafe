/**
 * Canonical Chote Bade menu — shared by seed, PetPooja fake sync, and customer fallback.
 * Source of truth: printed café menu PDF (thin-crust / wraps / combos / cold beverages).
 * Prices are INR stored as paise (×100).
 *
 * Pizza sizes: Chote = 8", Bade = 10" (Garden Fresh is 7" only).
 */

export const MENU_CATEGORY_ORDER = [
  'SIGNATURE PICKS',
  'THIN CRUST PIZZA',
  'GRILLED SANDWICHES',
  'GARLIC BREAD',
  'WRAPS & ROLLS',
  'CHAATS & KEBABS',
  'FRIES',
  'SMASH BURGERS',
  'WAFFLES & BROWNIE',
  'MOCKTAILS & COOLERS',
  'SIGNATURE SHAKES',
  'SPECIAL COMBOS',
  'ADD-ONS',
] as const

export type MenuCategory = (typeof MENU_CATEGORY_ORDER)[number]

/** Filter chip labels — keep close to the printed menu section titles. */
export const MENU_CATEGORY_CHIP: Record<string, string> = {
  'SIGNATURE PICKS': 'Signature Picks',
  'THIN CRUST PIZZA': 'Thin Crust Pizza',
  'GRILLED SANDWICHES': 'Grilled Sandwiches',
  'GARLIC BREAD': 'Garlic Bread',
  'WRAPS & ROLLS': 'Wraps & Rolls',
  'CHAATS & KEBABS': 'Chaats & Kebabs',
  FRIES: 'Fries',
  'SMASH BURGERS': 'Smash Burgers',
  'WAFFLES & BROWNIE': 'Waffles & Brownie',
  'MOCKTAILS & COOLERS': 'Mocktails & Coolers',
  'SIGNATURE SHAKES': 'Signature Shakes',
  'SPECIAL COMBOS': 'Special Combos',
  'ADD-ONS': 'Add-ons',
}

export type CafeMenuSeedItem = {
  petpoojaItemId: string
  name: string
  description: string
  /** Price in paise. */
  price: number
  category: string
  isAvailable: boolean
  /** Optional nutrition for UI badges (not stored in DB). */
  nutrition?: { kcal: number; proteinG: number; fiberG: number }
}

const rupees = (n: number) => n * 100

/**
 * Home-category items. Signature picks also appear under SIGNATURE PICKS
 * via SIGNATURE_ITEM_IDS on the client.
 */
export const CAFE_MENU_SEED: CafeMenuSeedItem[] = [
  // —— THIN CRUST PIZZA ——
  {
    petpoojaItemId: 'pp-garden-fresh-pizza',
    name: 'Garden Fresh Pizza (7")',
    description: 'With capsicum, red-yellow bell pepper, corn & onion.',
    price: rupees(129),
    category: 'THIN CRUST PIZZA',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-margherita-pizza-chote',
    name: 'Margherita Pizza — Chote (8")',
    description: 'Classic rich tomato sauce & mozzarella cheese.',
    price: rupees(299),
    category: 'THIN CRUST PIZZA',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-margherita-pizza-bade',
    name: 'Margherita Pizza — Bade (10")',
    description: 'Classic rich tomato sauce & mozzarella cheese.',
    price: rupees(389),
    category: 'THIN CRUST PIZZA',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-mexican-pizza-chote',
    name: 'Mexican Pizza — Chote (8")',
    description: 'Loaded with Mexican herbs, veggies & cheese.',
    price: rupees(389),
    category: 'THIN CRUST PIZZA',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-mexican-pizza-bade',
    name: 'Mexican Pizza — Bade (10")',
    description: 'Loaded with Mexican herbs, veggies & cheese.',
    price: rupees(469),
    category: 'THIN CRUST PIZZA',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-chote-bade-pizza-chote',
    name: 'Chote Bade Pizza — Chote (8")',
    description: "Chef's special loaded supreme combination.",
    price: rupees(399),
    category: 'THIN CRUST PIZZA',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-chote-bade-pizza-bade',
    name: 'Chote Bade Pizza — Bade (10")',
    description: "Chef's special loaded supreme combination.",
    price: rupees(499),
    category: 'THIN CRUST PIZZA',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-paneer-special-pizza-chote',
    name: 'Paneer Special Pizza — Chote (8")',
    description: 'Tandoori spiced paneer cubes & crisp onions.',
    price: rupees(299),
    category: 'THIN CRUST PIZZA',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-paneer-special-pizza-bade',
    name: 'Paneer Special Pizza — Bade (10")',
    description: 'Tandoori spiced paneer cubes & crisp onions.',
    price: rupees(389),
    category: 'THIN CRUST PIZZA',
    isAvailable: true,
  },

  // —— GRILLED SANDWICHES ——
  {
    petpoojaItemId: 'pp-mushroom-garlic-sw',
    name: 'Mushroom Garlic S/W',
    description: 'Sautéed garlic mushrooms & creamy cheese. Toasted.',
    price: rupees(199),
    category: 'GRILLED SANDWICHES',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-spinach-corn-sw',
    name: 'Spinach & Corn S/W',
    description: 'Fresh spinach leaves & sweet corn in white sauce. Toasted.',
    price: rupees(179),
    category: 'GRILLED SANDWICHES',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-cheese-corn-sw',
    name: 'Cheese Corn S/W',
    description: 'Double melted cheese with golden sweet corn. Toasted.',
    price: rupees(149),
    category: 'GRILLED SANDWICHES',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-veggie-loaded-sw',
    name: 'Veggie Loaded S/W',
    description: 'Crisp fresh garden vegetables with mint mayonnaise. Toasted.',
    price: rupees(129),
    category: 'GRILLED SANDWICHES',
    isAvailable: true,
  },

  // —— GARLIC BREAD ——
  {
    petpoojaItemId: 'pp-cb-garlic-bread',
    name: 'CB Garlic Bread',
    description: '4 pcs.',
    price: rupees(129),
    category: 'GARLIC BREAD',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-supreme-garlic-bread',
    name: 'Supreme Garlic Bread',
    description: '4 pcs.',
    price: rupees(199),
    category: 'GARLIC BREAD',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-cheese-corn-garlic-bread',
    name: 'Cheese & Corn Garlic Bread',
    description: '4 pcs.',
    price: rupees(179),
    category: 'GARLIC BREAD',
    isAvailable: true,
  },

  // —— WRAPS & ROLLS ——
  {
    petpoojaItemId: 'pp-paneer-wrap',
    name: 'Paneer Wrap',
    description: 'Spiced paneer filling wrapped with fresh veggies. Fresh made.',
    price: rupees(139),
    category: 'WRAPS & ROLLS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-vegetable-wrap',
    name: 'Vegetable Wrap',
    description: 'Fresh garden veggies wrapped with house special dressing. Fresh made.',
    price: rupees(119),
    category: 'WRAPS & ROLLS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-cigar-roll',
    name: 'Cigar Roll',
    description: 'Crispy fried rolls filled with seasoned veggies. Fresh made.',
    price: rupees(169),
    category: 'WRAPS & ROLLS',
    isAvailable: true,
  },

  // —— CHAATS & KEBABS ——
  {
    petpoojaItemId: 'pp-peanut-chaat',
    name: 'Peanut Chaat',
    description: 'Starter chaat.',
    price: rupees(139),
    category: 'CHAATS & KEBABS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-paneer-chaat',
    name: 'Paneer Chaat',
    description: 'Starter chaat.',
    price: rupees(179),
    category: 'CHAATS & KEBABS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-crispy-aloo-chaat',
    name: 'Crispy Aloo Chaat',
    description: 'Starter chaat.',
    price: rupees(179),
    category: 'CHAATS & KEBABS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-paneer-popcorn',
    name: 'Paneer Popcorn',
    description: 'Crispy paneer bites.',
    price: rupees(149),
    category: 'CHAATS & KEBABS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-crispy-corn',
    name: 'Crispy Corn',
    description: 'Crispy corn starter.',
    price: rupees(169),
    category: 'CHAATS & KEBABS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-veg-kabab',
    name: 'Veg Kabab (5 Pcs)',
    description: '5 pcs.',
    price: rupees(99),
    category: 'CHAATS & KEBABS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-hara-bhara-kabab',
    name: 'Hara Bhara Kabab (5 Pcs)',
    description: '5 pcs.',
    price: rupees(149),
    category: 'CHAATS & KEBABS',
    isAvailable: true,
  },

  // —— FRIES ——
  {
    petpoojaItemId: 'pp-salted-fries',
    name: 'Salted Fries',
    description: 'Classic salted fries.',
    price: rupees(149),
    category: 'FRIES',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-peri-peri-fries',
    name: 'Peri-Peri Fries',
    description: 'Fries tossed in peri-peri spice.',
    price: rupees(169),
    category: 'FRIES',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-loaded-cheese-fries',
    name: 'Loaded Cheese Fries',
    description: 'Fries loaded with cheese.',
    price: rupees(249),
    category: 'FRIES',
    isAvailable: true,
  },

  // —— SMASH BURGERS ——
  {
    petpoojaItemId: 'pp-smash-classic-veg',
    name: 'Smash Classic Veg',
    description: 'Crispy veg patty with house coleslaw.',
    price: rupees(99),
    category: 'SMASH BURGERS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-smash-mushroom-burger',
    name: 'Smash Mushroom Burger',
    description: 'Juicy mushroom patty with special herb sauce.',
    price: rupees(139),
    category: 'SMASH BURGERS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-smash-cheese-pizza-burger',
    name: 'Smash Cheese Pizza Burger',
    description: 'Loaded melted cheese with pizza seasoning.',
    price: rupees(149),
    category: 'SMASH BURGERS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-smash-crispy-supreme',
    name: 'Smash Crispy Supreme',
    description: 'Extra crunchy double patty deluxe burger.',
    price: rupees(199),
    category: 'SMASH BURGERS',
    isAvailable: true,
  },

  // —— WAFFLES & BROWNIE ——
  {
    petpoojaItemId: 'pp-nutella-waffle',
    name: 'Nutella Waffle',
    description: 'Warm waffle with Nutella.',
    price: rupees(149),
    category: 'WAFFLES & BROWNIE',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-chocolate-waffle-ice-cream',
    name: 'Chocolate Waffle with Ice Cream',
    description: 'Chocolate waffle served with ice cream.',
    price: rupees(159),
    category: 'WAFFLES & BROWNIE',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-hot-brownie-ice-cream',
    name: 'Hot Brownie with Ice Cream',
    description: 'Hot brownie served with ice cream.',
    price: rupees(199),
    category: 'WAFFLES & BROWNIE',
    isAvailable: true,
  },

  // —— MOCKTAILS & COOLERS ——
  {
    petpoojaItemId: 'pp-fresh-lime-salted-mocktail',
    name: 'Fresh Lime Salted Mocktail',
    description: 'Sugar free sparkling refresher.',
    price: rupees(89),
    category: 'MOCKTAILS & COOLERS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-lemon-iced-tea',
    name: 'Lemon Iced Tea',
    description: 'Chilled brewed tea with a fresh lemon twist.',
    price: rupees(99),
    category: 'MOCKTAILS & COOLERS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-mint-mojito-sugar-free',
    name: 'Mint Mojito (Sugar Free)',
    description: 'Crushed fresh mint leaves & lime soda.',
    price: rupees(99),
    category: 'MOCKTAILS & COOLERS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-peach-iced-tea',
    name: 'Peach Iced Tea',
    description: 'Sweet peach infused cold tea.',
    price: rupees(119),
    category: 'MOCKTAILS & COOLERS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-cranberry-basil-cooler',
    name: 'Cranberry Basil Cooler',
    description: 'Tangy cranberry with fresh basil aroma.',
    price: rupees(149),
    category: 'MOCKTAILS & COOLERS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-green-apple-mojito',
    name: 'Green Apple Mojito',
    description: 'Crisp green apple flavor with sparkling mint.',
    price: rupees(149),
    category: 'MOCKTAILS & COOLERS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-blue-lagoon-cooler',
    name: 'Blue Lagoon Cooler',
    description: 'Vibrant citrus punch mocktail.',
    price: rupees(149),
    category: 'MOCKTAILS & COOLERS',
    isAvailable: true,
  },

  // —— SIGNATURE SHAKES ——
  {
    petpoojaItemId: 'pp-cb-special-cold-coffee',
    name: 'CB Special Cold Coffee',
    description: 'House special cold coffee.',
    price: rupees(99),
    category: 'SIGNATURE SHAKES',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-strawberry-thick-shake',
    name: 'Strawberry Thick Shake',
    description: 'Rich strawberry pulp blended with creamy ice cream.',
    price: rupees(149),
    category: 'SIGNATURE SHAKES',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-kit-berry-shake',
    name: 'Kit Berry Shake',
    description: 'Fusion of crisp chocolate and berry flavors.',
    price: rupees(149),
    category: 'SIGNATURE SHAKES',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-blueberry-special-shake',
    name: 'Blueberry Special Shake',
    description: 'Sweet blueberry syrup blended to perfection.',
    price: rupees(149),
    category: 'SIGNATURE SHAKES',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-oreo-crunch-shake',
    name: 'Oreo Crunch Shake',
    description: 'Loaded with crushed Oreo cookies and chocolate drizzle.',
    price: rupees(159),
    category: 'SIGNATURE SHAKES',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-kitkat-shake',
    name: 'KitKat Shake',
    description: 'Crunchy Kit Kat bars blended into thick chocolate shake.',
    price: rupees(169),
    category: 'SIGNATURE SHAKES',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-classic-chocolate-shake',
    name: 'Classic Chocolate Shake',
    description: 'Timeless rich cocoa chocolate shake.',
    price: rupees(169),
    category: 'SIGNATURE SHAKES',
    isAvailable: true,
  },

  // —— SPECIAL COMBOS ——
  {
    petpoojaItemId: 'pp-cb-special-combo',
    name: 'CB Special Combo',
    description: 'Fries, 2 slice pizza, brownie with ice cream, veg wrap 1/2, pasta, garlic bread.',
    price: rupees(289),
    category: 'SPECIAL COMBOS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-corporate-combo',
    name: 'Corporate Combo',
    description: 'Grilled sandwich, hara bhara kabab, cigar roll, French fries.',
    price: rupees(209),
    category: 'SPECIAL COMBOS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-evening-snacks-combo',
    name: 'Evening Snacks Combo',
    description: 'Mushroom cottage cheese, crispy potato, peri-peri fries.',
    price: rupees(179),
    category: 'SPECIAL COMBOS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-family-combo',
    name: 'Family Combo',
    description: 'Nutella waffle or chocolate waffle, 2 slice pizza, 2 pcs garlic bread, French fries, shake (by choice).',
    price: rupees(269),
    category: 'SPECIAL COMBOS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-healthy-combo',
    name: 'Healthy Combo',
    description: 'Falafel pita bread with hummus, fattoush salad, corn chaat, mocktail (by choice).',
    price: rupees(329),
    category: 'SPECIAL COMBOS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-student-combo',
    name: 'Student Combo',
    description: 'Veg wrap or burger, regular fries, cold drink.',
    price: rupees(149),
    category: 'SPECIAL COMBOS',
    isAvailable: true,
  },

  // —— ADD-ONS (₹20 each) ——
  {
    petpoojaItemId: 'pp-addon-caramel-syrup',
    name: 'Caramel Syrup',
    description: 'Add-on syrup.',
    price: rupees(20),
    category: 'ADD-ONS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-addon-hazelnut-syrup',
    name: 'Hazelnut Syrup',
    description: 'Add-on syrup.',
    price: rupees(20),
    category: 'ADD-ONS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-addon-vanilla-syrup',
    name: 'Vanilla Syrup',
    description: 'Add-on syrup.',
    price: rupees(20),
    category: 'ADD-ONS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-addon-whipped-cream',
    name: 'Whipped Cream',
    description: 'Add-on topping.',
    price: rupees(20),
    category: 'ADD-ONS',
    isAvailable: true,
  },
  {
    petpoojaItemId: 'pp-addon-pearl-boba',
    name: 'Pearl Boba',
    description: 'Add-on topping.',
    price: rupees(20),
    category: 'ADD-ONS',
    isAvailable: true,
  },
]

/** petpoojaItemIds that also appear under Signature Picks on the menu UI. */
export const SIGNATURE_ITEM_IDS = new Set([
  'pp-chote-bade-pizza-chote',
  'pp-chote-bade-pizza-bade',
  'pp-cb-special-combo',
  'pp-cb-special-cold-coffee',
  'pp-peri-peri-fries',
  'pp-hot-brownie-ice-cream',
  'pp-smash-crispy-supreme',
])

/** Stable display order matching the printed menu (within and across categories). */
export const MENU_ITEM_ORDER = CAFE_MENU_SEED.map((item) => item.petpoojaItemId)

/** Canonical petpooja IDs — anything else in DB should be retired from the live menu. */
export const CANONICAL_MENU_IDS = new Set(MENU_ITEM_ORDER)

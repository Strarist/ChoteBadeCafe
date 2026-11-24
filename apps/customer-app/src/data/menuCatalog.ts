import { SIGNATURE_ITEM_IDS } from '@cafe/shared-types'
import { CAFE_MENU_SEED } from '@cafe/shared-types'

export type MenuTags = string[]

export type MenuNutrition = {
  kcal: number
  proteinG: number
  fiberG: number
}

export type MenuCatalogEntry = {
  displayName: string
  description: string
  image: string
  imageAlt: string
  tags: MenuTags
  nutrition?: MenuNutrition
}

const u = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

/**
 * Per-dish photos — Unsplash IDs chosen for plated veg cafe food.
 */
const byId: Record<
  string,
  { photo: string; imageAlt: string; tags: MenuTags }
> = {
  'pp-garden-fresh-pizza': {
    photo: 'photo-1574071318508-1cdbab80d002',
    imageAlt: 'Garden fresh thin crust pizza',
    tags: ['VEG'],
  },
  'pp-margherita-pizza-chote': {
    photo: 'photo-1574071318508-1cdbab80d002',
    imageAlt: 'Margherita pizza Chote size',
    tags: ['VEG'],
  },
  'pp-margherita-pizza-bade': {
    photo: 'photo-1574071318508-1cdbab80d002',
    imageAlt: 'Margherita pizza Bade size',
    tags: ['VEG'],
  },
  'pp-mexican-pizza-chote': {
    photo: 'photo-1552539618-7eec9b4d1796',
    imageAlt: 'Mexican pizza Chote size',
    tags: ['VEG'],
  },
  'pp-mexican-pizza-bade': {
    photo: 'photo-1552539618-7eec9b4d1796',
    imageAlt: 'Mexican pizza Bade size',
    tags: ['VEG'],
  },
  'pp-chote-bade-pizza-chote': {
    photo: 'photo-1571997478779-2adcbbe9ab2f',
    imageAlt: 'Chote Bade signature pizza Chote size',
    tags: ['VEG', 'SIGNATURE'],
  },
  'pp-chote-bade-pizza-bade': {
    photo: 'photo-1571997478779-2adcbbe9ab2f',
    imageAlt: 'Chote Bade signature pizza Bade size',
    tags: ['VEG', 'SIGNATURE'],
  },
  'pp-paneer-special-pizza-chote': {
    photo: 'photo-1615719413546-198b25453f85',
    imageAlt: 'Paneer special pizza Chote size',
    tags: ['VEG'],
  },
  'pp-paneer-special-pizza-bade': {
    photo: 'photo-1615719413546-198b25453f85',
    imageAlt: 'Paneer special pizza Bade size',
    tags: ['VEG'],
  },
  'pp-mushroom-garlic-sw': {
    photo: 'photo-1655279562015-047c3da9a271',
    imageAlt: 'Mushroom garlic grilled sandwich',
    tags: ['VEG'],
  },
  'pp-spinach-corn-sw': {
    photo: 'photo-1475090169767-40ed8d18f67d',
    imageAlt: 'Spinach and corn grilled sandwich',
    tags: ['VEG'],
  },
  'pp-cheese-corn-sw': {
    photo: 'photo-1608949621253-4eedba1d6b95',
    imageAlt: 'Cheese corn grilled sandwich',
    tags: ['VEG'],
  },
  'pp-veggie-loaded-sw': {
    photo: 'photo-1528735602780-2552fd46c7af',
    imageAlt: 'Veggie loaded grilled sandwich',
    tags: ['VEG'],
  },
  'pp-cb-garlic-bread': {
    photo: 'photo-1556008531-57e6eefc7be4',
    imageAlt: 'CB garlic bread',
    tags: ['VEG'],
  },
  'pp-supreme-garlic-bread': {
    photo: 'photo-1608039858788-667850f129f6',
    imageAlt: 'Supreme garlic bread',
    tags: ['VEG'],
  },
  'pp-cheese-corn-garlic-bread': {
    photo: 'photo-1598785244280-7a428600d053',
    imageAlt: 'Cheese and corn garlic bread',
    tags: ['VEG'],
  },
  'pp-paneer-wrap': {
    photo: 'photo-1632660346941-023cc64e1252',
    imageAlt: 'Paneer wrap',
    tags: ['VEG'],
  },
  'pp-vegetable-wrap': {
    photo: 'photo-1585238342107-49a3cdace47f',
    imageAlt: 'Vegetable wrap',
    tags: ['VEG'],
  },
  'pp-cigar-roll': {
    photo: 'photo-1601050690597-df0568f70950',
    imageAlt: 'Crispy cigar rolls',
    tags: ['VEG'],
  },
  'pp-peanut-chaat': {
    photo: 'photo-1601050690597-df0568f70950',
    imageAlt: 'Peanut chaat',
    tags: ['VEG'],
  },
  'pp-paneer-chaat': {
    photo: 'photo-1601050690597-df0568f70950',
    imageAlt: 'Paneer chaat',
    tags: ['VEG'],
  },
  'pp-crispy-aloo-chaat': {
    photo: 'photo-1601050690597-df0568f70950',
    imageAlt: 'Crispy aloo chaat',
    tags: ['VEG'],
  },
  'pp-paneer-popcorn': {
    photo: 'photo-1632660346941-023cc64e1252',
    imageAlt: 'Paneer popcorn',
    tags: ['VEG'],
  },
  'pp-crispy-corn': {
    photo: 'photo-1628394029816-1dc524670f60',
    imageAlt: 'Crispy corn',
    tags: ['VEG'],
  },
  'pp-veg-kabab': {
    photo: 'photo-1414235077428-338989a2e8c0',
    imageAlt: 'Veg kabab',
    tags: ['VEG'],
  },
  'pp-hara-bhara-kabab': {
    photo: 'photo-1414235077428-338989a2e8c0',
    imageAlt: 'Hara bhara kabab',
    tags: ['VEG'],
  },
  'pp-salted-fries': {
    photo: 'photo-1630384060421-cb20d0e0649d',
    imageAlt: 'Salted fries',
    tags: ['VEG'],
  },
  'pp-peri-peri-fries': {
    photo: 'photo-1630431341973-02e1b662ec35',
    imageAlt: 'Peri-peri fries',
    tags: ['VEG', 'SIGNATURE'],
  },
  'pp-loaded-cheese-fries': {
    photo: 'photo-1639744210631-209fce3e256c',
    imageAlt: 'Loaded cheese fries',
    tags: ['VEG'],
  },
  'pp-smash-classic-veg': {
    photo: 'photo-1520073201527-6b044ba2ca9f',
    imageAlt: 'Smash classic veg burger',
    tags: ['VEG'],
  },
  'pp-smash-mushroom-burger': {
    photo: 'photo-1525059696034-4967a8e1dca2',
    imageAlt: 'Smash mushroom burger',
    tags: ['VEG'],
  },
  'pp-smash-cheese-pizza-burger': {
    photo: 'photo-1583011482205-844cac1d6337',
    imageAlt: 'Smash cheese pizza burger',
    tags: ['VEG'],
  },
  'pp-smash-crispy-supreme': {
    photo: 'photo-1583011482205-844cac1d6337',
    imageAlt: 'Smash crispy supreme burger',
    tags: ['VEG', 'SIGNATURE'],
  },
  'pp-nutella-waffle': {
    photo: 'photo-1528207776546-365bb710ee93',
    imageAlt: 'Nutella waffle',
    tags: ['VEG'],
  },
  'pp-chocolate-waffle-ice-cream': {
    photo: 'photo-1562376552-0d160a2f238d',
    imageAlt: 'Chocolate waffle with ice cream',
    tags: ['VEG'],
  },
  'pp-hot-brownie-ice-cream': {
    photo: 'photo-1648857529887-28d03f6774ea',
    imageAlt: 'Hot brownie with ice cream',
    tags: ['VEG', 'SIGNATURE'],
  },
  'pp-fresh-lime-salted-mocktail': {
    photo: 'photo-1622597467836-f3285f2131b8',
    imageAlt: 'Fresh lime salted mocktail',
    tags: ['VEG', 'ICED'],
  },
  'pp-lemon-iced-tea': {
    photo: 'photo-1556679343-c7306c1976bc',
    imageAlt: 'Lemon iced tea',
    tags: ['VEG', 'ICED'],
  },
  'pp-mint-mojito-sugar-free': {
    photo: 'photo-1622597467836-f3285f2131b8',
    imageAlt: 'Mint mojito sugar free',
    tags: ['VEG', 'ICED'],
  },
  'pp-peach-iced-tea': {
    photo: 'photo-1601390395693-364c0e22031a',
    imageAlt: 'Peach iced tea',
    tags: ['VEG', 'ICED'],
  },
  'pp-cranberry-basil-cooler': {
    photo: 'photo-1497534446932-c925b458314e',
    imageAlt: 'Cranberry basil cooler',
    tags: ['VEG', 'ICED'],
  },
  'pp-green-apple-mojito': {
    photo: 'photo-1600271886742-f049cd451bba',
    imageAlt: 'Green apple mojito',
    tags: ['VEG', 'ICED'],
  },
  'pp-blue-lagoon-cooler': {
    photo: 'photo-1497534446932-c925b458314e',
    imageAlt: 'Blue lagoon cooler',
    tags: ['VEG', 'ICED'],
  },
  'pp-cb-special-cold-coffee': {
    photo: 'photo-1553787499-6f9133860278',
    imageAlt: 'CB special cold coffee',
    tags: ['VEG', 'ICED', 'SIGNATURE'],
  },
  'pp-strawberry-thick-shake': {
    photo: 'photo-1579954115545-a95591f28bfc',
    imageAlt: 'Strawberry thick shake',
    tags: ['VEG', 'ICED'],
  },
  'pp-kit-berry-shake': {
    photo: 'photo-1577805947697-89e18249d767',
    imageAlt: 'Kit berry shake',
    tags: ['VEG', 'ICED'],
  },
  'pp-blueberry-special-shake': {
    photo: 'photo-1579954115545-a95591f28bfc',
    imageAlt: 'Blueberry special shake',
    tags: ['VEG', 'ICED'],
  },
  'pp-oreo-crunch-shake': {
    photo: 'photo-1577805947697-89e18249d767',
    imageAlt: 'Oreo crunch shake',
    tags: ['VEG', 'ICED'],
  },
  'pp-kitkat-shake': {
    photo: 'photo-1572490122747-3968b75cc699',
    imageAlt: 'KitKat shake',
    tags: ['VEG', 'ICED'],
  },
  'pp-classic-chocolate-shake': {
    photo: 'photo-1572490122747-3968b75cc699',
    imageAlt: 'Classic chocolate shake',
    tags: ['VEG', 'ICED'],
  },
  'pp-cb-special-combo': {
    photo: 'photo-1571997478779-2adcbbe9ab2f',
    imageAlt: 'CB special combo platter',
    tags: ['VEG', 'SIGNATURE', 'COMBO'],
  },
  'pp-corporate-combo': {
    photo: 'photo-1528735602780-2552fd46c7af',
    imageAlt: 'Corporate combo platter',
    tags: ['VEG', 'COMBO'],
  },
  'pp-evening-snacks-combo': {
    photo: 'photo-1630431341973-02e1b662ec35',
    imageAlt: 'Evening snacks combo',
    tags: ['VEG', 'COMBO'],
  },
  'pp-family-combo': {
    photo: 'photo-1528207776546-365bb710ee93',
    imageAlt: 'Family combo platter',
    tags: ['VEG', 'COMBO'],
  },
  'pp-healthy-combo': {
    photo: 'photo-1572449043416-55f4685c9bb7',
    imageAlt: 'Healthy combo platter',
    tags: ['VEG', 'COMBO'],
  },
  'pp-student-combo': {
    photo: 'photo-1520073201527-6b044ba2ca9f',
    imageAlt: 'Student combo',
    tags: ['VEG', 'COMBO'],
  },
  'pp-addon-caramel-syrup': {
    photo: 'photo-1485808191679-5f86510681a2',
    imageAlt: 'Caramel syrup add-on',
    tags: ['VEG', 'ADD-ON'],
  },
  'pp-addon-hazelnut-syrup': {
    photo: 'photo-1504753793650-d4a2b783c15e',
    imageAlt: 'Hazelnut syrup add-on',
    tags: ['VEG', 'ADD-ON'],
  },
  'pp-addon-vanilla-syrup': {
    photo: 'photo-1542990253-0d0f5be5f0ed',
    imageAlt: 'Vanilla syrup add-on',
    tags: ['VEG', 'ADD-ON'],
  },
  'pp-addon-whipped-cream': {
    photo: 'photo-1572490122747-3968b75cc699',
    imageAlt: 'Whipped cream add-on',
    tags: ['VEG', 'ADD-ON'],
  },
  'pp-addon-pearl-boba': {
    photo: 'photo-1553787499-6f9133860278',
    imageAlt: 'Pearl boba add-on',
    tags: ['VEG', 'ADD-ON'],
  },
}

const fallbackPhoto = 'photo-1495474472287-4d71bcdd2085'

function buildCatalog(): Record<string, MenuCatalogEntry> {
  const out: Record<string, MenuCatalogEntry> = {}
  for (const item of CAFE_MENU_SEED) {
    const meta = byId[item.petpoojaItemId]
    const tags = [...(meta?.tags ?? ['VEG'])]
    if (SIGNATURE_ITEM_IDS.has(item.petpoojaItemId) && !tags.includes('SIGNATURE')) {
      tags.push('SIGNATURE')
    }
    out[catalogKey(item.name)] = {
      displayName: item.name,
      description: item.description,
      image: u(meta?.photo ?? fallbackPhoto),
      imageAlt: meta?.imageAlt ?? item.name,
      tags,
      nutrition: item.nutrition,
    }
  }
  return out
}

export const menuCatalog: Record<string, MenuCatalogEntry> = buildCatalog()

export const fallbackMenuImage = u(fallbackPhoto)

export function catalogKey(name: string) {
  return name.trim().toLowerCase()
}

export function getCatalogEntry(name: string): MenuCatalogEntry {
  const found = menuCatalog[catalogKey(name)]
  if (found) return found

  const titled = name
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())

  return {
    displayName: titled,
    description: 'From the counter, made to share.',
    image: fallbackMenuImage,
    imageAlt: titled,
    tags: ['VEG'],
  }
}

export function isSignatureItem(petpoojaOrId: string, name: string) {
  if (SIGNATURE_ITEM_IDS.has(petpoojaOrId)) return true
  return getCatalogEntry(name).tags.includes('SIGNATURE')
}

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
 * Per-dish photos — Unsplash IDs chosen for plated veg cafe food (no beef/pork burgers).
 */
const byId: Record<
  string,
  { photo: string; imageAlt: string; tags: MenuTags }
> = {
  'pp-white-sauce-pasta': {
    photo: 'photo-1645112411341-6c4fd023714a',
    imageAlt: 'Creamy white sauce pasta',
    tags: ['VEG'],
  },
  'pp-red-sauce-pasta': {
    photo: 'photo-1676300184847-4ee4030409c0',
    imageAlt: 'Red sauce tomato pasta',
    tags: ['VEG'],
  },
  'pp-pesto-sauce-pasta': {
    photo: 'photo-1473093295043-cdd812d0e601',
    imageAlt: 'Basil pesto pasta',
    tags: ['VEG'],
  },
  'pp-makhani-pasta': {
    photo: 'photo-1709201417368-f0f779f3b8d8',
    imageAlt: 'Creamy makhani pasta',
    tags: ['VEG', 'SIGNATURE'],
  },
  'pp-mexican-yellow-rice-tofu': {
    photo: 'photo-1628394029816-1dc524670f60',
    imageAlt: 'Mexican yellow rice bowl with tofu',
    tags: ['VEG'],
  },
  'pp-veggie-wrap': {
    photo: 'photo-1585238342107-49a3cdace47f',
    imageAlt: 'Fresh vegetable wrap',
    tags: ['VEG'],
  },
  'pp-crispy-paneer-wrap': {
    photo: 'photo-1632660346941-023cc64e1252',
    imageAlt: 'Crispy paneer wrap',
    tags: ['VEG', 'SIGNATURE'],
  },
  'pp-falafel-wrap': {
    photo: 'photo-1681072530653-db8fe2538631',
    imageAlt: 'Falafel wrap',
    tags: ['VEG'],
  },
  'pp-hummus-with-falafel': {
    photo: 'photo-1562059390-a761a084768e',
    imageAlt: 'Hummus with falafel platter',
    tags: ['VEG'],
  },
  'pp-hummus-falafel-pita-pocket': {
    photo: 'photo-1631021967255-898a52176fea',
    imageAlt: 'Hummus falafel pita pocket',
    tags: ['VEG'],
  },
  'pp-garlic-bread': {
    photo: 'photo-1556008531-57e6eefc7be4',
    imageAlt: 'Toasted garlic bread',
    tags: ['VEG'],
  },
  'pp-butter-garlic-bread': {
    photo: 'photo-1619535860434-ba1d8fa12536',
    imageAlt: 'Butter garlic bread',
    tags: ['VEG'],
  },
  'pp-cheese-garlic-bread': {
    photo: 'photo-1619531040576-f9416740661b',
    imageAlt: 'Cheese garlic bread',
    tags: ['VEG'],
  },
  'pp-supreme-garlic-bread': {
    photo: 'photo-1608039858788-667850f129f6',
    imageAlt: 'Supreme garlic bread',
    tags: ['VEG'],
  },
  'pp-cheese-corn-garlic-bread': {
    photo: 'photo-1598785244280-7a428600d053',
    imageAlt: 'Cheese corn garlic bread',
    tags: ['VEG'],
  },
  'pp-mushroom-garlic-bread': {
    photo: 'photo-1612716391329-28564c434ccc',
    imageAlt: 'Mushroom garlic bread',
    tags: ['VEG'],
  },
  'pp-paneer-makhani-sandwich': {
    photo: 'photo-1639744093483-86714cd62a3b',
    imageAlt: 'Paneer makhani sandwich',
    tags: ['VEG'],
  },
  'pp-veg-spicy-potato-sandwich': {
    photo: 'photo-1528735602780-2552fd46c7af',
    imageAlt: 'Spicy potato sandwich',
    tags: ['VEG'],
  },
  'pp-creamy-melt-corn-sandwich': {
    photo: 'photo-1608949621253-4eedba1d6b95',
    imageAlt: 'Creamy corn melt sandwich',
    tags: ['VEG'],
  },
  'pp-spinach-corn-sandwich': {
    photo: 'photo-1475090169767-40ed8d18f67d',
    imageAlt: 'Spinach and corn sandwich',
    tags: ['VEG'],
  },
  'pp-mushroom-garlic-sandwich': {
    photo: 'photo-1655279562015-047c3da9a271',
    imageAlt: 'Mushroom garlic sandwich',
    tags: ['VEG'],
  },
  'pp-loaded-taco-chips': {
    photo: 'photo-1565299585323-38d6b0865b47',
    imageAlt: 'Loaded taco chips',
    tags: ['VEG'],
  },
  'pp-pile-me-up-nachos': {
    photo: 'photo-1582169296194-e4d644c48063',
    imageAlt: 'Loaded nachos',
    tags: ['VEG'],
  },
  'pp-paneer-chaat': {
    photo: 'photo-1601050690597-df0568f70950',
    imageAlt: 'Paneer chaat',
    tags: ['VEG'],
  },
  'pp-mushroom-croquettes': {
    photo: 'photo-1414235077428-338989a2e8c0',
    imageAlt: 'Mushroom croquettes',
    tags: ['VEG'],
  },
  'pp-rajma-rice': {
    photo: 'photo-1668236534990-73c4ed23043c',
    imageAlt: 'Rajma rice bowl',
    tags: ['VEG'],
  },
  'pp-simple-fries': {
    photo: 'photo-1630384060421-cb20d0e0649d',
    imageAlt: 'Simple golden fries',
    tags: ['VEG'],
  },
  'pp-peri-peri-fries': {
    photo: 'photo-1630431341973-02e1b662ec35',
    imageAlt: 'Peri-peri fries',
    tags: ['VEG', 'SIGNATURE'],
  },
  'pp-truffle-fries': {
    photo: 'photo-1541592106381-b31e9677c0e5',
    imageAlt: 'Truffle fries',
    tags: ['VEG'],
  },
  'pp-loaded-fries': {
    photo: 'photo-1639744210631-209fce3e256c',
    imageAlt: 'Loaded fries',
    tags: ['VEG'],
  },
  'pp-margherita-pizza': {
    photo: 'photo-1574071318508-1cdbab80d002',
    imageAlt: 'Margherita pizza',
    tags: ['VEG'],
  },
  'pp-mexican-pizza': {
    photo: 'photo-1552539618-7eec9b4d1796',
    imageAlt: 'Mexican pizza',
    tags: ['VEG'],
  },
  'pp-chote-bade-pizza': {
    photo: 'photo-1571997478779-2adcbbe9ab2f',
    imageAlt: 'Chote Bade signature pizza',
    tags: ['VEG', 'SIGNATURE'],
  },
  'pp-chilli-paneer-pizza': {
    photo: 'photo-1615719413546-198b25453f85',
    imageAlt: 'Chilli paneer pizza',
    tags: ['VEG'],
  },
  'pp-pesto-pizza': {
    photo: 'photo-1593560708920-61dd98c46a4e',
    imageAlt: 'Pesto pizza',
    tags: ['VEG'],
  },
  'pp-paneer-burger': {
    photo: 'photo-1583011482205-844cac1d6337',
    imageAlt: 'Vegetarian paneer-style burger with lettuce and cheese',
    tags: ['VEG'],
  },
  'pp-mushroom-burger': {
    photo: 'photo-1525059696034-4967a8e1dca2',
    imageAlt: 'Vegetarian mushroom burger',
    tags: ['VEG'],
  },
  'pp-loaded-burger': {
    photo: 'photo-1583011482205-844cac1d6337',
    imageAlt: 'Loaded vegetarian burger',
    tags: ['VEG'],
  },
  'pp-aloo-tikki-burger': {
    photo: 'photo-1520073201527-6b044ba2ca9f',
    imageAlt: 'Aloo tikki veggie burger',
    tags: ['VEG'],
  },
  'pp-arabic-fattoush-salad': {
    photo: 'photo-1572449043416-55f4685c9bb7',
    imageAlt: 'Arabic fattoush salad',
    tags: ['VEG'],
  },
  'pp-caesar-salad': {
    photo: 'photo-1622637103261-ae624e188bd0',
    imageAlt: 'Fresh vegetarian Caesar-style salad',
    tags: ['VEG'],
  },
  'pp-greek-salad': {
    photo: 'photo-1622637103261-ae624e188bd0',
    imageAlt: 'Greek salad',
    tags: ['VEG'],
  },
  'pp-banoffee-waffle': {
    photo: 'photo-1562376552-0d160a2f238d',
    imageAlt: 'Banoffee waffle',
    tags: ['VEG'],
  },
  'pp-nutella-waffle': {
    photo: 'photo-1528207776546-365bb710ee93',
    imageAlt: 'Nutella waffle',
    tags: ['VEG'],
  },
  'pp-american-granola-pancake': {
    photo: 'photo-1598214886806-c87b84b7078b',
    imageAlt: 'American granola pancakes',
    tags: ['VEG'],
  },
  'pp-double-choco-chip-pancake': {
    photo: 'photo-1567620905732-2d1ec7ab7445',
    imageAlt: 'Double chocolate chip pancakes',
    tags: ['VEG'],
  },
  'pp-cheesecake': {
    photo: 'photo-1578775887804-699de7086ff9',
    imageAlt: 'Cheesecake slice',
    tags: ['VEG'],
  },
  'pp-tres-leches': {
    photo: 'photo-1529258283598-8d6fe60b27f4',
    imageAlt: 'Tres leches cake',
    tags: ['VEG'],
  },
  'pp-sizzling-brownie-ice-cream': {
    photo: 'photo-1648857529887-28d03f6774ea',
    imageAlt: 'Sizzling brownie with ice cream',
    tags: ['VEG', 'SIGNATURE'],
  },
  'pp-brownie': {
    photo: 'photo-1606313564200-e75d5e30476c',
    imageAlt: 'Chocolate brownie',
    tags: ['VEG'],
  },
  'pp-espresso': {
    photo: 'photo-1510591509098-f4fdc6d0ff04',
    imageAlt: 'Espresso shot',
    tags: ['VEG', 'HOT'],
  },
  'pp-double-espresso': {
    photo: 'photo-1579992357154-faf4bde95b3d',
    imageAlt: 'Double espresso',
    tags: ['VEG', 'HOT'],
  },
  'pp-americano': {
    photo: 'photo-1514432324607-a09d9b4aefdd',
    imageAlt: 'Americano',
    tags: ['VEG', 'HOT'],
  },
  'pp-cappuccino': {
    photo: 'photo-1572442388796-11668a67e53d',
    imageAlt: 'Cappuccino',
    tags: ['VEG', 'HOT'],
  },
  'pp-cafe-latte': {
    photo: 'photo-1504753793650-d4a2b783c15e',
    imageAlt: 'Café latte',
    tags: ['VEG', 'HOT'],
  },
  'pp-flat-white': {
    photo: 'photo-1541167760496-1628856ab772',
    imageAlt: 'Flat white',
    tags: ['VEG', 'HOT'],
  },
  'pp-cafe-mocha': {
    photo: 'photo-1485808191679-5f86510681a2',
    imageAlt: 'Café mocha',
    tags: ['VEG', 'HOT'],
  },
  'pp-spanish-latte': {
    photo: 'photo-1631292007327-70297e83d78b',
    imageAlt: 'Spanish latte',
    tags: ['VEG', 'HOT'],
  },
  'pp-hazelnut-latte': {
    photo: 'photo-1504753793650-d4a2b783c15e',
    imageAlt: 'Hazelnut latte',
    tags: ['VEG', 'HOT'],
  },
  'pp-caramel-macchiato': {
    photo: 'photo-1485808191679-5f86510681a2',
    imageAlt: 'Caramel macchiato',
    tags: ['VEG', 'HOT'],
  },
  'pp-iced-americano': {
    photo: 'photo-1517701604599-bb29b565090c',
    imageAlt: 'Iced americano',
    tags: ['VEG', 'ICED'],
  },
  'pp-iced-latte': {
    photo: 'photo-1461023058943-07fcbe16d735',
    imageAlt: 'Iced latte',
    tags: ['VEG', 'ICED'],
  },
  'pp-iced-spanish-latte': {
    photo: 'photo-1589985902809-39d25db22101',
    imageAlt: 'Iced Spanish latte',
    tags: ['VEG', 'ICED'],
  },
  'pp-iced-mocha': {
    photo: 'photo-1671759545218-831c32bfe92d',
    imageAlt: 'Iced mocha',
    tags: ['VEG', 'ICED'],
  },
  'pp-cold-brew': {
    photo: 'photo-1517701604599-bb29b565090c',
    imageAlt: 'Cold brew',
    tags: ['VEG', 'ICED'],
  },
  'pp-classic-cold-coffee': {
    photo: 'photo-1553787499-6f9133860278',
    imageAlt: 'Classic cold coffee',
    tags: ['VEG', 'ICED'],
  },
  'pp-signature-chote-bade-cold-coffee': {
    photo: 'photo-1553787499-6f9133860278',
    imageAlt: 'Signature Chote Bade cold coffee',
    tags: ['VEG', 'ICED', 'SIGNATURE'],
  },
  'pp-belgian-chocolate-frappe': {
    photo: 'photo-1572490122747-3968b75cc699',
    imageAlt: 'Belgian chocolate frappe',
    tags: ['VEG', 'ICED'],
  },
  'pp-hazelnut-coffee-frappe': {
    photo: 'photo-1577805947697-89e18249d767',
    imageAlt: 'Hazelnut coffee frappe',
    tags: ['VEG', 'ICED'],
  },
  'pp-caramel-coffee-frappe': {
    photo: 'photo-1586985289071-36f62f55ce44',
    imageAlt: 'Caramel coffee frappe',
    tags: ['VEG', 'ICED'],
  },
  'pp-double-chocolate-frappe': {
    photo: 'photo-1572490122747-3968b75cc699',
    imageAlt: 'Double chocolate frappe',
    tags: ['VEG', 'ICED'],
  },
  'pp-classic-hot-chocolate': {
    photo: 'photo-1542990253-0d0f5be5f0ed',
    imageAlt: 'Classic hot chocolate',
    tags: ['VEG', 'HOT'],
  },
  'pp-belgian-hot-chocolate': {
    photo: 'photo-1608651057580-4a50b2fc2281',
    imageAlt: 'Belgian hot chocolate',
    tags: ['VEG', 'HOT'],
  },
  'pp-lemon-iced-tea': {
    photo: 'photo-1556679343-c7306c1976bc',
    imageAlt: 'Lemon iced tea',
    tags: ['VEG', 'ICED'],
  },
  'pp-peach-iced-tea': {
    photo: 'photo-1601390395693-364c0e22031a',
    imageAlt: 'Peach iced tea',
    tags: ['VEG', 'ICED'],
  },
  'pp-mint-lemon-fizz': {
    photo: 'photo-1622597467836-f3285f2131b8',
    imageAlt: 'Mint lemon fizz',
    tags: ['VEG', 'ICED'],
  },
  'pp-classic-mojito': {
    photo: 'photo-1622597467836-f3285f2131b8',
    imageAlt: 'Classic virgin mojito',
    tags: ['VEG', 'ICED'],
  },
  'pp-watermelon-mint-cooler': {
    photo: 'photo-1600271886742-f049cd451bba',
    imageAlt: 'Watermelon mint cooler',
    tags: ['VEG', 'ICED'],
  },
  'pp-strawberry-lemonade': {
    photo: 'photo-1497534446932-c925b458314e',
    imageAlt: 'Strawberry lemonade',
    tags: ['VEG', 'ICED'],
  },
  'pp-virgin-berry-fizz': {
    photo: 'photo-1497534446932-c925b458314e',
    imageAlt: 'Virgin berry fizz',
    tags: ['VEG', 'ICED'],
  },
  'pp-classic-chocolate-shake': {
    photo: 'photo-1572490122747-3968b75cc699',
    imageAlt: 'Classic chocolate shake',
    tags: ['VEG', 'ICED'],
  },
  'pp-strawberry-cream-shake': {
    photo: 'photo-1579954115545-a95591f28bfc',
    imageAlt: 'Strawberry cream shake',
    tags: ['VEG', 'ICED'],
  },
  'pp-oreo-chocolate-shake': {
    photo: 'photo-1577805947697-89e18249d767',
    imageAlt: 'Oreo chocolate shake',
    tags: ['VEG', 'ICED'],
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

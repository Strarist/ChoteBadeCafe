export type MenuTags = string[]

export type MenuCatalogEntry = {
  displayName: string
  description: string
  image: string
  imageAlt: string
  tags: MenuTags
}

const u = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

/** Presentation layer for menu items — Unsplash photos + short copy. */
export const menuCatalog: Record<string, MenuCatalogEntry> = {
  "baba's espresso": {
    displayName: "Baba's Espresso",
    description: "Short, strong, no small talk.",
    image: u("photo-1510591509098-f4fdc6d0ff04"),
    imageAlt: "Espresso in a small cup next to cookies",
    tags: ["VEG", "HOT"],
  },
  americano: {
    displayName: "Americano",
    description: "Long black, quietly certain.",
    image: u("photo-1514432324607-a09d9b4aefdd"),
    imageAlt: "Black coffee in a ceramic cup",
    tags: ["VEG", "HOT"],
  },
  cortado: {
    displayName: "Cortado",
    description: "Equal parts heat and hush.",
    image: u("photo-1572442388796-11668a67e53d"),
    imageAlt: "Cortado with a thin layer of foam",
    tags: ["VEG", "HOT"],
  },
  cappuccino: {
    displayName: "Cappuccino",
    description: "Foam first, then the day begins.",
    image: u("photo-1570968915860-54d5c301fa9f"),
    imageAlt: "Cappuccino with latte art",
    tags: ["VEG", "HOT"],
  },
  "chota cortado": {
    displayName: "Chota Cortado",
    description: "Small cup, big comfort.",
    image: u("photo-1461023058943-07fcbe16d735"),
    imageAlt: "Iced coffee with swirling milk in a tall glass",
    tags: ["VEG", "HOT"],
  },
  "walnut staircase latte": {
    displayName: "Walnut Staircase Latte",
    description: "Toasted walnut, slow climb of warmth.",
    image: u("photo-1495474472287-4d71bcdd2085"),
    imageAlt: "Hand holding a white mug with leaf latte art",
    tags: ["VEG", "HOT"],
  },
  "cold sukoon brew": {
    displayName: "Cold Sukoon Brew",
    description: "Steeped overnight. Soft on the nerves.",
    image: u("photo-1517701604599-bb29b565090c"),
    imageAlt: "Iced coffee with ice cubes",
    tags: ["VEG", "ICED"],
  },
  "oat / almond / soy": {
    displayName: "Oat / Almond / Soy",
    description: "Plant milk, same ritual.",
    image: u("photo-1550583724-b2692b85b150"),
    imageAlt: "A glass of plant milk",
    tags: ["VEG", "ADD-ON"],
  },
  "full cream / toned": {
    displayName: "Full Cream / Toned",
    description: "The house default. No extra charge.",
    image: u("photo-1563636619-e9143da7973b"),
    imageAlt: "Fresh dairy milk being poured",
    tags: ["VEG", "ADD-ON"],
  },
  "coconut whip": {
    displayName: "Coconut Whip",
    description: "A soft tropical cloud on top.",
    image: u("photo-1589985270826-4b7bb135bc9d"),
    imageAlt: "Coconut and cream",
    tags: ["VEG", "ADD-ON"],
  },
  "house malai": {
    displayName: "House Malai",
    description: "Made fresh each morning.",
    image: u("photo-1488477181946-6428a0291777"),
    imageAlt: "A bowl of fresh cream",
    tags: ["VEG", "ADD-ON"],
  },
  "masala chai": {
    displayName: "Masala Chai",
    description: "Spice, milk, and a long conversation.",
    image: u("photo-1571934811356-5cc061b6821f"),
    imageAlt: "A cup of masala chai",
    tags: ["VEG", "HOT"],
  },
  "kadak cutting": {
    displayName: "Kadak Cutting",
    description: "Half a glass. Full of nerve.",
    image: u("photo-1561336313-0bd5e0b27ec8"),
    imageAlt: "Cutting chai in a glass",
    tags: ["VEG", "HOT"],
  },
  matcha: {
    displayName: "Matcha",
    description: "Ceremonial grade, whisked slow.",
    image: u("photo-1515823662972-da6a2e4d3002"),
    imageAlt: "A bowl of whisked matcha",
    tags: ["VEG", "HOT"],
  },
  syrups: {
    displayName: "Syrups",
    description: "Vanilla, caramel, cardamom, rose, walnut, gulkand.",
    image: u("photo-1517487881594-2787fef5ebf7"),
    imageAlt: "Bottles of flavoured syrup",
    tags: ["VEG", "ADD-ON"],
  },
  "toasted walnut latte": {
    displayName: "Toasted Walnut Latte",
    description: "The seasonal one. Warm, nutty, a little proud.",
    image: u("photo-1509042239860-f550ce710b93"),
    imageAlt: "A latte on a wooden table",
    tags: ["VEG", "HOT", "SEASONAL"],
  },
  "rose pista cloud": {
    displayName: "Rose Pista Cloud",
    description: "Pink, pistachio, and a little theatre.",
    image: u("photo-1572490122747-3968b75cc699"),
    imageAlt: "A pink creamy drink",
    tags: ["VEG", "ICED", "SEASONAL"],
  },
  "masala cold brew": {
    displayName: "Masala Cold Brew",
    description: "Spice meeting ice, on purpose.",
    image: u("photo-1534778101976-62847782c213"),
    imageAlt: "A glass of cold brew coffee",
    tags: ["VEG", "ICED", "SEASONAL"],
  },
  "filter kaapi float": {
    displayName: "Filter Kaapi Float",
    description: "South Indian filter, a scoop of cool.",
    image: u("photo-1497935586351-b67a49e012bf"),
    imageAlt: "South Indian filter coffee",
    tags: ["VEG", "ICED", "SEASONAL"],
  },
}

export const fallbackMenuImage = u("photo-1495474472287-4d71bcdd2085")

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
    description: "From the counter, made to share.",
    image: fallbackMenuImage,
    imageAlt: titled,
    tags: ["VEG"],
  }
}

export const images = {
  heroInterior:
    "https://images.unsplash.com/photo-1763750759240-a1398573772a?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
  coffee:
    "https://images.pexels.com/photos/9501604/pexels-photo-9501604.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  coffeeCup:
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
  food: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?crop=entropy&cs=srgb&fm=jpg&q=85&w=940",
  community:
    "https://images.unsplash.com/photo-1543807535-eceef0bc6599?crop=entropy&cs=srgb&fm=jpg&q=85&w=940",
  story:
    "https://images.unsplash.com/photo-1761142621842-de37137d7c53?crop=entropy&cs=srgb&fm=jpg&q=85&w=940",
  memory1:
    "https://images.unsplash.com/photo-1521017432531-fbd92d768814?crop=entropy&cs=srgb&fm=jpg&q=85&w=700",
  memory2:
    "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?crop=entropy&cs=srgb&fm=jpg&q=85&w=700",
  memory3:
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?crop=entropy&cs=srgb&fm=jpg&q=85&w=700",
} as const

export const navLinks = [
  { to: "/story", label: "Our Story" },
  { to: "/menu", label: "Menu" },
  { to: "/journal", label: "Journal" },
  { to: "/memory-wall", label: "Memory Wall" },
  { to: "/visit", label: "Visit" },
] as const

export const pillars = [
  {
    id: "01",
    title: "Community",
    description: "Your chota, your bada, and everyone in between.",
    image: images.community,
    to: "/memory-wall",
    icon: "users" as const,
  },
  {
    id: "02",
    title: "Story",
    description: "Why a cafe should feel like a family table.",
    image: images.story,
    to: "/story",
    icon: "book" as const,
  },
  {
    id: "03",
    title: "Coffee",
    description: "Single-origin, slow-poured, quietly serious.",
    image: images.coffee,
    to: "/menu",
    icon: "coffee" as const,
  },
  {
    id: "04",
    title: "Food",
    description: "Plates made to be pushed halfway across the table.",
    image: images.food,
    to: "/menu",
    icon: "utensils" as const,
  },
] as const

export const storyChapters = [
  {
    id: "01",
    title: "The name",
    image: images.community,
    body: "Chota. Bada. The small one and the big one. It's the oldest relationship there is — the elder who teaches, the younger who reaches. We named a cafe after that exact moment: the pause where a bada slides half his plate across the table, and a chota finally feels looked after.",
  },
  {
    id: "02",
    title: "The bond",
    image: images.memory1,
    body: "It isn't always father and son. Sometimes it's a mentor and a first-jobber. A coach and a kid. A nani and a grandchild fighting over the last croissant. We built for all of them — anyone who has ever been the small one, or grown into the big one.",
  },
  {
    id: "03",
    title: "The space",
    image: images.heroInterior,
    body: "Everything here is a metaphor, honestly. The arch by the door is the bada bending to make room. The diagonal walnut staircase is the chota, climbing. The shield-shaped mirrors ask you to see yourself. We didn't decorate a cafe — we built a feeling and put chairs in it.",
  },
] as const

export const betterList = [
  {
    title: "Compostable everything",
    body: "By spring, no plastic leaves the counter.",
  },
  {
    title: "A chota-priced menu",
    body: "A rotating cheap corner so students aren't priced out.",
  },
  {
    title: "Sunday community table",
    body: "One free table each week for anyone who just needs to sit warm.",
  },
] as const

export type MenuItem = {
  name: string
  price: number
  note?: string
}

export const menuSections: {
  id: string
  title: string
  items: MenuItem[]
}[] = [
  {
    id: "coffee",
    title: "Coffee",
    items: [
      { name: "BABA'S ESPRESSO", price: 160, note: "Short, strong, no small talk." },
      { name: "AMERICANO", price: 180, note: "Long black, quietly certain." },
      { name: "CORTADO", price: 190, note: "Equal parts heat and hush." },
      { name: "CAPPUCCINO", price: 210, note: "Foam first, then the day begins." },
      { name: "CHOTA CORTADO", price: 190, note: "Small cup, big comfort." },
      { name: "WALNUT STAIRCASE LATTE", price: 240, note: "Toasted walnut, slow climb of warmth." },
      { name: "COLD SUKOON BREW", price: 220, note: "Steeped overnight. Soft on the nerves." },
    ],
  },
  {
    id: "milk",
    title: "Milk Options",
    items: [
      { name: "OAT / ALMOND / SOY", price: 50, note: "Plant milk, same ritual." },
      { name: "FULL CREAM / TONED", price: 0, note: "no extra charge" },
      { name: "COCONUT WHIP", price: 60, note: "A soft tropical cloud on top." },
      { name: "HOUSE MALAI", price: 60, note: "made fresh each morning" },
    ],
  },
  {
    id: "chai",
    title: "Chai & Tea",
    items: [
      { name: "MASALA CHAI", price: 120, note: "Spice, milk, and a long conversation." },
      { name: "KADAK CUTTING", price: 90, note: "Half a glass. Full of nerve." },
      { name: "MATCHA", price: 260, note: "Ceremonial grade, whisked slow" },
      {
        name: "SYRUPS",
        price: 40,
        note: "Vanilla, Caramel, Cardamom, Rose, Walnut, Gulkand",
      },
    ],
  },
  {
    id: "seasonal",
    title: "Seasonal Specials",
    items: [
      { name: "TOASTED WALNUT LATTE", price: 250, note: "The seasonal one. Warm, nutty, a little proud." },
      { name: "ROSE PISTA CLOUD", price: 270, note: "Pink, pistachio, and a little theatre." },
      { name: "MASALA COLD BREW", price: 230, note: "Spice meeting ice, on purpose." },
      { name: "FILTER KAAPI FLOAT", price: 240, note: "South Indian filter, a scoop of cool." },
    ],
  },
]

export const journalPosts = [
  {
    slug: "walnut-staircase",
    title: "Why the walnut staircase latte tastes like home",
    excerpt:
      "A note from the counter on roasting slow, toasting nuts, and the cup that started it all.",
    date: "12 Mar 2026",
    image: images.coffee,
  },
  {
    slug: "sunday-table",
    title: "Sunday community table — what we learned",
    excerpt:
      "Empty chairs filled themselves. Here's who showed up, and what they left behind.",
    date: "28 Feb 2026",
    image: images.community,
  },
  {
    slug: "bean-story",
    title: "Bean story: the chota lot from Coorg",
    excerpt:
      "Small batch, big character. How a tiny lot became our house espresso.",
    date: "04 Feb 2026",
    image: images.food,
  },
] as const

export const site = {
  name: "Chote Bade",
  fullName: "Chote Bade Café",
  tagline: "Chote Moments, Bade Memories.",
  mantra: "Walk in. Relax. Enjoy. Good food | Good mood | Great memories.",
  address: "Shop No. D-49, Rodeo Drive, Near Park Hospital, Sector 49, Gurugram",
  addressFull:
    "Unit No. 49, Block D, Ground Floor, Rodeo Drive Arcadia II, South City-2, Near Park Hospital, Sector 49, Gurugram, Haryana 122018",
  hoursByDay: [
    { days: "Mon – Thu", time: "8:00 am – 11:00 pm" },
    { days: "Fri – Sat", time: "8:00 am – 12:30 am" },
    { days: "Sunday", time: "9:00 am – 11:00 pm" },
  ],
  hours: "Mon–Thu 8am–11pm · Fri–Sat 8am–12:30am · Sun 9am–11pm",
  phone: "+91 98765 43210",
  email: "hello@chotebadecafe.com",
  website: "https://chotebadecafe.com",
  instagram: "@chotebadecafe",
  instagramUrl: "https://www.instagram.com/chotebadecafe/",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Unit+No.+49+Block+D+Rodeo+Drive+Arcadia+II+South+City-2+Gurugram+122018",
  cuisines: "Continental, Italian & Mexican",
  deliveryPartners: "Zomato and Swiggy",
} as const

export const legalLinks = [
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/refunds", label: "Cancellation & Refunds" },
  { to: "/shipping", label: "Shipping Policy" },
  { to: "/contact", label: "Contact Us" },
] as const

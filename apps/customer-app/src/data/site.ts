export const images = {
  heroInterior:
    "https://images.unsplash.com/photo-1763750759240-a1398573772a?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
  coffee:
    "https://images.pexels.com/photos/9501604/pexels-photo-9501604.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  coffeeCup:
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
  /** Pure veg — signature wood-fired pizza (replaces egg-on-toast stock photo). */
  food:
    "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?crop=entropy&cs=srgb&fm=jpg&q=85&w=940",
  community:
    "https://images.unsplash.com/photo-1543807535-eceef0bc6599?crop=entropy&cs=srgb&fm=jpg&q=85&w=940",
  story:
    "https://images.unsplash.com/photo-1761142621842-de37137d7c53?crop=entropy&cs=srgb&fm=jpg&q=85&w=940",
  memory1:
    "https://images.unsplash.com/photo-1521017432531-fbd92d768814?crop=entropy&cs=srgb&fm=jpg&q=85&w=700",
  /** Pure veg — café drinks moment (replaces fried-egg brunch photo). */
  memory2:
    "https://images.unsplash.com/photo-1572442388796-11668a67e53d?crop=entropy&cs=srgb&fm=jpg&q=85&w=700",
  memory3:
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?crop=entropy&cs=srgb&fm=jpg&q=85&w=700",
} as const

/** Primary nav */
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
    title: "Barista",
    description: "Espresso to frappes — the Chote Bade pour.",
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

export const journalPosts = [
  {
    slug: "walnut-staircase",
    title: "Why the walnut staircase latte tastes like home",
    excerpt:
      "A note from the counter on roasting slow, toasting nuts, and the cup that started it all.",
    date: "12 Mar 2026",
    image: images.coffee,
    body: [
      "We named a latte after the staircase before we finished painting the walls. That should tell you something about how this place got built — feelings first, fixtures second.",
      "The walnut note isn't syrup for syrup's sake. It's toasted slow, folded into milk that still tastes like milk, and poured over an espresso that can stand up to a little sweetness without disappearing.",
      "Placeholder draft — swap this essay for the real counter note whenever it's ready. Until then, this slot holds the story shape.",
    ],
  },
  {
    slug: "sunday-table",
    title: "Sunday community table — what we learned",
    excerpt:
      "Empty chairs filled themselves. Here's who showed up, and what they left behind.",
    date: "28 Feb 2026",
    image: images.community,
    body: [
      "One free table each week sounded simple on paper. In practice it is a promise: someone who needs a warm seat gets one, no performance required.",
      "We're still learning who shows up — students between shifts, grandparents waiting on family, strangers who become regulars by the second pour.",
      "This is a placeholder write-up for opening week. Replace with real Sunday notes, photos, and names (with permission) as the ritual finds its rhythm.",
    ],
  },
  {
    slug: "bean-story",
    title: "Bean story: the chota lot from Coorg",
    excerpt:
      "Small batch, big character. How a tiny lot became our house espresso.",
    date: "04 Feb 2026",
    image: images.food,
    body: [
      "Chota doesn't mean lesser. The Coorg lot we cup for house espresso is small on purpose — enough to stay fresh, loud enough to taste like somewhere.",
      "Expect chocolate, a little citrus, and a finish that doesn't need a lecture. If you want the full roast log, ask at the counter — we'll talk your ear off.",
      "Draft copy for launch. Drop in origin details, roast dates, and barista notes when the first bags land.",
    ],
  },
] as const

export const memoryWallPins = [
  {
    id: "1",
    names: "Aarav & Papa",
    story: "Half a brownie, one shared cold coffee, and a promise to come back after exams.",
    image: images.memory1,
    staffPick: true,
  },
  {
    id: "2",
    names: "Meher & Nani",
    story: "She ordered the chai; I ordered the frappe. We swapped halfway, as always.",
    image: images.memory2,
    staffPick: false,
  },
  {
    id: "3",
    names: "Kabir & Coach",
    story: "Post-practice debrief at the corner table. The fries did not survive.",
    image: images.memory3,
    staffPick: true,
  },
  {
    id: "4",
    names: "Ishaan & Didi",
    story: "First paycheck treat. She paid. I tipped. Sibling maths.",
    image: images.community,
    staffPick: false,
  },
  {
    id: "5",
    names: "Ananya & Mentor",
    story: "Interview nerves, two lattes, one pep talk. We are open for those tables.",
    image: images.food,
    staffPick: false,
  },
  {
    id: "6",
    names: "Placeholder pin",
    story: "Sample memory — replace with a real guest photo and story after opening night.",
    image: images.heroInterior,
    staffPick: true,
  },
] as const

export const site = {
  name: "Chote Bade Cafe",
  fullName: "Chote Bade Cafe",
  tagline: "Chote Moments, Bade Memories.",
  /** Official line from opening flyer */
  slogan: "Chota Sa Break, Bada Sa Sukoon",
  mantra: "Walk in. Relax. Enjoy. Good food | Good mood | Great memories.",
  address: "Unit 49, Block D, Rodeo Drive Arcadia II, South City-2, Gurugram",
  addressFull:
    "Unit no. 49, Block D, Ground Floor, Rodeo Drive Arcadia II, South City - 2, Gurgaon, Haryana, India - 122018",
  hoursByDay: [
    { days: "Mon – Thu", time: "8:00 am – 11:00 pm" },
    { days: "Fri – Sat", time: "8:00 am – 12:30 am" },
    { days: "Sunday", time: "9:00 am – 11:00 pm" },
  ],
  hours: "Mon–Thu 8am–11pm · Fri–Sat 8am–12:30am · Sun 9am–11pm",
  phones: ["+91 9990318188", "+91 7678401469"] as const,
  /** Combined for policies / plain-text surfaces */
  phone: "+91 9990318188 / +91 7678401469",
  email: "hello@chotebadecafe.com",
  website: "https://www.chotebadecafe.com",
  instagram: "@chotebadecafe",
  instagramUrl: "https://www.instagram.com/chotebadecafe/",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Unit+no.+49+Block+D+Rodeo+Drive+Arcadia+II+South+City-2+Gurgaon+Haryana+122018",
  mapsEmbedUrl:
    "https://maps.google.com/maps?q=Unit+no.+49+Block+D+Ground+Floor+Rodeo+Drive+Arcadia+II+South+City-2+Gurgaon+122018&z=16&output=embed",
  cuisines: "Continental, Italian & Mexican",
  deliveryPartners: "Zomato and Swiggy",
  opening: {
    label: "Grand opening",
    dateLabel: "23 Aug 2026 (Sunday)",
    timeLabel: "6:00 PM",
    whenIso: "2026-08-23T18:00:00+05:30",
    chiefGuest: "Mr. Keshav Gurjar",
    chiefGuestTitle: "General Secretary (Panjab) Samajwadi Party",
  },
} as const

export const legalLinks = [
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/refunds", label: "Cancellation & Refunds" },
  { to: "/shipping", label: "Shipping Policy" },
  { to: "/contact", label: "Contact Us" },
] as const

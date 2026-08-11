import { useEffect, useMemo, useState } from "react"
import { LayoutGrid, List, Minus, Plus } from "lucide-react"
import type { MenuItem as ApiMenuItem } from "@cafe/shared-types"
import { images } from "../data/site"
import { getCatalogEntry } from "../data/menuCatalog"
import { Appear, EmergeLine, PageIntro } from "../components/MotionText"
import { Reveal } from "../components/Reveal"
import { useCart } from "../context/CartContext"
import { api } from "../lib/api"

type MenuView = "photos" | "whole"

type DisplayItem = {
  id: string
  name: string
  displayName: string
  price: number
  note: string
  image: string
  imageAlt: string
  tags: string[]
  isAddon: boolean
}

type MenuSection = {
  id: string
  title: string
  items: DisplayItem[]
}

function formatPrice(price: number, isAddon: boolean) {
  if (isAddon && price === 0) return "—"
  if (isAddon) return `+₹${price}`
  return `₹${price}`
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function toSections(apiItems: ApiMenuItem[]): MenuSection[] {
  const map = new Map<string, MenuSection>()

  for (const item of apiItems) {
    const id = slugify(item.category) || "menu"
    const existing = map.get(id) ?? {
      id,
      title: item.category,
      items: [],
    }
    const catalog = getCatalogEntry(item.name)
    const isAddon = /milk|add-on|syrup/i.test(item.category) || catalog.tags.includes("ADD-ON")
    existing.items.push({
      id: item.id,
      name: item.name,
      displayName: catalog.displayName,
      price: Math.round(item.price / 100),
      note: item.description?.trim() || catalog.description,
      image: catalog.image,
      imageAlt: catalog.imageAlt,
      tags: catalog.tags,
      isAddon,
    })
    map.set(id, existing)
  }

  return Array.from(map.values())
}

function QtyControls({
  itemName,
  qty,
  added,
  onDecrement,
  onIncrement,
  onAdd,
}: {
  itemName: string
  qty: number
  added: boolean
  onDecrement: () => void
  onIncrement: () => void
  onAdd: () => void
}) {
  if (qty > 0) {
    return (
      <div
        className={`inline-flex items-center gap-0.5 rounded-full glass-soft p-1 ${
          added ? "add-pulse ring-1 ring-sage/50" : ""
        }`}
      >
        <button
          type="button"
          onClick={onDecrement}
          className="grid size-10 place-items-center rounded-full text-burgundy transition active:scale-90 hover:bg-cream/50 md:size-11"
          aria-label={`Decrease ${itemName}`}
        >
          <Minus size={15} strokeWidth={2.2} />
        </button>
        <span className="min-w-7 text-center text-sm font-semibold tabular-nums text-burgundy">
          {qty}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          className="grid size-10 place-items-center rounded-full text-burgundy transition active:scale-90 hover:bg-cream/50 md:size-11"
          aria-label={`Increase ${itemName}`}
        >
          <Plus size={15} strokeWidth={2.2} />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      className="text-[0.82rem] font-semibold tracking-wide text-ink-deep transition hover:text-clay"
    >
      Add +
    </button>
  )
}

function WholeMenuSection({
  section,
  qtyFor,
  justAdded,
  onDecrement,
  onIncrement,
  onAdd,
}: {
  section: MenuSection
  qtyFor: (id: string) => number
  justAdded: string | null
  onDecrement: (id: string) => void
  onIncrement: (id: string) => void
  onAdd: (sectionId: string, sectionTitle: string, item: DisplayItem) => void
}) {
  return (
    <div>
      <h2 className="font-display text-[2rem] italic tracking-[-0.02em] text-burgundy md:text-[2.35rem]">
        {section.title}
      </h2>
      <ul className="mt-5 space-y-5">
        {section.items.map((item) => {
          const qty = qtyFor(item.id)
          const added = justAdded === item.id
          return (
            <li key={item.id} className="flex gap-3">
              <div className="img-pop size-16 shrink-0 overflow-hidden sm:size-[4.5rem]">
                <img
                  src={item.image}
                  alt={item.imageAlt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-mono text-[0.72rem] font-semibold tracking-[0.08em] text-burgundy sm:text-[0.78rem]">
                    {item.name}
                  </p>
                  <span className="shrink-0 font-mono text-[0.72rem] text-burgundy sm:text-[0.78rem]">
                    {formatPrice(item.price, item.isAddon)}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[0.68rem] leading-relaxed text-ink-muted sm:text-[0.72rem]">
                  {item.note}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[0.62rem] font-semibold tracking-[0.12em] text-ink-muted">
                    {item.tags.join(" · ")}
                  </p>
                  <QtyControls
                    itemName={item.displayName}
                    qty={qty}
                    added={added}
                    onDecrement={() => onDecrement(item.id)}
                    onIncrement={() => onIncrement(item.id)}
                    onAdd={() => onAdd(section.id, section.title, item)}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function WholeMenu({
  sections,
  qtyFor,
  justAdded,
  onDecrement,
  onIncrement,
  onAdd,
}: {
  sections: MenuSection[]
  qtyFor: (id: string) => number
  justAdded: string | null
  onDecrement: (id: string) => void
  onIncrement: (id: string) => void
  onAdd: (sectionId: string, sectionTitle: string, item: DisplayItem) => void
}) {
  const mid = Math.ceil(sections.length / 2)
  const colA = sections.slice(0, mid)
  const colB = sections.slice(mid)

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
      <Reveal>
        <div className="img-pop aspect-[4/5] overflow-hidden sm:aspect-[5/4] lg:aspect-[3/4]">
          <img
            src={images.coffeeCup}
            alt="Milk being poured into a cup of coffee"
            className="h-full w-full object-cover"
          />
        </div>
      </Reveal>

      <div className="space-y-10">
        {colA.map((section, index) => (
          <Reveal key={section.id} delay={index * 70}>
            <WholeMenuSection
              section={section}
              qtyFor={qtyFor}
              justAdded={justAdded}
              onDecrement={onDecrement}
              onIncrement={onIncrement}
              onAdd={onAdd}
            />
          </Reveal>
        ))}
      </div>

      <div className="space-y-10">
        {colB.map((section, index) => (
          <Reveal key={section.id} delay={index * 70 + 40}>
            <WholeMenuSection
              section={section}
              qtyFor={qtyFor}
              justAdded={justAdded}
              onDecrement={onDecrement}
              onIncrement={onIncrement}
              onAdd={onAdd}
            />
          </Reveal>
        ))}
      </div>
    </div>
  )
}

export function MenuPage() {
  const [sections, setSections] = useState<MenuSection[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [view, setView] = useState<MenuView>("photos")
  const [filterVisible, setFilterVisible] = useState(true)
  const [justAdded, setJustAdded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addItem, increment, decrement, openCart, itemCount, items } = useCart()

  useEffect(() => {
    let cancelled = false

    async function loadMenu() {
      setLoading(true)
      try {
        const data = await api.get<ApiMenuItem[]>("/menu")
        if (!cancelled) {
          setSections(toSections(data))
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadMenu()
    return () => {
      cancelled = true
    }
  }, [])

  const filters = useMemo(
    () => [{ id: "all", label: "All" }, ...sections.map((s) => ({ id: s.id, label: s.title }))],
    [sections],
  )

  const visibleSections = useMemo(() => {
    if (filter === "all") return sections
    return sections.filter((section) => section.id === filter)
  }, [filter, sections])

  const visibleItems = useMemo(
    () => visibleSections.flatMap((section) => section.items.map((item) => ({ section, item }))),
    [visibleSections],
  )

  useEffect(() => {
    setFilterVisible(false)
    const t = window.setTimeout(() => setFilterVisible(true), 180)
    return () => window.clearTimeout(t)
  }, [filter, view])

  const handleAdd = (sectionId: string, sectionTitle: string, item: DisplayItem) => {
    addItem({
      id: item.id,
      name: item.displayName,
      price: item.price,
      note: item.note,
      sectionId,
      sectionTitle,
    })
    setJustAdded(item.id)
    window.setTimeout(() => setJustAdded((cur) => (cur === item.id ? null : cur)), 900)
  }

  const qtyFor = (id: string) => items.find((i) => i.id === id)?.quantity ?? 0

  const bump = (id: string) => {
    increment(id)
    setJustAdded(id)
    window.setTimeout(() => setJustAdded((cur) => (cur === id ? null : cur)), 500)
  }

  return (
    <div className="paper-bg relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] grain" aria-hidden />

      <section className="relative overflow-hidden px-4 pt-24 pb-6 sm:px-5 md:px-8 md:pt-32 md:pb-8">
        <div className="relative mx-auto max-w-[1180px]">
          {view === "photos" ? (
            <PageIntro>
              <Appear delay={60} as="p" className="text-[0.72rem] font-semibold tracking-[0.18em] text-burgundy">
                MENU & ORDER
              </Appear>
              <h1 className="mt-3 font-display text-[clamp(2.1rem,8vw,4.2rem)] leading-[1.05] tracking-[-0.035em] text-burgundy">
                <EmergeLine delay={140}>What are you</EmergeLine>
                <EmergeLine delay={260}>in the mood for?</EmergeLine>
              </h1>
            </PageIntro>
          ) : (
            <PageIntro>
              <h1 className="font-display text-[clamp(2.4rem,9vw,4.6rem)] italic leading-[1.05] tracking-[-0.03em] text-burgundy">
                <EmergeLine delay={80}>Explore Our Menu</EmergeLine>
              </h1>
              <Appear
                delay={280}
                as="p"
                className="mt-4 max-w-md font-mono text-[0.78rem] leading-relaxed text-ink-muted sm:text-[0.84rem]"
              >
                Thoughtfully crafted coffee, slow-steeped chai, and seasonal drinks made with
                intentional ingredients that love you right back.
              </Appear>
            </PageIntro>
          )}

          <Reveal delay={160}>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center sm:justify-between">
              <div
                id="menu-filters"
                className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {filters.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter(item.id)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold chip-3d ${
                      filter === item.id ? "chip-3d-active" : ""
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="inline-flex self-start rounded-full glass-soft p-1">
                <button
                  type="button"
                  onClick={() => setView("photos")}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                    view === "photos" ? "bg-ink-deep text-cream" : "text-burgundy"
                  }`}
                  aria-pressed={view === "photos"}
                >
                  <LayoutGrid size={14} />
                  Photos
                </button>
                <button
                  type="button"
                  onClick={() => setView("whole")}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                    view === "whole" ? "bg-ink-deep text-cream" : "text-burgundy"
                  }`}
                  aria-pressed={view === "whole"}
                >
                  <List size={14} />
                  Whole menu
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative px-4 pb-28 sm:px-5 md:px-8 md:pb-32">
        <div className="relative mx-auto max-w-[1180px]">
          {loading && <p className="text-sm text-ink-muted">Loading the menu…</p>}
          {error && (
            <p className="text-sm text-burgundy">
              Could not load menu from the kitchen system: {error}
            </p>
          )}

          <div
            id="menu-list"
            className={`transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              filterVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            {view === "photos" ? (
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {visibleItems.map(({ section, item }, index) => {
                  const qty = qtyFor(item.id)
                  const added = justAdded === item.id
                  return (
                    <Reveal key={item.id} delay={Math.min(index * 50, 240)}>
                      <article className="group">
                        <div className="img-pop aspect-square overflow-hidden bg-wash">
                          <img
                            src={item.image}
                            alt={item.imageAlt}
                            className="h-full w-full object-cover"
                            loading={index < 3 ? "eager" : "lazy"}
                          />
                        </div>
                        <div className="mt-4 flex items-baseline justify-between gap-3">
                          <h2 className="font-display text-[1.35rem] font-semibold leading-tight tracking-[-0.02em] text-ink-deep sm:text-[1.45rem]">
                            {item.displayName}
                          </h2>
                          <span className="shrink-0 text-sm text-ink-muted">
                            {formatPrice(item.price, item.isAddon)}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{item.note}</p>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <p className="text-[0.68rem] font-semibold tracking-[0.12em] text-ink-muted">
                            {item.tags.join(" · ")}
                          </p>
                          <QtyControls
                            itemName={item.displayName}
                            qty={qty}
                            added={added}
                            onDecrement={() => decrement(item.id)}
                            onIncrement={() => bump(item.id)}
                            onAdd={() => handleAdd(section.id, section.title, item)}
                          />
                        </div>
                      </article>
                    </Reveal>
                  )
                })}
              </div>
            ) : (
              <WholeMenu
                sections={visibleSections}
                qtyFor={qtyFor}
                justAdded={justAdded}
                onDecrement={(id) => decrement(id)}
                onIncrement={bump}
                onAdd={handleAdd}
              />
            )}
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={openCart}
        className="btn-pill btn-ink fixed bottom-6 left-4 z-40 mb-[env(safe-area-inset-bottom)] px-5 py-3.5 text-sm sm:left-5 md:left-8"
      >
        View your table
        <span
          className={`grid min-w-5 place-items-center rounded-full bg-clay px-1.5 text-[0.7rem] leading-5 transition-all duration-700 ${
            itemCount > 0 ? "scale-100 opacity-100" : "scale-75 opacity-40"
          }`}
        >
          {itemCount}
        </span>
      </button>
    </div>
  )
}

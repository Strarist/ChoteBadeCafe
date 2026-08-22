import { useEffect, useMemo, useRef, useState } from "react"
import { LayoutGrid, List, Minus, Plus, UtensilsCrossed, X } from "lucide-react"
import type { MenuItem as ApiMenuItem } from "@cafe/shared-types"
import {
  MENU_CATEGORY_CHIP,
  MENU_CATEGORY_ORDER,
  MENU_ITEM_ORDER,
  SIGNATURE_ITEM_IDS,
} from "@cafe/shared-types"
import { getCatalogEntry } from "../data/menuCatalog"
import { site } from "../data/site"
import { Appear, EmergeLine, PageIntro } from "../components/MotionText"
import { Marquee } from "../components/Marquee"
import { Reveal } from "../components/Reveal"
import { useCart } from "../context/CartContext"
import { fetchMenu, peekMenuCache, peekMenuFallback } from "../lib/menuCache"
import { getLenis } from "../hooks/useSmoothScroll"

const SIGNATURE_CATEGORY = "SIGNATURE PICKS"

type MenuView = "photos" | "whole"

type DisplayItem = {
  id: string
  petpoojaItemId: string | null
  name: string
  displayName: string
  price: number
  note: string
  image: string
  imageAlt: string
  tags: string[]
  isAddon: boolean
  nutritionLabel: string | null
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

function toDisplayItem(item: ApiMenuItem): DisplayItem {
  const catalog = getCatalogEntry(item.name)
  const isAddon = /milk|add-on|syrup/i.test(item.category) || catalog.tags.includes("ADD-ON")
  const tags = [...catalog.tags]
  const ppId = item.petpoojaItemId ?? item.id
  if (SIGNATURE_ITEM_IDS.has(ppId) && !tags.includes("SIGNATURE")) {
    tags.push("SIGNATURE")
  }
  const nutrition = catalog.nutrition
  const nutritionLabel = nutrition
    ? `${nutrition.kcal} kcal · ${nutrition.proteinG}g protein · ${nutrition.fiberG}g fiber`
    : null
  return {
    id: item.id,
    petpoojaItemId: item.petpoojaItemId ?? (item.id.startsWith("pp-") ? item.id : null),
    name: item.name,
    displayName: catalog.displayName,
    price: Math.round(item.price / 100),
    note: item.description?.trim() || catalog.description,
    image: catalog.image,
    imageAlt: catalog.imageAlt,
    tags,
    isAddon,
    nutritionLabel,
  }
}

function toSections(apiItems: ApiMenuItem[]): MenuSection[] {
  const map = new Map<string, MenuSection>()
  const signatureItems: DisplayItem[] = []

  for (const item of apiItems) {
    const id = slugify(item.category) || "menu"
    const existing = map.get(id) ?? {
      id,
      title: item.category,
      items: [],
    }
    const display = toDisplayItem(item)
    existing.items.push(display)
    map.set(id, existing)

    const ppId = item.petpoojaItemId ?? item.id
    if (SIGNATURE_ITEM_IDS.has(ppId)) {
      signatureItems.push(display)
    }
  }

  if (signatureItems.length) {
    map.set(slugify(SIGNATURE_CATEGORY), {
      id: slugify(SIGNATURE_CATEGORY),
      title: SIGNATURE_CATEGORY,
      items: signatureItems,
    })
  }

  const orderIndex = new Map(MENU_CATEGORY_ORDER.map((title, i) => [slugify(title), i]))
  const itemOrder = new Map(MENU_ITEM_ORDER.map((id, i) => [id, i]))

  for (const section of map.values()) {
    section.items.sort((a, b) => {
      const ao = itemOrder.get(a.petpoojaItemId ?? "") ?? 9999
      const bo = itemOrder.get(b.petpoojaItemId ?? "") ?? 9999
      if (ao !== bo) return ao - bo
      return a.displayName.localeCompare(b.displayName)
    })
  }

  return Array.from(map.values()).sort((a, b) => {
    const ai = orderIndex.get(a.id) ?? 999
    const bi = orderIndex.get(b.id) ?? 999
    if (ai !== bi) return ai - bi
    return a.title.localeCompare(b.title)
  })
}

function QtyControls({
  itemName,
  qty,
  added,
  onDecrement,
  onIncrement,
  onAdd,
  compact = false,
}: {
  itemName: string
  qty: number
  added: boolean
  onDecrement: () => void
  onIncrement: () => void
  onAdd: () => void
  compact?: boolean
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
          className="grid size-10 place-items-center rounded-full text-burgundy transition active:scale-90 hover:bg-cream/50"
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
          className="grid size-10 place-items-center rounded-full text-burgundy transition active:scale-90 hover:bg-cream/50"
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
      className={
        compact
          ? "inline-flex min-h-10 items-center rounded-full border border-burgundy/25 bg-cream px-4 py-2 text-[0.78rem] font-semibold tracking-wide text-burgundy shadow-[0_2px_8px_rgba(50,38,27,0.08)] transition hover:border-burgundy/45 hover:bg-burgundy hover:text-cream active:scale-95"
          : "text-[0.82rem] font-semibold tracking-wide text-ink-deep transition hover:text-clay"
      }
    >
      Add +
    </button>
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
  return (
    <div className="mx-auto max-w-xl space-y-10">
      {sections.map((sec) => (
        <section key={sec.id}>
          <h2 className="mb-4 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-burgundy">
            {sec.title}
          </h2>
          <ul className="space-y-5 sm:space-y-6">
            {sec.items.map((item) => {
              const qty = qtyFor(item.id)
              const added = justAdded === item.id
              return (
                <li key={item.id} className="border-b border-ink/8 pb-5 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-ink-deep sm:text-[0.78rem]">
                        {item.displayName}
                      </p>
                      {item.note ? (
                        <p className="mt-1 font-mono text-[0.68rem] leading-relaxed text-ink-muted sm:text-[0.72rem]">
                          {item.note}
                        </p>
                      ) : null}
                      {item.nutritionLabel ? (
                        <p className="mt-1.5 font-mono text-[0.62rem] tracking-[0.04em] text-gold sm:text-[0.65rem]">
                          {item.nutritionLabel}
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 pt-0.5 font-mono text-[0.72rem] text-ink-deep sm:text-[0.78rem]">
                      {formatPrice(item.price, item.isAddon)}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <QtyControls
                      itemName={item.displayName}
                      qty={qty}
                      added={added}
                      compact
                      onDecrement={() => onDecrement(item.id)}
                      onIncrement={() => onIncrement(item.id)}
                      onAdd={() => onAdd(sec.id, sec.title, item)}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

export function MenuPage() {
  const initialMenu = peekMenuCache() ?? peekMenuFallback()
  const [sections, setSections] = useState<MenuSection[]>(() => toSections(initialMenu))
  const [filter, setFilter] = useState<string>("all")
  const [view, setView] = useState<MenuView>("photos")
  const [filterVisible, setFilterVisible] = useState(true)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [justAdded, setJustAdded] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollToDishesAfterFilter = useRef(false)
  const { addItem, increment, decrement, items, syncCartWithMenu, itemCount, isOpen: cartOpen } =
    useCart()

  useEffect(() => {
    let cancelled = false

    async function loadMenu() {
      setRefreshing(true)
      try {
        const data = await fetchMenu(true)
        if (!cancelled) {
          setSections(toSections(data))
          if (data.length) syncCartWithMenu(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err))
        }
      } finally {
        if (!cancelled) setRefreshing(false)
      }
    }

    void loadMenu()
    return () => {
      cancelled = true
    }
  }, [syncCartWithMenu])

  const filters = useMemo(
    () => [
      { id: "all", label: "All" },
      ...sections.map((s) => ({
        id: s.id,
        label: MENU_CATEGORY_CHIP[s.title] ?? s.title,
      })),
    ],
    [sections],
  )

  const visibleSections = useMemo(() => {
    if (filter === "all") return sections
    return sections.filter((section) => section.id === filter)
  }, [filter, sections])

  const visibleItems = useMemo(() => {
    // Avoid listing signature dishes twice in the photo grid when browsing All.
    const source =
      filter === "all"
        ? visibleSections.filter((section) => section.id !== slugify(SIGNATURE_CATEGORY))
        : visibleSections
    const seen = new Set<string>()
    const rows: { section: MenuSection; item: DisplayItem }[] = []
    for (const section of source) {
      for (const item of section.items) {
        if (seen.has(item.id)) continue
        seen.add(item.id)
        rows.push({ section, item })
      }
    }
    return rows
  }, [filter, visibleSections])

  const wholeMenuSections = useMemo(() => {
    const seen = new Set<string>()
    const result: MenuSection[] = []
    // `sections` is already in MENU_CATEGORY_ORDER (meal-flow: food → sweet → barista).
    for (const section of sections) {
      if (section.id === slugify(SIGNATURE_CATEGORY)) continue
      const items = section.items.filter((item) => {
        if (seen.has(item.id)) return false
        seen.add(item.id)
        return true
      })
      if (!items.length) continue
      result.push({ ...section, items })
    }
    return result
  }, [sections])

  useEffect(() => {
    setFilterVisible(false)
    const t = window.setTimeout(() => setFilterVisible(true), 40)
    return () => window.clearTimeout(t)
  }, [filter, view])

  useEffect(() => {
    if (view === "whole") setCategoryOpen(false)
  }, [view])

  // After picking a category, land on the first dish — not the footer.
  useEffect(() => {
    if (!scrollToDishesAfterFilter.current) return
    scrollToDishesAfterFilter.current = false
    const t = window.setTimeout(() => {
      const el = document.getElementById("menu-dishes")
      if (!el) return
      const lenis = getLenis()
      if (lenis) {
        lenis.scrollToElement(el, -140)
      } else {
        const y = el.getBoundingClientRect().top + window.scrollY - 140
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" })
      }
    }, 80)
    return () => window.clearTimeout(t)
  }, [filter, visibleItems, visibleSections])

  const handleAdd = (sectionId: string, sectionTitle: string, item: DisplayItem) => {
    addItem({
      id: item.id,
      name: item.displayName,
      apiName: item.name,
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

  const selectCategory = (id: string) => {
    scrollToDishesAfterFilter.current = true
    setFilter(id)
    setCategoryOpen(false)
    if (view !== "photos") setView("photos")
  }

  return (
    <div className="relative min-h-screen">
      {/* Title lives above sticky filters so it never slides underneath them */}
      <section className="relative px-4 pb-0 pt-24 sm:px-5 md:px-8 md:pt-28">
        <div className="relative mx-auto max-w-[1180px]">
          {view === "photos" ? (
            <PageIntro className="mb-5 md:mb-6">
              <Appear delay={40} as="p" className="text-[0.72rem] font-semibold tracking-[0.18em] text-burgundy">
                MENU & ORDER
              </Appear>
              <h1 className="mt-3 font-display text-[clamp(2rem,7vw,3.4rem)] leading-[1.08] tracking-[-0.035em] text-burgundy">
                <EmergeLine delay={120}>What are you</EmergeLine>
                <EmergeLine delay={220}>in the mood for?</EmergeLine>
              </h1>
            </PageIntro>
          ) : (
            <PageIntro className="mb-5 md:mb-6">
              <Appear delay={40} as="p" className="text-[0.72rem] font-semibold tracking-[0.18em] text-burgundy">
                WHOLE MENU
              </Appear>
              <h1 className="mt-3 font-display text-[clamp(2rem,7vw,3.2rem)] leading-[1.08] tracking-[-0.035em] text-burgundy">
                Everything on paper
              </h1>
            </PageIntro>
          )}
        </div>
      </section>

      <div className="relative mb-1">
        <Marquee text={site.slogan} />
      </div>

      <div className="menu-toolbar sticky top-16 z-30 md:top-[4.25rem]">
        <div className="mx-auto flex max-w-[1180px] items-center justify-center px-4 py-3 sm:px-5 md:px-8">
          <div className="inline-flex shrink-0 items-center rounded-full border border-ink/10 bg-cream/90 p-1 shadow-[0_8px_24px_rgba(50,38,27,0.06)]">
            <button
              type="button"
              onClick={() => setView("photos")}
              className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                view === "photos" ? "bg-ink-deep text-cream" : "text-burgundy"
              }`}
              aria-pressed={view === "photos"}
            >
              <LayoutGrid size={14} className="shrink-0" />
              Photos
            </button>
            <button
              type="button"
              onClick={() => {
                setView("whole")
                setFilter("all")
              }}
              className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                view === "whole" ? "bg-ink-deep text-cream" : "text-burgundy"
              }`}
              aria-pressed={view === "whole"}
            >
              <List size={14} className="shrink-0" />
              Whole menu
            </button>
          </div>
        </div>
      </div>

      <section
        className={`relative px-4 pb-28 pt-6 sm:px-5 md:px-8 md:pb-32 md:pt-8 ${
          view === "whole" ? "paper-bg" : ""
        }`}
      >
        <div className="relative mx-auto max-w-[1180px]">
          {refreshing && (
            <p className="mb-4 text-xs text-ink-muted" aria-live="polite">
              Refreshing live prices…
            </p>
          )}
          {error && sections.length === 0 && (
            <p className="text-sm text-burgundy">
              Could not load menu from the kitchen system: {error}
            </p>
          )}
          {error && sections.length > 0 && (
            <p className="mb-4 text-xs text-burgundy">
              Could not refresh prices — showing last saved menu. {error}
            </p>
          )}
          {!refreshing && !error && sections.length === 0 && (
            <p className="text-sm text-ink-muted">
              The menu is empty right now. Ask the kitchen to run a menu sync, or seed the database.
            </p>
          )}

          <div
            id="menu-dishes"
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
                        <div className="menu-photo img-pop aspect-square overflow-hidden bg-wash">
                          <img
                            src={item.image}
                            alt={item.imageAlt}
                            className="h-full w-full object-cover"
                            loading={index < 2 ? "eager" : "lazy"}
                            decoding="async"
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
                        {item.nutritionLabel ? (
                          <p className="mt-1.5 text-[0.68rem] font-semibold tracking-[0.06em] text-gold/90">
                            {item.nutritionLabel}
                          </p>
                        ) : null}
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
                sections={wholeMenuSections}
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

      {/* Category FAB — photos view only; whole menu is a flat list */}
      {view === "photos" && categoryOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-[45] bg-ink-deep/35 backdrop-blur-[2px]"
          aria-label="Close menu categories"
          onClick={() => setCategoryOpen(false)}
        />
      ) : null}

      {view === "photos" ? (
        <div
          className={`pointer-events-none fixed right-4 z-[46] flex flex-col items-end gap-3 ${
            itemCount > 0 && !cartOpen
              ? "bottom-[calc(5.75rem+env(safe-area-inset-bottom))]"
              : "bottom-[max(1.25rem,env(safe-area-inset-bottom))]"
          }`}
        >
          {categoryOpen ? (
            <div
              className="menu-fab-sheet pointer-events-auto w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-ink/10 bg-cream shadow-[0_18px_48px_rgba(50,38,27,0.28)]"
              role="dialog"
              id="menu-filters"
              aria-label="Menu categories"
            >
              <div className="border-b border-ink/8 px-4 py-3">
                <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-burgundy">
                  BROWSE MENU
                </p>
              </div>
              <ul className="max-h-[min(55vh,22rem)] overflow-y-auto py-1.5">
                {filters.map((item) => {
                  const active = filter === item.id
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => selectCategory(item.id)}
                        className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${
                          active
                            ? "bg-burgundy/10 font-semibold text-burgundy"
                            : "text-ink-deep hover:bg-wash"
                        }`}
                      >
                        <span>{item.label}</span>
                        {active ? (
                          <span className="text-[0.65rem] font-semibold tracking-[0.12em] text-burgundy">
                            VIEWING
                          </span>
                        ) : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setCategoryOpen((open) => !open)}
            className="menu-fab pointer-events-auto inline-flex items-center gap-2 rounded-full px-4 py-3.5 text-sm font-semibold text-cream shadow-[0_12px_32px_rgba(50,38,27,0.28)] transition active:scale-95"
            aria-expanded={categoryOpen}
            aria-controls="menu-filters"
            aria-label={categoryOpen ? "Close menu categories" : "Open menu categories"}
          >
            {categoryOpen ? <X size={18} strokeWidth={2.2} /> : <UtensilsCrossed size={18} strokeWidth={2} />}
            {categoryOpen ? "Close" : "Menu"}
          </button>
        </div>
      ) : null}
    </div>
  )
}

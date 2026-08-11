import { useEffect, useMemo, useState } from "react"
import { Minus, Plus } from "lucide-react"
import type { MenuItem as ApiMenuItem } from "@cafe/shared-types"
import { images } from "../data/site"
import { Appear, EmergeLine, PageIntro } from "../components/MotionText"
import { Reveal } from "../components/Reveal"
import { useCart } from "../context/CartContext"

import { api } from "../lib/api"

type MenuSection = {
  id: string
  title: string
  items: Array<{
    id: string
    name: string
    /** Display/cart price in rupees (converted from API paise). */
    price: number
    note?: string
  }>
}

function formatPrice(price: number) {
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
    existing.items.push({
      id: item.id,
      name: item.name,
      price: Math.round(item.price / 100),
      note: item.description ?? undefined,
    })
    map.set(id, existing)
  }

  return Array.from(map.values())
}

export function MenuPage() {
  const [sections, setSections] = useState<MenuSection[]>([])
  const [filter, setFilter] = useState<string>("all")
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

  useEffect(() => {
    setFilterVisible(false)
    const t = window.setTimeout(() => setFilterVisible(true), 220)
    return () => window.clearTimeout(t)
  }, [filter])

  const handleAdd = (
    sectionId: string,
    sectionTitle: string,
    item: { id: string; name: string; price: number; note?: string },
  ) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      note: item.note,
      sectionId,
      sectionTitle,
    })
    setJustAdded(item.id)
    window.setTimeout(() => setJustAdded((cur) => (cur === item.id ? null : cur)), 900)
  }

  const qtyFor = (id: string) => items.find((i) => i.id === id)?.quantity ?? 0

  return (
    <div className="paper-bg relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] grain" aria-hidden />

      <section className="relative overflow-hidden px-5 pt-28 pb-8 md:px-8 md:pt-32">
        <div className="relative mx-auto max-w-[1100px]">
          <PageIntro>
            <Appear delay={60} as="p" className="text-[0.72rem] font-semibold tracking-[0.18em] text-burgundy">
              MENU & ORDER
            </Appear>
            <h1 className="mt-4 font-display text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1.05] tracking-[-0.035em] text-burgundy">
              <EmergeLine delay={140}>Order something</EmergeLine>
              <EmergeLine delay={280}>worth sharing.</EmergeLine>
            </h1>
            <Appear delay={420} as="p" className="mt-5 max-w-xl text-[1.02rem] leading-relaxed text-ink-muted">
              Photo-forward, no PDFs, no confusion. Add to your table, pick how you're having it, done.
            </Appear>
          </PageIntro>

          <Reveal delay={160}>
            <div id="menu-filters" className="mt-8 flex flex-wrap gap-2">
              {filters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-95 ${
                    filter === item.id
                      ? "bg-burgundy text-cream shadow-[0_10px_24px_rgba(122,47,58,0.22)] scale-[1.03]"
                      : "glass-soft text-ink hover:-translate-y-0.5 hover:bg-cream/40"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal delay={240} className="mt-7">
            <div className="group media-card relative overflow-hidden rounded-[1.75rem] shadow-[0_24px_60px_rgba(50,38,27,0.1)]">
              <div className="img-pop aspect-[16/9] md:aspect-[21/9]">
                <img
                  src={images.coffeeCup}
                  alt="Hands holding a warm cup"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-deep/30 via-transparent to-transparent" />
              <span className="steam left-[46%] bottom-[42%]" />
              <span className="steam left-[52%] bottom-[40%]" style={{ animationDelay: "1.2s" }} />
              <div className="absolute inset-x-4 bottom-4 md:inset-x-6 md:bottom-6">
                <div className="glass-chip inline-flex max-w-full flex-wrap items-baseline gap-x-2 rounded-2xl px-4 py-3">
                  <span className="font-display text-base italic text-burgundy md:text-lg">
                    Seasonal Special.
                  </span>
                  <span className="font-mono text-[0.78rem] font-semibold tracking-[0.08em] text-burgundy md:text-sm">
                    TOASTED WALNUT LATTE
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative px-5 pb-28 md:px-8 md:pb-32">
        <div className="relative mx-auto max-w-[1100px]">
          {loading && (
            <p className="text-sm text-ink-muted">Loading the menu…</p>
          )}
          {error && (
            <p className="text-sm text-burgundy">
              Could not load menu from the kitchen system: {error}
            </p>
          )}

          <div
            id="menu-list"
            className={`mt-4 space-y-10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              filterVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
            }`}
          >
            {visibleSections.map((section, sIndex) => (
              <div
                key={section.id}
                style={{
                  transitionDelay: filterVisible ? `${sIndex * 90}ms` : "0ms",
                }}
              >
                <div className="overflow-hidden rounded-[1.75rem] glass-panel shadow-[0_12px_40px_rgba(50,38,27,0.05)]">
                  <div className="border-b border-ink/5 px-5 py-5 md:px-8 md:py-6">
                    <h2 className="font-display text-3xl italic tracking-[-0.02em] text-burgundy md:text-4xl">
                      {section.title}
                    </h2>
                  </div>
                  <ul className="divide-y divide-ink/5">
                    {section.items.map((item) => {
                      const qty = qtyFor(item.id)
                      const added = justAdded === item.id
                      return (
                        <li
                          key={item.id}
                          className="group flex flex-col gap-3 px-5 py-5 transition-colors duration-700 hover:bg-[#efe7db]/70 sm:flex-row sm:items-center sm:justify-between md:px-8"
                        >
                          <div>
                            <p className="font-mono text-[0.82rem] font-semibold tracking-[0.08em] text-burgundy transition duration-700">
                              {item.name}
                            </p>
                            {item.note && (
                              <p className="mt-1 text-sm text-ink-muted">{item.note}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="min-w-14 text-right font-mono text-sm font-semibold tracking-[0.04em] text-burgundy sm:min-w-16">
                              {formatPrice(item.price)}
                            </span>
                            {qty > 0 ? (
                              <div
                                className={`inline-flex items-center gap-0.5 rounded-full glass-soft p-1 ${
                                  added ? "add-pulse ring-1 ring-sage/50" : ""
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => decrement(item.id)}
                                  className="grid size-11 place-items-center rounded-full text-burgundy transition active:scale-90 hover:bg-cream/50"
                                  aria-label={`Decrease ${item.name}`}
                                >
                                  <Minus size={15} strokeWidth={2.2} />
                                </button>
                                <span className="min-w-8 text-center text-sm font-semibold tabular-nums text-burgundy">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    increment(item.id)
                                    setJustAdded(item.id)
                                    window.setTimeout(
                                      () => setJustAdded((cur) => (cur === item.id ? null : cur)),
                                      500,
                                    )
                                  }}
                                  className="grid size-11 place-items-center rounded-full text-burgundy transition active:scale-90 hover:bg-cream/50"
                                  aria-label={`Increase ${item.name}`}
                                >
                                  <Plus size={15} strokeWidth={2.2} />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  handleAdd(section.id, section.title, item)
                                }
                                className="inline-flex min-h-11 min-w-[5.5rem] items-center justify-center gap-1.5 rounded-full bg-burgundy/90 px-4 py-2 text-xs font-semibold text-cream backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-95 hover:-translate-y-0.5 hover:bg-clay"
                              >
                                <Plus size={14} />
                                Add
                              </button>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={openCart}
        className="fixed bottom-6 left-5 z-40 inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-cream transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] glass-dark hover:-translate-y-1 active:scale-95 md:left-8 mb-[env(safe-area-inset-bottom)]"
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

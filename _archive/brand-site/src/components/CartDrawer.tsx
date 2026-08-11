import { useEffect } from "react"
import { Minus, Plus, Trash2, X } from "lucide-react"
import { useCart } from "../context/CartContext"

function formatPrice(price: number) {
  return `₹${price}`
}

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    increment,
    decrement,
    removeItem,
    clearCart,
    itemCount,
    subtotal,
  } = useCart()

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart()
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [isOpen, closeCart])

  return (
    <div
      className={`fixed inset-0 z-[80] ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className={`absolute inset-0 bg-ink-deep/35 backdrop-blur-[3px] transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your table"
        className={`absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col border-l border-white/30 bg-cream/88 shadow-[-24px_0_60px_rgba(50,38,27,0.18)] backdrop-blur-2xl transition-transform duration-[950ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/8 px-5 py-5 md:px-6">
          <div>
            <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-burgundy">
              YOUR TABLE
            </p>
            <h2 className="mt-1 font-display text-2xl tracking-[-0.02em] text-burgundy">
              {itemCount === 0
                ? "Empty for now"
                : `${itemCount} item${itemCount === 1 ? "" : "s"}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="grid size-10 place-items-center rounded-full glass-soft transition duration-500 hover:-translate-y-0.5"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6" data-lenis-prevent>
          {items.length === 0 ? (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center">
              <p className="font-display text-xl text-ink-deep">Nothing on the table yet.</p>
              <p className="mt-2 max-w-[240px] text-sm text-ink-muted">
                Add a coffee or chai from the menu — half the plate is meant to be shared.
              </p>
              <button
                type="button"
                onClick={closeCart}
                className="btn-pill btn-ink mt-6"
              >
                Browse menu
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className="rounded-2xl p-4 glass-panel"
                  style={{
                    transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)",
                    transitionDelay: `${index * 60}ms`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[0.75rem] font-semibold tracking-[0.07em] text-ink-deep">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-ink-muted">{item.sectionTitle}</p>
                      {item.note && (
                        <p className="mt-1 text-xs text-ink-muted/80">{item.note}</p>
                      )}
                    </div>
                    <p className="font-display text-lg text-ink-deep">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="inline-flex items-center gap-1 rounded-full glass-soft p-1">
                      <button
                        type="button"
                        onClick={() => decrement(item.id)}
                        className="grid size-8 place-items-center rounded-full transition duration-500 hover:bg-cream/70"
                        aria-label={`Decrease ${item.name}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => increment(item.id)}
                        className="grid size-8 place-items-center rounded-full transition duration-500 hover:bg-cream/70"
                        aria-label={`Increase ${item.name}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-ink-muted transition duration-500 hover:bg-clay/10 hover:text-clay"
                    >
                      <Trash2 size={13} />
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-ink/8 px-5 py-5 md:px-6">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs tracking-[0.12em] text-ink-muted">SUBTOTAL</p>
                <p className="mt-1 font-display text-3xl text-ink-deep">
                  {formatPrice(subtotal)}
                </p>
              </div>
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-medium text-ink-muted transition duration-500 hover:text-clay"
              >
                Clear table
              </button>
            </div>
            <button type="button" className="btn-pill btn-clay w-full justify-center py-3.5">
              Place order
            </button>
            <p className="mt-3 text-center text-xs text-ink-muted">
              Walk-in pickup · pay at the counter
            </p>
          </div>
        )}
      </aside>
    </div>
  )
}

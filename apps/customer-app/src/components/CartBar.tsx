import { ChevronRight, ShoppingBag } from "lucide-react"
import { useCart } from "../context/CartContext"

/**
 * Compact bottom cart affordance — only when the table has items.
 * Header bag removed; this is the sole cart entry on mobile/desktop.
 */
export function CartBar() {
  const { itemCount, payableTotal, openCart, isOpen } = useCart()

  if (itemCount <= 0 || isOpen) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] md:px-8">
      <button
        type="button"
        onClick={openCart}
        className="cart-bar pointer-events-auto mx-auto flex w-full max-w-md items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-left transition active:scale-[0.99] md:max-w-sm"
        aria-label={`View your table, ${itemCount} items, ₹${payableTotal}`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-cream/15 text-cream ring-1 ring-cream/20">
            <ShoppingBag size={16} strokeWidth={1.8} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-cream">
              Your table · {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
            <span className="block text-[0.7rem] text-cream/70">Tap to review & pay</span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-cream px-3.5 py-1.5 text-sm font-semibold text-ink-deep shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
            ₹{payableTotal}
          </span>
          <span
            className="grid size-9 place-items-center rounded-full bg-cream/20 text-cream ring-1 ring-cream/25"
            aria-hidden
          >
            <ChevronRight size={18} strokeWidth={2.4} />
          </span>
        </span>
      </button>
    </div>
  )
}

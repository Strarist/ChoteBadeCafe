import {
  OFFER_CATALOG,
  WHEEL_SEGMENTS,
  type AppliedOffer,
  type OfferCode,
} from "@cafe/shared-types"
import type { CartItem } from "../context/CartContext"

const BURGER_CATEGORY = /burger/i
const DESSERT_CATEGORY = /dessert|waffle|pancake/i

function isBurger(item: CartItem): boolean {
  return BURGER_CATEGORY.test(item.sectionTitle) || BURGER_CATEGORY.test(item.name)
}

function isDessert(item: CartItem): boolean {
  return DESSERT_CATEGORY.test(item.sectionTitle) || DESSERT_CATEGORY.test(item.name)
}

/** Rupee → paise. Cart prices are stored in rupees. */
function toPaise(rupees: number): number {
  return Math.round(rupees * 100)
}

function cheapestUnitPaise(items: CartItem[]): number {
  if (!items.length) return 0
  return Math.min(...items.map((i) => toPaise(i.price)))
}

export type OfferCartResult = AppliedOffer & {
  /**
   * Cart lines to send to the API (BOGO bumps burger qty by +1 free).
   * Gross line totals use these quantities; discountAmount zeros the free unit.
   */
  orderItems: CartItem[]
}

/**
 * Compute discount for a won offer against the current cart.
 * BOGO: +1 free burger of the cheapest burger already in cart.
 * Free dessert: one dessert unit free (cheapest dessert line).
 */
export function applyOfferToCart(
  code: OfferCode | null | undefined,
  items: CartItem[],
): OfferCartResult | null {
  if (!code) return null
  const def = OFFER_CATALOG[code]
  if (!def) return null

  const subtotalPaise = items.reduce(
    (sum, item) => sum + toPaise(item.price) * item.quantity,
    0,
  )

  if (code === "better_luck") {
    return {
      code,
      label: def.label,
      discountAmount: 0,
      orderItems: items,
      hint: "No discount this visit — you can still place your order.",
    }
  }

  if (code === "flat_50") {
    const discountAmount = Math.min(5000, subtotalPaise)
    return {
      code,
      label: def.label,
      discountAmount,
      orderItems: items,
      hint:
        subtotalPaise === 0
          ? "Add items to use your ₹50 off."
          : discountAmount < 5000
            ? "Offer covers your full bill."
            : null,
    }
  }

  if (code === "mystery_25") {
    const discountAmount = Math.min(2500, subtotalPaise)
    return {
      code,
      label: def.label,
      discountAmount,
      orderItems: items,
      hint: subtotalPaise === 0 ? "Add items to use your mystery ₹25 off." : null,
    }
  }

  if (code === "bogo_burger") {
    const burgers = items.filter(isBurger)
    const burgerQty = burgers.reduce((s, i) => s + i.quantity, 0)
    if (burgerQty < 1) {
      return {
        code,
        label: def.label,
        discountAmount: 0,
        orderItems: items,
        hint: "Add a burger — the second one is on us.",
      }
    }
    const cheapest = [...burgers].sort((a, b) => a.price - b.price)[0]!
    const unit = toPaise(cheapest.price)
    const orderItems = items.map((item) =>
      item.id === cheapest.id ? { ...item, quantity: item.quantity + 1 } : item,
    )
    return {
      code,
      label: def.label,
      discountAmount: unit,
      orderItems,
      hint: `Extra ${cheapest.name} added free.`,
    }
  }

  if (code === "free_dessert") {
    const desserts = items.filter(isDessert)
    const dessertQty = desserts.reduce((s, i) => s + i.quantity, 0)
    if (dessertQty < 1) {
      return {
        code,
        label: def.label,
        discountAmount: 0,
        orderItems: items,
        hint: "Add a dessert — one is free.",
      }
    }
    const unit = cheapestUnitPaise(desserts)
    return {
      code,
      label: def.label,
      discountAmount: unit,
      orderItems: items,
      hint: "One dessert free (cheapest dessert in your cart).",
    }
  }

  return null
}

/** Weighted by the physical wheel segments (matches the reference layout). */
export function pickRandomOffer(): OfferCode {
  const index = Math.floor(Math.random() * WHEEL_SEGMENTS.length)
  return WHEEL_SEGMENTS[index]!
}

export function pickRandomWheelIndex(): number {
  return Math.floor(Math.random() * WHEEL_SEGMENTS.length)
}

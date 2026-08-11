import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Minus, Plus, Trash2, X } from "lucide-react"
import type { OrderDetail, RazorpayCheckoutPayload } from "@cafe/shared-types"
import { useCart } from "../context/CartContext"
import { api, storeOrderAccess } from "../lib/api"

function formatPrice(price: number) {
  return `₹${price}`
}

type Step = "cart" | "checkout" | "done" | "failed"

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
    tableId,
    setItemInstructions,
  } = useCart()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>("cart")
  const [name, setName] = useState("")
  const [mobile, setMobile] = useState("")
  const [email, setEmail] = useState("")
  const [payMethod, setPayMethod] = useState<"pay_at_counter" | "upi">("pay_at_counter")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [placed, setPlaced] = useState<OrderDetail | null>(null)

  const canConfirm = name.trim().length > 0 && mobile.trim().length >= 8

  useEffect(() => {
    if (!isOpen) {
      setStep("cart")
      setError(null)
      return
    }
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

  const submitOrder = async () => {
    if (!canConfirm) return
    setBusy(true)
    setError(null)
    try {
      const created = await api.post<OrderDetail>("/orders", {
        source: "qr",
        tableId,
        customer: {
          name: name.trim(),
          mobile: mobile.trim(),
          email: email.trim() || null,
        },
        items: items.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
          instructions: item.instructions || null,
        })),
      })
      if (created.accessToken) {
        storeOrderAccess(created.id, created.accessToken)
      }

      const checkedOut = await api.post<OrderDetail>(
        `/orders/${created.id}/checkout`,
        { method: payMethod === "upi" ? "upi" : "pay_at_counter" },
        created.id,
      )

      if (payMethod === "upi") {
        const checkout = await api.post<RazorpayCheckoutPayload>(
          `/payments/orders/${checkedOut.id}/checkout`,
          undefined,
          checkedOut.id,
        )
        const paid = await api.post<OrderDetail>(
          `/payments/orders/${checkedOut.id}/mock-confirm`,
          { razorpayOrderId: checkout.razorpayOrderId },
          checkedOut.id,
        )
        setPlaced(paid)
      } else {
        setPlaced(checkedOut)
      }

      clearCart()
      setStep("done")
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStep("failed")
    } finally {
      setBusy(false)
    }
  }

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
        className={`absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col border-l border-white/35 bg-cream/80 shadow-[-24px_0_60px_rgba(50,38,27,0.18)] backdrop-blur-2xl transition-transform duration-[950ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/8 px-5 py-5 md:px-6">
          <div>
            <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-burgundy">
              YOUR TABLE{tableId ? ` · ${tableId}` : ""}
            </p>
            <h2 className="mt-1 font-display text-2xl tracking-[-0.02em] text-burgundy">
              {step === "done" && placed
                ? `Token ${placed.token}`
                : itemCount === 0
                  ? "Empty for now"
                  : `${itemCount} item${itemCount === 1 ? "" : "s"}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="grid size-11 place-items-center rounded-full glass-soft transition duration-500 hover:-translate-y-0.5"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6" data-lenis-prevent>
          {step === "done" && placed && (
            <div className="space-y-4 text-center cart-success-pop">
              <p className="font-display text-3xl text-burgundy">{placed.token}</p>
              <p className="text-sm text-ink-muted">
                {placed.status === "confirmed"
                  ? "Paid — your order is with the kitchen."
                  : "Pay at the counter when you pick up. We'll call your token."}
              </p>
              <button
                type="button"
                className="btn-pill btn-clay w-full justify-center py-3.5"
                onClick={() => {
                  closeCart()
                  navigate(`/order/${placed.id}`)
                }}
              >
                Track order
              </button>
            </div>
          )}

          {step === "failed" && (
            <div className="space-y-3">
              <p className="text-sm text-burgundy">Could not place order.</p>
              <p className="text-xs text-ink-muted break-words">{error}</p>
              <button
                type="button"
                className="btn-pill btn-ink w-full justify-center"
                onClick={() => setStep("checkout")}
              >
                Try again
              </button>
            </div>
          )}

          {step === "checkout" && (
            <div className="space-y-4">
              <p className="text-sm text-ink-muted">
                Walk-in pickup · paid before the kitchen starts.
              </p>
              <label className="block text-xs font-semibold tracking-[0.08em] text-burgundy">
                NAME *
                <input
                  className="mt-1.5 w-full rounded-2xl border border-ink/10 bg-cream/80 px-4 py-3.5 text-base text-ink-deep outline-none transition focus:border-burgundy/40 focus:ring-2 focus:ring-burgundy/15"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                  aria-required
                />
              </label>
              <label className="block text-xs font-semibold tracking-[0.08em] text-burgundy">
                MOBILE *
                <input
                  className="mt-1.5 w-full rounded-2xl border border-ink/10 bg-cream/80 px-4 py-3.5 text-base text-ink-deep outline-none transition focus:border-burgundy/40 focus:ring-2 focus:ring-burgundy/15"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  aria-required
                />
              </label>
              {!canConfirm && (
                <p className="text-xs text-ink-muted">
                  Fill name * and mobile * (8+ digits) to confirm.
                </p>
              )}
              <label className="block text-xs font-semibold tracking-[0.08em] text-burgundy">
                EMAIL (optional)
                <input
                  className="mt-1.5 w-full rounded-2xl border border-ink/10 bg-cream/80 px-4 py-3.5 text-base text-ink-deep outline-none transition focus:border-burgundy/40 focus:ring-2 focus:ring-burgundy/15"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setPayMethod("pay_at_counter")}
                  className={`rounded-2xl px-4 py-3.5 text-left text-sm font-semibold transition active:scale-[0.98] ${
                    payMethod === "pay_at_counter"
                      ? "bg-burgundy text-cream"
                      : "glass-soft text-ink"
                  }`}
                >
                  Pay at counter
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod("upi")}
                  className={`rounded-2xl px-4 py-3.5 text-left text-sm font-semibold transition active:scale-[0.98] ${
                    payMethod === "upi" ? "bg-burgundy text-cream" : "glass-soft text-ink"
                  }`}
                >
                  Pay online (UPI / card)
                </button>
              </div>
            </div>
          )}

          {(step === "cart" || step === "checkout") && step !== "checkout" && (
            <>
              {items.length === 0 ? (
                <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center">
                  <p className="font-display text-xl text-ink-deep">Nothing on the table yet.</p>
                  <p className="mt-2 max-w-[240px] text-sm text-ink-muted">
                    Add a coffee or chai from the menu — half the plate is meant to be shared.
                  </p>
                  <button type="button" onClick={closeCart} className="btn-pill btn-ink mt-6">
                    Browse menu
                  </button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item.id} className="rounded-2xl p-4 glass-panel">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-[0.75rem] font-semibold tracking-[0.07em] text-ink-deep">
                            {item.name}
                          </p>
                          <p className="mt-1 text-xs text-ink-muted">{item.sectionTitle}</p>
                          <input
                            className="mt-2 w-full rounded-xl border border-ink/10 bg-cream/70 px-3 py-2 text-xs text-ink outline-none"
                            placeholder="Kitchen note (optional)"
                            value={item.instructions ?? ""}
                            onChange={(e) => setItemInstructions(item.id, e.target.value)}
                          />
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
                            className="grid size-10 place-items-center rounded-full"
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
                            className="grid size-10 place-items-center rounded-full"
                            aria-label={`Increase ${item.name}`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-ink-muted"
                        >
                          <Trash2 size={13} />
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {step === "checkout" && (
            <ul className="mt-4 space-y-2 border-t border-ink/8 pt-4">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}× {item.name}
                  </span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (step === "cart" || step === "checkout") && (
          <div className="safe-bottom border-t border-ink/8 px-5 py-5 md:px-6">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs tracking-[0.12em] text-ink-muted">SUBTOTAL</p>
                <p className="mt-1 font-display text-3xl text-ink-deep">{formatPrice(subtotal)}</p>
              </div>
              {step === "cart" && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-medium text-ink-muted"
                >
                  Clear table
                </button>
              )}
            </div>
            {step === "cart" ? (
              <button
                type="button"
                className="btn-pill btn-clay w-full justify-center py-3.5 text-base"
                onClick={() => setStep("checkout")}
              >
                Place order
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-pill btn-ink flex-1 justify-center py-3.5"
                    onClick={() => setStep("cart")}
                    disabled={busy}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className={`btn-pill flex-[1.4] justify-center py-3.5 transition ${
                      canConfirm && !busy
                        ? "btn-clay confirm-ready"
                        : "bg-ink/15 text-ink/40 cursor-not-allowed shadow-none"
                    }`}
                    onClick={() => void submitOrder()}
                    disabled={busy || !canConfirm}
                    aria-disabled={busy || !canConfirm}
                  >
                    {busy ? "Placing…" : "Confirm"}
                  </button>
                </div>
                {!canConfirm && (
                  <p className="text-center text-xs text-ink-muted">
                    Name * and mobile * required before payment
                  </p>
                )}
              </div>
            )}
            <p className="mt-3 text-center text-xs text-ink-muted">
              Walk-in pickup · pay before kitchen
            </p>
          </div>
        )}
      </aside>
    </div>
  )
}

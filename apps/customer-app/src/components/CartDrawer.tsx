import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Minus, Plus, Trash2, X } from "lucide-react"
import type { OrderDetail, RazorpayCheckoutPayload } from "@cafe/shared-types"
import { useCart } from "../context/CartContext"
import { api, storeOrderAccess } from "../lib/api"
import {
  clearPendingCheckout,
  loadPendingCheckout,
  savePendingCheckout,
  type PendingCheckout,
} from "../lib/checkoutRecovery"
import { openRazorpayCheckout } from "../lib/razorpayCheckout"
import { getLenis } from "../hooks/useSmoothScroll"
import { useModalFocus } from "../hooks/useModalFocus"
import { isPaidOrderStatus, toCustomerError } from "../lib/customerError"

function formatPrice(price: number) {
  return `₹${price}`
}

type Step = "cart" | "checkout" | "done"

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
  const { panelRef, closeButtonRef, requestClose } = useModalFocus(isOpen, closeCart)

  const [step, setStep] = useState<Step>("cart")
  const [name, setName] = useState("")
  const [mobile, setMobile] = useState("")
  const [email, setEmail] = useState("")
  const [payMethod, setPayMethod] = useState<"pay_at_counter" | "upi">("pay_at_counter")
  const [onlinePay, setOnlinePay] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [placed, setPlaced] = useState<OrderDetail | null>(null)
  const [pendingCheckout, setPendingCheckout] = useState<PendingCheckout | null>(null)

  const canConfirm = name.trim().length > 0 && mobile.trim().length >= 8

  useEffect(() => {
    if (!isOpen) return
    const saved = loadPendingCheckout()
    if (!saved) return

    let cancelled = false
    void api
      .get<OrderDetail>(`/orders/${saved.orderId}`, saved.orderId)
      .then((current) => {
        if (cancelled) return
        if (isPaidOrderStatus(current.status) || current.paymentStatus === "paid") {
          clearPendingCheckout()
          setPendingCheckout(null)
          return
        }
        setPendingCheckout(saved)
        setName(saved.name)
        setMobile(saved.mobile)
        setPayMethod(saved.payMethod)
        setStep("checkout")
      })
      .catch(() => {
        if (cancelled) return
        setPendingCheckout(saved)
        setName(saved.name)
        setMobile(saved.mobile)
        setPayMethod(saved.payMethod)
        setStep("checkout")
      })

    return () => {
      cancelled = true
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    void api
      .get<{ available: boolean }>("/payments/online")
      .then((result) => {
        setOnlinePay(result.available)
        if (!result.available) setPayMethod("pay_at_counter")
      })
      .catch(() => {
        /* API unreachable — stay on counter until we can confirm online pay */
        setOnlinePay(false)
        setPayMethod("pay_at_counter")
      })
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setStep("cart")
      setError(null)
      getLenis()?.start()
      return
    }
    getLenis()?.stop()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose()
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
      getLenis()?.start()
    }
  }, [isOpen, requestClose])

  const persistPending = (partial: PendingCheckout) => {
    savePendingCheckout(partial)
  }

  const showRecoveryUi = () => {
    setPendingCheckout(loadPendingCheckout())
  }

  const finishSuccess = (order: OrderDetail) => {
    clearPendingCheckout()
    setPendingCheckout(null)
    setPlaced(order)
    clearCart()
    setStep("done")
  }

  const runUpiPayment = async (orderId: string): Promise<OrderDetail> => {
    const existing = loadPendingCheckout()
    if (existing?.razorpay) {
      return confirmOnlinePayment(orderId, existing.razorpay)
    }

    const checkout = await api.post<RazorpayCheckoutPayload>(
      `/payments/orders/${orderId}/checkout`,
      undefined,
      orderId,
    )

    if (checkout.keyId === "mock") {
      if (!import.meta.env.DEV) {
        throw new Error("Online payment is not available yet. Please pay at the counter.")
      }
      return api.post<OrderDetail>(
        `/payments/orders/${orderId}/mock-confirm`,
        { razorpayOrderId: checkout.razorpayOrderId },
        orderId,
      )
    }

    const result = await openRazorpayCheckout(checkout)
    const razorpay = {
      razorpayOrderId: result.razorpayOrderId,
      razorpayPaymentId: result.razorpayPaymentId,
      razorpaySignature: result.razorpaySignature,
    }
    const pending = loadPendingCheckout()
    if (pending) {
      persistPending({ ...pending, razorpay, step: "checked_out", savedAt: Date.now() })
    }
    return confirmOnlinePayment(orderId, razorpay)
  }

  const confirmOnlinePayment = async (
    orderId: string,
    razorpay: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string },
  ): Promise<OrderDetail> => {
    let lastErr: unknown
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await api.post<OrderDetail>(
          `/payments/orders/${orderId}/confirm`,
          razorpay,
          orderId,
        )
      } catch (confirmErr) {
        lastErr = confirmErr
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)))
      }
    }
    const msg = toCustomerError(lastErr)
    throw new Error(`${msg} You can track this order from the status page.`)
  }

  const completeCheckout = async (
    orderId: string,
    accessToken: string | undefined,
    method: "pay_at_counter" | "upi",
    customerName: string,
    customerMobile: string,
  ): Promise<OrderDetail> => {
    if (accessToken) storeOrderAccess(orderId, accessToken)

    const pending = loadPendingCheckout()
    if (!pending || pending.step === "created") {
      const checkedOut = await api.post<OrderDetail>(
        `/orders/${orderId}/checkout`,
        { method: method === "upi" ? "upi" : "pay_at_counter" },
        orderId,
      )
      persistPending({
        orderId,
        accessToken,
        payMethod: method,
        step: "checked_out",
        name: customerName,
        mobile: customerMobile,
        savedAt: Date.now(),
      })
      if (method === "upi") {
        return runUpiPayment(checkedOut.id)
      }
      return checkedOut
    }

    if (method === "upi") {
      return runUpiPayment(orderId)
    }

    return api.get<OrderDetail>(`/orders/${orderId}`, orderId)
  }

  const resumeCheckout = async () => {
    const pending = pendingCheckout ?? loadPendingCheckout()
    if (!pending) return
    setBusy(true)
    setError(null)
    try {
      if (pending.accessToken) storeOrderAccess(pending.orderId, pending.accessToken)
      const current = await api.get<OrderDetail>(`/orders/${pending.orderId}`, pending.orderId)
      if (isPaidOrderStatus(current.status) || current.paymentStatus === "paid") {
        clearPendingCheckout()
        setPendingCheckout(null)
        closeCart()
        navigate(`/order/${current.id}`)
        return
      }
      const result = await completeCheckout(
        pending.orderId,
        pending.accessToken,
        pending.payMethod,
        pending.name,
        pending.mobile,
      )
      finishSuccess(result)
    } catch (err) {
      showRecoveryUi()
      setError(toCustomerError(err))
      setStep("checkout")
    } finally {
      setBusy(false)
    }
  }

  const dismissPendingCheckout = () => {
    const pending = pendingCheckout ?? loadPendingCheckout()
    clearPendingCheckout()
    setPendingCheckout(null)
    setError(null)
    if (pending?.orderId) {
      closeCart()
      navigate(`/order/${pending.orderId}`)
    }
  }

  const submitOrder = async () => {
    if (!canConfirm) return
    if (pendingCheckout) {
      await resumeCheckout()
      return
    }
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
          name: item.apiName ?? item.name,
          quantity: item.quantity,
          instructions: item.instructions || null,
        })),
      })

      persistPending({
        orderId: created.id,
        accessToken: created.accessToken,
        payMethod,
        step: "created",
        name: name.trim(),
        mobile: mobile.trim(),
        savedAt: Date.now(),
      })

      const result = await completeCheckout(
        created.id,
        created.accessToken,
        payMethod,
        name.trim(),
        mobile.trim(),
      )
      finishSuccess(result)
    } catch (err) {
      showRecoveryUi()
      setError(toCustomerError(err))
      setStep("checkout")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[80] ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      {...(!isOpen ? { inert: true as const } : {})}
    >
      <button
        type="button"
        aria-label="Close cart"
        onClick={requestClose}
        className={`absolute inset-0 bg-ink-deep/35 backdrop-blur-[3px] transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Your table"
        className={`absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col border-l border-ink/10 bg-[linear-gradient(180deg,#faf6ef_0%,#f3ebe0_45%,#efe6d8_100%)] shadow-[-24px_0_60px_rgba(50,38,27,0.22)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="relative flex items-center justify-between border-b border-ink/10 px-5 py-5 md:px-6">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(169,94,71,0.1),transparent_55%)]"
            aria-hidden
          />
          <div className="relative">
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
            ref={closeButtonRef}
            onClick={requestClose}
            className="relative grid size-10 place-items-center rounded-full border border-ink/10 bg-cream shadow-[0_8px_20px_rgba(50,38,27,0.08)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
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

          {step === "checkout" && (
            <div className="space-y-4">
              {pendingCheckout && !busy && (
                <div className="space-y-2 rounded-2xl border border-clay/30 bg-clay/10 px-4 py-3">
                  <p className="text-sm font-semibold text-burgundy">Incomplete checkout</p>
                  <p className="text-xs text-ink-muted">
                    Your order was started but not finished. Resume to avoid placing a duplicate.
                    “Start fresh” keeps this ticket at the till so staff can take cash.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn-pill btn-clay !py-2 text-xs"
                      disabled={busy}
                      onClick={() => void resumeCheckout()}
                    >
                      Resume checkout
                    </button>
                    <Link
                      to={`/order/${pendingCheckout.orderId}`}
                      className="btn-pill btn-ink !py-2 text-xs"
                      onClick={closeCart}
                    >
                      View order status
                    </Link>
                    <button
                      type="button"
                      className="text-xs text-ink-muted underline underline-offset-2"
                      disabled={busy}
                      onClick={dismissPendingCheckout}
                    >
                    Start fresh / pay at counter
                    </button>
                  </div>
                </div>
              )}
              {error && (
                <div className="space-y-1 rounded-2xl border border-burgundy/20 bg-burgundy/8 px-4 py-3">
                  <p className="text-sm text-burgundy">Could not place order.</p>
                  <p className="text-xs text-ink-muted break-words">{error}</p>
                </div>
              )}
              {error && pendingCheckout && /status page/i.test(error) && (
                <Link
                  to={`/order/${pendingCheckout.orderId}`}
                  className="btn-pill btn-clay inline-flex w-full justify-center !py-2.5 text-sm"
                  onClick={closeCart}
                >
                  Check order status
                </Link>
              )}
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
                {onlinePay && (
                  <button
                    type="button"
                    onClick={() => setPayMethod("upi")}
                    className={`rounded-2xl px-4 py-3.5 text-left text-sm font-semibold transition active:scale-[0.98] ${
                      payMethod === "upi" ? "bg-burgundy text-cream" : "glass-soft text-ink"
                    }`}
                  >
                    Pay online (UPI / card)
                  </button>
                )}
              </div>
            </div>
          )}

          {(step === "cart" || step === "checkout") && step !== "checkout" && (
            <>
              {items.length === 0 ? (
                <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center">
                  <p className="font-display text-xl text-ink-deep">Your table&apos;s still empty</p>
                  <p className="mt-2 max-w-[240px] text-sm text-ink-muted">
                    Chota shuru karein? Add a coffee or chai from the menu.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      closeCart()
                      navigate("/menu")
                    }}
                    className="btn-pill btn-ink mt-6 !py-2.5 text-sm"
                  >
                    Browse menu
                  </button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="cart-line rounded-2xl border border-ink/10 bg-cream p-3.5 shadow-[0_12px_28px_rgba(50,38,27,0.06)]"
                    >
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
                        <div className="inline-flex items-center gap-1 rounded-full border border-ink/8 bg-cream p-0.5">
                          <button
                            type="button"
                            onClick={() => decrement(item.id)}
                            className="grid size-9 place-items-center rounded-full"
                            aria-label={`Decrease ${item.name}`}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="min-w-7 text-center text-sm font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => increment(item.id)}
                            className="grid size-9 place-items-center rounded-full"
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
          <div className="safe-bottom border-t border-ink/10 bg-cream/95 px-5 py-4 shadow-[0_-16px_40px_rgba(50,38,27,0.08)] md:px-6">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-xs tracking-[0.12em] text-ink-muted">SUBTOTAL</p>
                <p className="mt-0.5 font-display text-2xl text-ink-deep md:text-3xl">{formatPrice(subtotal)}</p>
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
                className="btn-pill btn-clay w-full justify-center !py-2.5 text-sm"
                onClick={() => setStep("checkout")}
              >
                Place order
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-pill btn-ink flex-1 justify-center !py-2.5 text-sm"
                    onClick={() => setStep("cart")}
                    disabled={busy}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className={`btn-pill flex-[1.4] justify-center !py-2.5 text-sm transition ${
                      canConfirm && !busy
                        ? "btn-clay confirm-ready"
                        : "bg-ink/15 text-ink/40 cursor-not-allowed shadow-none"
                    }`}
                    onClick={() => void submitOrder()}
                    disabled={busy || !canConfirm}
                    aria-disabled={busy || !canConfirm}
                  >
                    {busy
                      ? payMethod === "upi"
                        ? "Opening pay…"
                        : "Placing…"
                      : payMethod === "upi"
                        ? "Pay & place"
                        : "Confirm"}
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
              Walk-in pickup · pay before kitchen. By confirming you agree to our{" "}
              <Link to="/terms" onClick={closeCart} className="underline underline-offset-2">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/refunds" onClick={closeCart} className="underline underline-offset-2">
                Refund Policy
              </Link>
              .
            </p>
          </div>
        )}
      </aside>
    </div>
  )
}

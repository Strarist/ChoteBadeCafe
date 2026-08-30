import { useCallback, useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import type { OrderDetail } from "@cafe/shared-types"
import { api } from "../lib/api"
import { Appear, PageIntro } from "../components/MotionText"

function statusMessage(order: OrderDetail): string {
  if (order.status === "cancelled") return "This order was cancelled."
  if (order.status === "payment_failed") return "Payment didn’t go through — try again from the menu."
  if (order.status === "awaiting_payment") {
    return "Waiting for online payment. If you chose pay at counter, open checkout again."
  }
  if (order.paymentStatus === "paid") {
    return "Paid online — order sent to the kitchen. They’ll handle preparing and serving."
  }
  return "Order sent — pay at the counter if you haven’t. Kitchen status lives on their side."
}

function isNotFound(err: unknown): boolean {
  return err instanceof Error && /\b404\b|not found/i.test(err.message)
}

export function OrderStatusPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const [fatalError, setFatalError] = useState<string | null>(null)
  const hadOrderRef = useRef(false)

  const load = useCallback(async () => {
    if (!orderId) return
    try {
      const data = await api.get<OrderDetail>(`/orders/${orderId}`, orderId)
      hadOrderRef.current = true
      setOrder(data)
      setRefreshError(null)
      setFatalError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (!hadOrderRef.current && isNotFound(err)) {
        setFatalError("Order not found. Check the link or place a new order from the menu.")
      } else {
        setRefreshError(message)
      }
    }
  }, [orderId])

  useEffect(() => {
    if (!orderId) return
    setOrder(null)
    setRefreshError(null)
    setFatalError(null)
    hadOrderRef.current = false

    void load()
    // Light poll only while payment might still settle; kitchen tracking is off.
    const poll = window.setInterval(() => void load(), 4000)

    return () => {
      window.clearInterval(poll)
    }
  }, [orderId, load])

  return (
    <div className="paper-bg min-h-screen px-5 pb-24 pt-28 md:px-8">
      <div className="mx-auto max-w-lg">
        <PageIntro>
          <Appear as="p" className="text-[0.72rem] font-semibold tracking-[0.18em] text-burgundy">
            YOUR ORDER
          </Appear>
        </PageIntro>

        {fatalError && !order && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-burgundy">{fatalError}</p>
            <Link to="/menu" className="btn-pill btn-clay inline-flex">
              Back to menu
            </Link>
          </div>
        )}

        {refreshError && order && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-burgundy/20 bg-burgundy/8 px-4 py-3">
            <p className="text-xs text-ink-muted">Can&apos;t refresh — showing last update.</p>
            <button
              type="button"
              className="text-xs font-semibold text-burgundy underline underline-offset-2"
              onClick={() => void load()}
            >
              Retry now
            </button>
          </div>
        )}

        {refreshError && !order && !fatalError && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-burgundy">{refreshError}</p>
            <button type="button" className="btn-pill btn-clay" onClick={() => void load()}>
              Retry now
            </button>
          </div>
        )}

        {order && (
          <div className="mt-6 rounded-[1.75rem] border border-[#d8cfc0]/70 bg-[#f7f1e7]/55 p-6">
            <p className="font-display text-4xl text-burgundy">{order.token}</p>
            <p className="mt-2 text-sm text-ink-muted">{statusMessage(order)}</p>
            <p className="mt-1 text-sm text-ink-muted">{order.customer.name}</p>
            {order.offerLabel && order.discountAmount > 0 && (
              <p className="mt-3 text-sm text-sage-deep">
                Offer: {order.offerLabel} (−₹{Math.round(order.discountAmount / 100)})
              </p>
            )}
            <ul className="mt-6 space-y-2 border-t border-ink/10 pt-4">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}× {item.menuItem.name}
                  </span>
                  <span>₹{Math.round(item.lineTotal / 100)}</span>
                </li>
              ))}
              {order.discountAmount > 0 && (
                <li className="flex justify-between text-sm text-sage-deep">
                  <span>Discount</span>
                  <span>−₹{Math.round(order.discountAmount / 100)}</span>
                </li>
              )}
              <li className="flex justify-between border-t border-ink/10 pt-2 text-sm font-semibold">
                <span>Total</span>
                <span>₹{Math.round(order.totalAmount / 100)}</span>
              </li>
            </ul>
            {order.status === "payment_failed" && (
              <Link to="/menu" className="btn-pill btn-clay mt-6 inline-flex">
                Order again from menu
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

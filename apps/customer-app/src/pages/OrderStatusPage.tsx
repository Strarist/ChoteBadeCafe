import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { io } from "socket.io-client"
import type { OrderDetail } from "@cafe/shared-types"
import { SOCKET_EVENTS } from "@cafe/shared-types"
import { api } from "../lib/api"
import { Appear, PageIntro } from "../components/MotionText"

export function OrderStatusPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) return
    let cancelled = false

    async function load() {
      try {
        const data = await api.get<OrderDetail>(`/orders/${orderId}`, orderId)
        if (!cancelled) {
          setOrder(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      }
    }

    void load()
    const socket = io(api.url, { transports: ["websocket", "polling"] })
    socket.on(SOCKET_EVENTS.ORDER_STATUS_CHANGED, (payload: { orderId: string }) => {
      if (payload.orderId === orderId) void load()
    })
    socket.on(SOCKET_EVENTS.ORDER_PAYMENT_FAILED, (payload: { orderId: string }) => {
      if (payload.orderId === orderId) void load()
    })

    return () => {
      cancelled = true
      socket.disconnect()
    }
  }, [orderId])

  return (
    <div className="paper-bg min-h-screen px-5 pb-24 pt-28 md:px-8">
      <div className="mx-auto max-w-lg">
        <PageIntro>
          <Appear as="p" className="text-[0.72rem] font-semibold tracking-[0.18em] text-burgundy">
            ORDER STATUS
          </Appear>
        </PageIntro>
        {error && <p className="mt-4 text-sm text-burgundy">{error}</p>}
        {order && (
          <div className="mt-6 rounded-[1.75rem] border border-[#d8cfc0]/70 bg-[#f7f1e7]/55 p-6">
            <p className="font-display text-4xl text-burgundy">{order.token}</p>
            <p className="mt-2 text-sm capitalize text-ink-muted">
              {order.status.replaceAll("_", " ")}
            </p>
            <p className="mt-1 text-sm text-ink-muted">{order.customer.name}</p>
            <ul className="mt-6 space-y-2 border-t border-ink/10 pt-4">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}× {item.menuItem.name}
                  </span>
                  <span>₹{Math.round(item.lineTotal / 100)}</span>
                </li>
              ))}
            </ul>
            {order.status === "payment_failed" && (
              <Link to="/menu" className="btn-pill btn-clay mt-6 inline-flex">
                Retry from menu
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

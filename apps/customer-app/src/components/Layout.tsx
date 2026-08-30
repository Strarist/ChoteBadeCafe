import { useLocation } from "react-router-dom"
import { useEffect } from "react"
import { Header } from "./Header"
import { Footer } from "./Footer"
import { PullUpChair } from "./PullUpChair"
import { CartDrawer } from "./CartDrawer"
import { CartBar } from "./CartBar"
import { PageTransition } from "./PageTransition"
import { getLenis, useSmoothScroll } from "../hooks/useSmoothScroll"
import { prefetchMenu } from "../lib/menuCache"
import { warmApi } from "../lib/warmApi"
import { useConnectionStatus } from "../hooks/useConnectionStatus"
import { ConnectionBanner } from "./ConnectionBanner"
import { useCart } from "../context/CartContext"

export function Layout() {
  const { pathname } = useLocation()
  const connectionStatus = useConnectionStatus()
  const { isOpen: cartOpen } = useCart()
  const isSpin = pathname === "/spin"
  useSmoothScroll()

  useEffect(() => {
    warmApi()
    prefetchMenu()
  }, [])

  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "Chote Bade Café",
      "/story": "Our Story — Chote Bade",
      "/menu": "Menu — Chote Bade",
      "/spin": "Spin & Win — Chote Bade",
      "/journal": "Journal — Chote Bade",
      "/memory-wall": "Memory Wall — Chote Bade",
      "/visit": "Contact Us — Chote Bade",
      "/contact": "Contact Us — Chote Bade",
      "/privacy": "Privacy Policy — Chote Bade",
      "/terms": "Terms and Conditions — Chote Bade",
      "/refunds": "Cancellation and Refunds — Chote Bade",
      "/shipping": "Shipping Policy — Chote Bade",
    }
    document.title = titles[pathname] ?? "Chote Bade Café"
  }, [pathname])

  useEffect(() => {
    getLenis()?.scrollToTopImmediate()
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden ${
        isSpin ? "bg-[#2a0a10] text-[#f5e6c8]" : "bg-transparent text-ink"
      }`}
    >
      <ConnectionBanner status={connectionStatus} />
      {!isSpin ? (
        <>
          <div className="pointer-events-none fixed inset-0 -z-10 grain" aria-hidden />
          <div
            className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[70vh] bg-gradient-to-b from-cream-warm/80 via-transparent to-transparent"
            aria-hidden
          />
        </>
      ) : null}
      <div {...(cartOpen ? { inert: true as const } : {})}>
        {!isSpin ? <Header /> : null}
        <main className={isSpin ? "page-main p-0" : "page-main pb-24 md:pb-16"}>
          <PageTransition />
          {!isSpin ? <PullUpChair /> : null}
        </main>
        {!isSpin ? <Footer /> : null}
      </div>
      <CartBar />
      <CartDrawer />
    </div>
  )
}

import { useLocation } from "react-router-dom"
import { useEffect } from "react"
import { Header } from "./Header"
import { Footer } from "./Footer"
import { PullUpChair } from "./PullUpChair"
import { CartDrawer } from "./CartDrawer"
import { PageTransition } from "./PageTransition"
import { getLenis, useSmoothScroll } from "../hooks/useSmoothScroll"

export function Layout() {
  const { pathname } = useLocation()
  useSmoothScroll()

  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "Chote Bade Café",
      "/story": "Our Story — Chote Bade",
      "/menu": "Menu — Chote Bade",
      "/journal": "Journal — Chote Bade",
      "/memory-wall": "Memory Wall — Chote Bade",
      "/visit": "Visit — Chote Bade",
    }
    document.title = titles[pathname] ?? "Chote Bade Café"
  }, [pathname])

  // Belt-and-suspenders: every route change starts at the top
  useEffect(() => {
    getLenis()?.scrollToTopImmediate()
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-transparent text-ink">
      <div className="pointer-events-none fixed inset-0 -z-10 grain" aria-hidden />
      <div
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[70vh] bg-gradient-to-b from-cream-warm/80 via-transparent to-transparent"
        aria-hidden
      />
      <Header />
      <main className="page-main">
        <PageTransition />
        <PullUpChair />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}

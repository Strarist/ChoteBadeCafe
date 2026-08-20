import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { ArrowUpRight, Menu, X } from "lucide-react"
import { Logo } from "./Logo"
import { navLinks } from "../data/site"
import { useOrderNow } from "../hooks/useOrderNow"
import { getLenis } from "../hooks/useSmoothScroll"

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const orderNow = useOrderNow()
  const location = useLocation()
  const navRef = useRef<HTMLElement>(null)
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    if (open) getLenis()?.stop()
    else getLenis()?.start()
    return () => {
      document.body.style.overflow = ""
      getLenis()?.start()
    }
  }, [open])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const updatePill = () => {
    const nav = navRef.current
    if (!nav) return
    const active = nav.querySelector<HTMLElement>("[aria-current='page']")
    if (!active) {
      setPill((p) => ({ ...p, ready: false }))
      return
    }
    const navBox = nav.getBoundingClientRect()
    const linkBox = active.getBoundingClientRect()
    setPill({
      left: linkBox.left - navBox.left,
      width: linkBox.width,
      ready: true,
    })
  }

  useLayoutEffect(() => {
    updatePill()
  }, [location.pathname, open])

  useEffect(() => {
    window.addEventListener("resize", updatePill)
    return () => window.removeEventListener("resize", updatePill)
  }, [])

  return (
    <>
      <header
        className={`site-header fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled || open ? "site-header-scrolled" : ""
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-3 px-5 md:h-[4.25rem] md:px-8">
          <Logo />

          <nav ref={navRef} className="relative hidden items-center gap-0.5 lg:flex">
            <span
              className="nav-pill pointer-events-none absolute top-0 bottom-0 rounded-full bg-burgundy/[0.08]"
              style={{
                width: pill.width,
                transform: `translateX(${pill.left}px)`,
                opacity: pill.ready ? 1 : 0,
              }}
              aria-hidden
            />
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative z-[1] rounded-full px-3.5 py-2 text-[0.88rem] font-medium tracking-[-0.01em] transition-colors duration-300 ${
                    isActive ? "text-burgundy" : "text-ink/75 hover:text-burgundy"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={orderNow}
              className="btn-pill btn-clay hidden !px-4 !py-2 text-[0.8rem] lg:inline-flex"
            >
              Order Now
            </button>
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full border border-ink/10 bg-cream-warm/80 text-ink transition hover:border-burgundy/25 hover:bg-burgundy/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div
          className="fixed inset-x-0 top-16 bottom-0 z-40 md:top-[4.25rem] lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="mobile-sheet-backdrop absolute inset-0"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <nav className="site-mobile-nav relative flex h-full flex-col overflow-hidden">
            <div className="site-mobile-nav-wash pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative flex flex-1 flex-col overflow-y-auto px-5 pb-8 pt-6">
              <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-burgundy">
                FIND YOUR WAY
              </p>
              <div className="mt-5 flex flex-col gap-1.5">
                {navLinks.map((link, i) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    style={{ animationDelay: `${50 + i * 45}ms` }}
                    className={({ isActive }) =>
                      `mobile-nav-link group flex items-center justify-between rounded-2xl border px-4 py-3.5 transition ${
                        isActive
                          ? "border-burgundy/20 bg-burgundy/[0.07] text-burgundy shadow-[0_10px_28px_rgba(92,42,50,0.08)]"
                          : "border-ink/8 bg-cream/70 text-ink shadow-[0_6px_18px_rgba(50,38,27,0.04)] hover:border-burgundy/15 hover:bg-cream"
                      }`
                    }
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-[0.7rem] font-semibold tracking-[0.08em] text-ink-muted">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-lg font-medium tracking-[-0.02em]">{link.label}</span>
                    </span>
                    <ArrowUpRight
                      size={18}
                      className="text-ink-muted transition group-hover:text-burgundy"
                    />
                  </NavLink>
                ))}
              </div>

              <div className="mt-auto pt-8">
                <div className="rounded-3xl border border-ink/8 bg-gradient-to-br from-cream to-cream-warm p-5 shadow-[0_18px_40px_rgba(50,38,27,0.08)]">
                  <p className="font-display text-xl tracking-[-0.03em] text-burgundy">
                    Ready for the table?
                  </p>
                  <p className="mt-1.5 text-sm text-ink-muted">
                    Browse the menu and we&apos;ll hold your order until you pay.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      orderNow()
                    }}
                    className="btn-pill btn-clay mt-4 w-full justify-center !py-2.5 text-sm"
                  >
                    Order Now
                  </button>
                </div>
              </div>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  )
}

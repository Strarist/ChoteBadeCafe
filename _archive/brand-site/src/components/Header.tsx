import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { Menu, ShoppingBag, X } from "lucide-react"
import { Logo } from "./Logo"
import { navLinks } from "../data/site"
import { useCart } from "../context/CartContext"

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { itemCount, openCart } = useCart()
  const [badgeBump, setBadgeBump] = useState(false)
  const prevCount = useRef(itemCount)
  const location = useLocation()
  const navRef = useRef<HTMLElement>(null)
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    if (itemCount > prevCount.current) {
      setBadgeBump(true)
      const t = window.setTimeout(() => setBadgeBump(false), 700)
      prevCount.current = itemCount
      return () => window.clearTimeout(t)
    }
    prevCount.current = itemCount
  }, [itemCount])

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
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        scrolled || open ? "header-glass-scrolled" : "header-glass"
      }`}
    >
      <div className="mx-auto flex h-[4.6rem] max-w-[1400px] items-center justify-between gap-4 px-5 md:px-8">
        <Logo />

        <nav
          ref={navRef}
          className="relative hidden items-center gap-1 rounded-full px-1.5 py-1.5 lg:flex glass-soft"
        >
          <span
            className="nav-pill pointer-events-none absolute top-1.5 bottom-1.5 rounded-full bg-cream/55 shadow-[0_1px_0_rgba(50,38,27,0.06),0_8px_20px_rgba(122,47,58,0.08)]"
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
                `relative z-[1] rounded-full px-3.5 py-2 text-[0.9rem] font-medium tracking-[-0.01em] transition-colors duration-500 ${
                  isActive ? "text-burgundy" : "text-ink/85 hover:text-burgundy"
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
            onClick={openCart}
            aria-label={`View your table${itemCount ? `, ${itemCount} items` : ""}`}
            className="relative grid size-10 place-items-center rounded-full text-ink transition duration-500 glass-soft hover:-translate-y-0.5"
          >
            <ShoppingBag size={18} strokeWidth={1.7} />
            {itemCount > 0 && (
              <span
                className={`absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-clay px-1 text-[0.65rem] font-semibold leading-5 text-cream transition duration-500 ${
                  badgeBump ? "scale-125" : "scale-100"
                }`}
              >
                {itemCount}
              </span>
            )}
          </button>
          <Link to="/menu" className="btn-pill btn-clay hidden sm:inline-flex">
            Order Now
          </Link>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full text-ink transition duration-500 glass-soft hover:-translate-y-0.5 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
          open ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="mx-4 mb-4 flex flex-col gap-1 rounded-[1.5rem] p-3 glass-strong">
          {navLinks.map((link, i) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${i * 70}ms` : "0ms" }}
              className={({ isActive }) =>
                `rounded-2xl px-4 py-3 text-lg font-medium transition duration-500 ${
                  isActive ? "bg-cream/55 text-burgundy" : "text-ink hover:bg-cream/35"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/menu"
            onClick={() => setOpen(false)}
            className="btn-pill btn-clay mt-2 justify-center"
          >
            Order Now
          </Link>
        </nav>
      </div>
    </header>
  )
}

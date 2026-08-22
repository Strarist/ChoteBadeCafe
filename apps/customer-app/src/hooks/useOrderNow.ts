import { useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"

/** Order Now always does something visible — even when already on /menu. */
export function useOrderNow() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { openCart, itemCount } = useCart()

  return useCallback(() => {
    const onMenu = pathname === "/menu" || pathname.startsWith("/menu/")
    if (!onMenu) {
      navigate("/menu")
      return
    }
    if (itemCount > 0) {
      openCart()
      return
    }
    const target =
      document.getElementById("menu-dishes") ??
      document.getElementById("menu-filters") ??
      document.getElementById("menu-list")
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 96
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" })
      target.classList.add("menu-scroll-flash")
      window.setTimeout(() => target.classList.remove("menu-scroll-flash"), 900)
      return
    }
    openCart()
  }, [pathname, navigate, openCart, itemCount])
}

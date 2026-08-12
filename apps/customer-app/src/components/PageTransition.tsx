import { useEffect, useRef, useState } from "react"
import { useLocation, useOutlet } from "react-router-dom"
import { getLenis } from "../hooks/useSmoothScroll"

/** Keep swap + soft-enter under ~100ms so routes do not flash blank. */
const ENTER_MS = 90

/**
 * Instant page swap with a short soft-enter.
 * No exit fade — that was the ~320–500ms blank gap between routes.
 */
export function PageTransition() {
  const location = useLocation()
  const outlet = useOutlet()
  const outletRef = useRef(outlet)
  outletRef.current = outlet

  const [render, setRender] = useState({ key: location.pathname, node: outlet })
  const [phase, setPhase] = useState<"idle" | "enter">("idle")
  const coldStart = useRef(true)

  useEffect(() => {
    if (!coldStart.current) return
    coldStart.current = false
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) return
    setPhase("enter")
    const t = window.setTimeout(() => setPhase("idle"), ENTER_MS)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (location.pathname === render.key) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const nextKey = location.pathname
    let enterTimer = 0

    getLenis()?.scrollToTopImmediate()
    setRender({ key: nextKey, node: outletRef.current })
    getLenis()?.scrollToTopImmediate()

    if (reduced) {
      setPhase("idle")
      return
    }

    // Double-rAF: paint new route once, then run the short enter.
    requestAnimationFrame(() => {
      getLenis()?.scrollToTopImmediate()
      setPhase("enter")
      enterTimer = window.setTimeout(() => setPhase("idle"), ENTER_MS)
    })

    return () => {
      window.clearTimeout(enterTimer)
    }
  }, [location.pathname, render.key])

  const className = phase === "enter" ? "page-shell is-entering" : "page-shell"

  return <div className={className}>{render.node}</div>
}

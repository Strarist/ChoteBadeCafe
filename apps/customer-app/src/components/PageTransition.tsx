import { useEffect, useRef, useState } from "react"
import { useLocation, useOutlet } from "react-router-dom"
import { getLenis } from "../hooks/useSmoothScroll"

/**
 * Soft page change: fade out → swap at top → fade in.
 * Child PageIntro / EmergeLine own the text motion.
 * Cold load also gets a short enter phase so first paint feels alive.
 */
export function PageTransition() {
  const location = useLocation()
  const outlet = useOutlet()
  const outletRef = useRef(outlet)
  outletRef.current = outlet

  const [render, setRender] = useState({ key: location.pathname, node: outlet })
  const [phase, setPhase] = useState<"idle" | "exit" | "enter">("idle")
  const coldStart = useRef(true)

  // First visit: run enter phase so shell + remounted intro animations feel intentional
  useEffect(() => {
    if (!coldStart.current) return
    coldStart.current = false
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) return
    setPhase("enter")
    const t = window.setTimeout(() => setPhase("idle"), 900)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (location.pathname === render.key) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const nextKey = location.pathname
    let enterTimer = 0
    let exitTimer = 0

    getLenis()?.scrollToTopImmediate()

    const swap = () => {
      setRender({ key: nextKey, node: outletRef.current })
      getLenis()?.scrollToTopImmediate()
      requestAnimationFrame(() => {
        getLenis()?.scrollToTopImmediate()
        setPhase(reduced ? "idle" : "enter")
        if (!reduced) {
          // Match emerge (~1.25s) so text motion isn't cut short
          enterTimer = window.setTimeout(() => setPhase("idle"), 900)
        }
      })
    }

    if (reduced) {
      swap()
      return
    }

    setPhase("exit")
    exitTimer = window.setTimeout(swap, 320)

    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(enterTimer)
    }
  }, [location.pathname, render.key])

  const className =
    phase === "exit"
      ? "page-shell is-exiting"
      : phase === "enter"
        ? "page-shell is-entering"
        : "page-shell"

  return <div className={className}>{render.node}</div>
}

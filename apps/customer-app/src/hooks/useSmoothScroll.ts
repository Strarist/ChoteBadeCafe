import { useEffect } from "react"
import Lenis from "lenis"

type LenisController = {
  /** Jump to top instantly — use on route changes */
  scrollToTopImmediate: () => void
  scrollToTop: (duration?: number) => void
  stop: () => void
  start: () => void
}

let controller: LenisController | null = null

export function getLenis() {
  return controller
}

function jumpToTop(lenis?: Lenis | null) {
  // Native + Lenis so nothing fights the reset
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  lenis?.scrollTo(0, { immediate: true, force: true })
}

export function useSmoothScroll() {
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual"
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      controller = {
        scrollToTopImmediate: () => {
          window.scrollTo(0, 0)
          document.documentElement.scrollTop = 0
          document.body.scrollTop = 0
        },
        scrollToTop: () => window.scrollTo({ top: 0, behavior: "smooth" }),
        stop: () => undefined,
        start: () => undefined,
      }
      return
    }

    const lenis = new Lenis({
      // Cafe-pace: more delayed, slower wheel — premium glide
      duration: 4.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -12 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.22,
      touchMultiplier: 0.62,
      syncTouch: false,
    })

    controller = {
      scrollToTopImmediate: () => jumpToTop(lenis),
      scrollToTop: (duration = 1.7) => {
        lenis.scrollTo(0, {
          duration,
          easing: (t) => 1 - Math.pow(1 - t, 3.8),
        })
      },
      stop: () => lenis.stop(),
      start: () => lenis.start(),
    }

    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      controller = null
      lenis.destroy()
    }
  }, [])
}

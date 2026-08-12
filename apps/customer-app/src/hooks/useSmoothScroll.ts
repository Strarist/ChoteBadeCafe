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
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  lenis?.scrollTo(0, { immediate: true, force: true })
}

function makeNativeController(): LenisController {
  return {
    scrollToTopImmediate: () => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    },
    scrollToTop: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    stop: () => undefined,
    start: () => undefined,
  }
}

/**
 * Smooth scroll on fine pointers (desktop). Native scroll on touch / reduced-motion
 * to avoid mobile stutter from Lenis rAF + long duration.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual"
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const coarse = window.matchMedia("(pointer: coarse)").matches
    if (reduced || coarse) {
      controller = makeNativeController()
      return () => {
        controller = null
      }
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1,
      syncTouch: false,
    })

    controller = {
      scrollToTopImmediate: () => jumpToTop(lenis),
      scrollToTop: (duration = 0.9) => {
        lenis.scrollTo(0, {
          duration,
          easing: (t) => 1 - Math.pow(1 - t, 3),
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

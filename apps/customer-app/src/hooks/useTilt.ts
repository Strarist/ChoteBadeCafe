import { useEffect, useRef } from "react"

/** Subtle cursor-follow tilt for hero media */
export function useTilt(strength = 10) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) return

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      el.style.transform = `perspective(900px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) translateY(${y * -6}px)`
    }

    const onLeave = () => {
      el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) translateY(0)"
    }

    el.addEventListener("mousemove", onMove)
    el.addEventListener("mouseleave", onLeave)
    el.style.transition = "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)"

    return () => {
      el.removeEventListener("mousemove", onMove)
      el.removeEventListener("mouseleave", onLeave)
    }
  }, [strength])

  return ref
}

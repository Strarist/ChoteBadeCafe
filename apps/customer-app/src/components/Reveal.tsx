import { useEffect, useRef, useState, type ReactNode } from "react"

type RevealProps = {
  children: ReactNode
  className?: string
  variant?: "up" | "scale" | "left" | "right"
  delay?: number
  as?: "div" | "section" | "article" | "li" | "blockquote"
}

const variantClass = {
  up: "reveal",
  scale: "reveal-scale",
  left: "reveal-left",
  right: "reveal-right",
} as const

function isNearViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  const vh = window.innerHeight || 0
  // Generous margin so above-the-fold content paints visible on the first frame after route swap
  return rect.top < vh * 1.15 && rect.bottom > -vh * 0.1
}

export function Reveal({
  children,
  className = "",
  variant = "up",
  delay = 0,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced || isNearViewport(el)) {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.08, rootMargin: "80px 0px 0px 0px" },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as never}
      className={`${variantClass[variant]} ${inView ? "is-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}

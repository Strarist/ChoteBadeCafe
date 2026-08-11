import { useLocation } from "react-router-dom"
import type { ReactNode } from "react"

/** Large display line — rises from below through a clip mask */
export function EmergeLine({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <span className={`emerge-line ${className}`}>
      <span style={{ animationDelay: `${delay}ms` }}>{children}</span>
    </span>
  )
}

/** Small / supporting text — soft fade from nowhere (blur + scale) */
export function Appear({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: "div" | "p" | "span"
}) {
  return (
    <Tag className={`appear-soft ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </Tag>
  )
}

/**
 * Page hero motion mount — remounts on route change so animations replay.
 * Large titles use EmergeLine; eyebrows/body use Appear.
 */
export function PageIntro({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  const { pathname } = useLocation()
  // Include a stable enter token so cold-load + navigations always remount children
  return (
    <div key={pathname} className={`page-intro ${className}`}>
      {children}
    </div>
  )
}

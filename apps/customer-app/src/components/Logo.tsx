import { Link } from "react-router-dom"

export interface LogoProps {
  light?: boolean
  withWordmark?: boolean
  size?: "sm" | "md" | "lg" | "xl" | number
  className?: string
  asLink?: boolean
  showTagline?: boolean
}

/**
 * Production Chote Bade Café Brand Logo Component
 * Incorporates the authentic circular medallion emblem and brand wordmark.
 */
export function Logo({
  light = false,
  withWordmark = true,
  size = "md",
  className = "",
  asLink = true,
  showTagline = false,
}: LogoProps) {
  const wordColor = light ? "#ede6da" : "#5c2a32"

  const sizeClasses = {
    sm: "size-8 md:size-9",
    md: "size-10 md:size-11",
    lg: "size-11 sm:size-12 md:size-[3.25rem]",
    xl: "size-20 md:size-24",
  }

  const customStyle =
    typeof size === "number"
      ? { width: `${size}px`, height: `${size}px` }
      : undefined

  const webpSrc = light
    ? "/images/branding/chote-bade-cafe-logo-light.webp"
    : "/images/branding/chote-bade-cafe-logo.webp"

  const pngSrc = light
    ? "/images/branding/chote-bade-cafe-logo-light.png"
    : "/images/branding/chote-bade-cafe-logo.png"

  const content = (
    <div className={`logo-mark inline-flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      <picture className="shrink-0 flex items-center justify-center">
        <source srcSet={webpSrc} type="image/webp" />
        <img
          src={pngSrc}
          alt="Chote Bade Café"
          className={`object-contain transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:scale-105 ${
            typeof size === "string" ? sizeClasses[size] : ""
          }`}
          style={customStyle}
          width={size === "sm" ? 36 : size === "lg" ? 52 : size === "xl" ? 96 : 44}
          height={size === "sm" ? 36 : size === "lg" ? 52 : size === "xl" ? 96 : 44}
          loading="eager"
          decoding="async"
        />
      </picture>

      {withWordmark && (
        <div className="flex flex-col justify-center min-w-0">
          <span
            className="logo-wordmark font-display leading-[1.05] tracking-tight"
            style={{ color: wordColor }}
          >
            Chote Bade Cafe
          </span>
          {showTagline && (
            <span
              className="mt-1 text-[0.62rem] font-sans font-semibold uppercase tracking-[0.18em]"
              style={{ color: light ? "rgba(237,230,218,0.7)" : "#8b1e2d" }}
            >
              Chote Moments, Bade Memories
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (asLink) {
    return (
      <Link to="/" className="inline-block" aria-label="Chote Bade Café home">
        {content}
      </Link>
    )
  }

  return content
}

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
 * Circular medallion + stacked wordmark (CHOTE BADE / — CAFÉ —)
 * matching the brand lockup: burgundy title, gold café line.
 */
export function Logo({
  light = false,
  withWordmark = true,
  size = "md",
  className = "",
  asLink = true,
  showTagline = false,
}: LogoProps) {
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
    <div
      className={`logo-mark inline-flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}
    >
      <picture className="shrink-0 flex items-center justify-center">
        <source srcSet={webpSrc} type="image/webp" />
        <img
          src={pngSrc}
          alt={asLink || withWordmark ? "" : "Chote Bade Café"}
          aria-hidden={asLink || withWordmark ? true : undefined}
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
        <div className={`logo-wordmark ${light ? "logo-wordmark--light" : ""}`}>
          <span className="logo-wordmark-title">Chote Bade</span>
          <span className="logo-wordmark-cafe">
            <span className="logo-wordmark-rule" aria-hidden />
            <span className="logo-wordmark-cafe-text">Café</span>
            <span className="logo-wordmark-rule" aria-hidden />
          </span>
          {showTagline && (
            <span className="logo-wordmark-tagline">
              Chote moments, Bade memories
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (asLink) {
    return (
      <Link to="/" className="inline-block" aria-label="Chote Bade Café home">
        <span aria-hidden="true">{content}</span>
      </Link>
    )
  }

  return content
}

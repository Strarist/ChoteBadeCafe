import { Link } from "react-router-dom"

/** Matches brand mark: gold circle, cup + CB, steam, cloud + wordmark */
export function Logo({ light = false, withWordmark = true }: { light?: boolean; withWordmark?: boolean }) {
  const word = light ? "#ede6da" : "#5c2a32"
  const gold = light ? "#e8d5a3" : "#c9a24b"
  const cupInk = light ? "#3a2418" : "#5c2a32"

  return (
    <Link to="/" className="logo-mark inline-flex items-center gap-2.5 group" aria-label="Chote Bade home">
      <svg
        className="size-10 shrink-0 transition duration-700 group-hover:-translate-y-0.5 md:size-[2.65rem]"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden
      >
        {/* Outer ring */}
        <circle cx="32" cy="32" r="29.5" stroke={gold} strokeWidth="1.75" />

        {/* Soft cloud */}
        <path
          d="M26.5 14.2c.4-1.6 1.8-2.7 3.5-2.7 1.1 0 2.1.5 2.8 1.2.5-.3 1.1-.5 1.8-.5 1.7 0 3.1 1.3 3.3 2.9.9.2 1.6.9 1.6 1.9 0 1.1-.9 2-2 2H26.2c-1.2 0-2.1-.9-2.1-2.1 0-1 .7-1.8 1.7-2-.1-.2-.1-.4-.1-.7z"
          fill={gold}
        />

        {/* Steam */}
        <path
          d="M28.2 22.5c0-2.2-1.2-3.2-1.2-5.2"
          stroke={gold}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M32.2 22.2c0-2.6-1.4-3.6-1.4-5.8"
          stroke={gold}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M36.2 22.5c0-2.2-1.2-3.2-1.2-5.2"
          stroke={gold}
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Cup body */}
        <path
          d="M22.5 28.5h16.2c1.2 0 2.2 1 2.2 2.2v8.6c0 3.6-2.9 6.5-6.5 6.5h-7.6c-3.6 0-6.5-2.9-6.5-6.5v-8.6c0-1.2 1-2.2 2.2-2.2z"
          fill={gold}
        />
        {/* Handle */}
        <path
          d="M40.9 31.2h2.4c2.1 0 3.8 1.7 3.8 3.8v1.4c0 2.1-1.7 3.8-3.8 3.8h-2.4"
          stroke={gold}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* CB letters (negative on cup) */}
        <text
          x="32.5"
          y="40.2"
          textAnchor="middle"
          fill={cupInk}
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.02em",
          }}
        >
          CB
        </text>
      </svg>

      {withWordmark && (
        <span className="logo-wordmark font-display leading-none" style={{ color: word }}>
          Chote Bade
        </span>
      )}
    </Link>
  )
}

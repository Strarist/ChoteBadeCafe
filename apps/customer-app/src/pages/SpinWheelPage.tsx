import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  OFFER_CATALOG,
  WHEEL_SEGMENTS,
  type OfferCode,
} from "@cafe/shared-types"
import { Logo } from "../components/Logo"
import { useCart } from "../context/CartContext"
import { pickRandomWheelIndex } from "../lib/offers"
import {
  hasSpunThisVisit,
  loadSpinRecord,
  saveSpinResult,
  visitKeyFromTable,
} from "../lib/spinSession"

const SIZE = 400
const CX = SIZE / 2
const CY = SIZE / 2
const R = 188
const SEGMENT_ANGLE = 360 / WHEEL_SEGMENTS.length
const SPIN_MS = 4500

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function wedgePath(index: number): string {
  const start = index * SEGMENT_ANGLE
  const end = start + SEGMENT_ANGLE
  const a = polar(CX, CY, R, start)
  const b = polar(CX, CY, R, end)
  return `M ${CX} ${CY} L ${a.x} ${a.y} A ${R} ${R} 0 0 1 ${b.x} ${b.y} Z`
}

export function SpinWheelPage() {
  const { tableId, refreshOffer } = useCart()
  const navigate = useNavigate()
  const visitKey = visitKeyFromTable(tableId)
  const existing = useMemo(() => loadSpinRecord(visitKey), [visitKey])

  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [won, setWon] = useState<OfferCode | null>(existing?.offerCode ?? null)
  const [alreadySpun, setAlreadySpun] = useState(() => hasSpunThisVisit(visitKey))

  useEffect(() => {
    if (existing?.offerCode) {
      setWon(existing.offerCode)
      setAlreadySpun(true)
    }
  }, [existing])

  const spin = () => {
    if (spinning || hasSpunThisVisit(visitKey)) return
    const index = pickRandomWheelIndex()
    const code = WHEEL_SEGMENTS[index]!
    const segmentCenter = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2
    // Pointer at top; wheel rotates so segmentCenter lands under pointer
    const target = 360 * 6 + (360 - segmentCenter)
    setSpinning(true)
    setWon(null)
    setRotation((prev) => prev + target)

    window.setTimeout(() => {
      saveSpinResult(code, visitKey)
      refreshOffer()
      setWon(code)
      setAlreadySpun(true)
      setSpinning(false)
    }, SPIN_MS)
  }

  const def = won ? OFFER_CATALOG[won] : null
  const isWin = won != null && won !== "better_luck"

  return (
    <div className="spin-page relative min-h-[100dvh] overflow-hidden px-4 pb-16 pt-6 text-center md:px-8 md:pt-10">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 42%, #6b1a28 0%, #4a1018 45%, #2a0a10 100%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(212,168,75,0.12), transparent 40%), radial-gradient(circle at 80% 70%, rgba(212,168,75,0.08), transparent 35%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center">
        <div className="flex items-center gap-3 rounded-full border border-[#d4a84b]/35 bg-[#3a1018]/70 px-4 py-2.5 backdrop-blur-sm">
          <Logo light size="sm" withWordmark={false} asLink={false} />
          <div className="text-left">
            <p className="font-display text-sm leading-none tracking-wide text-[#f5e6c8]">
              Chote Bade Café
            </p>
            <p className="mt-1 text-[0.58rem] font-semibold tracking-[0.14em] text-[#d4a84b]/90">
              BIG FLAVOURS, SMALL PRICES
            </p>
          </div>
        </div>

        <h1 className="spin-title mt-7 max-w-[18ch] font-display text-[clamp(1.85rem,6.5vw,2.75rem)] leading-[1.12] tracking-[-0.02em]">
          Spin &amp; Win Amazing Offers!
        </h1>

        <div className="relative mt-8 w-[min(100%,340px)]">
          {/* Pointer */}
          <div
            className="absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-[2px]"
            aria-hidden
          >
            <div
              className="h-0 w-0 border-x-[11px] border-t-[20px] border-x-transparent"
              style={{
                borderTopColor: "#d4a84b",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.45))",
              }}
            />
          </div>

          <div
            className="relative aspect-square w-full"
            style={{
              filter: "drop-shadow(0 22px 50px rgba(0,0,0,0.45))",
            }}
          >
            {/* Gold rim */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, #f0d78a, #b8862d, #f5e0a0, #a67c28, #f0d78a)",
                padding: "7px",
              }}
            >
              <div
                className="h-full w-full overflow-hidden rounded-full"
                style={{ background: "#3a1018" }}
              >
                <svg
                  viewBox={`0 0 ${SIZE} ${SIZE}`}
                  className="h-full w-full transition-transform ease-[cubic-bezier(0.12,0.78,0.08,1)]"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transitionDuration: `${SPIN_MS}ms`,
                  }}
                  role="img"
                  aria-label="Prize wheel"
                >
                  {WHEEL_SEGMENTS.map((code, i) => {
                    const offer = OFFER_CATALOG[code]
                    const mid = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2
                    // Midway between hub and rim — text reads center → outward
                    const labelR = 112
                    const labelPos = polar(CX, CY, labelR, mid)
                    return (
                      <g key={`${code}-${i}`}>
                        <path
                          d={wedgePath(i)}
                          fill={offer.color}
                          stroke="rgba(245,230,200,0.12)"
                          strokeWidth={1}
                        />
                        <text
                          x={labelPos.x}
                          y={labelPos.y}
                          fill={offer.textColor}
                          fontSize={code === "better_luck" ? 10 : 13.5}
                          fontWeight={700}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${mid - 90}, ${labelPos.x}, ${labelPos.y})`}
                          style={{
                            fontFamily: "Manrope, system-ui, sans-serif",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {offer.shortLabel}
                        </text>
                      </g>
                    )
                  })}
                  {/* Inner decorative ring */}
                  <circle
                    cx={CX}
                    cy={CY}
                    r={58}
                    fill="none"
                    stroke="rgba(212,168,75,0.35)"
                    strokeWidth={2}
                  />
                </svg>
              </div>
            </div>

            {/* Center hub */}
            <button
              type="button"
              onClick={spin}
              disabled={spinning || alreadySpun}
              className="absolute left-1/2 top-1/2 z-20 flex size-[5.25rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-[3px] border-[#d4a84b] text-center transition enabled:hover:scale-[1.04] enabled:active:scale-95 disabled:cursor-default"
              style={{
                background:
                  "radial-gradient(circle at 35% 30%, #8a2434 0%, #5c1524 55%, #3a1018 100%)",
                boxShadow:
                  "inset 0 2px 6px rgba(255,220,150,0.2), 0 8px 20px rgba(0,0,0,0.4)",
              }}
              aria-label={spinning ? "Spinning" : alreadySpun ? "Already spun" : "Spin now"}
            >
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#f5e6c8]">
                {spinning ? "…" : alreadySpun ? "DONE" : "SPIN"}
              </span>
              {!spinning && !alreadySpun ? (
                <span className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#d4a84b]">
                  NOW
                </span>
              ) : null}
            </button>
          </div>
        </div>

        {!won && !alreadySpun && (
          <p className="mt-8 text-sm text-[#f5e6c8]/85">
            Try your luck and unlock an exclusive offer!
          </p>
        )}

        {spinning && (
          <p className="mt-8 animate-pulse text-sm font-semibold text-[#d4a84b]">
            Spinning…
          </p>
        )}

        {won && def && !spinning && (
          <div
            className="mt-8 w-full max-w-sm space-y-3 rounded-2xl border border-[#d4a84b]/40 px-6 py-6"
            style={{
              background: "linear-gradient(180deg, rgba(90,20,30,0.9), rgba(42,10,16,0.95))",
            }}
          >
            <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-[#d4a84b]">
              {isWin ? "YOU WON" : "THIS VISIT"}
            </p>
            <p className="font-display text-2xl text-[#f5e6c8] md:text-3xl">{def.label}</p>
            <p className="text-sm leading-relaxed text-[#f5e6c8]/75">{def.description}</p>
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                className="btn-pill justify-center px-6 py-3 text-sm font-semibold"
                style={{
                  background: "linear-gradient(180deg, #e0bc5c, #c4933a)",
                  color: "#3a1518",
                }}
                onClick={() => navigate("/menu")}
              >
                {isWin ? "Order with this offer" : "Order from the menu"}
              </button>
              <Link
                to="/"
                className="inline-flex items-center justify-center py-2 text-sm text-[#d4a84b] underline-offset-2 hover:underline"
              >
                Back home
              </Link>
            </div>
          </div>
        )}

        <p className="mt-6 text-[0.7rem] text-[#f5e6c8]/45">
          {tableId
            ? `Table ${tableId} · one spin per visit`
            : "One spin per table visit"}
        </p>
      </div>
    </div>
  )
}

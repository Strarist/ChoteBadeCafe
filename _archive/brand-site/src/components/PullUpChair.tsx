import { Link } from "react-router-dom"
import { Reveal } from "./Reveal"

export function PullUpChair() {
  return (
    <section className="relative overflow-hidden bg-ink-deep text-cream">
      <div
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-clay/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-sage/25 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-10 rounded-[2rem] p-7 glass-on-dark md:grid-cols-[1fr_1.1fr] md:items-end md:gap-16 md:p-12">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.2em] text-cream/55">
              PULL UP A CHAIR
            </p>
            <h2 className="mt-5 max-w-xl font-display text-[clamp(2.4rem,5vw,4.4rem)] leading-[1.05] tracking-[-0.03em]">
              Come sit with
              <br />
              your chota bada.
            </h2>
          </Reveal>

          <Reveal delay={120}>
            <p className="max-w-md text-[1.05rem] leading-relaxed text-cream/75">
              Walk in for a coffee, stay for the whole afternoon. There's always room at the table.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link to="/menu" className="btn-pill btn-cream">
                Order Now
              </Link>
              <Link to="/visit" className="link-arrow text-cream/85 hover:text-cream">
                Find us →
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

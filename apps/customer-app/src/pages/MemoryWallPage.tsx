import { useState } from "react"
import { images } from "../data/site"
import { Appear, EmergeLine, PageIntro } from "../components/MotionText"
import { Reveal } from "../components/Reveal"

const tabs = ["Recent", "Staff picks", "Pin a memory"] as const

export function MemoryWallPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Recent")

  return (
    <section className="relative overflow-hidden px-5 pt-32 pb-20 md:px-8 md:pt-36 md:pb-28">
      <div
        className="pointer-events-none absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-sage/15 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto max-w-[1400px]">
        <PageIntro className="max-w-2xl">
          <Appear delay={60} as="p" className="text-[0.72rem] font-semibold tracking-[0.18em] text-burgundy">
            THE MEMORY WALL
          </Appear>
          <h1 className="mt-5 font-display text-[clamp(2.6rem,6vw,5rem)] leading-[1.05] tracking-[-0.035em] text-burgundy">
            <EmergeLine delay={140}>Who's your</EmergeLine>
            <EmergeLine delay={280}>chota bada?</EmergeLine>
          </h1>
          <Appear delay={420} as="p" className="mt-6 text-[1.05rem] leading-relaxed text-ink-muted">
            A corkboard of real guests, real photos, and the little stories that brought them in. Pin yours.
          </Appear>
        </PageIntro>

        <Reveal delay={80}>
          <div className="mt-10 flex flex-wrap gap-2">
            {tabs.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  tab === item
                    ? "bg-ink-deep text-cream shadow-[0_10px_24px_rgba(50,38,27,0.18)] scale-[1.03]"
                    : "glass-soft text-ink hover:-translate-y-0.5 hover:bg-cream/50"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </Reveal>

        {tab === "Pin a memory" ? (
          <Reveal>
            <form
              className="mt-10 max-w-xl space-y-4 rounded-[1.75rem] p-6 glass-panel md:p-8"
              onSubmit={(e) => {
                e.preventDefault()
                setTab("Recent")
              }}
            >
              <h2 className="font-display text-2xl text-burgundy">Pin a memory</h2>
              <input
                required
                placeholder="Your names"
                className="w-full rounded-2xl border border-line bg-cream px-4 py-3 text-sm outline-none transition focus:border-clay/40 focus:ring-2 focus:ring-clay/20"
              />
              <textarea
                required
                rows={4}
                placeholder="The little story"
                className="w-full rounded-2xl border border-line bg-cream px-4 py-3 text-sm outline-none transition focus:border-clay/40 focus:ring-2 focus:ring-clay/20"
              />
              <button type="submit" className="btn-pill btn-clay">
                Pin it
              </button>
            </form>
          </Reveal>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              images.memory1,
              images.memory2,
              images.memory3,
              images.community,
              images.food,
              images.heroInterior,
            ].map((src, i) => (
              <Reveal key={`${src}-${i}`} delay={i * 70}>
                <figure
                  className={`polaroid rounded-sm bg-cream p-3 shadow-polaroid ${
                    i % 2 === 0 ? "-rotate-1" : "rotate-1"
                  }`}
                >
                  <img src={src} alt="Guest memory" className="aspect-[4/3] w-full object-cover" />
                  <figcaption className="mt-3 px-1 pb-1 text-sm text-ink-muted">
                    {tab === "Staff picks"
                      ? "Staff pick — a table that stayed too long (in the best way)."
                      : "Pinned by a guest who shared half a plate."}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

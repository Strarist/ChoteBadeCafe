import { ArrowUpRight, BookOpen, Coffee, Users, UtensilsCrossed } from "lucide-react"
import { Link } from "react-router-dom"
import { Marquee } from "../components/Marquee"
import { Appear, EmergeLine, PageIntro } from "../components/MotionText"
import { Reveal } from "../components/Reveal"
import { useTilt } from "../hooks/useTilt"
import { useOrderNow } from "../hooks/useOrderNow"
import { images, pillars } from "../data/site"

const iconMap = {
  coffee: Coffee,
  utensils: UtensilsCrossed,
  users: Users,
  book: BookOpen,
}

export function HomePage() {
  const tiltRef = useTilt(7)
  const orderNow = useOrderNow()

  return (
    <>
      <section className="relative overflow-hidden pt-28 md:pt-32">
        <div
          className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-burgundy/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-sage/15 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-[1400px] items-center gap-12 px-5 pb-16 md:grid-cols-[1.05fr_0.95fr] md:gap-10 md:px-8 md:pb-24 lg:gap-16">
          <PageIntro className="max-w-xl">
            <Appear delay={80} as="p" className="text-[0.72rem] font-semibold tracking-[0.18em] text-burgundy">
              EST. 2025 — A CAFE ABOUT THE BIGGEST BOND
            </Appear>
            <h1 className="mt-6 font-display text-[clamp(3.4rem,8vw,6.4rem)] leading-[0.95] tracking-[-0.04em] text-burgundy">
              <EmergeLine delay={160}>Chota.</EmergeLine>
              <EmergeLine delay={280}>Bada.</EmergeLine>
              <EmergeLine delay={400}>Ek table.</EmergeLine>
            </h1>
            <Appear delay={560} as="p" className="mt-7 max-w-md text-[1.05rem] leading-relaxed text-ink-muted">
              The oldest bond there is — the big one and the small one, meeting over one warm plate.
            </Appear>
            <Appear delay={700} className="mt-9 flex flex-wrap items-center gap-5">
              <button type="button" onClick={orderNow} className="btn-pill btn-clay">
                See the menu
              </button>
              <Link to="/story" className="link-arrow text-burgundy">
                Read our story →
              </Link>
            </Appear>
          </PageIntro>

            <Appear delay={280} className="relative mx-auto w-full max-w-[400px] lg:max-w-[440px]">
            <div
              ref={tiltRef}
              className="arch-frame media-card relative aspect-[3/4.35] bg-[#ded9ce] shadow-[0_28px_70px_rgba(50,38,27,0.16)] will-change-transform"
            >
              <div className="img-pop absolute inset-0">
                <img
                  src={images.heroInterior}
                  alt="Warm arched interior of Chote Bade Café"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="steam left-[42%] bottom-[58%]" style={{ animationDelay: "0s" }} />
              <span className="steam left-[48%] bottom-[56%]" style={{ animationDelay: "1.1s" }} />
              <span className="steam left-[54%] bottom-[59%]" style={{ animationDelay: "2.1s" }} />
              <div className="absolute inset-x-4 bottom-4 z-10 rounded-xl px-3 py-2.5 text-center glass-chip md:inset-x-6 md:bottom-5">
                <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-burgundy md:text-[0.68rem]">
                  CHOTA SA BREAK, BADA SA SUKOON
                </p>
              </div>
            </div>
            <div
              className="pointer-events-none absolute -bottom-6 -left-6 size-24 rounded-full border border-burgundy/20 md:-bottom-8 md:-left-8 md:size-28"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -right-4 top-10 size-16 rounded-full bg-gold/15 blur-xl"
              aria-hidden
            />
          </Appear>
        </div>
      </section>

      <Marquee text="chota sa break, bada sa sukoon" />

      <section className="section-wash relative px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-burgundy">
              MORE THAN A CAFE
            </p>
            <h2 className="mt-4 max-w-2xl font-display text-[clamp(2rem,4vw,3.4rem)] leading-[1.1] tracking-[-0.03em] text-burgundy">
              Four reasons people keep pulling up a chair.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {pillars.map((pillar, index) => {
              const Icon = iconMap[pillar.icon]
              return (
                <Reveal key={pillar.id} delay={index * 110} className="h-full">
                  <Link to={pillar.to} className="group block h-full">
                    <div className="media-card relative overflow-hidden rounded-[1.75rem] bg-wash aspect-[16/11] shadow-[0_12px_40px_rgba(50,38,27,0.06)]">
                      <div className="img-pop absolute inset-0">
                        <img
                          src={pillar.image}
                          alt={pillar.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="absolute left-5 top-5 font-display text-4xl text-cream/85 drop-shadow md:text-5xl">
                        {pillar.id}
                      </span>
                    </div>
                    <div className="mt-5 flex items-start justify-between gap-4 px-1">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <Icon
                            size={18}
                            strokeWidth={1.6}
                            className="text-burgundy/70 transition duration-700 group-hover:text-burgundy"
                          />
                          <h3 className="font-display text-2xl tracking-[-0.02em] text-burgundy transition duration-700 group-hover:text-clay">
                            {pillar.title}
                          </h3>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                          {pillar.description}
                        </p>
                      </div>
                      <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-full border border-burgundy/25 text-burgundy transition duration-700 group-hover:border-burgundy group-hover:bg-burgundy group-hover:text-cream group-hover:rotate-45">
                        <ArrowUpRight size={16} />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-sage grain">
        <div
          className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-cream/15 blur-3xl"
          aria-hidden
        />
        <div className="relative z-[2] mx-auto grid max-w-[1400px] items-center gap-12 px-5 py-20 md:grid-cols-[1fr_1.05fr] md:gap-10 md:px-8 md:py-28">
          <Reveal variant="left" className="text-cream">
            <div className="rounded-[1.75rem] border border-cream/20 bg-cream/10 p-6 backdrop-blur-xl md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
              <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-cream/75">
                THE MEMORY WALL
              </p>
              <h2 className="mt-4 max-w-md font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.08] tracking-[-0.03em]">
                Every table leaves a mark.
              </h2>
              <p className="mt-5 max-w-md text-[1.02rem] leading-relaxed text-cream/80">
                Real guests. Real photos. Real chota-bada stories, pinned to a corkboard that never runs out of space.
              </p>
              <Link to="/memory-wall" className="btn-pill btn-ink mt-8">
                Visit the wall
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </Reveal>

          <Reveal variant="right" delay={120}>
            <div className="relative mx-auto h-[340px] w-full max-w-[520px] md:h-[420px]">
              {[
                {
                  src: images.memory1,
                  rot: "-rotate-6",
                  pos: "left-0 top-8 z-10",
                  float: "float-soft",
                },
                {
                  src: images.memory2,
                  rot: "rotate-3",
                  pos: "left-[18%] top-0 z-20",
                  float: "float-soft-delay",
                },
                {
                  src: images.memory3,
                  rot: "rotate-6",
                  pos: "right-0 top-12 z-30",
                  float: "float-soft-delay-2",
                },
              ].map((shot) => (
                <div
                  key={shot.src}
                  className={`polaroid absolute ${shot.pos} w-[48%] ${shot.rot} ${shot.float} rounded-sm bg-cream p-2.5 shadow-polaroid`}
                >
                  <div className="img-pop">
                    <img
                      src={shot.src}
                      alt="Guest memory"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}

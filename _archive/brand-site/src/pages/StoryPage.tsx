import { betterList, images, storyChapters } from "../data/site"
import { Marquee } from "../components/Marquee"
import { Appear, EmergeLine, PageIntro } from "../components/MotionText"
import { Reveal } from "../components/Reveal"

export function StoryPage() {
  return (
    <>
      <section className="relative overflow-hidden px-5 pt-32 pb-16 md:px-8 md:pt-36 md:pb-20">
        <div
          className="pointer-events-none absolute right-0 top-24 h-64 w-64 rounded-full bg-sage/15 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-[900px]">
          <PageIntro>
            <Appear delay={60} as="p" className="text-[0.72rem] font-semibold tracking-[0.18em] text-burgundy">
              OUR STORY
            </Appear>
            <h1 className="mt-5 font-display text-[clamp(2.6rem,6vw,5rem)] leading-[1.05] tracking-[-0.035em] text-burgundy">
              <EmergeLine delay={140}>A cafe about</EmergeLine>
              <EmergeLine delay={260}>the biggest bond,</EmergeLine>
              <EmergeLine delay={380}>served small.</EmergeLine>
            </h1>
            <Appear delay={520} as="p" className="mt-7 max-w-2xl text-[1.05rem] leading-relaxed text-ink-muted">
              We could've written a tidy "About Us." Instead, here's the real thing — why we exist, what the name means, and how we're trying to do better.
            </Appear>
          </PageIntro>
        </div>
      </section>

      <section className="px-5 pb-8 md:px-8">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-20 md:gap-28">
          {storyChapters.map((chapter, index) => (
            <article
              key={chapter.id}
              className={`grid items-center gap-8 md:grid-cols-2 md:gap-14 ${
                index % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              <Reveal variant={index % 2 === 0 ? "left" : "right"} className="group media-card overflow-hidden rounded-[1.75rem] bg-wash aspect-[5/4] shadow-[0_16px_40px_rgba(50,38,27,0.08)]">
                <div className="img-pop h-full">
                  <img
                    src={chapter.image}
                    alt={chapter.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </Reveal>
              <Reveal variant={index % 2 === 0 ? "right" : "left"} delay={100}>
                <p className="font-display text-5xl text-burgundy/20 md:text-6xl">{chapter.id}</p>
                <h2 className="mt-2 font-display text-3xl tracking-[-0.02em] text-burgundy md:text-4xl">
                  {chapter.title}
                </h2>
                <p className="mt-5 max-w-lg text-[1.02rem] leading-relaxed text-ink-muted">
                  {chapter.body}
                </p>
              </Reveal>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-16">
        <Marquee text="how we want to do better" tone="ink" />
      </div>

      <section className="relative overflow-hidden bg-sage grain px-5 py-20 md:px-8 md:py-28">
        <div className="relative z-[2] mx-auto max-w-[1100px]">
          <Reveal className="max-w-2xl text-cream">
            <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-[-0.03em]">
              Here's the list on the fridge.
            </h2>
            <p className="mt-4 text-cream/80">
              We're not pretending we've got it all figured out. Being honest about it keeps us honest.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {betterList.map((item, i) => (
              <Reveal key={item.title} delay={i * 100}>
                <div className="h-full rounded-[1.5rem] border border-cream/15 bg-cream/10 p-6 text-cream backdrop-blur-md transition duration-500 hover:-translate-y-1.5 hover:bg-cream/16">
                  <h3 className="font-display text-2xl tracking-[-0.02em]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-cream/75">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1100px] items-center gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-14">
          <Reveal variant="left" className="overflow-hidden rounded-[1.75rem] bg-wash aspect-[4/5] shadow-[0_16px_40px_rgba(50,38,27,0.08)]">
            <img
              src={images.story}
              alt="Founder note"
              className="h-full w-full object-cover"
            />
          </Reveal>
          <Reveal as="blockquote" variant="right" delay={120}>
            <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-burgundy">
              A NOTE FROM THE BADA
            </p>
            <p className="mt-5 font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.25] tracking-[-0.02em] text-burgundy">
              "My dadu never said 'I love you.' He just kept refilling my plate. This whole place is me, trying to refill yours."
            </p>
            <footer className="mt-6 text-sm text-ink-muted">
              — Aryan Mehta, founder & resident chota-turned-bada
            </footer>
          </Reveal>
        </div>
      </section>
    </>
  )
}

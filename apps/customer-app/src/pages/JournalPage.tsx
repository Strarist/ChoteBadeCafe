import { useMemo } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { journalPosts } from "../data/site"
import { Appear, EmergeLine, PageIntro } from "../components/MotionText"
import { Reveal } from "../components/Reveal"

export function JournalPage() {
  return (
    <section className="relative overflow-hidden px-5 pt-32 pb-20 md:px-8 md:pt-36 md:pb-28">
      <div
        className="pointer-events-none absolute right-10 top-32 h-56 w-56 rounded-full bg-clay/10 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto max-w-[1400px]">
        <PageIntro className="max-w-2xl">
          <Appear delay={60} as="p" className="text-[0.72rem] font-semibold tracking-[0.18em] text-burgundy">
            JOURNAL
          </Appear>
          <h1 className="mt-5 font-display text-[clamp(2.6rem,6vw,5rem)] leading-[1.05] tracking-[-0.035em] text-burgundy">
            <EmergeLine delay={140}>Notes from</EmergeLine>
            <EmergeLine delay={280}>the counter.</EmergeLine>
          </h1>
          <Appear delay={420} as="p" className="mt-6 text-[1.05rem] leading-relaxed text-ink-muted">
            Behind-the-scenes, bean stories, honest lists. Drafts live here for now — swap in final essays anytime.
          </Appear>
        </PageIntro>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {journalPosts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 100} className="h-full">
              <Link to={`/journal/${post.slug}`} className="group block h-full">
                <div className="media-card overflow-hidden rounded-[1.5rem] bg-wash aspect-[5/4] shadow-[0_12px_36px_rgba(50,38,27,0.07)]">
                  <div className="img-pop h-full">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <p className="mt-4 text-xs font-semibold tracking-[0.12em] text-ink-muted">
                  {post.date}
                </p>
                <h2 className="mt-2 font-display text-2xl leading-snug tracking-[-0.02em] text-burgundy transition group-hover:text-clay">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{post.excerpt}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function JournalPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = useMemo(
    () => journalPosts.find((item) => item.slug === slug),
    [slug],
  )

  if (!post) return <Navigate to="/journal" replace />

  return (
    <section className="px-5 pt-32 pb-20 md:px-8 md:pt-36 md:pb-28">
      <div className="mx-auto max-w-[720px]">
        <PageIntro>
          <Appear delay={40}>
            <Link to="/journal" className="link-arrow text-ink-muted">
              ← Back to journal
            </Link>
          </Appear>
          <Appear delay={80} as="p" className="mt-6 text-xs font-semibold tracking-[0.12em] text-ink-muted">
            {post.date}
          </Appear>
          <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.1] tracking-[-0.03em] text-burgundy">
            <EmergeLine delay={120}>{post.title}</EmergeLine>
          </h1>
        </PageIntro>

        <Reveal delay={100}>
          <div className="media-card mt-10 overflow-hidden rounded-[1.5rem] bg-wash aspect-[16/10] shadow-[0_12px_36px_rgba(50,38,27,0.07)]">
            <img src={post.image} alt="" className="h-full w-full object-cover" />
          </div>
        </Reveal>

        <div className="mt-10 space-y-5 text-[1.05rem] leading-relaxed text-ink-muted">
          {post.body.map((paragraph, i) => (
            <Reveal key={i} delay={Math.min(i * 60, 180)}>
              <p>{paragraph}</p>
            </Reveal>
          ))}
        </div>

        <p className="mt-12 rounded-2xl border border-dashed border-burgundy/25 bg-burgundy/[0.04] px-4 py-3 text-sm text-ink-muted">
          Placeholder essay — replace these paragraphs in <code className="font-mono text-xs">site.ts</code> when the final note is ready.
        </p>
      </div>
    </section>
  )
}

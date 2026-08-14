import { Link, Navigate, useLocation } from "react-router-dom"
import { policies, policyByPath } from "../data/policies"
import { Appear, EmergeLine, PageIntro } from "../components/MotionText"
import { Reveal } from "../components/Reveal"

export function LegalPage() {
  const { pathname } = useLocation()
  const id = policyByPath[pathname.replace(/\/$/, "") || "/"]
  if (!id) return <Navigate to="/" replace />

  const doc = policies[id]

  return (
    <section className="relative overflow-hidden px-5 pt-32 pb-20 md:px-8 md:pt-36 md:pb-28">
      <div
        className="pointer-events-none absolute -right-16 top-28 h-72 w-72 rounded-full bg-clay/10 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto max-w-[760px]">
        <PageIntro>
          <Appear delay={40} as="p" className="text-[0.72rem] font-semibold tracking-[0.18em] text-burgundy">
            {doc.eyebrow.toUpperCase()}
          </Appear>
          <h1 className="mt-5 font-display text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.08] tracking-[-0.035em] text-burgundy">
            <EmergeLine delay={120}>{doc.title}</EmergeLine>
          </h1>
          <Appear delay={280} as="p" className="mt-5 text-sm text-ink-muted">
            Last updated {doc.updated}
          </Appear>
          <Appear delay={360} as="p" className="mt-6 text-[1.05rem] leading-relaxed text-ink-muted">
            {doc.intro}
          </Appear>
        </PageIntro>

        <div className="mt-12 space-y-10">
          {doc.sections.map((section, i) => (
            <Reveal key={section.heading} delay={Math.min(i * 40, 160)}>
              <h2 className="font-display text-2xl tracking-[-0.02em] text-burgundy">{section.heading}</h2>
              <div className="mt-3 space-y-3 text-[0.98rem] leading-relaxed text-ink-muted">
                {section.paragraphs.map((p, pi) => (
                  <p key={pi}>{p}</p>
                ))}
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mt-14 text-sm text-ink-muted">
          Also see our{" "}
          <Link to="/visit" className="text-burgundy underline decoration-burgundy/30 underline-offset-4">
            Contact Us
          </Link>{" "}
          page,{" "}
          <Link to="/menu" className="text-burgundy underline decoration-burgundy/30 underline-offset-4">
            Menu / pricing
          </Link>
          , and the other policies in the footer.
        </p>
      </div>
    </section>
  )
}

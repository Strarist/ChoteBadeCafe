import { Clock3, Mail, MapPin, Phone } from "lucide-react"
import { site } from "../data/site"
import { Appear, EmergeLine, PageIntro } from "../components/MotionText"
import { Reveal } from "../components/Reveal"

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  )
}

export function VisitPage() {
  return (
    <section className="relative overflow-hidden px-5 pt-32 pb-20 md:px-8 md:pt-36 md:pb-28">
      <div
        className="pointer-events-none absolute -right-16 top-28 h-72 w-72 rounded-full bg-clay/10 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto max-w-[1400px]">
        <PageIntro className="max-w-2xl">
          <Appear delay={60} as="p" className="text-[0.72rem] font-semibold tracking-[0.18em] text-burgundy">
            VISIT
          </Appear>
          <h1 className="mt-5 font-display text-[clamp(2.6rem,6vw,5rem)] leading-[1.05] tracking-[-0.035em] text-burgundy">
            <EmergeLine delay={140}>Pull up</EmergeLine>
            <EmergeLine delay={280}>a chair.</EmergeLine>
          </h1>
          <Appear delay={420} as="p" className="mt-6 text-[1.05rem] leading-relaxed text-ink-muted">
            Walk-ins always welcome. Bring your chota, your bada, or just yourself.
          </Appear>
        </PageIntro>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal variant="left">
            <div className="h-full rounded-[1.75rem] p-6 glass-panel md:p-8">
              <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-ink-muted">
                Where & when
              </p>
              <ul className="mt-6 space-y-5 text-ink">
                <li className="flex gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-clay" />
                  <span>{site.addressFull}</span>
                </li>
                <li className="flex gap-3">
                  <Phone size={18} className="mt-0.5 shrink-0 text-clay" />
                  <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="transition hover:text-clay">
                    {site.phone}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Mail size={18} className="mt-0.5 shrink-0 text-clay" />
                  <a href={`mailto:${site.email}`} className="transition hover:text-clay">
                    {site.email}
                  </a>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 shrink-0 text-clay">
                    <InstagramIcon />
                  </span>
                  <a
                    href={site.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-clay"
                  >
                    {site.instagram}
                  </a>
                </li>
              </ul>

              <div className="mt-8 space-y-3 border-t border-line/60 pt-6">
                <div className="flex items-start gap-3">
                  <Clock3 size={18} className="mt-0.5 shrink-0 text-clay" />
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-semibold">Mon – Thu</span> · 8:00 am – 11:00 pm
                    </p>
                    <p>
                      <span className="font-semibold">Fri – Sat</span> · 8:00 am – 12:30 am
                    </p>
                    <p>
                      <span className="font-semibold">Sunday</span> · 9:00 am – 11:00 pm · community
                      table all day
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal variant="right" delay={100}>
            <form
              className="relative overflow-hidden rounded-[1.75rem] p-6 text-cream glass-dark md:p-8"
              onSubmit={(e) => e.preventDefault()}
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-clay/25 blur-2xl"
                aria-hidden
              />
              <h2 className="relative font-display text-3xl tracking-[-0.02em]">Say hello</h2>
              <p className="relative mt-3 text-sm leading-relaxed text-cream/70">
                Reservations for six or more, collabs, or just a nice note.
              </p>
              <div className="relative mt-6 space-y-3">
                <input
                  required
                  placeholder="Name"
                  className="w-full rounded-2xl border border-cream/15 bg-cream/5 px-4 py-3 text-sm text-cream outline-none transition placeholder:text-cream/40 focus:border-cream/40 focus:bg-cream/10"
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-2xl border border-cream/15 bg-cream/5 px-4 py-3 text-sm text-cream outline-none transition placeholder:text-cream/40 focus:border-cream/40 focus:bg-cream/10"
                />
                <textarea
                  required
                  rows={5}
                  placeholder="Your note"
                  className="w-full rounded-2xl border border-cream/15 bg-cream/5 px-4 py-3 text-sm text-cream outline-none transition placeholder:text-cream/40 focus:border-cream/40 focus:bg-cream/10"
                />
                <button type="submit" className="btn-pill btn-cream">
                  Send it over
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

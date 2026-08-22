import { type FormEvent, useState } from "react"
import { CalendarDays, Clock3, Mail, MapPin, Phone } from "lucide-react"
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
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [note, setNote] = useState("")
  const opening = site.opening

  const sendNote = (e: FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Hello from ${name.trim() || "the website"}`)
    const body = encodeURIComponent(`${note.trim()}\n\n— ${name.trim()}\n${email.trim()}`)
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`
  }

  return (
    <section className="relative overflow-hidden px-5 pt-32 pb-20 md:px-8 md:pt-36 md:pb-28">
      <div
        className="pointer-events-none absolute -right-16 top-28 h-72 w-72 rounded-full bg-clay/10 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto max-w-[1400px]">
        <PageIntro className="max-w-2xl">
          <Appear delay={60} as="p" className="text-[0.72rem] font-semibold tracking-[0.18em] text-burgundy">
            CONTACT US
          </Appear>
          <h1 className="mt-5 font-display text-[clamp(2.6rem,6vw,5rem)] leading-[1.05] tracking-[-0.035em] text-burgundy">
            <EmergeLine delay={140}>Pull up</EmergeLine>
            <EmergeLine delay={280}>a chair.</EmergeLine>
          </h1>
          <Appear delay={420} as="p" className="mt-6 text-[1.05rem] leading-relaxed text-ink-muted">
            Now open in South City-2, Gurugram — Rodeo Drive Arcadia II. Walk-ins welcome.
          </Appear>
          <Appear delay={480} as="p" className="mt-3 font-display text-xl tracking-[-0.02em] text-burgundy">
            {site.slogan}
          </Appear>
        </PageIntro>

        <Reveal delay={60}>
          <div className="mt-10 overflow-hidden rounded-[1.75rem] border border-burgundy/15 bg-burgundy text-cream md:grid md:grid-cols-[1.05fr_0.95fr]">
            <div className="p-6 md:p-8">
              <p className="inline-flex items-center gap-2 text-[0.72rem] font-semibold tracking-[0.16em] text-cream/70">
                <CalendarDays size={16} />
                {opening.label.toUpperCase()}
              </p>
              <h2 className="mt-3 font-display text-[clamp(1.8rem,3.5vw,2.6rem)] leading-[1.1] tracking-[-0.03em]">
                We are open
              </h2>
              <p className="mt-4 text-lg font-semibold text-cream">
                {opening.dateLabel} · {opening.timeLabel}
              </p>
              <div className="mt-5 rounded-2xl border border-cream/15 bg-cream/10 px-4 py-3">
                <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-cream/65">
                  CHIEF GUEST
                </p>
                <p className="mt-1 font-semibold text-cream">{opening.chiefGuest}</p>
                <p className="mt-0.5 text-sm text-cream/75">{opening.chiefGuestTitle}</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {site.phones.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="btn-pill btn-cream !py-2 text-sm"
                  >
                    Call {phone.replace("+91 ", "")}
                  </a>
                ))}
              </div>
            </div>
            <div className="border-t border-cream/10 md:border-l md:border-t-0">
              <img
                src="/images/branding/opening-flyer.png"
                alt="Chote Bade Cafe opening announcement — 23 Aug 2026 at 6:00 PM"
                className="h-full w-full object-cover object-left"
              />
            </div>
          </div>
        </Reveal>

        <div className="mt-10 overflow-hidden rounded-[1.75rem] border border-line/50 bg-wash shadow-[0_16px_40px_rgba(50,38,27,0.08)]">
          <div className="relative aspect-[16/10] min-h-[220px] w-full md:aspect-[21/9] md:min-h-[280px]">
            <iframe
              title="Chote Bade Cafe on Google Maps"
              src={site.mapsEmbedUrl}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/40 bg-cream/80 px-5 py-3">
            <p className="text-sm text-ink-muted">{site.address}</p>
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-burgundy transition hover:text-clay"
            >
              Open in Maps →
            </a>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal variant="left">
            <div className="h-full rounded-[1.75rem] p-6 glass-panel md:p-8">
              <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-ink-muted">
                Where & when
              </p>
              <ul className="mt-6 space-y-5 text-ink">
                <li className="flex gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-clay" />
                  <a
                    href={site.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-clay"
                  >
                    {site.addressFull}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Phone size={18} className="mt-0.5 shrink-0 text-clay" />
                  <span className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-3">
                    {site.phones.map((phone) => (
                      <a
                        key={phone}
                        href={`tel:${phone.replace(/\s/g, "")}`}
                        className="transition hover:text-clay"
                      >
                        {phone}
                      </a>
                    ))}
                  </span>
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
                    rel="noopener noreferrer"
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
                    {site.hoursByDay.map((row) => (
                      <p key={row.days}>
                        <span className="font-semibold">{row.days}</span> · {row.time}
                      </p>
                    ))}
                    <p className="text-ink-muted">
                      {site.cuisines}. Delivery via {site.deliveryPartners}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal variant="right" delay={100}>
            <form
              className="relative overflow-hidden rounded-[1.75rem] p-6 text-cream glass-dark md:p-8"
              onSubmit={sendNote}
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-burgundy-soft/50 blur-2xl"
                aria-hidden
              />
              <h2 className="relative font-display text-3xl tracking-[-0.02em]">Say hello</h2>
              <p className="relative mt-3 text-sm leading-relaxed text-cream/70">
                Reservations for six or more, collabs, or just a nice note. Opens your email to{" "}
                {site.email}. Prefer a call? Use either number above.
              </p>
              <div className="relative mt-6 space-y-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold tracking-[0.08em] text-cream/70">
                    Name
                  </span>
                  <input
                    required
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-cream/15 bg-cream/5 px-4 py-3 text-sm text-cream outline-none transition placeholder:text-cream/40 focus:border-cream/40 focus:bg-cream/10"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold tracking-[0.08em] text-cream/70">
                    Email
                  </span>
                  <input
                    required
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-cream/15 bg-cream/5 px-4 py-3 text-sm text-cream outline-none transition placeholder:text-cream/40 focus:border-cream/40 focus:bg-cream/10"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold tracking-[0.08em] text-cream/70">
                    Your note
                  </span>
                  <textarea
                    required
                    name="note"
                    rows={5}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full rounded-2xl border border-cream/15 bg-cream/5 px-4 py-3 text-sm text-cream outline-none transition placeholder:text-cream/40 focus:border-cream/40 focus:bg-cream/10"
                  />
                </label>
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

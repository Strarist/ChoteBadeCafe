import { Link } from "react-router-dom"
import { Clock3, Mail, MapPin, Phone } from "lucide-react"
import { Logo } from "./Logo"
import { legalLinks, site } from "../data/site"

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink-deep text-cream">
      <div
        className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-sage/15 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-[1400px] gap-12 px-5 py-16 md:grid-cols-2 md:px-8 lg:grid-cols-4 lg:gap-8">
        <div className="max-w-xs">
          <Logo light />
          <p className="mt-5 font-display text-2xl leading-tight text-cream">
            {site.fullName}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-cream/65">{site.tagline}</p>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-cream/55">FIND US</p>
          <ul className="mt-5 space-y-4 text-sm text-cream/80">
            <li className="flex gap-3">
              <MapPin size={16} className="mt-0.5 shrink-0 opacity-70" />
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-cream"
              >
                {site.address}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock3 size={16} className="mt-0.5 shrink-0 opacity-70" />
              <span>{site.hours}</span>
            </li>
            <li className="flex gap-3">
              <Phone size={16} className="mt-0.5 shrink-0 opacity-70" />
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="transition hover:text-cream">
                {site.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail size={16} className="mt-0.5 shrink-0 opacity-70" />
              <a href={`mailto:${site.email}`} className="transition hover:text-cream">
                {site.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-cream/55">WANDER</p>
          <ul className="mt-5 space-y-3 text-sm text-cream/80">
            <li>
              <Link to="/story" className="transition hover:text-cream">
                Our Story
              </Link>
            </li>
            <li>
              <Link to="/menu" className="transition hover:text-cream">
                Menu
              </Link>
            </li>
            <li>
              <Link to="/journal" className="transition hover:text-cream">
                Journal
              </Link>
            </li>
            <li>
              <Link to="/visit" className="transition hover:text-cream">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-cream/55">SAY HI</p>
          <a
            href={site.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm text-cream/80 transition hover:text-cream"
          >
            <InstagramIcon />
            {site.instagram}
          </a>
          <p className="mt-4 text-xs leading-relaxed text-cream/55">
            {site.cuisines}. We deliver on Zomato &amp; Swiggy.
          </p>
        </div>
      </div>

      <div className="relative border-t border-cream/10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-5 text-xs text-cream/45 md:flex-row md:items-center md:justify-between md:px-8">
          <p>© 2026 {site.fullName}. {site.tagline}</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-2">
            {legalLinks.map((link) => (
              <Link key={link.to} to={link.to} className="transition hover:text-cream">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}

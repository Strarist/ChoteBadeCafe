import { type FormEvent, useEffect, useMemo, useState } from "react"
import { Camera, MapPin, MonitorSmartphone } from "lucide-react"
import type { MemoryPin } from "@cafe/shared-types"
import { joinApiUrl, mediaUrl } from "@cafe/frontend-api"
import { memoryWallPins, site } from "../data/site"
import { api } from "../lib/api"
import { Appear, EmergeLine, PageIntro } from "../components/MotionText"
import { Reveal } from "../components/Reveal"

const tabs = ["Recent", "Staff picks", "Pin a memory"] as const
type PinMethod = "choose" | "website" | "instagram" | "cafe"

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  )
}

function pinImage(pin: MemoryPin | { image: string }) {
  if ("imageUrl" in pin) return mediaUrl(pin.imageUrl)
  return pin.image
}

export function MemoryWallPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Recent")
  const [pinMethod, setPinMethod] = useState<PinMethod>("choose")
  const [names, setNames] = useState("")
  const [story, setStory] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pins, setPins] = useState<MemoryPin[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (window.location.hash === "#pin") {
      setTab("Pin a memory")
      setPinMethod("choose")
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void api
      .get<MemoryPin[]>("/memory")
      .then((rows) => {
        if (!cancelled) {
          setPins(rows)
          setLoadError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : String(err))
        }
      })
    return () => {
      cancelled = true
    }
  }, [submitted])

  useEffect(() => {
    if (!photo) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(photo)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])

  const fallbackPins = useMemo(
    () =>
      memoryWallPins.map((p) => ({
        id: p.id,
        names: p.names,
        story: p.story,
        image: p.image,
        staffPick: p.staffPick,
      })),
    [],
  )

  const displayPins =
    pins.length > 0
      ? pins
      : fallbackPins.map((p) => ({
          id: p.id,
          names: p.names,
          story: p.story,
          imageUrl: p.image,
          status: "approved" as const,
          staffPick: p.staffPick,
          createdAt: "",
          moderatedAt: null,
          rejectReason: null,
        }))

  const visible =
    tab === "Staff picks" ? displayPins.filter((p) => p.staffPick) : displayPins

  const openPinTab = (method: PinMethod = "choose") => {
    setTab("Pin a memory")
    setPinMethod(method)
    window.history.replaceState(null, "", "#pin")
  }

  const onPin = async (e: FormEvent) => {
    e.preventDefault()
    if (!photo) {
      setError("Add a photo to pin your memory")
      return
    }
    setBusy(true)
    setError(null)
    try {
      const body = new FormData()
      body.append("names", names.trim())
      body.append("story", story.trim())
      body.append("photo", photo)
      const res = await fetch(joinApiUrl("/memory"), { method: "POST", body })
      const text = await res.text()
      if (!res.ok) {
        let message = text || `HTTP ${res.status}`
        try {
          const parsed = JSON.parse(text) as { message?: string | string[] }
          if (parsed.message) {
            message = Array.isArray(parsed.message)
              ? parsed.message.join(", ")
              : parsed.message
          }
        } catch {
          /* keep */
        }
        throw new Error(message)
      }
      setNames("")
      setStory("")
      setPhoto(null)
      setSubmitted(true)
      setTab("Recent")
      setPinMethod("choose")
      window.history.replaceState(null, "", "/memory-wall")
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

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
            <EmergeLine delay={140}>Who&apos;s your</EmergeLine>
            <EmergeLine delay={280}>chota bada?</EmergeLine>
          </h1>
          <Appear delay={420} as="p" className="mt-6 text-[1.05rem] leading-relaxed text-ink-muted">
            Share a photo and a little story. Pins go to the cafe team first — only accepted memories
            appear on the wall.
          </Appear>
          <Appear delay={500} className="mt-7">
            <button type="button" onClick={() => openPinTab()} className="btn-pill btn-clay">
              How to pin a memory
            </button>
          </Appear>
        </PageIntro>

        <Reveal delay={80}>
          <div className="mt-10 flex flex-wrap gap-2">
            {tabs.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setTab(item)
                  if (item === "Pin a memory") setPinMethod("choose")
                }}
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

        {submitted ? (
          <p className="mt-6 text-sm text-sage-deep" role="status">
            Thanks — your pin is waiting for cafe approval. It won&apos;t show publicly until a staff
            member accepts it.
          </p>
        ) : null}
        {loadError && pins.length === 0 ? (
          <p className="mt-4 text-xs text-ink-muted">Showing sample pins while the wall loads.</p>
        ) : null}

        {tab === "Pin a memory" ? (
          <Reveal>
            <div id="pin" className="mt-10 scroll-mt-28">
              {pinMethod === "choose" ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-3xl tracking-[-0.02em] text-burgundy">
                      How do you want to pin?
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
                      Website uploads need a photo. Staff accept or reject every pin before it goes
                      live.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => setPinMethod("website")}
                      className="group rounded-[1.5rem] border border-ink/10 bg-cream/80 p-5 text-left shadow-[0_12px_32px_rgba(50,38,27,0.06)] transition duration-500 hover:-translate-y-1 hover:border-burgundy/25"
                    >
                      <span className="grid size-11 place-items-center rounded-full bg-burgundy/10 text-burgundy transition group-hover:bg-burgundy group-hover:text-cream">
                        <MonitorSmartphone size={20} strokeWidth={1.8} />
                      </span>
                      <p className="mt-4 font-display text-xl text-burgundy">On this website</p>
                      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                        Upload a photo + names + story. Pending until admin approves.
                      </p>
                      <span className="mt-4 inline-block text-sm font-semibold text-clay">
                        Continue →
                      </span>
                    </button>

                    <a
                      href={site.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-[1.5rem] border border-ink/10 bg-cream/80 p-5 text-left shadow-[0_12px_32px_rgba(50,38,27,0.06)] transition duration-500 hover:-translate-y-1 hover:border-burgundy/25"
                    >
                      <span className="grid size-11 place-items-center rounded-full bg-burgundy/10 text-burgundy transition group-hover:bg-burgundy group-hover:text-cream">
                        <InstagramIcon size={20} />
                      </span>
                      <p className="mt-4 font-display text-xl text-burgundy">Tag us on Instagram</p>
                      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                        Post a photo, tag {site.instagram}, mention Memory Wall.
                      </p>
                      <span className="mt-4 inline-block text-sm font-semibold text-clay">
                        Open Instagram →
                      </span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setPinMethod("cafe")}
                      className="group rounded-[1.5rem] border border-ink/10 bg-cream/80 p-5 text-left shadow-[0_12px_32px_rgba(50,38,27,0.06)] transition duration-500 hover:-translate-y-1 hover:border-burgundy/25"
                    >
                      <span className="grid size-11 place-items-center rounded-full bg-burgundy/10 text-burgundy transition group-hover:bg-burgundy group-hover:text-cream">
                        <MapPin size={20} strokeWidth={1.8} />
                      </span>
                      <p className="mt-4 font-display text-xl text-burgundy">In cafe or by email</p>
                      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                        Ask the counter, or email a photo + story to {site.email}.
                      </p>
                      <span className="mt-4 inline-block text-sm font-semibold text-clay">
                        See details →
                      </span>
                    </button>
                  </div>
                </div>
              ) : null}

              {pinMethod === "website" ? (
                <form
                  className="max-w-xl space-y-4 rounded-[1.75rem] p-6 glass-panel md:p-8"
                  onSubmit={(e) => void onPin(e)}
                >
                  <button
                    type="button"
                    onClick={() => setPinMethod("choose")}
                    className="link-arrow text-sm text-ink-muted"
                  >
                    ← All pin options
                  </button>
                  <h2 className="font-display text-2xl text-burgundy">Pin on the website</h2>
                  <p className="text-sm leading-relaxed text-ink-muted">
                    Photo required (JPEG / PNG / WebP, max 2.5 MB). Staff review before publish.
                  </p>
                  {error ? <p className="text-sm text-burgundy">{error}</p> : null}
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold tracking-[0.08em] text-burgundy">
                      Your names
                    </span>
                    <input
                      required
                      value={names}
                      onChange={(e) => setNames(e.target.value)}
                      className="w-full rounded-2xl border border-line bg-cream px-4 py-3 text-sm outline-none transition focus:border-clay/40 focus:ring-2 focus:ring-clay/20"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold tracking-[0.08em] text-burgundy">
                      The little story
                    </span>
                    <textarea
                      required
                      rows={4}
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                      className="w-full rounded-2xl border border-line bg-cream px-4 py-3 text-sm outline-none transition focus:border-clay/40 focus:ring-2 focus:ring-clay/20"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold tracking-[0.08em] text-burgundy">
                      Photo
                    </span>
                    <input
                      required
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                      className="block w-full text-sm text-ink-muted file:mr-3 file:rounded-full file:border-0 file:bg-burgundy file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cream"
                    />
                  </label>
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="aspect-[4/3] w-full rounded-2xl object-cover"
                    />
                  ) : null}
                  <button type="submit" className="btn-pill btn-clay" disabled={busy}>
                    {busy ? "Sending…" : "Submit for approval"}
                  </button>
                </form>
              ) : null}

              {pinMethod === "cafe" ? (
                <div className="max-w-xl space-y-5 rounded-[1.75rem] p-6 glass-panel md:p-8">
                  <button
                    type="button"
                    onClick={() => setPinMethod("choose")}
                    className="link-arrow text-sm text-ink-muted"
                  >
                    ← All pin options
                  </button>
                  <h2 className="font-display text-2xl text-burgundy">Pin in person or by mail</h2>
                  <ul className="space-y-4 text-sm leading-relaxed text-ink-muted">
                    <li className="flex gap-3">
                      <Camera size={18} className="mt-0.5 shrink-0 text-clay" />
                      <span>
                        At the cafe: leave a photo or write your names + story at the counter. Staff
                        still approve before it hits the wall.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <MapPin size={18} className="mt-0.5 shrink-0 text-clay" />
                      <span>{site.addressFull}</span>
                    </li>
                  </ul>
                  <a
                    href={`mailto:${site.email}?subject=${encodeURIComponent("Memory Wall pin")}`}
                    className="btn-pill btn-clay inline-flex"
                  >
                    Email {site.email}
                  </a>
                </div>
              ) : null}
            </div>
          </Reveal>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((pin, i) => (
              <Reveal key={pin.id} delay={i * 70}>
                <figure
                  className={`polaroid rounded-sm bg-cream p-3 shadow-polaroid ${
                    i % 2 === 0 ? "-rotate-1" : "rotate-1"
                  }`}
                >
                  <img
                    src={pinImage(pin)}
                    alt=""
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <figcaption className="mt-3 px-1 pb-1">
                    <p className="text-sm font-semibold text-burgundy">{pin.names}</p>
                    <p className="mt-1 text-sm text-ink-muted">{pin.story}</p>
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

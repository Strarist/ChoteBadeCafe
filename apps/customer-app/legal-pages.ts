import type { Plugin } from "vite"
import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { policies, policyByPath, type PolicyDoc } from "./src/data/policies"
import { legalLinks, site } from "./src/data/site"

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function shell(title: string, eyebrow: string, body: string) {
  const nav = legalLinks
    .map((link) => `<a href="${esc(link.to)}">${esc(link.label)}</a>`)
    .join(" · ")
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)} — ${esc(site.fullName)}</title>
  <meta name="description" content="${esc(`${title} for ${site.fullName}, ${site.address}.`)}" />
  <style>
    body { margin: 0; font-family: Georgia, serif; background: #ede6da; color: #5c4630; }
    main { max-width: 720px; margin: 0 auto; padding: 3rem 1.25rem 4rem; }
    a { color: #7a2f3a; }
    .eyebrow { font-family: sans-serif; font-size: 0.72rem; letter-spacing: 0.18em; font-weight: 700; color: #7a2f3a; }
    h1 { font-size: clamp(2rem, 5vw, 3.2rem); color: #7a2f3a; line-height: 1.1; }
    h2 { color: #7a2f3a; margin-top: 2rem; }
    p, li { line-height: 1.65; }
    .muted { color: #6f6152; }
    nav { font-family: sans-serif; font-size: 0.85rem; margin-top: 2.5rem; }
  </style>
</head>
<body>
  <main>
    <p class="eyebrow">${esc(eyebrow.toUpperCase())}</p>
    <h1>${esc(title)}</h1>
    ${body}
    <p class="muted">${esc(site.fullName)} · ${esc(site.addressFull)} · ${esc(site.phone)} · ${esc(site.email)}</p>
    <nav>
      <a href="/">Home</a> · <a href="/menu">Menu / pricing</a> · ${nav}
    </nav>
  </main>
</body>
</html>
`
}

export function renderPolicyHtml(doc: PolicyDoc) {
  const sections = doc.sections
    .map(
      (section) =>
        `<h2>${esc(section.heading)}</h2>${section.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}`,
    )
    .join("")
  const body = `<p class="muted">Last updated ${esc(doc.updated)}</p><p>${esc(doc.intro)}</p>${sections}`
  return shell(doc.title, doc.eyebrow, body)
}

export function renderContactHtml() {
  const hours = site.hoursByDay
    .map((row) => `<li><strong>${esc(row.days)}</strong> · ${esc(row.time)}</li>`)
    .join("")
  const body = `
    <p>This is the Contact Us page for ${esc(site.fullName)}.</p>
    <h2>Address</h2>
    <p><a href="${esc(site.mapsUrl)}">${esc(site.addressFull)}</a></p>
    <h2>Phone</h2>
    <p><a href="tel:${esc(site.phone.replace(/\s/g, ""))}">${esc(site.phone)}</a></p>
    <h2>Email</h2>
    <p><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>
    <h2>Hours</h2>
    <ul>${hours}</ul>
    <p>${esc(site.cuisines)}. Delivery via ${esc(site.deliveryPartners)}.</p>
    <p>Instagram: <a href="${esc(site.instagramUrl)}">${esc(site.instagram)}</a></p>
  `
  return shell("Contact Us", "Visit", body)
}

const htmlByUrl: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(policyByPath).map(([route, id]) => [route, renderPolicyHtml(policies[id])]),
  ),
  "/contact": renderContactHtml(),
}

function normalizeUrl(url: string) {
  const bare = url.split("?")[0]?.split("#")[0] ?? ""
  if (bare.endsWith(".html")) return bare.replace(/\.html$/, "")
  return bare.replace(/\/$/, "") || "/"
}

function writePages(outDir: string) {
  for (const [route, html] of Object.entries(htmlByUrl)) {
    const slug = route.slice(1)
    mkdirSync(path.join(outDir, slug), { recursive: true })
    writeFileSync(path.join(outDir, slug, "index.html"), html)
    writeFileSync(path.join(outDir, `${slug}.html`), html)
  }
}

export function legalPagesPlugin(): Plugin {
  let outDir = "dist"
  return {
    name: "legal-pages",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = normalizeUrl(req.url ?? "")
        const html = htmlByUrl[url]
        if (!html) return next()
        res.setHeader("Content-Type", "text/html; charset=utf-8")
        res.end(html)
      })
    },
    closeBundle() {
      writePages(outDir)
    },
  }
}

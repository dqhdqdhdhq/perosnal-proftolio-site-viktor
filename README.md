# Viktor · Portfolio

A hand-built personal portfolio. **Zero frameworks, zero build steps, zero dependencies** —
three files of carefully crafted HTML, CSS, and vanilla JavaScript.

Warm editorial design: ink on white, burnt-orange accent (`#E34400`), Satoshi + Instrument
Serif, hairline borders, dot-grid textures — with a full dark mode and the interactive
craft to match.

## ✦ What's inside

| Feature | Where |
|---|---|
| Light / dark theme — morphing sun ⇄ moon, circular reveal (View Transitions API) | `#themeToggle` |
| Hero word rotator set in Instrument Serif italic (*alive. fast. human. fun.*) | `.rotator` |
| Auto-scrolling work strip + trusted-by wordmark row | `.strip`, `.logos` |
| Service intro with tilted, color-dotted tag pills | `#services` |
| Per-project animated SVG illustrations (cart drives by, charts draw, chat types, rain falls) | `#work` |
| Tilted process cards with checklist / task-board / rocket vignettes and orange squiggle connectors | `#process` |
| Testimonials, About with career table & count-up stats | `#testimonials`, `#about` |
| Astronaut that draws itself in and follows your cursor with its eyes | `#about` |
| Project + retainer pricing cards (featured dark card, availability dot) | `#pricing` |
| FAQ accordion — native `<details>`, one open at a time, rotating plus icon | `#faq` |
| Big orange CTA with copy-to-clipboard email + availability card | `#contact` |
| Starfield canvas — subtle ambience in dark mode | canvas `#sky` |
| Konami code easter egg → warp drive (`↑ ↑ ↓ ↓ ← → ← → B A`) | try it |
| Magnetic buttons, 3D-tilt cards, custom cursor (desktop only) | `script.js` |
| "Lost in space" 404 page | `404.html` |

Mobile-first and fully responsive (tested at 390 / 768 / 1440 px), honors
`prefers-reduced-motion`, keyboard-accessible, self-hosted fonts, no external requests.

## ✏️ Make it yours

All content lives in `index.html` — search for these and replace:

1. **Email** — `hello@viktor.dev` (CTA button + pricing row `data-email`, mobile menu
   footer, and the console message in `script.js`).
2. **Social links** — the `cta__socials` list (GitHub / LinkedIn / X point at homepages).
3. **Projects** — four `<article class="project">` blocks, plus the matching `.strip__card`
   marquee tiles.
4. **Experience** — the `.career` rows in `#about`.
5. **About copy & stats** — `#about` paragraphs and the `data-count-to` numbers.
6. **Pricing** — the two `.plan` cards in `#pricing`.
7. **FAQ** — the `details.faq__item` blocks.

## 🔤 Fonts

Self-hosted in `fonts/` (no external requests):

- **Satoshi** (variable 300–900) — via [Fontshare](https://www.fontshare.com/fonts/satoshi),
  free for personal & commercial use under the ITF Free Font License.
- **Instrument Serif** (regular + italic) — [Google Fonts](https://fonts.google.com/specimen/Instrument+Serif),
  SIL Open Font License.

## 🚀 Deploy (GitHub Pages)

Settings → Pages → Source: **Deploy from a branch** → pick the branch, root folder. Done —
`404.html` is picked up automatically. Any static host (Netlify, Vercel, Cloudflare Pages)
works the same: there is no build step.

## 🧑‍🚀 Run locally

Open `index.html` in a browser, or:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

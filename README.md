# Viktor · Portfolio

A hand-built personal portfolio. **Zero frameworks, zero build steps, zero dependencies** —
just three files of carefully crafted HTML, CSS, and vanilla JavaScript.

## ✦ What's inside

| Feature | Where |
|---|---|
| Living starfield — parallax depth, twinkling, shooting stars | canvas `#sky`, `script.js` → *starfield* |
| Day / night theme — morphing sun ⇄ moon, circular reveal (View Transitions API) | `#themeToggle` |
| Skills constellation — interactive SVG star map (hover, tap, keyboard) | `#skills` |
| Astronaut that draws itself in and follows your cursor with its eyes | `#about` |
| Per-project animated SVG illustrations | `#work` |
| Flight-log timeline whose path draws as you scroll, with a comet tracker | `#journey` |
| Magnetic buttons, 3D-tilt cards, custom cursor (desktop only) | `script.js` |
| Konami code easter egg → warp drive (`↑ ↑ ↓ ↓ ← → ← → B A`) | try it |
| "Lost in space" 404 page | `404.html` |

Mobile-first and fully responsive (tested at 360 / 390 / 768 / 1440 px), honors
`prefers-reduced-motion`, keyboard-accessible, self-hosted variable font (one 22 KB file),
no external requests at all.

## ✏️ Make it yours

All content lives in `index.html` — search for these and replace:

1. **Email** — `hello@viktor.dev` (appears in the contact button `data-email`, the mobile
   menu footer, and the console message in `script.js`).
2. **Social links** — the `contact__socials` list (GitHub / LinkedIn / X point at homepages
   for now).
3. **Projects** — four `<article class="project">` blocks: name, description, tags, links.
4. **Experience** — the `timeline__list` entries in `#journey`.
5. **About copy & stats** — `#about` paragraphs and the `data-count-to` numbers.
6. **Skills** — stars in the `#skymapSvg` map (`data-skill`, `data-level`) and the matching
   legend chips. Star size = `r` on `star__core`/`star__halo`.

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

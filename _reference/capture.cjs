/* Runs on a GitHub Actions runner (full internet).
   Screenshots both reference sites at 1440px and 390px, stepwise scroll,
   and extracts computed design tokens. Output goes to _reference/shots/. */
const { chromium } = require('playwright');
const fs = require('fs');

const SITES = [
  { name: 'linea', url: 'https://lineads.framer.website/' },
  { name: 'hanzo', url: 'https://hanzo.framer.website/' },
];
const WIDTHS = [
  { w: 1440, h: 900, tag: '1440' },
  { w: 390, h: 844, tag: '390' },
];

(async () => {
  const browser = await chromium.launch();
  for (const site of SITES) {
    for (const vp of WIDTHS) {
      const dir = `_reference/shots/${site.name}-${vp.tag}`;
      fs.mkdirSync(dir, { recursive: true });
      const ctx = await browser.newContext({
        viewport: { width: vp.w, height: vp.h },
        deviceScaleFactor: vp.w < 500 ? 2 : 1,
        isMobile: vp.w < 500,
        hasTouch: vp.w < 500,
        userAgent: vp.w < 500
          ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
          : undefined,
      });
      const page = await ctx.newPage();
      await page.goto(site.url, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
      await page.waitForTimeout(4000);

      // full scroll first so lazy content loads, then back to top
      const total = await page.evaluate(() => document.body.scrollHeight);
      for (let y = 0; y < total; y += 700) {
        await page.evaluate(v => window.scrollTo(0, v), y);
        await page.waitForTimeout(220);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1500);

      const finalH = await page.evaluate(() => document.body.scrollHeight);
      const step = Math.round(vp.h * 0.9);
      let shot = 0;
      for (let y = 0; y < finalH; y += step) {
        await page.evaluate(v => window.scrollTo(0, v), y);
        await page.waitForTimeout(1500);
        await page.screenshot({ path: `${dir}/${String(shot).padStart(2, '0')}.png` });
        shot++;
        if (shot > 34) break;
      }
      console.log(`${site.name}@${vp.tag}: ${shot} shots, height ${finalH}px`);

      // desktop pass also extracts computed tokens
      if (vp.w === 1440) {
        const tokens = await page.evaluate(() => {
          const out = { fonts: {}, colors: {}, samples: [], links: [] };
          const seen = new Set();
          let i = 0;
          for (const el of document.querySelectorAll('h1,h2,h3,h4,h5,p,a,button,span,div,li')) {
            if (++i > 6000) break;
            const cs = getComputedStyle(el);
            const f = cs.fontFamily;
            out.fonts[f] = (out.fonts[f] || 0) + 1;
            for (const p of ['color', 'backgroundColor', 'borderTopColor']) {
              const v = cs[p];
              if (v && v !== 'rgba(0, 0, 0, 0)') out.colors[v] = (out.colors[v] || 0) + 1;
            }
            const tag = el.tagName.toLowerCase();
            const text = (el.textContent || '').trim().slice(0, 60);
            if (['h1', 'h2', 'h3', 'h4', 'button'].includes(tag) && text && !seen.has(tag + text) && out.samples.length < 60) {
              seen.add(tag + text);
              out.samples.push({ tag, text, font: cs.fontFamily.slice(0, 60), size: cs.fontSize, weight: cs.fontWeight, lh: cs.lineHeight, ls: cs.letterSpacing, color: cs.color, bg: cs.backgroundColor, radius: cs.borderRadius });
            }
          }
          for (const a of document.querySelectorAll('a[href]')) {
            const href = a.getAttribute('href');
            if (href && !href.startsWith('#') && out.links.length < 30) out.links.push(href);
          }
          const cols = {};
          for (const [k, v] of Object.entries(out.colors)) if (v > 4) cols[k] = v;
          out.colors = cols;
          out.bodyBg = getComputedStyle(document.body).backgroundColor;
          return out;
        });
        fs.writeFileSync(`_reference/shots/${site.name}-tokens.json`, JSON.stringify(tokens, null, 1));
      }
      await ctx.close();
    }
  }
  await browser.close();
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });

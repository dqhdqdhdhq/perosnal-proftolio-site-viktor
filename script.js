/* ═══════════════════════════════════════════════════════════════
   VIKTOR · portfolio v2 — script.js
   Vanilla JS, zero dependencies. Organized as small modules, each
   guarded so a failure in one never takes down the rest.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE_POINTER = window.matchMedia('(pointer: fine)').matches;

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function safe(name, fn) {
    try { fn(); } catch (err) { console.warn('[viktor] module "' + name + '" failed:', err); }
  }

  /* ── Toast ────────────────────────────────────────────────── */
  var toastEl = $('#toast');
  var toastTimer = null;
  function toast(msg, ms) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, ms || 2600);
  }

  /* ══ 1. STARFIELD (dark mode ambience + warp easter egg) ═══─ */
  var warpUntil = 0;
  function warp(duration) {
    warpUntil = performance.now() + (duration || 3600);
    root.classList.add('warping');
  }

  safe('starfield', function () {
    var canvas = $('#sky');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, stars = [];
    var warpPower = 0;
    var lastT = performance.now();
    var rafId = null;

    var DARK_PALETTE = ['#f4f1ed', '#f4f1ed', '#e6d8cb', '#f0a47e'];
    var LIGHT_PALETTE = ['#211e1e', '#211e1e', '#5a4a40', '#e34400'];

    function palette() {
      return root.getAttribute('data-theme') === 'dark' ? DARK_PALETTE : LIGHT_PALETTE;
    }

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      var count = clamp(Math.round((W * H) / 16000), 36, 130);
      stars = [];
      var colors = palette();
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          z: 0.25 + Math.random() * 0.75,
          r: 0.4 + Math.random() * 1.2,
          a: 0.2 + Math.random() * 0.6,
          phase: Math.random() * Math.PI * 2,
          tw: 0.4 + Math.random() * 1.4,
          ci: (Math.random() * colors.length) | 0
        });
      }
    }

    function frame(now) {
      rafId = requestAnimationFrame(frame);
      var dt = Math.min((now - lastT) / 16.7, 3);
      lastT = now;

      var target = now < warpUntil ? 1 : 0;
      warpPower += (target - warpPower) * 0.045 * dt;
      if (target === 0 && warpPower < 0.02 && root.classList.contains('warping')) {
        root.classList.remove('warping');
      }

      var colors = palette();
      var cx = W / 2, cy = H / 2;
      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];

        if (warpPower > 0.01) {
          var dx = s.x - cx, dy = s.y - cy;
          var dist = Math.max(Math.hypot(dx, dy), 1);
          var v = warpPower * s.z * 14 * dt;
          s.x += (dx / dist) * v * (dist * 0.02 + 1);
          s.y += (dy / dist) * v * (dist * 0.02 + 1);
          if (s.x < -20 || s.x > W + 20 || s.y < -20 || s.y > H + 20) {
            s.x = cx + (Math.random() - 0.5) * W * 0.4;
            s.y = cy + (Math.random() - 0.5) * H * 0.4;
          }
        }

        var alpha = s.a * (0.6 + 0.4 * Math.sin(now * 0.001 * s.tw + s.phase));
        ctx.globalAlpha = alpha * (0.55 + warpPower * 0.45);
        var color = colors[s.ci % colors.length];
        ctx.fillStyle = color;

        if (warpPower > 0.05) {
          var ddx = s.x - cx, ddy = s.y - cy;
          var dl = Math.max(Math.hypot(ddx, ddy), 1);
          var len = warpPower * s.z * 34;
          ctx.strokeStyle = color;
          ctx.lineWidth = s.r;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - (ddx / dl) * len, s.y - (ddy / dl) * len);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * (1 + s.z * 0.3), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    function start() { if (rafId == null) { lastT = performance.now(); rafId = requestAnimationFrame(frame); } }
    function stop() { if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; } }

    resize();
    window.addEventListener('resize', resize);

    if (REDUCED) {
      // calm, static dots — no animation loop
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        ctx.globalAlpha = s.a * 0.7;
        ctx.fillStyle = palette()[s.ci % 4];
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      return;
    }

    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) stop(); else start();
    });
    start();
  });

  /* ══ 2. THEME TOGGLE (sun ⇄ moon) ═════════════════════════── */
  safe('theme', function () {
    var btn = $('#themeToggle');
    if (!btn) return;

    function apply(theme) {
      root.setAttribute('data-theme', theme);
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      try { localStorage.setItem('viktor-theme', theme); } catch (e) {}
    }

    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';

      // circular reveal via View Transitions, with graceful fallback
      if (doc.startViewTransition && !REDUCED) {
        var rect = btn.getBoundingClientRect();
        var x = rect.left + rect.width / 2;
        var y = rect.top + rect.height / 2;
        var r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
        var vt = doc.startViewTransition(function () { apply(next); });
        vt.ready.then(function () {
          root.animate(
            { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + r + 'px at ' + x + 'px ' + y + 'px)'] },
            { duration: 600, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
          );
        }).catch(function () {});
      } else {
        root.classList.add('theme-anim');
        apply(next);
        setTimeout(function () { root.classList.remove('theme-anim'); }, 650);
      }
    });
  });

  /* ══ 3. NAV: hide/show, scrollspy, burger ═════════════════── */
  safe('nav', function () {
    var nav = $('#nav');
    var burger = $('#navBurger');
    var menu = $('#mobileMenu');
    var lastY = window.scrollY;
    var ticking = false;

    function onScroll() {
      var y = window.scrollY;
      nav.classList.toggle('nav--scrolled', y > 24);
      if (!doc.body.classList.contains('menu-open')) {
        if (y > lastY && y > 360) nav.classList.add('nav--hidden');
        else nav.classList.remove('nav--hidden');
      }
      lastY = y;
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    // burger / mobile menu
    function closeMenu() {
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
      doc.body.classList.remove('menu-open');
    }
    burger.addEventListener('click', function () {
      var open = !menu.classList.contains('is-open');
      if (open) {
        menu.classList.add('is-open');
        menu.setAttribute('aria-hidden', 'false');
        burger.setAttribute('aria-expanded', 'true');
        burger.setAttribute('aria-label', 'Close menu');
        doc.body.classList.add('menu-open');
        nav.classList.remove('nav--hidden');
      } else closeMenu();
    });
    $$('.menu__link', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
    });

    // scrollspy
    var links = $$('.nav__link');
    var byId = {};
    links.forEach(function (l) { byId[l.getAttribute('data-section')] = l; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('is-active'); });
          var link = byId[en.target.id];
          if (link) link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    ['work', 'services', 'process', 'about', 'pricing', 'faq'].forEach(function (id) {
      var sec = doc.getElementById(id);
      if (sec) spy.observe(sec);
    });
  });

  /* ══ 4. HERO: split chars + rotating word ═════════════════── */
  safe('hero', function () {
    var hero = $('.hero');
    if (!hero) return;

    var charIndex = 0;
    $$('[data-split]', hero).forEach(function (el) {
      var text = el.textContent;
      el.textContent = '';
      el.setAttribute('aria-label', text);
      text.split(' ').forEach(function (wordText, w, arr) {
        var word = doc.createElement('span');
        word.className = 'word';
        word.setAttribute('aria-hidden', 'true');
        for (var i = 0; i < wordText.length; i++) {
          var span = doc.createElement('span');
          span.className = 'ch';
          span.textContent = wordText[i];
          span.style.setProperty('--d', (charIndex * 26) + 'ms');
          charIndex++;
          word.appendChild(span);
        }
        el.appendChild(word);
        if (w < arr.length - 1) {
          var gap = doc.createElement('span');
          gap.className = 'ch ch--space';
          gap.setAttribute('aria-hidden', 'true');
          el.appendChild(gap);
          charIndex++;
        }
      });
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hero.classList.add('is-in'); });
    });

    // rotating word
    var rotator = $('.rotator', hero);
    if (!rotator) return;
    var words = $$('.rotator__word', rotator);
    var idx = 0;

    function fit() {
      var w = words[idx].offsetWidth;
      if (w > 0) rotator.style.width = w + 'px';
    }
    fit();
    window.addEventListener('resize', fit);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(fit);

    if (REDUCED || words.length < 2) return;
    setInterval(function () {
      var current = words[idx];
      idx = (idx + 1) % words.length;
      var next = words[idx];
      current.classList.remove('is-active');
      current.classList.add('is-leaving');
      next.classList.add('is-active');
      fit();
      setTimeout(function () { current.classList.remove('is-leaving'); }, 600);
    }, 2600);
  });

  /* ══ 5. REVEAL ON SCROLL ══════════════════════════════════── */
  safe('reveal', function () {
    var items = $$('[data-reveal]');
    items.forEach(function (el) {
      var d = el.getAttribute('data-reveal-delay');
      if (d) el.style.setProperty('--rd', d + 'ms');
    });
    if (REDUCED || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('revealed');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });

    // project artwork plays when scrolled into view (and replays next time)
    var artIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        en.target.classList.toggle('in-view', en.isIntersecting);
      });
    }, { threshold: 0.45 });
    $$('.project').forEach(function (p) { artIo.observe(p); });
  });

  /* ══ 6. COUNTERS ══════════════════════════════════════════── */
  safe('counters', function () {
    var nums = $$('[data-count-to]');
    if (!nums.length) return;
    function animate(el) {
      var target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
      if (REDUCED) { el.textContent = target.toLocaleString('en-US'); return; }
      var t0 = null;
      var dur = 1500;
      function step(t) {
        if (!t0) t0 = t;
        var p = clamp((t - t0) / dur, 0, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animate(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { io.observe(el); });
  });

  /* ══ 7. ASTRONAUT: draw-in, eyes follow cursor, moonlet ═══── */
  safe('astronaut', function () {
    var svg = $('#astro');
    if (!svg) return;

    var strokes = $$('.astro__stroke, .astro__visor, .astro__smile, .astro__panel, .astro__orbit', svg);
    var fills = $$('.astro__eye, .astro__blush, .astro__btn, .astro__beacon, .astro__moonlet', svg);
    var visor = $('.astro__visor', svg);

    if (!REDUCED) {
      strokes.forEach(function (el) {
        try {
          var len = el.getTotalLength();
          el.style.strokeDasharray = el.classList.contains('astro__orbit') ? '5 7' : String(len);
          el.style.strokeDashoffset = el.classList.contains('astro__orbit') ? '0' : String(len);
          if (el.classList.contains('astro__orbit')) el.style.opacity = '0';
        } catch (e) {}
      });
      fills.forEach(function (el) { el.style.opacity = '0'; });
      if (visor) visor.style.fillOpacity = '0';

      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        strokes.forEach(function (el, i) {
          if (el.classList.contains('astro__orbit')) {
            el.style.transition = 'opacity 1s ease 1.4s';
            el.style.opacity = '1';
            return;
          }
          el.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1) ' + (i * 110) + 'ms';
          el.style.strokeDashoffset = '0';
        });
        if (visor) {
          visor.style.transition = 'fill-opacity .8s ease .9s';
          visor.style.fillOpacity = '1';
        }
        fills.forEach(function (el, i) {
          el.style.transition = 'opacity .55s ease ' + (1100 + i * 90) + 'ms';
          el.style.opacity = '';
        });
      }, { threshold: 0.35 });
      io.observe(svg);
    }

    // eyes follow the pointer
    var eyes = $$('.astro__eye', svg);
    if (!eyes.length || REDUCED) return;
    var targetX = 0, targetY = 0, curX = 0, curY = 0;
    var visible = false;

    var vio = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) tick();
    }, { threshold: 0 });
    vio.observe(svg);

    window.addEventListener('pointermove', function (e) {
      var rect = svg.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height * 0.42;
      var dx = e.clientX - cx, dy = e.clientY - cy;
      var dist = Math.hypot(dx, dy) || 1;
      var pull = Math.min(dist / 90, 1) * 6.5;
      targetX = (dx / dist) * pull;
      targetY = (dy / dist) * pull;
    }, { passive: true });

    function tick() {
      if (!visible) return;
      curX += (targetX - curX) * 0.12;
      curY += (targetY - curY) * 0.12;
      for (var i = 0; i < eyes.length; i++) {
        eyes[i].style.transform = 'translate(' + curX.toFixed(2) + 'px,' + curY.toFixed(2) + 'px)';
      }
      requestAnimationFrame(tick);
    }

    // moonlet rides the orbit ellipse
    var moonlet = $('.astro__moonlet', svg);
    if (moonlet) {
      var t = 0;
      (function orbitTick() {
        requestAnimationFrame(orbitTick);
        if (!visible) return;
        t += 0.008;
        var x = 160 + Math.cos(t) * 150;
        var y = 170 + Math.sin(t) * 58;
        moonlet.setAttribute('cx', x.toFixed(1));
        moonlet.setAttribute('cy', y.toFixed(1));
      })();
    }
  });

  /* ══ 8. MAGNETIC ELEMENTS + TILT CARDS (desktop) ══════════── */
  safe('magnetic', function () {
    if (!FINE_POINTER || REDUCED) return;

    $$('[data-magnetic]').forEach(function (el) {
      var strength = 7;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        var y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        el.style.transform = 'translate(' + (x * strength).toFixed(1) + 'px,' + (y * strength).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });

    $$('[data-tilt]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        var rx = (py - 0.5) * -3.4;
        var ry = (px - 0.5) * 3.4;
        card.style.transform = 'perspective(1000px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  });

  /* ══ 9. CUSTOM CURSOR (desktop) ═══════════════════════════── */
  safe('cursor', function () {
    if (!FINE_POINTER || REDUCED) return;
    var dot = $('#cursorDot');
    var ring = $('#cursorRing');
    var holder = $('.cursor');
    if (!dot || !ring) return;

    root.classList.add('custom-cursor');
    holder.classList.add('cursor--hidden');

    var x = -100, y = -100, rx = -100, ry2 = -100;
    var started = false;

    window.addEventListener('pointermove', function (e) {
      x = e.clientX; y = e.clientY;
      holder.classList.remove('cursor--hidden');
      if (!started) { started = true; rx = x; ry2 = y; loop(); }
      var t = e.target;
      var interactive = t.closest && t.closest('a, button, summary, .tag, [data-tilt]');
      holder.classList.toggle('cursor--hover', !!interactive);
    }, { passive: true });

    doc.addEventListener('mouseleave', function () { holder.classList.add('cursor--hidden'); });

    function loop() {
      rx += (x - rx) * 0.16;
      ry2 += (y - ry2) * 0.16;
      dot.style.transform = 'translate(' + (x - 3) + 'px,' + (y - 3) + 'px)';
      ring.style.transform = 'translate(' + (rx - 18) + 'px,' + (ry2 - 18) + 'px)';
      requestAnimationFrame(loop);
    }
  });

  /* ══ 10. COPY EMAIL (all [data-copy-email] buttons) ═══════── */
  safe('email', function () {
    $$('[data-copy-email]').forEach(function (btn) {
      var email = btn.getAttribute('data-email') || 'hello@viktor.dev';
      btn.addEventListener('click', function () {
        function done() { toast('Copied! ' + email + ' — talk soon.'); }
        function fallback() { window.location.href = 'mailto:' + email; }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email).then(done).catch(fallback);
        } else fallback();
      });
    });
  });

  /* ══ 11. ROCKET: back to top ══════════════════════════════── */
  safe('rocket', function () {
    var rocket = $('#rocket');
    if (!rocket) return;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        rocket.classList.toggle('show', window.scrollY > 700);
        ticking = false;
      });
    }, { passive: true });

    rocket.addEventListener('click', function () {
      if (!REDUCED) {
        rocket.classList.add('launching');
        setTimeout(function () { rocket.classList.remove('launching'); }, 950);
      }
      window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
    });
  });

  /* ══ 12. FAQ: close others when one opens ═════════════════── */
  safe('faq', function () {
    var items = $$('.faq__item');
    items.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        items.forEach(function (other) {
          if (other !== item && other.open) other.open = false;
        });
      });
    });
  });

  /* ══ 13. EASTER EGGS ══════════════════════════════════════── */
  safe('eggs', function () {
    var seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    var pos = 0;
    doc.addEventListener('keydown', function (e) {
      var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = key === seq[pos] ? pos + 1 : (key === seq[0] ? 1 : 0);
      if (pos === seq.length) {
        pos = 0;
        engage();
      }
    });
    var hint = $('#konamiHint');
    if (hint) hint.addEventListener('click', engage);
    function engage() {
      warp(3600);
      toast('✦ Warp drive engaged — hold on!');
    }

    console.log(
      '%cviktor.%c\n\nYou found the console. This site is 100%% hand-built —\nno frameworks, no templates, no build step. View source,\npoke around, and if you like what you see: hello@viktor.dev\n\nPsst: try the Konami code. ↑↑↓↓←→←→BA',
      'font-size:18px; font-weight:700; background:#e34400; color:#fff; padding:8px 16px; border-radius:8px;',
      'font-size:12px; color:#e34400; line-height:1.7;'
    );
  });

  /* ══ 14. FOOTER YEAR ══════════════════════════════════════── */
  safe('year', function () {
    var y = $('#year');
    if (y) y.textContent = String(new Date().getFullYear());
  });
})();

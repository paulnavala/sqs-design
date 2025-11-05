(function () {
  'use strict';
  function y() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return !1;
    }
  }
  const h = [
      'The best time to plant a tree was 20 years ago. The second best time is now.',
      "Your limitation—it's only your imagination.",
      'Great things never come from comfort zones.',
      "Success doesn't just find you. You have to go out and get it.",
      'Dream bigger. Do bigger.',
      "Don't stop when you're tired. Stop when you're done.",
      'Wake up with determination. Go to bed with satisfaction.',
      'Little by little, a little becomes a lot.',
      'The secret of getting ahead is getting started.',
      "Believe you can and you're halfway there.",
      "Opportunities don't happen. You create them.",
      "Everything you've ever wanted is on the other side of fear.",
    ],
    u = { count: 6, min: 1, max: 70 },
    w = { crackingDuration: 1500, particleCleanup: 1500 };
  function v() {
    const e = h[Math.floor(Math.random() * h.length)],
      t = new Set();
    for (; t.size < u.count; ) t.add(u.min + Math.floor(Math.random() * (u.max - u.min + 1)));
    return { quote: e, lucky: Array.from(t).sort((o, n) => o - n) };
  }
  function g(e, t, o, n) {
    (t.classList.remove('flw-stage--unopened', 'flw-stage--cracking', 'flw-stage--revealed'),
      t.classList.add('flw-stage--' + e));
    const i = e === 'cracking',
      a = e === 'revealed';
    ((o.hidden = !i),
      (n.hidden = !a),
      o.setAttribute('aria-hidden', String(!i)),
      n.setAttribute('aria-hidden', String(!a)));
  }
  function k(e) {
    if (((e.innerHTML = ''), y())) return;
    const t = 20,
      o = e.getBoundingClientRect(),
      n = document.createDocumentFragment();
    for (let i = 0; i < t; i++) {
      const a = document.createElement('span');
      ((a.className = 'flw-p animate'),
        (a.style.left = o.width / 2 + 'px'),
        (a.style.top = o.height / 2 + 'px'));
      const d = (Math.random() - 0.5) * 220,
        s = (Math.random() - 0.5) * 220;
      (a.style.setProperty('--dx', d + 'px'),
        a.style.setProperty('--dy', s + 'px'),
        (a.style.animationDelay = 0.3 + Math.random() * 0.3 + 's'),
        n.appendChild(a));
    }
    requestAnimationFrame(() => {
      (e.appendChild(n), setTimeout(() => (e.innerHTML = ''), w.particleCleanup));
    });
  }
  function b(e, t, o) {
    const n = document.createElement('span');
    ((n.className = 'flw-ball'),
      (n.style.animationDelay = 0.1 * t + 0.2 + 's'),
      (n.textContent = String(e)),
      (n.style.margin = '0'),
      (n.style.padding = '0'),
      o.appendChild(n));
  }
  function f(e) {
    const { stage: t, cracking: o, revealed: n, quoteEl: i, ballsEl: a, particles: d } = e,
      s = v();
    (g('cracking', t, o, n), k(d));
    let l = w.crackingDuration;
    (y() && (l = 0),
      setTimeout(() => {
        ((i.textContent = '"' + s.quote + '"'),
          (a.innerHTML = ''),
          s.lucky.forEach((c, r) => b(c, r, a)),
          g('revealed', t, o, n));
      }, l));
  }
  function p(e) {
    const { stage: t, cracking: o, revealed: n } = e;
    g('unopened', t, o, n);
  }
  function m() {
    const e = document.getElementById('flwStage');
    if (!e) return;
    const t = document.getElementById('flwLogoBtn'),
      o = document.getElementById('flwTap'),
      n = document.getElementById('flwCracking'),
      i = document.getElementById('flwRevealed'),
      a = document.getElementById('flwAgain'),
      d = document.getElementById('flwQuote'),
      s = document.getElementById('flwBalls'),
      l = document.getElementById('flwParticles');
    if (!t || !o || !n || !i || !a || !d || !s || !l) return;
    const c = { stage: e, cracking: n, revealed: i, quoteEl: d, ballsEl: s, particles: l };
    (t.addEventListener('click', () => f(c)),
      o.addEventListener('click', () => f(c)),
      a.addEventListener('click', () => p(c)),
      t.addEventListener('keydown', (r) => {
        (r.key === 'Enter' || r.key === ' ') && (r.preventDefault(), f(c));
      }),
      e.addEventListener('keydown', (r) => {
        r.key === 'Escape' &&
          e.classList.contains('flw-stage--revealed') &&
          (r.preventDefault(), p(c));
      }));
  }
  ((window.initFortuneLogoWidget = m), (window.initFortunePeach = m));
  function E() {
    if (document.getElementById('flwStage')) return m();
    const t = new MutationObserver(() => {
      document.getElementById('flwStage') && (t.disconnect(), m());
    });
    t.observe(document.body, { childList: !0, subtree: !0 });
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', E) : E();
})();

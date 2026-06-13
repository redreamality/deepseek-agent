/* =====================================================================
   DeepSeek Agent — app.js
   anime.js v4 (ESM, via CDN) drives the narrative; everything degrades
   gracefully if the module fails to load (counters, bars and content
   still work via rAF + CSS).
   ===================================================================== */

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let A = null; // anime.js namespace, assigned after dynamic import

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ---------------------------------------------------------------------
   Number roll-up (anime-independent)
   ------------------------------------------------------------------- */
function fmtNum(v, el) {
  const dec = parseInt(el.dataset.decimals || '0', 10);
  const useComma = el.dataset.format === 'comma';
  const n = dec > 0 ? Number(v.toFixed(dec)) : Math.round(v);
  const s = useComma ? n.toLocaleString('en-US') : (dec > 0 ? n.toFixed(dec) : String(n));
  return (el.dataset.prefix || '') + s + (el.dataset.suffix || '');
}
function countUp(el) {
  if (el.dataset.counted) return;
  el.dataset.counted = '1';
  const to = parseFloat(el.dataset.to);
  if (isNaN(to)) return;
  if (reduce) { el.textContent = fmtNum(to, el); return; }
  const dur = 1500, t0 = performance.now();
  (function step(now) {
    const p = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3); // outCubic
    el.textContent = fmtNum(to * e, el);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = fmtNum(to, el);
  })(performance.now());
}

/* ---------------------------------------------------------------------
   Split text into per-character spans (baseline-pinned via CSS)
   ------------------------------------------------------------------- */
function splitText(el) {
  if (el.dataset.split) return;
  el.dataset.split = '1';
  const text = el.textContent;
  el.textContent = '';
  const frag = document.createDocumentFragment();
  // group chars into words so line-breaks only happen between words
  for (const part of text.split(/(\s+)/)) {
    if (part === '') continue;
    if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); continue; }
    const word = document.createElement('span');
    word.className = 'word';
    for (const ch of part) {
      const sp = document.createElement('span');
      sp.className = 'char';
      sp.textContent = ch;
      word.appendChild(sp);
    }
    frag.appendChild(word);
  }
  el.appendChild(frag);
}
function splitAll() { $$('[data-split]').forEach(splitText); }

/* ---------------------------------------------------------------------
   Depth field — drifting plankton on a canvas
   ------------------------------------------------------------------- */
function startPlankton() {
  const c = document.getElementById('plankton');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w, h, dpr, parts, mx = 0, my = 0, tmx = 0, tmy = 0;
  const mk = () => ({
    x: Math.random() * w, y: Math.random() * h,
    r: (Math.random() * 1.5 + 0.4) * dpr,
    s: (Math.random() * 0.22 + 0.04) * dpr,
    d: Math.random() * Math.PI * 2,
    a: Math.random() * 0.45 + 0.12,
    hue: Math.random() < 0.5 ? '77,107,255' : '38,242,213'
  });
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = c.width = window.innerWidth * dpr;
    h = c.height = window.innerHeight * dpr;
    c.style.width = window.innerWidth + 'px';
    c.style.height = window.innerHeight + 'px';
    const count = window.innerWidth < 640 ? 34 : 70;
    parts = Array.from({ length: count }, mk);
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      const px = p.x + mx * 38 * dpr * p.r;
      const py = p.y + my * 38 * dpr * p.r;
      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, 6.283);
      ctx.fillStyle = 'rgba(' + p.hue + ',' + p.a + ')';
      ctx.fill();
    }
  }
  function loop() {
    mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
    for (const p of parts) {
      p.y -= p.s;
      p.x += Math.sin(p.d + p.y * 0.002) * 0.2 * dpr;
      if (p.y < -6) { p.y = h + 6; p.x = Math.random() * w; }
    }
    draw();
    requestAnimationFrame(loop);
  }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (e) => {
    tmx = e.clientX / window.innerWidth - 0.5;
    tmy = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });
  if (reduce) { draw(); return; }
  loop();
}

/* ---------------------------------------------------------------------
   Loader → callback when done
   ------------------------------------------------------------------- */
function runLoader(cb) {
  const loader = document.getElementById('loader');
  const num = document.getElementById('loaderNum');
  const rule = document.querySelector('.loader-rule');
  const done = () => { if (loader) loader.classList.add('done'); if (cb) cb(); };
  if (!loader) { done(); return; }
  if (reduce) {
    if (num) num.textContent = '100';
    if (rule) rule.style.setProperty('--lw', '100%');
    setTimeout(done, 150); return;
  }
  const dur = 1150, t0 = performance.now();
  (function step(now) {
    const p = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - p, 2);
    if (num) num.textContent = Math.round(e * 100);
    if (rule) rule.style.setProperty('--lw', (e * 100) + '%');
    if (p < 1) requestAnimationFrame(step);
    else setTimeout(done, 180);
  })(performance.now());
}

/* ---------------------------------------------------------------------
   Nav solidify on scroll + copy chips
   ------------------------------------------------------------------- */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('solid', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
function initCopy() {
  $$('[data-copy]').forEach((el) => {
    el.addEventListener('click', () => {
      const text = el.dataset.copy;
      const after = () => { el.classList.add('copied'); setTimeout(() => el.classList.remove('copied'), 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(after).catch(after);
      } else { after(); }
    });
  });
}

/* ---------------------------------------------------------------------
   reasoning_effort slider (pointer drag, snaps to 3 stops)
   ------------------------------------------------------------------- */
function initEffort() {
  const track = document.getElementById('effortTrack');
  const thumb = document.getElementById('effortThumb');
  const fill = document.getElementById('effortFill');
  const val = document.getElementById('effortVal');
  const sec = document.getElementById('agentic');
  if (!track || !thumb || !fill) return;
  const labels = ['none', 'high', 'max'];
  const accents = ['#8a97b8', '#7c85ff', '#26f2d5'];
  const idxFor = (p) => (p < 0.25 ? 0 : p < 0.75 ? 1 : 2);
  function apply(p, snap) {
    const i = idxFor(p);
    const pos = snap ? [0, 0.5, 1][i] : p;
    thumb.style.left = (pos * 100) + '%';
    fill.style.width = (pos * 100) + '%';
    if (val) val.textContent = labels[i];
    if (sec) sec.style.setProperty('--section-accent', accents[i]);
  }
  function pFromX(x) {
    const r = track.getBoundingClientRect();
    return Math.max(0, Math.min(1, (x - r.left) / r.width));
  }
  let dragging = false;
  // pointer capture on the whole track so a tap or drag anywhere works
  track.addEventListener('pointerdown', (e) => {
    dragging = true;
    try { track.setPointerCapture(e.pointerId); } catch (_) {}
    apply(pFromX(e.clientX), false);
    e.preventDefault();
  });
  track.addEventListener('pointermove', (e) => { if (dragging) apply(pFromX(e.clientX), false); });
  const end = (e) => { if (!dragging) return; dragging = false; apply(pFromX(e.clientX), true); };
  track.addEventListener('pointerup', end);
  track.addEventListener('pointercancel', end);
  // click fallback for environments that deliver mouse events without pointer events
  track.addEventListener('click', (e) => { if (!dragging) apply(pFromX(e.clientX), true); });
  apply(1, true);
}

/* ---------------------------------------------------------------------
   Tool-call graph: light nodes in sequence
   ------------------------------------------------------------------- */
function startNodes(s) {
  const nodes = $$('.tnode', s);
  if (!nodes.length || s.dataset.nodes) return;
  s.dataset.nodes = '1';
  let i = 0;
  const tick = () => {
    nodes.forEach((n, k) => n.classList.toggle('lit', k === i % nodes.length));
    i++;
  };
  tick();
  if (!reduce) setInterval(tick, 850);
}

/* ---------------------------------------------------------------------
   API section — typewriter code with syntax colour
   ------------------------------------------------------------------- */
const CODE = [
  [['c', '# Your OpenAI code — now with DeepSeek brains.']],
  [],
  [['k', 'from'], ['p', ' '], ['m', 'openai'], ['p', ' '], ['k', 'import'], ['p', ' OpenAI']],
  [],
  [['p', 'client = '], ['f', 'OpenAI'], ['p', '(']],
  [['p', '    base_url='], ['s', '"https://api.deepseek.com"'], ['p', ',']],
  [['p', '    api_key='], ['s', '"sk-..."'], ['p', ',']],
  [['p', ')']],
  [],
  [['p', 'resp = client.chat.completions.'], ['f', 'create'], ['p', '(']],
  [['p', '    model='], ['hl', '"deepseek-v4-pro"'], ['p', ',   '], ['c', '# was "gpt-4o"']],
  [['p', '    tools=tools,           '], ['c', '# up to 128, in parallel']],
  [['p', '    extra_body={'], ['s', '"thinking"'], ['p', ': {'], ['s', '"type"'], ['p', ': '], ['s', '"enabled"'], ['p', '}},']],
  [['p', ')']],
];
const CLS = { c: 'tok-com', k: 'tok-kw', m: 'tok-mod', f: 'tok-fn', s: 'tok-str', n: 'tok-num', hl: 'hl', p: '' };

let codeTyped = false;
function typeCode() {
  if (codeTyped) return;
  codeTyped = true;
  const root = document.getElementById('codeBlock');
  const caret = document.getElementById('caret');
  if (!root) return;
  const lineEls = CODE.map(() => { const d = document.createElement('div'); d.className = 'code-line'; root.appendChild(d); return d; });
  const toks = [];
  CODE.forEach((line, li) => line.forEach(([cl, t]) => toks.push({ li, cl, t })));

  if (reduce) {
    toks.forEach((tk) => { const sp = document.createElement('span'); if (CLS[tk.cl]) sp.className = CLS[tk.cl]; sp.textContent = tk.t; lineEls[tk.li].appendChild(sp); });
    if (caret) caret.classList.add('hide');
    return;
  }
  let ti = 0, ci = 0, span = null;
  (function frame() {
    let budget = 3;
    while (budget-- > 0 && ti < toks.length) {
      const tk = toks[ti];
      if (ci === 0) { span = document.createElement('span'); if (CLS[tk.cl]) span.className = CLS[tk.cl]; lineEls[tk.li].appendChild(span); }
      span.textContent += tk.t[ci++];
      if (caret) lineEls[tk.li].appendChild(caret);
      if (ci >= tk.t.length) { ti++; ci = 0; }
    }
    if (ti < toks.length) requestAnimationFrame(frame);
    else if (caret) { setTimeout(() => caret.classList.add('hide'), 1200); flashModel(); }
  })();
}
function flashModel() {
  const hl = document.querySelector('#codeBlock .hl');
  if (hl && A) {
    try { A.animate(hl, { backgroundColor: ['rgba(38,242,213,0.55)', 'rgba(38,242,213,0.16)'], duration: 950, ease: 'outQuad' }); } catch (_) {}
  }
}
function revealLatency() {
  const f = document.getElementById('latFill');
  if (f) requestAnimationFrame(() => { f.style.width = '4%'; });
}

/* ---------------------------------------------------------------------
   Hero intro timeline (runs after the loader finishes)
   ------------------------------------------------------------------- */
function heroStart() {
  const heroStat = document.querySelector('.hero-stat .num');
  if (!A || reduce) { countUp(heroStat); return; }
  // Use absolute per-element delays instead of timeline position strings —
  // unambiguous across anime versions, and keeps the whole intro ~3.4s.
  const go = (sel, props, delay, dur) => {
    try { A.animate(sel, Object.assign({ ease: 'outExpo', duration: dur || 680, delay: delay }, props)); }
    catch (_) {}
  };
  try {
    go('.sonar', { opacity: [0, 0.55], ease: 'outQuad' }, 0, 1200);
    A.utils.set('.hero-whale', { opacity: 1 });
    try {
      go(A.svg.createDrawable('.whale-body'), { draw: ['0 0', '0 1'], ease: 'inOutQuad' }, 150, 1000);
      go(A.svg.createDrawable('.whale-belly'), { draw: ['0 0', '0 1'] }, 650, 600);
      go(A.svg.createDrawable('.whale-spout'), { draw: ['0 0', '0 1'] }, 900, 460);
      go('.whale-eye', { opacity: [0, 1], scale: [0, 1], ease: 'outBack' }, 1050, 320);
    } catch (_) {
      A.utils.set('.whale-body,.whale-belly,.whale-spout,.whale-eye', { opacity: 1 });
    }
    go('[data-hero="badge"]', { opacity: [0, 1], translateY: [-10, 0] }, 850, 480);
    document.querySelectorAll('.hero-title [data-split]').forEach((t, i) => {
      t.style.opacity = 1;
      const chars = t.querySelectorAll('.char');
      try {
        A.animate(chars, { opacity: [0, 1], translateY: ['1em', 0], rotate: [8, 0], duration: 720, ease: 'outExpo', delay: A.stagger(18, { start: 1100 + i * 380 }) });
      } catch (_) { chars.forEach((c) => { c.style.opacity = 1; }); }
    });
    const dotEase = A.createSpring ? A.createSpring({ stiffness: 120, damping: 7 }) : 'outBack';
    go('[data-hero="dot"]', { opacity: [0, 1], scale: [0, 1.2, 1], ease: dotEase }, 2050, 720);
    go('[data-hero="sub"]', { opacity: [0, 1], translateY: [16, 0] }, 1950, 640);
    try {
      A.animate('[data-hero="stat"]', { opacity: [0, 1], translateY: [16, 0], duration: 640, ease: 'outExpo', delay: 2200, onBegin: () => countUp(heroStat) });
    } catch (_) {}
    go('[data-hero="actions"]', { opacity: [0, 1], translateY: [16, 0] }, 2450, 640);
    go('[data-hero="hint"]', { opacity: [0, 1] }, 2750, 600);
    // safety: ensure the hero number counts even if onBegin isn't honoured
    setTimeout(() => countUp(heroStat), 2500);
  } catch (e) {
    document.documentElement.classList.remove('anim');
    document.documentElement.classList.add('no-anim');
    countUp(heroStat);
  }
}

/* ---------------------------------------------------------------------
   Per-section reveal, fired by IntersectionObserver
   ------------------------------------------------------------------- */
function revealSection(s) {
  if (A && !reduce) {
    try {
      $$('[data-split]', s).forEach((t) => {
        t.style.opacity = 1;
        const chars = t.querySelectorAll('.char');
        if (chars.length) A.animate(chars, { opacity: [0, 1], translateY: ['0.9em', 0], rotate: [5, 0], duration: 740, delay: A.stagger(18), ease: 'outExpo' });
      });
      const items = $$('[data-reveal],[data-card],[data-step],[data-bench],[data-crow],[data-tile],[data-logo]', s);
      if (items.length) A.animate(items, { opacity: [0, 1], translateY: [26, 0], duration: 720, delay: A.stagger(55), ease: 'outQuad' });
      if (s.id === 'agentic') {
        try { const d = A.svg.createDrawable($$('[data-wire]', s)); A.animate(d, { draw: ['0 0', '0 1'], duration: 900, delay: A.stagger(110), ease: 'inOutQuad' }); } catch (_) {}
      }
      if (s.id === 'open') {
        try { const r = A.svg.createDrawable('.mit-ring'); A.animate(r, { draw: ['0 0', '0 1'], duration: 1100, ease: 'inOutQuad' }); } catch (_) {}
      }
      if (s.id === 'cta') {
        try { A.animate('.cta-ring', { scale: [1, 0.16], opacity: [0.6, 0], duration: 1700, delay: A.stagger(130), ease: 'inOutQuad' }); } catch (_) {}
      }
    } catch (_) {
      $$('[data-split]', s).forEach((t) => { t.style.opacity = 1; });
    }
  }
  // value animations — always run, independent of anime
  $$('.num', s).forEach(countUp);
  requestAnimationFrame(() => $$('[data-w]', s).forEach((f) => { f.style.width = f.dataset.w + '%'; }));
  $$('.pstep', s).forEach((p, i) => setTimeout(() => p.classList.add('lit'), 250 + i * 130));
  if (s.id === 'agentic') startNodes(s);
  if (s.id === 'api') { typeCode(); revealLatency(); }
}

function initSections() {
  const secs = $$('[data-section]');
  if (!('IntersectionObserver' in window)) { secs.forEach(revealSection); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      revealSection(en.target);
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
  secs.forEach((s) => io.observe(s));
}

/* Safety net: if something stalls, never leave content invisible. */
function watchdog() {
  setTimeout(() => {
    const l = document.getElementById('loader');
    if (l) l.classList.add('done');
    const t = document.querySelector('.hero-title [data-split]');
    if (t && getComputedStyle(t).opacity === '0') {
      document.documentElement.classList.remove('anim');
      document.documentElement.classList.add('no-anim');
    }
  }, 4200);
}

/* Load anime.js v4 — local vendored copy first (offline-safe), CDN fallback. */
async function loadAnime() {
  const sources = ['./vendor/anime.esm.js', 'https://cdn.jsdelivr.net/npm/animejs@4/+esm'];
  for (const src of sources) {
    try {
      const mod = await import(src);
      const ns = (mod && mod.animate) ? mod : (mod && mod.default && mod.default.animate ? mod.default : null);
      if (ns && typeof ns.animate === 'function') return ns;
    } catch (_) { /* try next source */ }
  }
  return null;
}

/* ---------------------------------------------------------------------
   Boot
   ------------------------------------------------------------------- */
async function boot() {
  document.documentElement.classList.add('booted'); // tell the head-script safety timer we're alive
  startPlankton();
  initNav();
  initCopy();
  initEffort();
  splitAll();

  A = await loadAnime();

  if (!A || reduce) {
    document.documentElement.classList.remove('anim');
    document.documentElement.classList.add('no-anim');
  }

  watchdog();
  initSections();
  runLoader(heroStart);
}

boot();


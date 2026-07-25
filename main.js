'use strict';

const $ = (id) => document.getElementById(id);
const cleanup = [];
let reduced = false;
let col = { accent: '#615fff', dim: '#5c5e78', line: '#1c1d2e' };

function initHover() {
  document.querySelectorAll('[data-hover]').forEach((el) => {
    const base = el.getAttribute('style') || '';
    const hover = el.getAttribute('data-hover');
    el.addEventListener('mouseenter', () => {
      el.setAttribute('style', base + ';' + hover);
    });
    el.addEventListener('mouseleave', () => {
      el.setAttribute('style', base);
    });
  });
}

function readColors() {
  const cs = getComputedStyle(document.documentElement);
  col = {
    accent: cs.getPropertyValue('--accent').trim() || '#3ee08a',
    dim: cs.getPropertyValue('--fg-3').trim() || '#5b6366',
    line: cs.getPropertyValue('--line').trim() || '#1b1f21',
  };
}

function responsive() {
  const apply = () => {
    const w = window.innerWidth;
    const wide = w >= 900,
      mid = w >= 700;
    const q = (s) => Array.from(document.querySelectorAll(s));
    q('[data-nav]').forEach((el) => (el.style.display = wide ? 'flex' : 'none'));
    q('[data-hero-grid]').forEach((el) => {
      el.style.gridTemplateColumns = wide ? 'minmax(0,1fr) 340px' : 'minmax(0,1fr)';
      el.style.padding = wide ? '132px 20px 84px' : '96px 20px 64px';
    });
    q('[data-split="7-5"]').forEach((el) => (el.style.gridTemplateColumns = wide ? '1.15fr 1fr' : 'minmax(0,1fr)'));
    q('[data-split="5-7"]').forEach((el) => (el.style.gridTemplateColumns = wide ? '1fr 1.15fr' : 'minmax(0,1fr)'));
    q('[data-proto]').forEach((el) => (el.style.gridTemplateColumns = wide ? '0.85fr 1.4fr' : 'minmax(0,1fr)'));
    q('[data-bep]').forEach((el) => (el.style.gridTemplateColumns = mid ? 'repeat(2,minmax(0,1fr))' : 'minmax(0,1fr)'));
    q('[data-install]').forEach((el) => (el.style.gridTemplateColumns = wide ? '0.8fr 1.2fr' : 'minmax(0,1fr)'));
    const showAnno = w >= 1440;
    const anno = $('anno');
    if (anno) anno.style.display = showAnno ? 'block' : 'none';
    q('[data-shot-1]').forEach((el) => (el.style.paddingRight = showAnno ? '290px' : '0px'));
  };
  apply();
  window.addEventListener('resize', apply, { passive: true });
  cleanup.push(() => window.removeEventListener('resize', apply));
}

function startHero() {
  const cv = $('heroCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d', { alpha: true });
  if (!ctx) return;
  readColors();

  const density = 1;
  let cap = 30;
  let W = 0,
    H = 0,
    dpr = Math.min(window.devicePixelRatio || 1, 2);

  const peers = [
    [0.06, 0.18],
    [0.02, 0.52],
    [0.1, 0.86],
    [0.3, 0.06],
    [0.26, 0.96],
    [0.52, 0.12],
    [0.48, 0.92],
    [0.7, 0.04],
    [0.9, 0.2],
    [0.96, 0.72],
    [0.74, 0.95],
  ];
  const target = [0.63, 0.52];
  let packets = [];
  const buildPackets = (n) => {
    packets = [];
    for (let i = 0; i < n; i++) {
      packets.push({
        p: i % peers.length,
        t: Math.random(),
        v: 0.0016 + Math.random() * 0.0042,
        o: (Math.random() - 0.5) * 0.42,
        len: 0.02 + Math.random() * 0.05,
        w: Math.random() < 0.16 ? 1.6 : 1,
      });
    }
  };
  buildPackets(Math.round(150 * density));

  const dust = [];
  for (let i = 0; i < Math.round(90 * density); i++)
    dust.push({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00035,
      vy: (Math.random() - 0.5) * 0.00025,
      a: 0.1 + Math.random() * 0.25,
    });

  const resize = () => {
    const r = cv.getBoundingClientRect();
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(cv);
  cleanup.push(() => ro.disconnect());

  const pt = (pk, t) => {
    const a = peers[pk.p],
      b = target;
    const mx = (a[0] + b[0]) / 2,
      my = (a[1] + b[1]) / 2;
    const dx = b[0] - a[0],
      dy = b[1] - a[1];
    const cx = mx - dy * pk.o,
      cy = my + dx * pk.o;
    const u = 1 - t;
    return [(u * u * a[0] + 2 * u * t * cx + t * t * b[0]) * W, (u * u * a[1] + 2 * u * t * cy + t * t * b[1]) * H];
  };

  const alpha = (a) => {
    ctx.globalAlpha = a;
    return col.accent;
  };

  let fill = 0;
  const draw = () => {
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = col.dim;
    for (const d of dust) {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0) d.x = 1;
      if (d.x > 1) d.x = 0;
      if (d.y < 0) d.y = 1;
      if (d.y > 1) d.y = 0;
      ctx.globalAlpha = d.a * 0.5;
      ctx.fillRect(d.x * W, d.y * H, 1.2, 1.2);
    }
    ctx.globalAlpha = 1;

    ctx.lineWidth = 1;
    ctx.strokeStyle = col.line;
    ctx.globalAlpha = 0.55;
    for (let i = 0; i < peers.length; i++) {
      const fake = { p: i, o: 0.18 };
      ctx.beginPath();
      const s = pt(fake, 0);
      ctx.moveTo(s[0], s[1]);
      for (let t = 0.1; t <= 1.001; t += 0.1) {
        const q = pt(fake, t);
        ctx.lineTo(q[0], q[1]);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    for (const pk of packets) {
      pk.t += pk.v;
      if (pk.t >= 1) {
        pk.t = 0;
        pk.o = (Math.random() - 0.5) * 0.42;
        pk.p = (Math.random() * peers.length) | 0;
        fill = Math.min(1, fill + 0.004);
      }
      const a = pt(pk, pk.t);
      const b = pt(pk, Math.max(0, pk.t - pk.len));
      const fade = pk.t > 0.86 ? Math.max(0, (1 - pk.t) / 0.14) : 1;
      ctx.strokeStyle = alpha((0.1 + pk.t * 0.55) * fade);
      ctx.lineWidth = pk.w;
      ctx.beginPath();
      ctx.moveTo(b[0], b[1]);
      ctx.lineTo(a[0], a[1]);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = col.dim;
    for (let i = 0; i < peers.length; i++) {
      const p = peers[i];
      ctx.globalAlpha = 0.65;
      ctx.fillRect(p[0] * W - 2, p[1] * H - 2, 4, 4);
    }
    ctx.globalAlpha = 1;

    const tx = target[0] * W,
      ty = target[1] * H,
      s = 26;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(tx, ty, s * 0.92, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = alpha(0.55);
    ctx.lineWidth = 1;
    ctx.strokeRect(tx - s / 2, ty - s / 2, s, s);
    ctx.fillStyle = alpha(0.3);
    const h = s * (0.25 + fill * 0.7);
    ctx.fillRect(tx - s / 2, ty + s / 2 - h, s, h);
    ctx.globalAlpha = 1;
    if (fill >= 1) fill = 0.05;
  };

  let last = 0,
    frames = 0,
    acc = 0,
    checked = false,
    running = true,
    raf = null;
  const loop = (ts) => {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    const dt = ts - last;
    if (dt < 1000 / cap) return;
    last = ts;
    if (!checked) {
      acc += dt;
      frames++;
      if (frames === 60) {
        checked = true;
        if (acc / frames > 26) {
          buildPackets(Math.round(70 * density));
          cap = 30;
        }
      }
    }
    draw();
  };

  if (reduced) {
    draw();
    return;
  }

  const io = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        if (e.isIntersecting && !running) {
          running = true;
          last = 0;
          raf = requestAnimationFrame(loop);
        } else if (!e.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      });
    },
    { threshold: 0 },
  );
  io.observe(cv);
  cleanup.push(() => {
    running = false;
    cancelAnimationFrame(raf);
    io.disconnect();
  });
  raf = requestAnimationFrame(loop);
}

function startPieces() {
  const cv = $('pieceCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  const COLS = 52,
    ROWS = 6,
    TOTAL = COLS * ROWS;
  const state = new Uint8Array(TOTAL);
  let done = 0;
  const pieceCount = $('pieceCount');
  const paint = () => {
    const r = cv.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(r.width * dpr);
    cv.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cw = r.width / COLS,
      ch = r.height / ROWS;
    for (let i = 0; i < TOTAL; i++) {
      const x = (i % COLS) * cw,
        y = ((i / COLS) | 0) * ch;
      ctx.fillStyle = state[i] === 2 ? col.accent : state[i] === 1 ? col.dim : col.line;
      ctx.globalAlpha = state[i] === 2 ? 0.9 : 1;
      ctx.fillRect(x, y, Math.max(1, cw - 1.2), Math.max(1, ch - 1.2));
    }
    ctx.globalAlpha = 1;
  };
  for (let i = 0; i < TOTAL * 0.34; i++) state[(Math.random() * TOTAL) | 0] = 2;
  done = state.reduce((a, b) => a + (b === 2 ? 1 : 0), 0);
  paint();
  if (pieceCount) pieceCount.textContent = Math.round((done / TOTAL) * 2048) + ' / 2048';
  if (reduced) return;
  const tick = () => {
    for (let k = 0; k < 3; k++) {
      const i = (Math.random() * TOTAL) | 0;
      if (state[i] === 0) {
        state[i] = Math.random() < 0.6 ? 2 : 1;
        if (state[i] === 2) done++;
      } else if (state[i] === 1) {
        state[i] = 2;
        done++;
      }
    }
    if (done > TOTAL * 0.92) {
      state.fill(0);
      done = 0;
      for (let i = 0; i < TOTAL * 0.2; i++) {
        const j = (Math.random() * TOTAL) | 0;
        if (!state[j]) {
          state[j] = 2;
          done++;
        }
      }
    }
    paint();
    if (pieceCount) pieceCount.textContent = Math.round((done / TOTAL) * 2048) + ' / 2048';
  };
  const id = setInterval(tick, 460);
  cleanup.push(() => clearInterval(id));
}

function startReadout() {
  let dn = 11.8,
    eta = 372,
    peers = 47,
    t = 0;
  const dnVal = $('dnVal'),
    upVal = $('upVal'),
    peerVal = $('peerVal'),
    upTime = $('upTime');
  const set = (el, v) => {
    if (el) el.textContent = v;
  };
  const tick = () => {
    t += 1;
    dn = Math.max(4, Math.min(41, dn + (Math.random() - 0.46) * 2.6));
    eta = eta > 20 ? eta - 1 - ((Math.random() * 2) | 0) : 600 + ((Math.random() * 120) | 0);
    if (Math.random() < 0.4) peers = Math.max(18, Math.min(212, peers + ((Math.random() * 7) | 0) - 3));
    set(dnVal, dn.toFixed(1));
    set(upVal, ((eta / 60) | 0) + ':' + String(eta % 60).padStart(2, '0'));
    set(peerVal, String(peers));
    const hh = String((t / 3600) | 0).padStart(2, '0');
    const mm = String(((t / 60) | 0) % 60).padStart(2, '0');
    const ss = String(t % 60).padStart(2, '0');
    set(upTime, hh + ':' + mm + ':' + ss);
  };
  tick();
  if (reduced) return;
  const id = setInterval(tick, 1000);
  cleanup.push(() => clearInterval(id));
}

function startReveal() {
  const nodes = Array.from(document.querySelectorAll('[data-anim]'));
  if (reduced) {
    nodes.forEach((n) => {
      n.style.animation = 'none';
      n.style.strokeDashoffset = '0';
      n.style.opacity = '1';
      n.style.transform = 'none';
    });
    return;
  }
  const io = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.animationPlayState = 'running';
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.25 },
  );
  nodes.forEach((n) => io.observe(n));
  cleanup.push(() => io.disconnect());
}

function startGallery() {
  const g = $('gallery'),
    bar = $('galBar'),
    idx = $('galIdx');
  if (!g || !bar) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    const max = g.scrollWidth - g.clientWidth;
    const p = max > 0 ? g.scrollLeft / max : 0;
    bar.style.transform = 'scaleX(' + (0.14 + p * 0.86).toFixed(4) + ')';
    if (idx) {
      const n = Math.min(3, Math.max(1, Math.round(p * 2) + 1));
      idx.textContent = '0' + n + '/03';
    }
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  g.addEventListener('scroll', onScroll, { passive: true });
  update();
  cleanup.push(() => g.removeEventListener('scroll', onScroll));
}

const RELEASES_BASE = 'https://github.com/najmiter/zorrent-releases/releases/latest/download';
const DOWNLOADS = {
  macos: {
    href: RELEASES_BASE + '/Zorrent.dmg',
    label: 'Download for macOS',
    navLabel: 'Download for macOS',
    size: '2.6 MB',
  },
  windows: {
    href: RELEASES_BASE + '/ZorrentSetup.exe',
    label: 'Download for Windows',
    navLabel: 'Download for Windows',
    size: '0.9 MB',
  },
};

function detectOS() {
  const uaData = navigator.userAgentData;
  const platform = (uaData && uaData.platform) || navigator.platform || '';
  const ua = navigator.userAgent || '';
  if (/win/i.test(platform) || /windows/i.test(ua)) return 'windows';
  if (/mac/i.test(platform) || /macintosh|mac os x/i.test(ua)) return 'macos';
  if (/linux/i.test(platform) || /linux|android/i.test(ua)) return 'linux';
  return null;
}

function initDownloadButtons() {
  const os = detectOS();
  const asset = DOWNLOADS[os];

  const navBtn = $('navDownloadBtn'),
    navLabel = $('navDownloadLabel');
  const heroBtn = $('heroDownloadBtn'),
    heroLabel = $('heroDownloadLabel'),
    heroSize = $('heroDownloadSize');

  if (!asset) {
    if (navBtn) navBtn.setAttribute('href', '#install');
    if (navLabel) navLabel.textContent = 'Download';
    if (heroBtn) heroBtn.setAttribute('href', '#install');
    if (heroLabel) heroLabel.textContent = 'See downloads';
    if (heroSize) heroSize.textContent = os === 'linux' ? 'planned' : '';
    return;
  }

  if (navBtn) navBtn.setAttribute('href', asset.href);
  if (navLabel) navLabel.textContent = asset.navLabel;
  if (heroBtn) heroBtn.setAttribute('href', asset.href);
  if (heroLabel) heroLabel.textContent = asset.label;
  if (heroSize) heroSize.textContent = asset.size;
}

function init() {
  readColors();
  initHover();
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  responsive();
  initDownloadButtons();
  startHero();
  startPieces();
  startReadout();
  startReveal();
  startGallery();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

window.addEventListener('beforeunload', () =>
  cleanup.forEach((f) => {
    try {
      f();
    } catch (e) {}
  }),
);

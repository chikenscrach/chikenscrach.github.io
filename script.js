// =============================================
//  script.js — Interactive Enhancements
// =============================================

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initGreeting();
  initTypingEffect();

  if (!reducedMotion) {
    initSakura();
    initCardTilt();
    initStaggerAnimation();
  }

  initKonamiCode();
});

// ── 1. Dynamic Greeting ─────────────────────
function initGreeting() {
  const el = document.getElementById('greeting');
  const h = new Date().getHours();
  let g;

  if      (h >= 5  && h < 12) g = 'Good Morning ☀️';
  else if (h >= 12 && h < 17) g = 'Good Afternoon 🌤️';
  else if (h >= 17 && h < 21) g = 'Good Evening 🌆';
  else                        g = 'Good Night 🌙';

  el.textContent = `${g}  I'm csg`;
}

// ── 2. Typing Effect ────────────────────────
function initTypingEffect() {
  const el    = document.getElementById('subtitle');
  const full  = el.textContent;          // grab original text
  el.textContent = '';                   // clear

  // Split into grapheme clusters (handles emoji)
  let chars;
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const seg = new Intl.Segmenter('en', { granularity: 'grapheme' });
    chars = [...seg.segment(full)].map(s => s.segment);
  } else {
    chars = Array.from(full);
  }

  // Create text node + blinking cursor
  const textNode = document.createTextNode('');
  const cursor   = document.createElement('span');
  cursor.className = 'cursor-blink';
  cursor.textContent = '|';
  el.appendChild(textNode);
  el.appendChild(cursor);

  let i = 0;
  function type() {
    if (i < chars.length) {
      textNode.textContent += chars[i++];
      setTimeout(type, 45 + Math.random() * 55);
    } else {
      // Fade out cursor after typing finishes
      setTimeout(() => {
        cursor.style.transition = 'opacity 0.6s';
        cursor.style.opacity = '0';
        setTimeout(() => cursor.remove(), 600);
      }, 1500);
    }
  }

  // Start after entrance animation settles
  setTimeout(type, 900);
}

// ── 3. Sakura Petals (Canvas) ───────────────
function initSakura() {
  const canvas = document.getElementById('sakura');
  const ctx    = canvas.getContext('2d');
  const COUNT  = 35;
  const petals = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // ---- Petal Class ----
  class Petal {
    constructor(randomY) {
      this.reset(randomY);
    }

    reset(randomY = false) {
      this.x        = Math.random() * canvas.width;
      this.y        = randomY ? Math.random() * canvas.height : -20;
      this.size     = Math.random() * 7 + 4;
      this.vy       = Math.random() * 1.1 + 0.4;          // fall speed
      this.vx       = Math.random() * 0.6 - 0.3;          // drift
      this.rot      = Math.random() * Math.PI * 2;
      this.rotSpd   = (Math.random() - 0.5) * 0.04;
      this.alpha    = Math.random() * 0.45 + 0.2;
      this.wobble   = Math.random() * Math.PI * 2;
      this.wobbleSpd = Math.random() * 0.025 + 0.01;
    }

    update() {
      this.wobble += this.wobbleSpd;
      this.x      += this.vx + Math.sin(this.wobble) * 0.4;
      this.y      += this.vy;
      this.rot    += this.rotSpd;

      if (this.y > canvas.height + 30) this.reset();
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle   = '#ffb7c5';

      // Petal shape (two bezier curves)
      const s = this.size;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo( s * 0.4, -s * 0.8,  s,     -s * 0.55, 0, s);
      ctx.bezierCurveTo(-s,       -s * 0.55, -s * 0.4, -s * 0.8, 0, 0);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < COUNT; i++) petals.push(new Petal(true));

  (function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of petals) { p.update(); p.draw(); }
    requestAnimationFrame(loop);
  })();
}

// ── 4. 3D Card Tilt ─────────────────────────
function initCardTilt() {
  if ('ontouchstart' in window) return;       // skip on touch devices

  const card = document.getElementById('card');

  card.addEventListener('mousemove', (e) => {
    const r  = card.getBoundingClientRect();
    const cx = r.width  / 2;
    const cy = r.height / 2;
    const x  = e.clientX - r.left - cx;       // offset from center
    const y  = e.clientY - r.top  - cy;

    const rotX = (y / cy) * -5;               // max ±5°
    const rotY = (x / cx) *  5;

    card.style.transform =
      `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform =
      'perspective(800px) rotateX(0) rotateY(0)';
  });
}

// ── 5. Staggered Entrance Animation ─────────
function initStaggerAnimation() {
  const items = document.querySelectorAll('.content > *');

  items.forEach((item, i) => {
    const delay = i * 80;
    item.style.setProperty('--delay', `${delay}ms`);
    item.classList.add('stagger-in');

    // Remove animation class once complete so :hover transforms work
    setTimeout(() => {
      item.classList.remove('stagger-in');
      item.style.removeProperty('--delay');
    }, delay + 600);
  });
}

// ── 6. Konami Code Easter Egg ───────────────
function initKonamiCode() {
  const CODE = [
    'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
    'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
    'b','a'
  ];
  let idx = 0;
  let activated = false;

  // Keyboard (desktop)
  document.addEventListener('keydown', (e) => {
    if (activated) return;
    idx = (e.key === CODE[idx]) ? idx + 1 : 0;
    if (idx === CODE.length) { activated = true; trigger(); }
  });

  // Tap hint 7 times (mobile friendly)
  const hint = document.getElementById('hint');
  let taps = 0, tapTimer;
  hint.addEventListener('click', () => {
    if (activated) return;
    taps++;
    clearTimeout(tapTimer);
    if (taps >= 7) { activated = true; trigger(); taps = 0; }
    tapTimer = setTimeout(() => taps = 0, 2500);
  });

  function trigger() {
    showToast('🎉 Secret Unlocked! 🎉');
    spawnConfetti();

    // Rainbow avatar ring
    const ring = document.querySelector('.avatar-wrapper');
    ring.classList.add('rainbow-mode');
    setTimeout(() => ring.classList.remove('rainbow-mode'), 6000);

    // Fun title swap
    const orig = document.title;
    document.title = '🎮 You found the secret! 🎮';
    setTimeout(() => (document.title = orig), 6000);
  }
}

// ── Utilities ───────────────────────────────

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.classList.remove('show'), 3200);
}

function spawnConfetti() {
  const COLORS = [
    '#ff0000','#ff8800','#ffff00','#00ff00',
    '#00aaff','#ff00ff','#ff69b4','#ffd700'
  ];

  for (let i = 0; i < 150; i++) {
    const c  = document.createElement('div');
    c.className = 'confetti';

    c.style.backgroundColor   = COLORS[Math.random() * COLORS.length | 0];
    c.style.left              = `${Math.random() * 100}vw`;
    c.style.width             = `${Math.random() * 8 + 4}px`;
    c.style.height            = `${Math.random() * 12 + 4}px`;
    c.style.animationDuration = `${Math.random() * 1.8 + 1.5}s`;
    c.style.animationDelay    = `${Math.random() * 0.7}s`;
    c.style.setProperty('--drift', `${(Math.random() - 0.5) * 220}px`);

    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4200);
  }
}
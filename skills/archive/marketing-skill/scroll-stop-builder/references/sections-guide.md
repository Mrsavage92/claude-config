# Scroll-Stop Builder — Sections Implementation Guide

## Site Architecture

```
index.html (self-contained)
frames/
  frame00001.jpg
  frame00002.jpg
  ... (up to N frames)
```

## Section 1: Loader

Full-screen overlay shown while first 30 frames preload.

```html
<div id="loader">
  <h1 class="product-name">[PRODUCT NAME]</h1>
  <div class="loader-bar">
    <div class="loader-fill" id="loaderFill"></div>
  </div>
  <p class="loader-label">Loading experience...</p>
</div>
```

CSS: `position: fixed; inset: 0; z-index: 1000; background: [BG_COLOR]`
Transition: fade out with `opacity: 0; pointer-events: none` after frames load.

## Section 2: Navbar

Starts as transparent floating pill. Transforms to solid bar on scroll > 80px.

```html
<nav id="navbar">
  <div class="nav-logo">[PRODUCT NAME]</div>
  <div class="nav-links">
    <a href="#specs">Specs</a>
    <a href="#cta" class="nav-cta">Get Started</a>
  </div>
</nav>
```

States:
- Default: `background: transparent; border-radius: 100px; margin: 16px auto`
- Scrolled: `background: rgba(0,0,0,0.85); backdrop-filter: blur(20px); border-radius: 0`

## Section 3: Video Canvas (Scroll Driver)

Two-part structure:
1. Fixed canvas: renders frames, stays in viewport
2. Scroll driver: tall empty div that creates scroll distance

```html
<canvas id="videoCanvas"></canvas>
<div id="scrollDriver"></div>  <!-- height = TOTAL_FRAMES * 4 px -->
```

Canvas sizing:
```javascript
function resizeCanvas() {
  const aspect = videoWidth / videoHeight; // from first frame
  if (window.innerWidth / window.innerHeight > aspect) {
    canvas.height = window.innerHeight;
    canvas.width = window.innerHeight * aspect;
  } else {
    canvas.width = window.innerWidth;
    canvas.height = window.innerWidth / aspect;
  }
  canvas.style.left = (window.innerWidth - canvas.width) / 2 + 'px';
  canvas.style.top = (window.innerHeight - canvas.height) / 2 + 'px';
}
```

## Section 4: Annotation Beats

Generate 3-5 beats based on video thirds. Position alternates left/right.

Default beat positions for N frames:
- Beat 1: frame Math.floor(N * 0.2) — "Opening claim"
- Beat 2: frame Math.floor(N * 0.4) — "Key feature"
- Beat 3: frame Math.floor(N * 0.6) — "Proof point"
- Beat 4: frame Math.floor(N * 0.8) — "Final value prop"

Visibility: show when currentFrame is within ±(N/8) of beat frame.

## Section 5: Starscape

Behind everything (z-index: -1). Canvas fills viewport.

```javascript
const stars = Array.from({length: 150}, () => ({
  x: Math.random() * W, y: Math.random() * H,
  r: Math.random() * 1.2 + 0.3,
  speed: Math.random() * 0.12 + 0.04,
  opacity: Math.random() * 0.5 + 0.15
}));

function drawStars() {
  starCtx.clearRect(0, 0, W, H);
  stars.forEach(s => {
    starCtx.beginPath();
    starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    starCtx.fillStyle = `rgba(255,255,255,${s.opacity})`;
    starCtx.fill();
    s.y -= s.speed;
    if (s.y < -2) { s.y = H + 2; s.x = Math.random() * W; }
  });
  requestAnimationFrame(drawStars);
}
```

## Section 6: Specs Grid

Normal page flow, appears below the scroll driver.

```html
<section id="specs">
  <h2>Why [PRODUCT]</h2>
  <div class="specs-grid">
    <div class="spec-card">
      <div class="spec-value" data-target="[NUMBER]">0</div>
      <div class="spec-label">[LABEL]</div>
    </div>
    <!-- repeat 3-4 times -->
  </div>
</section>
```

Count-up triggered by IntersectionObserver. Duration: 1500ms ease-out.

## Section 7: CTA Section

```html
<section id="cta">
  <h2>[HERO HEADLINE]</h2>
  <p>[SUBHEADLINE]</p>
  <a href="#" class="cta-button">Get Started →</a>
</section>
```

Background: slightly lighter than main bg. Centered text. Generous padding.

## Section 8: Footer

Minimal. Product name, copyright, optional nav links.

## Snap-Stop Scroll (Desktop Only)

Only enable if user requests. Guard with velocity check:

```javascript
let snapEnabled = true;
let lastScrollTime = 0;

window.addEventListener('scroll', () => {
  const now = Date.now();
  const velocity = Math.abs(window.scrollY - lastScrollY) / (now - lastScrollTime);

  // Don't snap if scrolling fast (user is swiping past)
  if (velocity < 0.5 && snapEnabled) {
    // Snap to nearest beat frame
    const nearestBeat = findNearestBeat(currentFrame);
    if (nearestBeat && Math.abs(nearestBeat.frame - currentFrame) < SNAP_THRESHOLD) {
      window.scrollTo({top: nearestBeat.scrollY, behavior: 'smooth'});
    }
  }

  lastScrollTime = now;
  lastScrollY = window.scrollY;
}, { passive: true });
```

Add `scrollbar-gutter: stable` to body to prevent layout shift on snap.

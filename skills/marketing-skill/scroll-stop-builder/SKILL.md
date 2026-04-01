---
Name: scroll-stop-builder
Description: Takes a video file and builds a production-quality Apple-style scroll-driven website where video playback is controlled by scroll position, with lerp smoothing, starscape, annotation overlays, and full mobile responsiveness.
Category: marketing-skill
Tier: 2
Author: Claude Skills
Version: 1.0.0
Dependencies: ["ffmpeg"]
Trigger: "scroll-stop build", "scroll animation website", "video on scroll", "Apple-style scroll animation", "scrollytelling"
---

# Scroll-Stop Builder

## Description

Takes a product video and builds a production-ready website where video playback is controlled by scroll position — the Apple product page experience. Features:

- FFmpeg frame extraction at optimal quality
- Canvas rendering with lerp (linear interpolation) smoothing — no choppy scroll
- Animated starscape background matching video background colour
- Annotation overlays in "beats" mode (text callouts that appear at specific scroll points)
- Specs section with count-up animation
- Navbar that transforms from transparent pill to solid bar on scroll
- Loader screen with progress bar
- Full mobile responsiveness
- `prefers-reduced-motion` accessibility support throughout

## Features

- Scroll-linked video playback (every scroll pixel = video frame advance)
- Lerp smoothing prevents jarring jumps between frames
- Beats annotation mode (cleaner than snap-stop)
- Background colour matching between video and site
- Snap-stop scroll fixed (scrollbar-gutter, velocity check, motion preference)
- 9:16 default for social, 16:9 for web

## Dependencies

Requires `ffmpeg` installed locally:
```bash
brew install ffmpeg   # macOS
```

## Usage

Trigger with: "scroll-stop build", "scroll animation website", "video on scroll", "Apple-style scroll animation", or "scrollytelling"

I will ask 3 quick questions:
1. What is the video file path?
2. What is the product name and one-line hero headline?
3. What background colour dominates the video? (hex or description — I'll extract it if unsure)

Then I build the complete website.

## Examples

```
User: scroll-stop build my product video
Claude: [asks 3 questions, builds complete scroll-driven website]

User: Apple-style scroll animation for launch.mp4
Claude: [asks 3 questions, extracts frames, outputs production site]
```

## Workflow

### Step 1 — Gather Info

Ask these 3 questions:
1. **Video path**: Where is the video file? (full path or relative)
2. **Product**: Name + one-line hero headline (e.g. "AuraGlow — The serum that works while you sleep")
3. **Background colour**: What's the dominant background colour in the video? (hex preferred, e.g. #0a0a0f — or describe it and I'll infer)

Optional defaults (do not ask unless user volunteers):
- Frame quality: 90% JPEG (default)
- Frames directory: `./frames/` (default)
- Annotation beats: auto-generated based on video duration

### Step 2 — Extract Frames

Generate the FFmpeg command to extract frames:

```bash
# Create frames directory
mkdir -p frames

# Extract frames at video's native framerate, max quality
ffmpeg -i "VIDEO_PATH" -q:v 2 -f image2 "frames/frame%05d.jpg"

# Count frames extracted
ls frames/ | wc -l
```

Instruct user to run this command and report back the frame count. Then continue with that count.

### Step 3 — Generate Website

Output a complete, self-contained HTML file. The site must contain:

**Frame Loading System**:
```javascript
const TOTAL_FRAMES = [FRAME_COUNT]; // from ffmpeg output
const FRAMES_DIR = './frames/';
const PRELOAD_AHEAD = 15; // frames to preload ahead of current

let frameCache = {};
let currentFrame = 1;
let targetFrame = 1;

function preloadFrames(start, count) {
  for (let i = start; i < Math.min(start + count, TOTAL_FRAMES); i++) {
    if (!frameCache[i]) {
      const img = new Image();
      img.src = `${FRAMES_DIR}frame${String(i).padStart(5,'0')}.jpg`;
      frameCache[i] = img;
    }
  }
}
```

**Lerp Scroll Animation**:
```javascript
let lerpTarget = 0;
let lerpCurrent = 0;
const LERP_FACTOR = 0.08; // smoothing — lower = smoother but laggier

function lerp(current, target, factor) {
  return current + (target - current) * factor;
}

function onScroll() {
  const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  lerpTarget = Math.floor(scrollProgress * (TOTAL_FRAMES - 1)) + 1;
}

function animate() {
  lerpCurrent = lerp(lerpCurrent, lerpTarget, LERP_FACTOR);
  const frame = Math.round(lerpCurrent);

  if (frame !== currentFrame && frameCache[frame]) {
    ctx.drawImage(frameCache[frame], 0, 0, canvas.width, canvas.height);
    currentFrame = frame;
    preloadFrames(frame, PRELOAD_AHEAD);
    updateAnnotations(frame);
  }
  requestAnimationFrame(animate);
}
```

**Starscape Background** (canvas, behind video canvas):
```javascript
function initStarscape() {
  const stars = Array.from({length: 150}, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 1.5 + 0.3,
    speed: Math.random() * 0.15 + 0.05,
    opacity: Math.random() * 0.6 + 0.2
  }));
  // Render and drift stars each frame
}
```

**Annotation Beats System**:
Auto-generate 3-5 annotation beats evenly distributed across the video. Each beat has:
- `frame`: frame number to appear at
- `title`: short product claim (2-4 words)
- `body`: supporting detail (1 sentence)
- `position`: 'left' | 'right' (alternate)

CSS for beats:
```css
.annotation {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  max-width: 280px;
  opacity: 0;
  transition: opacity 0.4s ease, transform 0.4s ease;
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 16px;
  padding: 20px 24px;
}
.annotation.visible { opacity: 1; }
.annotation.left { left: 40px; }
.annotation.right { right: 40px; }
```

**Navbar Pill Transform**:
```javascript
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  if (window.scrollY > 80) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});
```
CSS: start as transparent pill, transition to `background: rgba(0,0,0,0.8); backdrop-filter: blur(20px);`

**Specs Section** (below scroll area, normal page flow):
- 3-4 key product specs in a grid
- Count-up animation triggered by IntersectionObserver
- Glass-morphism cards matching video background colour

**Loader**:
```javascript
window.addEventListener('load', () => {
  // Preload first 30 frames
  preloadFrames(1, 30);
  // Track preload progress
  let loaded = 0;
  // Remove loader when first 30 frames cached
});
```
Loader design: full-screen overlay, product name, progress bar in accent colour.

**Scroll Container**:
- Video canvas: fixed, 100vw × 100vh (or appropriate aspect ratio)
- Scroll driver div: `height: [TOTAL_FRAMES * 4]px` (4px per frame = smooth but not endless)
- Page sections stack below the scroll driver

**Accessibility**:
```css
@media (prefers-reduced-motion: reduce) {
  .annotation { transition: none; }
  /* Pause lerp animation, show static middle frame */
}
```

**Mobile**:
- Canvas scales to fill viewport maintaining aspect ratio
- Annotations move to bottom overlay on mobile (< 768px)
- Touch scroll works natively (no scroll hijacking)
- Snap-stop: use `scroll-snap-type` only on desktop, with velocity guard:
```javascript
let lastScrollY = 0;
let scrollVelocity = 0;
window.addEventListener('scroll', () => {
  scrollVelocity = Math.abs(window.scrollY - lastScrollY);
  lastScrollY = window.scrollY;
});
```

**Design tokens** (inferred from background colour):
- Background: use the colour the user provided
- Text: white (#ffffff) or near-white
- Accent: complementary colour (auto-derive or ask)
- Font: Space Grotesk headings, Inter body (Google Fonts CDN)

### Step 4 — Deliver

Output path:
- Cloud: `/mnt/user-data/outputs/scroll-site-[product-name]/index.html`
- Local: `./scroll-site-[product-name]/index.html`

Also output:
1. The complete HTML as a code block
2. Setup instructions:
   - Run the ffmpeg command
   - Place `index.html` next to the `frames/` directory
   - Open with `python3 -m http.server 8080` (file:// won't load local images)
   - Navigate to `http://localhost:8080`

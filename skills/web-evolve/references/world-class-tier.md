# World-Class Tier Spec — Awwwards SOTD/SOTM quality gate

This file is the contract for `target_score ≥ 98`. When `--world-class` is set, every rule below is non-negotiable. The orchestrator reads this file in Phase R and enforces it via synthetic `WC1–WC10` checks injected into the priority queue.

**Source research:** Awwwards 2026 SOTM winners (Oryzo AI, Renaissance Edition, Bruno Simon portfolio), Awwwards evaluation system, Godly.website curation criteria, FWA SOTD, current GSAP/Lenis/R3F stack as of May 2026.

---

## Awwwards-aligned scoring (replaces flat 0–100)

Awwwards uses 4 weighted dimensions on a 10-point scale:

| Dimension | Weight | Checklist categories that feed it |
|---|---|---|
| **Design** | 40% | A (anti-slop), C (consistency), D (motion), K (layout/section differentiation) |
| **Usability** | 30% | F (mobile/responsive), G (Core Web Vitals + perf), I (consistency), a11y findings |
| **Creativity** | 20% | Benchmark gap delta + /critique creativity score + WC-series synthetic checks |
| **Content** | 10% | J (copy quality) + SEO findings |

**Tier gates** (averaged 10-point score):

| Avg score | Tier label | Per-dimension minima |
|---|---|---|
| ≥ 6.5 | Honorable Mention candidate | Design ≥ 6.5, Usability ≥ 7, Creativity ≥ 6, Content ≥ 6 |
| ≥ 8.0 | **Site of the Day candidate** | Design ≥ 8.0, Usability ≥ 7.5, Creativity ≥ 7.5, Content ≥ 7.0 |
| ≥ 8.5 | **Site of the Month candidate** | Design ≥ 8.5, Usability ≥ 8.0, Creativity ≥ 9.0, Content ≥ 7.5 |
| ≥ 9.0 | **Best in World (Awwwards SOTY)** | Design ≥ 9.0, Usability ≥ 8.5, Creativity ≥ 9.5, Content ≥ 8.0 |

**Mapping legacy `target_score` to Awwwards tiers:**
- 90 = premium SaaS (not Awwwards-eligible — `target_score` is the legacy flat scale)
- 95 = Stripe/Linear quality (HM-tier on Awwwards scale)
- **98 = SOTD candidate** (default for `--world-class`)
- **100 = SOTM candidate** (default for `--world-class --target=100`)

**Computed in orchestrator** (`world_class_score`):
```
design       = weighted(A=3, C=2, D=4, K=3) -> 0..10 scale
usability    = weighted(F=3, G=3, I=2, a11y=4) -> 0..10
creativity   = benchmark_gap_closure_pct * 5 + critique_creativity * 5 -> 0..10
content      = weighted(J=3, seo=2) -> 0..10
awwwards_avg = design*0.4 + usability*0.3 + creativity*0.2 + content*0.1
```

Loop exits only when all four per-dimension minima are met AND `awwwards_avg ≥ target`.

---

## The world-class motion stack (mandatory at target ≥ 98)

| Layer | Library | Why mandatory | Install |
|---|---|---|---|
| Smooth scroll | **`lenis`** | Industry standard 2026. Locomotive is deprecated. 2.13kb. | `npm i lenis` |
| Scroll choreography | **`gsap` + ScrollTrigger** | All Awwwards SOTM 2026 winners use it. Free post-Webflow acquisition (Apr 2024). | `npm i gsap` |
| Type animation | **`gsap` SplitText** | Free as of GSAP 3.13. Kinetic typography is a creativity-axis multiplier. | included in gsap |
| Layout transitions | **`gsap` Flip** | Free. Used for view-state transitions inside SPAs. | included in gsap |
| Vector morph | **`gsap` MorphSVG** | Free. For logo/icon morph signatures. | included in gsap |
| 3D / WebGL hero | **`@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing`** | When the hero technique is 3D scene (one of three world-class hero options). | `npm i three @react-three/fiber @react-three/drei @react-three/postprocessing` |
| Interactive vector animation | **`@rive-app/react-canvas`** | 60fps vs Lottie's 17fps. 10–15× smaller files. State machines beat Lottie's playback model. Use when >1 stateful animation. | `npm i @rive-app/react-canvas` |
| Designer-icon animation | `lottie-react` | Use only for designer-authored single-state icons. Otherwise prefer Rive. | `npm i lottie-react` |
| Route transitions | **View Transitions API** | Baseline same-doc (Chrome 111+, Safari 18+, Firefox 144+). Progressive enhancement. | native |

**Lenis configuration (when GSAP drives the ticker):**
```ts
import Lenis from 'lenis'
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

useEffect(() => {
  const lenis = new Lenis({ autoRaf: false, syncTouch: false })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  return () => { lenis.destroy(); gsap.ticker.remove(lenis.raf) }
}, [])
```
**Never use `@studio-freight/react-lenis`** — Studio Freight rebranded to Darkroom Engineering and that package is retired. Use `lenis/react` if you want the React wrapper.

---

## World-class hero options (pick exactly one — half-committed heroes fail this tier)

A hero earns a Creativity score ≥ 7.5 only if it commits to ONE of these three signatures:

**Option A — WebGL/3D scene (R3F + drei + postprocessing):**
- Real-time scene, not a baked image
- Camera moves on scroll OR cursor (parallax or orbit)
- Postprocessing pass: bloom + DOF OR chromatic aberration OR film grain
- Loading state: skeleton + load 3D after page interactive
- Hard performance gate: 60fps on M1 MacBook Air at 1440×900
- Reference: Bruno Simon portfolio (Awwwards SOTM Jan 2026)

**Option B — Scroll-driven narrative:**
- GSAP ScrollTrigger pinning hero for 2–4 viewports of scroll
- Content unfolds in choreographed beats (3–5 distinct beats)
- SplitText character reveals on each beat
- Real product UI shown in motion (not gradient blob)
- Reference: Apple iPad Pro launch page, Pitch.com homepage

**Option C — Kinetic typography signature:**
- One word/phrase as the primary visual element
- Variable font axis animation (weight, width, slant) on hover or scroll
- Custom SplitText choreography (chars, words, or lines)
- Backed by atmospheric grain texture OR subtle WebGL distortion
- Reference: Vercel homepage, Resend launch

**Anti-pattern (auto-FAIL):** centered headline + gradient blob + shadcn button. This is the AI-template hero and produces Awwwards score 4–5.

---

## Custom cursor & magnetic interactions (mandatory at target ≥ 98)

Cursor signature is one of the Creativity-axis differentiators. Implementations:

**Baseline (target 98):**
- Replace native cursor with a custom dot/ring follower
- Magnetic snap on `data-magnetic="true"` elements (CTA buttons, nav links)
- Hover-state morph (e.g., ring expands on hovering image/link)

**Stretch (target 100):**
- WebGL cursor trail (particle system reacting to velocity) — see Obys reference
- Lens distortion on image hover via GLSL fragment shader
- Cursor disappears on touch devices (replaced with intentional touch states, not stale hover styles)

Library: prefer Motion's `<Cursor>` primitive (motion.dev/docs/cursor) or hand-rolled with `lenis` velocity for smooth follow.

---

## View Transitions API (mandatory at target ≥ 98)

- Same-document transitions on every route change inside the SPA
- `viewTransitionName: '<unique-id>'` on shared elements (hero image → product image, logo, nav anchor)
- Reduced-motion query respected: skip transitions if `(prefers-reduced-motion: reduce)`
- Cross-document support enabled via meta tag for Chromium/WebKit:
  ```html
  <meta name="view-transition" content="same-origin">
  ```
- Firefox fallback: progressive enhancement, no transition fires — page still works

Reference: Astro view transitions docs, the View Transitions Chrome example gallery.

---

## Typography (mandatory at target ≥ 98)

Inter is fine for SaaS-tier. Awwwards-tier requires a real foundry choice:

| Path | Source | License | Notes |
|---|---|---|---|
| **Recommended free** | **Geist** (Vercel) | Free, OFL | Modern, opinionated, variable. Default for premium tech. |
| **Recommended free** | **JetBrains Mono** (paired) | Free, OFL | For code/data sections. |
| Free with care | Pangram Pangram (Pangram Sans, Editorial Old, Migra) | **FREE TO TRY ONLY** — NOT commercial. Watermark on commercial use. | Honor the license. Pay if shipping. |
| Premium paid | **Söhne** (Klim) | Commercial | Linear, Stripe, Vercel-tier use this family. |
| Premium paid | **Calibre** (Klim) | Commercial | Geometric warmth. |
| Premium paid | **GT America** (Grilli Type) | Commercial | Editorial-tech crossover. |

**At least one variable axis must be animated** (weight, width, slant, or optical size) on hover or scroll. Static type = creativity score ≤ 6.

---

## Color (mandatory at target ≥ 98)

- All colors in **OKLCH** (perceptual uniformity), not HSL/HEX
- Palette = 1 brand accent + 2 supporting neutrals + 1 surface, period
- **No shadcn defaults** — `slate`/`zinc`/`neutral` are the AI-template signature
- Dark mode is intentional, not inverted: separate token set with adjusted L axis values
- Contrast ratio AAA target (7:1) for body, AA (4.5:1) minimum for all other text
- One signature gradient acceptable; multiple gradients = creativity score penalty

---

## Sound design (optional bonus at target ≥ 100)

Site of the Month winners often include subtle UI sound:
- Button click feedback (≤ -25dB, ≤ 50ms)
- Hover whoosh on hero animations (≤ -30dB)
- Mute toggle in nav respected, persists in localStorage
- Sound disabled by default, opt-in toggle in header
- Library: Howler.js OR raw Web Audio API

Reference: Pitch.com homepage, Linear annotations.

---

## Performance gates (mandatory at target ≥ 98)

Measured via `chrome-devtools-mcp performance_start_trace` against deployed URL on mid-range device emulation (4× CPU slowdown, Slow 4G):

| Metric | Target 98 | Target 100 |
|---|---|---|
| LCP | < 2.0s | < 1.5s |
| INP | < 150ms | < 100ms |
| CLS | < 0.05 | < 0.01 |
| TBT | < 150ms | < 100ms |
| TTI | < 3.0s | < 2.5s |
| Lighthouse Performance | ≥ 90 | ≥ 95 |
| Lighthouse Accessibility | ≥ 95 | 100 |
| Lighthouse Best Practices | 100 | 100 |
| Lighthouse SEO | ≥ 95 | 100 |
| Total page weight (compressed) | < 1.5MB | < 1.0MB |
| Main thread blocking time | < 500ms | < 300ms |
| 3D scene FPS (if Option A hero) | ≥ 60fps M1 Air | ≥ 60fps M1 Air + ≥ 30fps mid-range Android |

These supersede the `G4/G5/G6` checklist values when `--world-class` is set. Source: real Chrome trace, not synthetic Lighthouse from a fast US datacenter.

---

## Mobile parity (mandatory at target ≥ 98)

Awwwards SOTD requires ≥ 70/100 mobile-friendly score. World-class tier exceeds this:

- Every section tested at 390×844 (iPhone 14 Pro) AND 360×640 (Galaxy S budget)
- Touch targets ≥ 48×48 (not 44 — that's the floor)
- Hover states replaced with explicit tap states — no stale `:hover` styles
- Mobile signature different from desktop where appropriate (carousel on mobile, grid on desktop is OK; gradient blob on mobile when desktop has 3D scene is NOT)
- Test on real device or BrowserStack — emulator alone is insufficient at this tier

---

## Synthetic WC-series checks (injected into priority queue when `--world-class`)

| ID | Check | Fix path |
|---|---|---|
| WC1 | One of {WebGL hero, scroll-narrative, kinetic-typography} present | `overdrive` + R3F or GSAP |
| WC2 | Lenis installed AND initialized at app root with `autoRaf:false` | Phase G install + `animate` |
| WC3 | GSAP + ScrollTrigger registered AND ≥ 1 ScrollTrigger pin active | Phase G + `animate` |
| WC4 | Custom cursor component present AND `data-magnetic` on primary CTAs | `web-component` + Motion `Cursor` |
| WC5 | View Transitions API used on at least one route boundary | `web-fix` + `edit_direct` |
| WC6 | Variable font from foundry (NOT default Inter from Google) | `typeset` |
| WC7 | OKLCH color tokens, no shadcn defaults (slate/zinc/neutral) | `colorize` |
| WC8 | Real product UI in hero (not gradient blob, not shadcn primitives) | `overdrive` + R3F or product video |
| WC9 | 60fps verified via chrome-devtools-mcp trace | `optimize` |
| WC10 | View Transitions respect `prefers-reduced-motion` | `web-fix` + `edit_direct` |

Each WC check gets `visual_bonus: 2500` in the sort key (higher than checklist 2000-tier), so they lead the queue once Phase R/G complete.

---

## Reference benchmark sources (Phase R fetches these)

| Source | URL | Why |
|---|---|---|
| Awwwards SOTM | `https://www.awwwards.com/inspiration_search/sites_of_the_month/` | Authoritative monthly winners |
| Awwwards SOTD | `https://www.awwwards.com/websites/sites_of_the_day/` | Daily best |
| Awwwards WebGL collection | `https://www.awwwards.com/websites/webgl/` | For Option A hero references |
| Godly.website | `https://godly.website/` | Curated by Wells Riley, narrow taste filter |
| FWA SOTD | `https://thefwa.com/cases/site-of-the-day` | More creative-agency-oriented |
| Land-book | `https://land-book.com/` | Landing-page-specific gallery |
| Mobbin (paid) | `https://mobbin.com/` | If user has a Mobbin subscription |

Phase R fetches the top 6 winners across these sources, screenshots each, extracts hero technique + motion library detected (via DOM probe for `gsap`/`lenis`/`three`/`rive` globals) + color palette + typography pair, then asks the user to pick 2–3 references.

---

## Anti-patterns at target ≥ 98 (auto-FAIL)

- Hero is centered headline + gradient blob + shadcn button
- Inter from Google Fonts as the only typeface
- shadcn defaults left in (`slate-500` `zinc-100` `neutral-200`)
- No smooth scroll OR native CSS `scroll-behavior: smooth` (Lenis required)
- Framer Motion as the ONLY motion library (it's fine for component state — GSAP must own scroll choreography)
- Lottie animations everywhere (Rive should handle stateful, Lottie only for designer icons)
- No reduced-motion handling — auto-fail accessibility minimum
- Mobile = "responsive squeeze of desktop" with stale hover states
- Generic stock photography (Unsplash hero image)
- AI-generated illustration that signals AI-generated (Midjourney hero with 6-finger hands etc.)

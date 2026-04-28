---
name: style-mirror
description: >
  Accurately mirrors the visual design language of a reference website onto the current project.
  Extracts exact values (colors, layout structure, typography, spacing, gradients) via screenshot +
  live CSS inspection, produces a diff, then applies every change systematically.
  Invoked when the user says "make it look like X", "mirror X", or "I want it to look like X".
tools: Read, Write, Edit, Bash, mcp__puppeteer__puppeteer_navigate, mcp__puppeteer__puppeteer_screenshot, mcp__puppeteer__puppeteer_evaluate, Glob, Grep
---

# Skill: /style-mirror

## Why this skill exists

"Make it look like X" fails catastrophically when the implementation:
- Only changes surface colors and ignores layout structure
- Uses prose descriptions instead of exact extracted values
- Skips typography weight and family differences
- Doesn't compare the reference's above-fold layout against the current site
- Reports done without verifying with a screenshot

This skill prevents that failure by making the process systematic and verifiable.

---

## Cardinal rules

1. **Extract before changing.** Never estimate colours from memory — always inspect the live site via Puppeteer.
2. **Layout is not optional.** If the reference is centered single-column and the current site is split-pane, that layout change is required. Colour changes alone do not make sites look alike.
3. **Typography is not optional.** Font family, weight, and size are as visible as colour. If the reference uses geometric sans bold and the current site uses a display serif, that must change.
4. **Produce a diff table first.** Never touch code until the diff is written and confirmed.
5. **Verify with screenshots.** After applying changes, screenshot both sites and compare element by element. If anything doesn't match, fix it before reporting done.
6. **Brand content stays.** Mirror the design language, not the content. Logos, product names, copy, and CTAs stay as the project's own.
7. **Tokens lock is mandatory.** The extracted spec MUST be written to `{project_path}/tokens.lock.json` (canonical, project root) AND `{project_path}/.style-mirror/tokens.lock.json` (archival). Build skills (web-page, web-scaffold, polish, web-component, web-review, web-fix), the impeccable Context Gathering Step 0, and the `tokens-lock-enforce.ps1` PreToolUse hook all check the project-root path. Without it, replication mode is not active and Design DNA defaults will override the mirror.
8. **Section-by-section, not page-at-once.** After applying changes for one section (hero, features, footer, etc.), screenshot just that section and diff against the reference's same section before moving on. Drift compounds — catch it at section boundaries, not at the end.

---

## Forbidden additions during mirror

When this skill is active (and whenever `tokens.lock.json` exists), the following Design DNA defaults are SUSPENDED. Do NOT add them unless the extracted tokens prove the reference uses them:

- **Gradient mesh backgrounds** — only if reference's hero has a multi-radial-gradient
- **Grain / noise textures** — only if reference applies SVG turbulence or noise overlay
- **Border glow / box-shadow ring** — only if reference uses it on cards/buttons
- **Glassmorphism / backdrop-blur** — only if reference's nav or modals use it
- **Grid-line backgrounds** — only if reference shows visible grid pattern
- **Animated gradient text / `background-clip: text`** — banned by impeccable, only if reference explicitly does it
- **Lucide icons** — if reference uses custom icon set or different family (Octicons, Heroicons, Phosphor, custom SVG), match it
- **Framer Motion entrance animations (fadeUp, stagger, scroll-triggered reveals)** — only if reference's IntersectionObserver / scroll listeners show them in computed JS
- **Hover scale `whileHover={{ scale: 1.02 }}`** — only if reference's `:hover` computed transform shows scale
- **Rounded corners larger than reference** — read `border-radius` from extracted tokens, do not "improve" it to a larger Tailwind default
- **shadcn/ui component substitution** — if reference uses bespoke buttons/cards/inputs, do NOT swap to shadcn primitives
- **Premium-website mandatory section list** — if reference does not have a "Logo Cloud → Stats → Testimonials → Pricing → FAQ" structure, do NOT add those sections
- **21st.dev component lock** — disabled during mirror. Use the reference's actual layout structure.
- **Awwwards-style "signature visual moments"** — restraint. The point is to look like the reference, not to look like a 2025 Awwwards finalist.

---

## Inputs

| Input | Required | Notes |
|---|---|---|
| `reference_url` | Yes | The site to mirror (e.g. `https://github.com`) |
| `project_path` | Yes | Absolute path to the current project |
| `brand_accent` | Optional | If set, keep this colour as the CTA accent instead of mirroring the reference's CTA colour |

---

## Step 1 — Screenshot the reference

Navigate to `reference_url` at 1440×900 viewport. Wait 4s for animations to settle.

Save screenshot to `{project_path}/.evolution/style-mirror/reference.png`.

If navigation fails: halt and report `REFERENCE_UNREACHABLE`.

---

## Step 2 — Extract the reference design system

### 2A — Visual analysis (from screenshot)

Looking at the screenshot, answer each question precisely:

**Above-fold layout:**
- Is the hero **centered** (text centered, product below or background) or **split-pane** (text left/right, visual opposite)?
- What elements appear above the fold? List in order: eyebrow / headline / subline / CTAs / product visual / social proof / etc.
- Where is the product visual? Options: beside text (split), below text (centered), full-background, not present
- How much whitespace is in the hero? Sparse (just headline + CTA) or dense (many elements)?

**Color palette (estimate from screenshot, confirm with CSS in Step 2B):**
- Hero background color
- Card/surface color (distinct from background?)
- Primary text color
- Secondary/muted text color
- Accent/CTA color
- Border color (visible on cards/inputs)
- Hero gradient or glow: direction, colors, opacity, positions

**Typography:**
- Heading font style: serif / geometric sans / humanist sans / monospace?
- Heading weight: thin / light / normal / semibold / bold / black (800+)?
- Heading size above fold: roughly what fraction of viewport height?
- Letter-spacing: tight / normal / wide?
- Body font: same family as heading or different?
- Any decorative or italic moments?

### 2B — Fetch actual CSS source files

Before running computed style inspection, fetch the actual CSS bundles loaded by the page:

```python
# During page load, capture all CSS file URLs
css_urls = []
page.on('response', lambda r: css_urls.append(r.url) if 'css' in r.url and r.status == 200 else None)
page.goto(reference_url)
page.wait_for_timeout(3000)
# css_urls now contains all stylesheet URLs
```

Fetch the main theme CSS (look for files named `dark`, `main`, `app`, or similar):
```python
import urllib.request
for url in css_urls[:8]:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as r:
        css = r.read().decode('utf-8')
    # Search for colour tokens, gradient definitions, typography
    # Focus on: background, gradient, color, font-family, font-weight
```

Also extract all active gradient elements in the hero viewport:
```js
(() => {
  const els = document.querySelectorAll("*");
  const results = [];
  for (const el of els) {
    const cs = getComputedStyle(el);
    const bg = cs.backgroundImage;
    if (bg && bg !== "none" && (bg.includes("gradient") || bg.includes("rgba"))) {
      const rect = el.getBoundingClientRect();
      if (rect.top < 900 && rect.height > 50) {
        results.push({
          tag: el.tagName,
          className: el.className.toString().slice(0, 80),
          backgroundImage: bg,
          backgroundColor: cs.backgroundColor,
          top: Math.round(rect.top),
          height: Math.round(rect.height),
        });
      }
    }
  }
  return results;
})()
```

**This step is mandatory.** Estimated gradients are always wrong. Extracted gradients are exact.
The distinction matters: a purple radial added from visual guessing vs the actual
`linear-gradient(rgb(0,2,64), rgba(0,0,0,0))` extracted from GitHub's DOM are completely different.

### 2C — CSS inspection via Puppeteer (computed values)

Run this evaluation and record every value:

```js
(() => {
  const cs = (el) => el ? getComputedStyle(el) : {};
  const h1 = document.querySelector('h1');
  const btn = document.querySelector('a[href*="sign"], button[class*="primary"], [class*="signup"], [class*="cta"], .btn-primary, button');
  const nav = document.querySelector('nav, header');
  const section = document.querySelector('section');
  const card = document.querySelector('[class*="card"], [class*="Card"], article');

  return {
    body_bg: getComputedStyle(document.body).backgroundColor,
    body_color: getComputedStyle(document.body).color,
    h1_fontFamily: cs(h1).fontFamily,
    h1_fontWeight: cs(h1).fontWeight,
    h1_fontSize: cs(h1).fontSize,
    h1_color: cs(h1).color,
    h1_letterSpacing: cs(h1).letterSpacing,
    h1_lineHeight: cs(h1).lineHeight,
    btn_bg: cs(btn).backgroundColor,
    btn_color: cs(btn).color,
    btn_borderRadius: cs(btn).borderRadius,
    btn_fontWeight: cs(btn).fontWeight,
    nav_bg: cs(nav).backgroundColor,
    section_paddingTop: cs(section).paddingTop,
    card_bg: cs(card).backgroundColor,
    card_border: cs(card).border,
  };
})()
```

Also inspect the hero background for gradient/glow:
```js
(() => {
  const hero = document.querySelector('section, .hero, [class*="hero"], main > div');
  if (!hero) return 'no hero found';
  const cs = getComputedStyle(hero);
  return {
    background: cs.background,
    backgroundImage: cs.backgroundImage,
    backgroundColor: cs.backgroundColor,
  };
})()
```

### 2D — Write tokens.lock.json (MANDATORY)

After Step 2C produces the spec, write it to **both** locations:
- `{project_path}/tokens.lock.json` — the canonical project-root copy that all build skills, the impeccable Context Gathering Protocol, and the `tokens-lock-enforce.ps1` PreToolUse hook check for.
- `{project_path}/.style-mirror/tokens.lock.json` — the archival copy alongside the reference screenshot and extraction artifacts.

Both files must contain identical JSON. If you only write to `.style-mirror/`, downstream skills will not see the lock and replication mode will silently fail.

```json
{
  "reference_url": "https://github.com",
  "captured_at": "2026-04-28T...",
  "layout": {
    "hero": "centered",
    "above_fold_order": ["nav", "headline", "subline", "cta_pair", "product_visual"],
    "product_visual": "below-text",
    "density": "sparse"
  },
  "colors": {
    "body_bg": "#0d1117",
    "card_bg": "#161b22",
    "nav_bg": "rgba(13,17,23,0.7)",
    "border": "#30363d",
    "text_primary": "#e6edf3",
    "text_secondary": "#7d8590",
    "cta_bg": "#238636",
    "cta_text": "#ffffff",
    "hero_gradient": "linear-gradient(rgb(0,2,64), rgba(0,0,0,0))"
  },
  "typography": {
    "heading_family": "\"Mona Sans\", system-ui, sans-serif",
    "heading_weight": 600,
    "heading_letter_spacing": "-0.025em",
    "heading_h1_size": "clamp(40px, 6vw, 72px)",
    "body_family": "\"Mona Sans\", system-ui, sans-serif",
    "body_weight": 400
  },
  "spacing": {
    "section_padding_top": "96px",
    "cta_border_radius": "6px"
  },
  "icons": {
    "family": "octicons",
    "stroke_width": null
  },
  "forbidden_additions": [
    "gradient_mesh", "grain_texture", "border_glow", "glassmorphism",
    "grid_lines", "gradient_text", "lucide_icons", "framer_motion_entrances"
  ]
}
```

The `forbidden_additions` array is computed by inspecting the reference's computed styles — if reference does NOT use a pattern, mark it forbidden. Build skills (web-page, web-scaffold, polish, impeccable) MUST refuse to add anything in this list.

### 2C — Build the reference design spec (human-readable companion)

Produce a structured spec in this format:

```
REFERENCE DESIGN SPEC: {reference_url}
Captured: {timestamp}

LAYOUT
  Hero structure:   {centered | split-pane}
  Above-fold order: {list elements in order}
  Product visual:   {beside-text | below-text | background | none}
  Hero density:     {sparse | moderate | dense}

COLORS (confirmed from CSS inspection)
  Body background:  {hex or rgba}
  Card surface:     {hex or rgba}
  Nav background:   {hex or rgba}
  Border:           {hex or rgba}
  Text primary:     {hex or rgba}
  Text secondary:   {hex or rgba}
  CTA button bg:    {hex or rgba}
  CTA button text:  {hex or rgba}
  Hero gradient:    {exact gradient string or 'none'}

TYPOGRAPHY
  Heading family:   {font-family string}
  Heading weight:   {number, e.g. 700}
  Heading tracking: {letter-spacing value}
  Heading size (h1): {font-size value}
  Body family:      {font-family string}
  Body weight:      {number}
  Italic/display moments: {describe any}

SPACING
  Section padding:  {paddingTop value}
  CTA border-radius: {value}
```

---

## Step 3 — Analyse the current project

Read the project's globals.css, key layout files, and the main landing page component.

Extract the same dimensions:
- Current background, card, border, text colors
- Current heading font family and weight
- Current hero layout structure (grep for `grid-cols`, `flex`, `split`)
- Current CTA button colors
- Current section padding pattern

---

## Step 4 — Build the diff table

For every dimension in the spec, compare reference vs current:

| Dimension | Reference | Current | Change needed | Impact |
|---|---|---|---|---|
| Hero layout | centered | split-pane | Restructure HeroSection to center-stack | **HIGH** |
| Body bg | #0d1117 | #1a1714 | Update globals.css body background | HIGH |
| Card bg | #161b22 | #201e1a | Update bg-card override | HIGH |
| Border | #30363d | rgba(255,255,255,0.08) | Update border-gl-border | MED |
| Text primary | #e6edf3 | hsl(36 33% 97%) | Update text-gl-charcoal override | HIGH |
| Heading font | Inter 800 | Cormorant Garamond | Change font-display definition | **HIGH** |
| Heading weight | 800 | 400 (normal) | Change heading font-weight globally | HIGH |
| Hero gradient | purple/blue full-bleed | gold radial corner | Rewrite HeroBackground | HIGH |
| CTA color | #238636 | #C9A84C gold | Keep gold (brand accent) | SKIP |

**Mark each change as HIGH / MED / LOW / SKIP.**

Never skip HIGH impact items. Layout and typography are always HIGH.

---

## Step 5 — Confirm before applying

Output the diff table to the user with a one-line summary:

> "Reference uses centered layout with DM Sans 800 weight on #0d1117. Current site is split-pane with Cormorant on #1a1714. 6 HIGH changes required, 2 MED, 1 SKIP (keeping gold CTA). Applying now."

Do not wait for approval unless a change would discard major existing work (e.g. a complete hero rebuild). Just state what you're doing and proceed.

---

## Step 6 — Apply systematically

Work through every HIGH item first, then MED. Apply in this order:

1. **Layout structure** — if the hero layout doesn't match, restructure the component. This is the most visible difference and must be done first.
2. **Color system** — update CSS variable overrides in globals.css
3. **Typography** — font family, weight, letter-spacing for headings
4. **Hero visual treatment** — background gradient/glow/atmosphere
5. **Component details** — cards, borders, button radius, spacing

For each change, use Edit tool directly. Run `npx tsc --noEmit` after all changes.

---

## Step 6b — Section-by-section mirror loop (NEW)

Replace the single-pass apply-then-verify with a per-section loop. Drift compounds across long builds — catch it at section boundaries, not at the end.

For each section in the reference (in order: nav → hero → next-section → next → footer):

1. **Re-fetch** the reference's section: `mcp__puppeteer__puppeteer_evaluate` returning the section's bounding box, computed styles, and inner HTML structure.
2. **Re-read** `tokens.lock.json` from the project root. Confirm the section's tokens have not drifted.
3. **Build** the project's equivalent section using ONLY values from `tokens.lock.json` and the freshly-extracted section structure.
4. **Screenshot** just that section: `mcp__puppeteer__puppeteer_screenshot` with `clip: { x, y, width, height }` matching the section bounds.
5. **Diff** computed styles between project's section and reference's section. Mismatches must be fixed before moving on.
6. **Confirm** in BUILD-LOG.md or `.style-mirror/section-log.md`: section name, tokens used, mismatches found, mismatches fixed.

Section-by-section is non-negotiable when the page has more than 3 sections. The hero-good-everything-else-drifts failure mode is exactly this skipped loop.

## Step 7 — Screenshot and verify

Take a 1440×900 screenshot of the current project (dev server or live URL).

Save to `{project_path}/.evolution/style-mirror/after.png`.

Compare against `reference.png`. For each HIGH impact item from the diff table, state:

| Dimension | Match? | Notes |
|---|---|---|
| Hero layout | ✓ / ✗ | |
| Background color | ✓ / ✗ | |
| Typography style | ✓ / ✗ | |
| Hero gradient | ✓ / ✗ | |
| Text colors | ✓ / ✗ | |

Any ✗ = diagnose and fix. Do not report done until all HIGH items are ✓.

---

## What counts as "matching"

- **Layout**: Same general structure (centered vs split-pane). Exact pixel positions don't need to match.
- **Colors**: Within ±10% lightness/saturation. If reference is #0d1117 and current is #0f1419, that's close enough.
- **Typography**: Same category (geometric sans ≠ serif). Weight within one step (700 vs 800 is fine, 400 vs 800 is not).
- **Gradient**: Same hue family and general placement. Exact opacity not critical.

---

## Common reference sites — known values

Pre-cached for faster execution. Always verify with live inspection but use these as a starting point:

| Site | Bg | Card | Border | Text | Accent | Heading |
|---|---|---|---|---|---|---|
| github.com | #0d1117 | #161b22 | #30363d | #e6edf3 | #238636 | Mona Sans / 600+ weight, sans |
| stripe.com | #0a2540 (hero) / white (body) | white | #e6ebf1 | #425466 | #635bff | Sohne / 500 weight |
| linear.app | #0e0e10 | #18181a | rgba(255,255,255,0.1) | #ffffff | #5e6ad2 | Inter / 600 weight |
| vercel.com | #000000 | #111111 | rgba(255,255,255,0.15) | #ffffff | #ffffff | Geist / 600 weight |
| notion.so | #ffffff | #f7f6f3 | #e9e9e8 | #37352f | #000000 | Inter / 400-600 weight |

Hero layouts:
- github.com: **centered**, sparse (headline + 2 CTAs), product screenshot floats below centered
- stripe.com: **split-pane** (text left, product right) on hero, then centered sections
- linear.app: **centered**, large headline, product screenshot full-width below
- vercel.com: **centered**, minimal (1 line + 1 CTA), diagram below
- notion.so: **centered**, moderate density

---

## Failure modes to avoid

| Failure | What it looks like | Fix |
|---|---|---|
| Surface-only | Changed colors, site still looks completely different | Always do layout + typography |
| Estimate trap | "GitHub is dark blue-ish" → #1a1714 | Always CSS-inspect the actual computed values |
| Font blindness | Changed bg color, kept serif headings | Change font-family in globals.css font-display definition |
| Layout skip | "That would be too disruptive" | Layout is the most visible difference. Never skip it. |
| Done too early | Reported done without verifying | Always screenshot and compare |

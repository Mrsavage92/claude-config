# DESIGN-BRIEF.md Template

Written to project root in Step 10. This file is the single source of truth. Build skills read it — they do not re-research.

---

```markdown
# [Product Name] — Design Brief

> This file is locked at research time. web-scaffold and web-page read it and execute — they do not re-run MCP queries or change component choices.

personality: [Enterprise Authority | Data Intelligence | Trusted Productivity | Premium Professional | Bold Operator | Health & Care | Growth Engine | Civic/Government]

## Product Personality
- **Personality type:** [one of 8 — must match the `personality:` field above]
- **User emotion on open:** [what they feel]
- **3-second message:** [what design communicates instantly]
- **Memorability hook:** [the ONE thing user remembers 24h later]
- **Mode:** dark-first | light-first
- **Why this mode:** [tied to user environment]

## Aesthetic Direction (anti-convergence lock)
- **Aesthetic flavor:** [Brutally minimal | Maximalist chaos | Retro-futuristic | Organic/natural | Luxury/refined | Editorial/magazine | Brutalist/raw | Art deco/geometric | Soft/pastel | Industrial/utilitarian]
- **Why this flavor differentiates:** [vs the dominant category look from competitor research]
- **Implementation complexity match:** [maximalist = elaborate code | minimalist = restraint and precision]

## Color System
- **Primary:** hsl([H] [S]% [L]%) — [color name + reason it fits this product]
- **Background:** hsl([H] [S]% [L]%)
- **Surface:** hsl([H] [S]% [L]%)
- **Accent:** hsl([H] [S]% [L]%) — [use case]
- **Color job:** Primary used ONLY for [CTA buttons] and [active nav]. Accent used for [warnings/highlights].
- **Rejected:** hsl(213 94% 58%) electric blue — [reason rejected for this product]
- **Rejected:** hsl(220 35% 4%) dark navy — [reason rejected, or "used — justified by: [reason]"]

## Typography
- **Display font:** [font name] — [reason it fits personality]
- **Body font:** [font name]
- **Heading weight:** 700 | 800
- **Display tracking:** [tight -0.03em | normal | standard -0.01em]
- **Google Fonts import:** `[full @import URL]`

## Hero Architecture
- **Pattern:** Centered | Split-pane | Full-screen | Minimal editorial
- **Why:** [one sentence tied to personality + user type]
- **Product visual:** Browser mockup | Lottie animation | Split-pane output | Large typography only

## Visual Atmosphere & Motion (read by build skills — do not skip)
- **Background atmosphere:** Gradient mesh | Noise/grain | Geometric pattern | Layered transparency | Spotlight/dramatic shadow | Photographic backdrop | Animated canvas
- **Atmosphere implementation hint:** [e.g. "SVG turbulence noise overlay at 0.04 opacity over hsl(220 30% 8%) base"]
- **Motion strategy:** Choreographed entrance | Continuous ambient | Scroll-driven transformation
- **Motion details:** [e.g. "Hero copy fades in 0ms, subhead 100ms delay, CTA 200ms, product visual 350ms with 8px translate-y. After load: page is calm."]
- **Surprise hover element:** [exact element + interaction, e.g. "Pricing card lifts 4px and casts colored shadow matching card accent"]
- **Decorative detail layer:** Custom cursor | Decorative dividers | Drop caps | Marquee/ticker | Asymmetric grid break | Annotated callouts
- **Reduced-motion fallback:** [what gets disabled when `prefers-reduced-motion` is set]

## Component Lock — 21st.dev (read by web-scaffold and web-page — do not override)

| Section | Component chosen | Query used | Why this product |
|---|---|---|---|
| Animated background | [component name] | `[exact searchQuery]` | [product-specific reason] |
| Navigation | [component name] | `[exact searchQuery]` | [product-specific reason] |
| Hero | [component name] | `[exact searchQuery]` | [product-specific reason] |
| Logo cloud | [component name] | `[exact searchQuery]` | [product-specific reason] |
| Stats / CountUp | [component name] | `[exact searchQuery]` | [product-specific reason] |
| Features | [component name] | `[exact searchQuery]` | [product-specific reason] |
| Testimonials | [component name] | `[exact searchQuery]` | [product-specific reason] |
| Pricing | [component name] | `[exact searchQuery]` | [product-specific reason] |
| FAQ | [component name] | `[exact searchQuery]` | [product-specific reason] |
| Final CTA | [component name] | `[exact searchQuery]` | [product-specific reason] |
| Footer | [component name] | `[exact searchQuery]` | [product-specific reason] |
| Banner (optional) | [component name or N/A] | `[exact searchQuery or —]` | [reason included / excluded] |
| Waitlist (optional) | [component name or N/A] | `[exact searchQuery or —]` | [reason included / excluded] |

## LottieFiles Animations
1. **Empty state ([page]):** [URL or description] — trigger: [condition]
2. **Success state:** [URL or description] — trigger: [condition]
3. **Processing state:** [URL or description] — trigger: [condition]

## Competitor Research
- **Dominant color in category:** [hue + why we're avoiding it]
- **Mode prevalence:** [dark-first / light-first / mixed in this category]
- **Patterns that convert (adopt):** [2-3 things all top competitors do that we'll match]
- **Clichés to avoid:** [2-3 things every competitor does that we will not]
- **Visual gap (opportunity):** [one thing no competitor is doing that we'll own]

## Design References
- **Primary:** [site] — borrow [specific elements e.g. "their card hover states and sidebar density"]
- **Secondary:** [site] — borrow [specific elements]

## Marketing Site Structure
**Tier:** [1 | 2 | 3]

**Public routes:**
- `/` — [one-line brief]
- `/features` — [one-line brief]
- `/pricing` — [one-line brief]
- `/auth` — Auth

**App routes:**
- `/dashboard` — [one-line brief]
- `/setup` — Onboarding wizard
- `/settings` — Profile, billing, team, danger zone
- [additional feature routes]

## Differentiation Audit (vs recent builds)
| Dimension | This product | Last build | Different? |
|---|---|---|---|
| Primary color | hsl([H]...) [name] | hsl([H]...) [name] | Yes / No |
| Mode | dark/light | dark/light | Yes / No |
| Hero pattern | [pattern] | [pattern] | Yes / No |
| Features layout | [layout] | [layout] | Yes / No |
| Section count | Micro (5) / Standard (9) / Full (11) | [last build count] | Yes / No |

## Dashboard Design (if /dashboard exists)
- **Category:** [Analytics / Operations / Finance / HR / CRM / DevOps / Health / Civic]
- **Layout:** [Sidebar nav | Top nav] + [Single-panel | Split-panel]
- **KPI cards:** [N cards — metric names + sparkline type each]
- **Hero chart:** [chart type + what it shows]
- **Empty state:** [what new user sees + CTA text]

## Design Anti-Patterns (banned for this product)
- Electric blue primary — [reason]
- Dark navy background — [reason, or "approved — justified by [reason]"]
- Gradient blob hero visual — always replaced with real product mockup or lottie
- [Any product-specific anti-patterns from competitor research]

## Build Order
1. `/` (full landing page — all sections from Component Lock)
2. `/features`
3. `/pricing`
4. `/auth`
5. `/setup` (onboarding wizard)
6. `/dashboard`
7. [feature pages by priority]
8. `/settings` (last)
```

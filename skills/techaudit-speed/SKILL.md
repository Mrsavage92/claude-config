---
name: techaudit-speed
description: Deep page speed analysis mapping render-blocking resources, unoptimised assets, and third-party script impact. Produces a prioritised optimisation plan with estimated load time improvements.
---

# Page Speed Deep Dive

## Skill Purpose
Deep analysis of page load performance. Maps every render-blocking resource, catalogues unoptimised assets, and produces a prioritised optimisation plan with estimated load time improvements. Output: SPEED-AUDIT.md.

## When to Use
- `/techaudit speed <url>`
- Follow-up to `/techaudit audit` when Speed score is below 60
- User wants to identify and fix performance bottlenecks

## How to Execute

### Step 1: Resource Inventory
Fetch the page and catalogue every resource:

| Category | What to Record |
|---|---|
| **Scripts** | URL, blocking/async/defer, first-party vs third-party, estimated size |
| **Stylesheets** | URL, critical vs non-critical, inline vs external |
| **Images** | URL, format (JPEG/PNG/WebP/AVIF/SVG), dimensions if specified, lazy loaded, srcset present |
| **Fonts** | URL, format (woff2/woff/ttf), font-display setting, preloaded |
| **iframes** | Third-party embeds (YouTube, Google Maps, social widgets, chat widgets) |

### Step 2: Bottleneck Identification
Identify the top 5 performance bottlenecks by impact:

| Bottleneck Type | How to Detect | Typical Impact |
|---|---|---|
| Unoptimised images | Large PNG/JPEG without srcset, no WebP/AVIF | 1-5s on mobile |
| Render-blocking scripts | `<script>` without async/defer in `<head>` | 0.5-3s blocking |
| Unused CSS/JS | Large frameworks loaded for minimal use | 0.5-2s download |
| Unoptimised fonts | No `font-display: swap`, not preloaded, TTF instead of WOFF2 | 0.3-1s FOIT |
| Third-party bloat | Chat widgets, analytics, social embeds, tag managers | 1-5s cumulative |
| No compression | Missing gzip/brotli on text resources | 50-80% size reduction possible |
| No caching | Missing or short Cache-Control headers | Repeat visit penalty |

### Step 3: Scoring

| Score Range | Meaning |
|---|---|
| 80-100 | Fast — well-optimised, minimal blocking resources |
| 60-79 | Acceptable — some optimisation opportunities |
| 40-59 | Slow — multiple bottlenecks affecting user experience |
| 0-39 | Critical — page load actively harming business metrics |

**Weight distribution:**
- Image optimisation: 25%
- Script loading strategy: 20%
- CSS delivery: 15%
- Font loading: 10%
- Third-party impact: 15%
- Compression & caching: 15%

### Step 4: Optimisation Plan
For each bottleneck, provide:
1. **What to fix** — specific resource or pattern
2. **How to fix** — exact implementation step
3. **Estimated improvement** — time saved in seconds
4. **Effort** — Low/Medium/High
5. **Priority** — based on impact-to-effort ratio

### Step 5: Quick Win Checklist

| Fix | Effort | Impact |
|---|---|---|
| Convert PNG/JPEG to WebP with `<picture>` fallback | Low | High |
| Add `loading="lazy"` to below-fold images | Low | Medium |
| Add `async` or `defer` to non-critical scripts | Low | High |
| Preload critical fonts with `font-display: swap` | Low | Medium |
| Enable Brotli compression (if on Cloudflare/Vercel) | Low | High |
| Lazy-load YouTube/Maps iframes with `loading="lazy"` | Low | Medium |

### Step 6: Generate Report
Save to `SPEED-AUDIT.md` in the domain output directory (`~/Documents/Claude/{domain}/`) with:
- Resource inventory table (categorised by type)
- Top 5 bottlenecks with estimated impact
- Overall Speed Score with breakdown
- Prioritised optimisation plan (Quick Wins → Medium-Term → Strategic)
- Recommended tools: Cloudflare (CDN/compression), ImageOptim/Squoosh (images), Bundlephobia (JS audit)
- Before/after projection: estimated total load time improvement

## Output Standards
- Every recommendation must include the specific file/resource URL
- Estimated improvements should be conservative ranges (e.g. "0.5-1.2s saved")
- Group recommendations by effort level so the user can batch quick wins

# Refinement Skill Contract

**Read FIRST.** This is the shared contract every refinement skill (`/typeset`, `/colorize`, `/layout`, `/animate`, `/polish`, `/optimize`, `/adapt`, `/clarify`, `/overdrive`, `/delight`, `/calibrate-amplitude`) must follow. It exists because the previous version of these skills was the suite's failure mode: they produced commodity advice from training-data defaults and the output was the AI-template aesthetic Adam ranked 5–6/10.

Status: this contract supersedes anything in an individual refinement skill's SKILL.md that contradicts it. If a refinement skill ships output without satisfying this contract, the iteration is a phase failure — `/web-evolve` VOIDs it.

---

## The contract

### 1. Refinement skills do NOT generate from training-data defaults. Sources are mandatory.

Every invocation MUST receive at least ONE of these in args, or HALT:

| Source | Format | Where it comes from |
|---|---|---|
| `reference: <url>` | Live URL to extract from | User picked OR Phase R reference, OR scope-pinned reference (SCOPE.md `## References`) |
| `extract: <path-to-tokens.json>` | Pre-extracted style tokens | Produced by `Skill('style-mirror', args='extract \| urls: [...]')` and saved to `.evolution/extracts/<slug>.json` or `tokens.lock.json` |
| `taste_section: <section-id>` | Pointer into `~/.claude/skills/taste-skill/SKILL.md` | E.g. `taste_section: 8.3` (Cards), `taste_section: 4.2` (magnetic-micro-physics). Section 8 (Creative Arsenal) is the primary library. |
| `memorable_choice: <string>` | The project's "one memorable thing" from `/web-evolve` Phase A.4 | Locked at run-start, every iter inherits |

**No source → HALT** with: `"Refinement skill {name} requires at least one of: reference, extract, taste_section, memorable_choice. Generic refinement is banned (suite contract refinement-contract.md)."`

### 2. Output is complete code, not advice.

A refinement skill's deliverable is:
- A rewritten component file (full replacement, not patch hints), OR
- A new component file plus the integration diff into the parent.

A refinement skill that returns prose ("consider using a foundry font, vary your scale...") is failing the contract. The build skill calling it cannot turn advice into code at the quality required for tier 95+.

If the skill cannot produce code (missing context, missing reference, etc.) → HALT, ask, do NOT fall back to advice.

### 3. The Reach Test — every output must cite its source.

Each refinement output writes a `// SOURCE:` comment at the top of every file it changes:

```tsx
// SOURCE: extract:.evolution/extracts/linear-app.json (typography.body_family, spacing.scale)
// SOURCE: taste-skill:8.6 (Typography — kinetic axis on hover)
// SOURCE: memorable_choice "one-word kinetic headline that re-types on scroll"
```

`/web-evolve` Phase C iter-acceptance check: if NO `// SOURCE:` comment exists in the diff → iter is generic-by-construction → VOID + revert. This is the Reach Test from the architectural critique.

### 4. The Reflex-Reject List.

Refinement skills MUST NOT reach for these patterns even if the source theoretically permits them. They are the AI-2024 fingerprint:

- Centered headline + gradient blob + shadcn button (hero)
- Inter from Google Fonts (typography)
- shadcn defaults: `slate`/`zinc`/`neutral` palette (color)
- Lucide tinted-square icons in a grid (features)
- Dashboard mockup floating in hero (product visual)
- Cyan-on-dark / purple-to-blue gradients (color)
- Border-left 3-4px colored stripe on cards (visual detail — see /impeccable absolute_bans)
- Gradient text via `background-clip: text` (see /impeccable absolute_bans)
- Bento grid as default features layout (overused)
- GSAP pinned-scroll narrative as default hero (overused)
- Custom dot+ring cursor on service-business sites (memory: feedback_no_custom_cursor_by_default)

If the source (reference / extract / taste_section) shows one of these patterns, OK — replication overrides reflex-reject (memory: visual mirroring protocol). Otherwise these are auto-FAIL.

### 5. Boldness clause.

Refinement skills called by `/web-evolve` Phase C receive `bold_execution: yes` in args (see /web-evolve Cardinal Rule 10 — preserved through the principles refactor). This means:

- No atmospheric opacity below 0.15
- No "subtle improvement" framing
- Visible difference required between before/after screenshots at 1440×900
- The difference must be IMMEDIATELY obvious — not "I see a small change in the line-height"

A subtle-only iter fails Rule 30 (visible-delta floor, SSIM > 0.985 = VOID). The boldness clause is procedural enforcement of the floor.

### 6. Compose with `/impeccable craft` — don't compete.

`/impeccable craft` is the production engine. When `/web-evolve` Phase C routes a fix to `/typeset` (or any refinement skill), the actual implementation pathway is:

```
/web-evolve Phase C
  → Skill('impeccable', args='craft type-system | reference: {url} | taste_section: 8.6 | memorable_choice: {locked} | bold_execution: yes | output: complete component rewrite at {path}')
```

The refinement skill SKILL.md is now the PROMPT TEMPLATE for `/impeccable craft` — it documents:
- What dimension this skill cares about (typography / color / layout / motion / etc.)
- What source types are valid for that dimension
- What output shape is expected (single component rewrite vs. design-system update vs. integration diff)
- What reflex-rejects are domain-specific to this dimension

The refinement skill does NOT call `Edit`/`Write` directly. It builds the craft prompt and invokes `Skill('impeccable', ...)`. The skill's value is in HOW it asks craft, not in producing output itself.

This is the central change. Refinement skills used to be advice generators that the orchestrator turned into Edits. Now they're craft-prompt-builders that turn references + taste sections + memorable_choice into structured craft invocations.

---

## What this contract changes mechanically

Before this contract:
```
/web-evolve Phase C
  → Skill('typeset', args='fix the typography')
  → typeset returns advice
  → orchestrator turns advice into Edit
  → Edit applies generic improvements
  → result: commodity output
```

After this contract:
```
/web-evolve Phase C
  → Skill('typeset', args='reference: linear.app | taste_section: 3.1 | memorable_choice: "kinetic display + neutral body" | bold_execution: yes')
  → typeset HALTs if any source missing (no generic mode)
  → typeset builds craft prompt with extracted tokens + taste section + reflex-rejects + boldness
  → typeset invokes Skill('impeccable', args='craft typography-system | ...')
  → impeccable craft returns complete component rewrite with SOURCE comments
  → orchestrator commits the rewrite
  → /web-evolve Phase C Reach Test verifies SOURCE comment present
  → orchestrator screenshots before/after, runs SSIM, VOIDs if invisible
  → result: reference-anchored, non-generic, visibly different
```

---

## Per-skill domain (what each refinement skill specializes in)

This table is the routing map. `/web-evolve` Phase C SKILL_LOOKUP routes to the right specialist based on what's failing:

| Skill | Domain | Primary source types | Output shape |
|---|---|---|---|
| `/typeset` | Typography (font picks, scale, hierarchy, axis animation) | extract.typography, taste 3.1 / 8.6 | Component rewrite + globals.css update |
| `/colorize` | Color (palette, tokens, brand-tint, OKLCH math) | extract.color, taste 3.2 | globals.css `@theme` update + selective component refactor |
| `/layout` | Layout (grid, spacing rhythm, container queries, asymmetry) | extract.spacing, extract.layout, taste 3.3 / 8.2 | Component rewrite |
| `/animate` | Motion (entrance, scroll, hover, micro-interactions, Lenis/GSAP) | extract.motion, taste 4.x / 9.x | Component rewrite + motion config |
| `/polish` | Final-pass consistency (alignment, optical adjustments, dead pixels) | memorable_choice + existing-component audit | Surgical multi-file diff |
| `/optimize` | UI perf (bundle, render, INP, LCP, image format) | chrome-devtools-mcp trace + memorable_choice | Multi-file refactor + asset changes |
| `/adapt` | Responsive (375/768/1024/1440 + container queries) | extract.responsive + memorable_choice | Component rewrite + global breakpoint config |
| `/clarify` | UX copy (microcopy, errors, empty states, CTA labels) | brand voice from CLAUDE.md + memorable_choice | Copy-only diff |
| `/overdrive` | Beyond-baseline ambition (shaders, R3F, spring physics, scroll-driven 3D) | taste 4.x + chosen hero signature (A/B/C) from Phase R | New component scaffold + integration diff |
| `/delight` | Single signature moment (one memorable interaction) | memorable_choice + taste 8.7 | Single-component new build |
| `/calibrate-amplitude` | Adjusts visual intensity (replaces /bolder + /distill + /quieter — same axis, different dial values) | dial value (0.0–1.0) + current-state critique | Multi-file restraint/intensity refactor |

`/calibrate-amplitude` notes:
- dial 0.0 = quietest (was `/quieter`)
- dial 0.3 = simplified (was `/distill`)
- dial 0.7 = current-day normal
- dial 1.0 = boldest (was `/bolder`)
- Skill receives the dial value in args, plus current-state snapshot, and adjusts in the right direction.

---

## When this contract does NOT apply

- `/style-mirror` is exempt — it IS the extraction engine and can never receive an extract from itself.
- `/impeccable craft` is exempt — it IS the production engine and is called BY refinement skills. Craft can be invoked with or without a reference; refinement skills must always have one.
- `/impeccable teach` is exempt — it's the context-establishment skill, runs once per project.
- `/critique` is exempt — evaluation skill, not production.
- Build skills (`/web-page`, `/web-component`, `/web-scaffold`) are exempt as DIRECT callers — they invoke craft directly. But when they delegate a sub-fix to a refinement skill, the contract applies.

---
name: calibrate-amplitude
disable-model-invocation: true
description: Reference-anchored visual-amplitude refinement. ONE dial covering the full spectrum from quietest (0.0) to boldest (1.0) — replaces the legacy /bolder + /distill + /quieter trio. Builds a craft invocation that pushes the existing design toward the dial value using taste-skill Section 3 + memorable_choice. Generic-mode is BANNED.
argument-hint: "dial:<0.0-1.0> | reference:<url> | extract:<path> | taste_section:<id> | memorable_choice:<str>"
metadata:
  version: 1.0.0
  user-invocable: true
---

# /calibrate-amplitude (v1.0)

Follows the shared **Refinement Skill Contract** — read `~/.claude/skills/shared/refinement-contract.md` first.

**Domain:** visual intensity / amplitude only. Whether the design feels too quiet, too loud, too complex, too sparse, or wrong-but-can't-place-it on the boldness axis. Does NOT touch typography family choice (that's `/typeset`), palette construction (`/colorize`), or motion (`/animate`).

**Replaces:** `/bolder`, `/distill`, `/quieter`. These three skills were sliders on the same axis. One skill with a dial value is honest; three skills was duplication.

---

## The dial

A single `dial:<float>` arg between 0.0 and 1.0:

| Dial | Legacy equivalent | What it does |
|---|---|---|
| 0.0 | `/quieter` (extreme) | Tone everything down. Reduce contrast, shrink type, mute color, kill non-essential motion. For overstimulating designs that need to recede. |
| 0.3 | `/distill` | Strip unnecessary complexity. Remove decorative elements that don't earn their place. Fewer cards, lower density, more whitespace. |
| 0.5 | (no legacy) | Current state is right — no amplitude change needed. Refuse this dial value; it's a no-op. |
| 0.7 | (no legacy) | Mild assertiveness. Move from "competent" to "intentional" — slightly larger type, slightly more saturated accent, a hint of motion. |
| 1.0 | `/bolder` (extreme) | Maximum visual impact. Larger type contrast, fuller saturation on accent, distinct hierarchy, motion that announces. For designs that read as forgettable. |

Skill receives the dial value + current-state snapshot (Puppeteer screenshot of affected area) + sources, and adjusts in the right direction.

**Dial value 0.5 is rejected.** A request for "no change" is not a refinement.

---

## Args contract (HALT if no source provided)

Must receive ALL of:

- `dial: <float 0.0-1.0, excluding 0.5>` — required
- At least ONE of `reference:`, `extract:`, `taste_section:`, `memorable_choice:` — required (refinement-contract §1)

No source → HALT: `"calibrate-amplitude requires reference / extract / taste_section / memorable_choice. Pure intensity adjustment without a reference is generic-by-construction."`

---

## Reflex-rejects per dial direction

**Quieting (dial < 0.5)** — avoid these reflex-quietings:
- Just opacity-reducing everything to 0.6 — kills the design's discipline, doesn't strip it
- Replacing accent with gray — produces an AI-template "minimal SaaS"
- Removing all motion — kills clarity affordances (state changes, focus indicators)
- Setting `font-weight: 300` everywhere — readability collapse at common sizes

**Boldening (dial > 0.5)** — avoid these reflex-boldenings:
- Just scaling up the H1 to 8rem — generic AI-display-tell
- Saturating the accent to `oklch(70% 0.3 H)` — neon-on-dark territory
- Adding a gradient blob behind the hero — see /impeccable absolute_bans
- Adding glow shadows to every CTA — generic "high-end SaaS dark mode" tell
- ALL CAPS subhead — see /typeset reflex-rejects

The legitimate moves come from the source (reference / extract / taste section), not from these reflex patterns.

---

## What this skill PRODUCES

A craft invocation, not a file edit.

```
Skill('impeccable', args='
  craft amplitude-adjustment
  | direction: {"quieter" if dial<0.5 else "bolder"}
  | dial_magnitude: {abs(dial-0.5)*2}   # 0.0 to 1.0 scale of how far from neutral
  | target_files: {discovered list of files participating in the affected section/page}
  | reference_tokens: {extract OR live-fetched from reference URL}
  | taste_directives: {first 600 chars of taste-skill Section 3 — generally Section 3.x picks come from the dial direction}
  | memorable_choice: {locked value}
  | current_state_snapshot: {Puppeteer screenshot path}
  | bold_execution: yes
  | reflex_rejects: {direction-appropriate list from above}
  | output_contract:
      - Visible difference at 1440x900 — opacity adjustments < 0.15 magnitude = INVISIBLE_DIFF
      - Preserve content (no information loss when quieting; no decorative additions when boldening)
      - Respect contrast minima (AA 4.5:1 body, AAA 7:1 preferred even when quieting)
      - // SOURCE: comments at top of every file changed
      - Preserve accessibility — quieting must NOT kill focus indicators, state changes, or reduced-motion respect
')
```

---

## Web-evolve targeted mode

When called from `/web-evolve` Phase C: skip context gathering, all in args. Validate `dial` + at least one source. Build craft prompt. Invoke `/impeccable`. Refuse invisible diffs (Rule 30).

---

## Direct-invocation mode

If a human invokes `/calibrate-amplitude` directly without `dial:`, prompt:
```
"Pick a dial value (not 0.5 — that's a no-op):
  0.0 — make it disappear (extreme quiet)
  0.3 — strip the complexity (former /distill)
  0.7 — make it intentional (mild assertion)
  1.0 — make it loud (extreme bold, former /bolder)
And give me a source — reference URL, extract path, taste section, or memorable_choice."
```

---

## When NOT to call /calibrate-amplitude

- The font choice is wrong → `/typeset` (different axis)
- The palette is wrong → `/colorize` (different axis)
- The hierarchy is flat → `/typeset` (scale ratios) OR `/layout` (composition)
- Motion is absent or wrong → `/animate`
- The page is structurally broken → `/web-page` REBUILD via `/web-evolve`

Amplitude is the LAST axis to refine, not the first. If the page is fundamentally wrong, calibrating its amplitude makes it more loudly wrong.

---

## Migration note

`/bolder`, `/distill`, `/quieter` SKILL.md files are deprecated and redirect to this skill. The legacy invocations still resolve:
- `/bolder` → `/calibrate-amplitude dial:1.0`
- `/distill` → `/calibrate-amplitude dial:0.3`
- `/quieter` → `/calibrate-amplitude dial:0.0`

`/web-evolve` Phase C SKILL_LOOKUP updated: `fix_skill: calibrate-amplitude` replaces the three legacy entries. Visual-bonus weight inherited from the highest of the three (was `/bolder` at 500 in legacy table).

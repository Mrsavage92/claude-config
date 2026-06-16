---
name: colorize
disable-model-invocation: true
description: Reference-anchored color refinement. Builds a craft invocation that produces a complete OKLCH token system rewrite from extracted reference colors + taste-skill Section 3.2 + memorable_choice. Generic palettes are BANNED — must receive a source.
argument-hint: "reference:<url> | extract:<path> | taste_section:<id> | memorable_choice:<str>"
metadata:
  version: 3.0.0
  user-invocable: true
---

# /colorize (v3.0)

Follows the shared **Refinement Skill Contract** — read `~/.claude/skills/shared/refinement-contract.md` first.

**Domain:** color tokens only. Palette construction, OKLCH math, brand-hue tinting of neutrals, contrast ratios, semantic token assignment. Does NOT touch typography, layout, or motion.

---

## Args contract (HALT if none provided)

Must receive at least ONE of:

- `reference: <url>` — live URL whose palette to extract
- `extract: <path>` — pre-extracted `color.*` tokens
- `taste_section: 3.2` (color bias-correction)
- `memorable_choice: <string>` — usually constrains the palette ("one signature acid green")

No source → HALT: `"colorize requires reference / extract / taste_section / memorable_choice. Generic palettes are banned."`

---

## Reflex-rejects (auto-FAIL unless source contains them)

- shadcn defaults: `slate`, `zinc`, `neutral`, `stone`, `gray` (the AI-template signature)
- Cyan-on-dark (#22d3ee on dark navy) — Stripe-clone tell
- Purple-to-blue gradient backgrounds — Vercel-clone tell
- Neon accents on dark backgrounds — generic "cyberpunk" tell
- Pure black (#000) or pure white (#fff) — never appears in nature
- Gray text on colored backgrounds — washed out
- Gradient text via `background-clip: text` — see /impeccable absolute_bans
- Border-left 3-4px colored stripe — see /impeccable absolute_bans
- Multi-hue brand palettes (3+ unrelated accent colors) — pick ONE accent

---

## What this skill PRODUCES

A craft invocation, not a file edit.

```
Skill('impeccable', args='
  craft color-system
  | target_files: {globals.css OR app/globals.css + any component with hardcoded color}
  | reference_tokens: {color section of extract OR extracted now from reference URL via /style-mirror}
  | taste_directives: {first 600 chars of taste-skill Section 3.2}
  | memorable_choice: {locked value}
  | bold_execution: yes
  | reflex_rejects: slate/zinc/neutral/stone/gray defaults, cyan-on-dark, purple-blue-gradient, neon-on-dark, #000, #fff, gradient-text, border-stripes
  | output_contract:
      - OKLCH format only (not HSL, not hex)
      - 1 brand accent + 2 neutrals + 1 surface — period
      - Neutrals tinted toward brand hue (chroma 0.005-0.015) for subconscious cohesion
      - REDUCE chroma at extreme lightness (light tints want lower chroma)
      - Contrast: AAA (7:1) for body, AA (4.5:1) min for all other text
      - Tokens emit via @theme inline {} on Tailwind v4 OR :root vars on legacy
      - // SOURCE: comments at top of every file changed
      - Visible at 1440x900 — token rename with identical resolved value = INVISIBLE_DIFF
')
```

---

## Web-evolve targeted mode

Same pattern as /typeset: skip context gathering, validate source present, build craft prompt, invoke /impeccable, refuse invisible diffs (Rule 30).

---

## Direct-invocation mode

Prompt for source if missing:
```
"Pick one — I won't generate a generic palette:
  1. Reference URL whose palette to mirror
  2. tokens.lock.json or extract path
  3. taste-skill Section 3.2
  4. The project's memorable_choice if it constrains color"
```

---

## Theme decision (light vs dark) — derived, not defaulted

Theme is NOT a default. Decide from audience + viewing context (DEX/trading/SRE/late-music → dark; hospital/children/wedding/food → light). Defaulting to either "to play it safe" or "to look cool" is auto-FAIL. See taste-skill's `<theme_selection>` for the canonical guidance.

---

## When NOT to call /colorize

- Headings need a different font weight → `/typeset`
- The whole site is wrong palette for the brand → call `/style-mirror` first to extract from a reference, then `/colorize` against the extract
- Replication-mode project (`tokens.lock.json` present) — colorize REPLICATES the lock, never overrides

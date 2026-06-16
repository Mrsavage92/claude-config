---
name: typeset
disable-model-invocation: true
description: Reference-anchored typography refinement. Builds a craft invocation that produces a complete type system rewrite from extracted reference tokens + taste-skill Section 3.1/8.6 + memorable_choice. Use when fonts/scale/hierarchy/weight are off. Generic-mode is BANNED — must receive a source.
argument-hint: "reference:<url> | extract:<path> | taste_section:<id> | memorable_choice:<str>"
metadata:
  version: 3.0.0
  user-invocable: true
---

# /typeset (v3.0)

This skill follows the shared **Refinement Skill Contract**: `~/.claude/skills/shared/refinement-contract.md`. Read it first. The contract is load-bearing — it changed what refinement skills DO (they build craft prompts; they don't write code or advice themselves).

**Domain:** typography only. Font picks, scale, hierarchy, weight, line-height, line-length, optical sizing, variable-axis animation.

---

## Args contract (HALT if none provided)

Must receive at least ONE of:

- `reference: <url>` — live URL whose typography to mirror
- `extract: <path>` — pre-extracted `typography.*` tokens from `tokens.lock.json` or `.evolution/extracts/<slug>.json`
- `taste_section: 3.1` (typography bias-correction) OR `taste_section: 8.6` (kinetic typography arsenal)
- `memorable_choice: <string>` — locked at run-start by `/web-evolve` Phase A.4

No source → HALT: `"typeset requires reference / extract / taste_section / memorable_choice. Generic typography is banned (refinement-contract §1)."`

---

## Reflex-rejects (auto-FAIL unless source explicitly contains them)

- Inter from Google Fonts
- DM Sans, Plus Jakarta Sans, Outfit, Instrument Sans
- IBM Plex family (overused as "technical" default)
- Fraunces, Newsreader, Playfair Display, Cormorant (overused as "elegant" default)
- Monospace as lazy shorthand for "developer/technical" vibe
- Flat hierarchy (sizes within 1.1× ratio)
- Body text > 80ch line length
- ALL CAPS on body passages
- Identical line-height for all sizes

If the source contains one of these (e.g. `tokens.lock.json` extracts Inter from the reference), replication wins — use it. Otherwise these are auto-FAIL.

---

## What this skill PRODUCES

A craft invocation, not a file edit. The skill's output is a `Skill('impeccable', args='craft type-system | ...')` call with structured args.

**Build the craft prompt:**

```
Skill('impeccable', args='
  craft type-system
  | target_files: {discovered list of files that handle type — page.tsx, globals.css, font-config}
  | reference_tokens: {typography section of extract OR extracted now from reference URL}
  | taste_directives: {first 600 chars of taste-skill Section {taste_section}}
  | memorable_choice: {locked value}
  | bold_execution: yes
  | reflex_rejects: Inter, DM Sans, Plus Jakarta, Outfit, IBM Plex, Fraunces, Newsreader, Playfair, Cormorant, monospace-as-lazy-technical, flat-hierarchy, ALL-CAPS-body
  | output_contract:
      - Pick ONE foundry display + ONE refined body OR ONE variable family with 2 axes used
      - Modular scale ≥ 1.25 ratio across at least 5 steps
      - Animate one variable axis (weight/width/slant/optical-size) on hover OR scroll
      - Body line-length capped at 65-75ch
      - // SOURCE: comments at top of every file changed (refinement-contract §3)
      - Visible at 1440x900 before/after — line-height alone is NOT enough
')
```

---

## Web-evolve targeted mode (when called from /web-evolve Phase C)

Args from orchestrator always include `bold_execution: yes`, `iter_id`, `route`, optionally `current_problems` (from per-route page-baselines).

1. Skip context gathering — orchestrator passes context in args
2. Validate at least one source is present — HALT if not
3. Build craft prompt per above
4. Invoke `Skill('impeccable', ...)` with the craft prompt
5. Wait for craft to return the rewrite
6. Return the diff path + the SOURCE comment list — orchestrator handles commit + Reach Test verification + SSIM check

Refuse invisible diffs (web-evolve Cardinal Rule 30): before returning, verify the change is visible at 1440×900. Pure token swaps with identical resolved values → return `INVISIBLE_DIFF: <reason>` instead of committing.

---

## Direct-invocation mode (when called by a human, not /web-evolve)

If the user invokes `/typeset` directly (not via /web-evolve), prompt for the missing source:

```
"Pick one — I won't produce generic typography:
  1. A reference URL whose typography to mirror
  2. A path to a tokens.lock.json or extract file
  3. A taste-skill section pointer (3.1 or 8.6)
  4. The project's memorable_choice if /web-evolve Phase A.4 has locked one"
```

Wait for answer. Then proceed as targeted mode.

---

## Anti-patterns specific to typography refinement

- "Switch from Inter to Geist" as the entire fix — Geist is its own AI-default tell (memory: feedback_taste_calibration). Pick something further afield unless the brand is Vercel-adjacent.
- "Add `clamp()` for fluid sizing" as the entire fix — fluid sizing alone doesn't change hierarchy.
- "Use a display font for h1" as the entire fix — display font choice without scale + weight + axis-animation is incomplete.
- Recommending a foundry font WITHOUT the licensing path — Söhne/Calibre/GT America are paid; if the project can't license, propose Geist + Geist Mono OR a Velvetyne / Pangram free-with-license-care alternative.

A typeset iter passes when: foundry pick made, scale set with ratio ≥ 1.25, hierarchy is 5+ steps, one variable axis animates, line-length capped, body and display are distinct families OR distinct axis settings of one variable family.

---

## When NOT to call /typeset

- The site has no typography to refine (true blank state) — call `/web-page` for a full build.
- The fix is "the color of headings is wrong" — that's `/colorize`.
- The fix is "headings entrance is missing motion" — that's `/animate`.
- The whole page is structurally broken (sales-page checklist ≥ 2 FAILs) — `/web-evolve` Phase C will route through `/web-page` REBUILD, not refinement.

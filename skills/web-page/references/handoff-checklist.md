# Handoff Checklist — pre-commit gate for any built page

Runs at the END of every `Skill('web-page')` build and at the END of every `/web-evolve` iter on every changed route. Catches taste/a11y/perf mistakes at build time so the audit phase doesn't have to.

The gate is the script. The list below documents what each check enforces — but compliance is measured by `run-handoff-check.sh` exit code, not by Claude's self-assessment.

## How to run

```bash
bash ~/.claude/skills/web-page/references/run-handoff-check.sh <built-file-path>
# or for a whole route (Next.js)
bash ~/.claude/skills/web-page/references/run-handoff-check.sh app/services/page.tsx
# or for a whole route (Vite)
bash ~/.claude/skills/web-page/references/run-handoff-check.sh src/pages/Services.tsx
```

Exit 0 = ship. Exit 1 = one or more banned-severity hits, fix before commit. Exit 2 = script misconfigured (file missing).

## What it checks (mechanical — no LLM judgment)

| # | Check | How | Fail = |
|---|---|---|---|
| 1 | No `taste-rules.csv` banned patterns in file | `python ~/.claude/skills/taste-skill/data/check_taste.py <file>` exit 1 | Inter / #0d1117 / `text-9xl` / `lucide.*bg-blue.*rounded` / "Elevate" / etc. found |
| 2 | No debug code shipped | grep for `console\.(log\|debug\|trace)`, `debugger`, `TODO:|FIXME:` outside comments | match found |
| 3 | Interactive elements have `cursor-pointer` | grep `<button` + `onClick`; require `cursor-pointer` in className OR project-wide button component | button/onClick without cursor-pointer and not using project Button primitive |
| 4 | Focus states present | grep for `focus-visible:` or `focus:` on any element with `onClick`/`<button`/`<a` | missing on at least one |
| 5 | `prefers-reduced-motion` respected | grep for `motion-safe:` OR `useReducedMotion` OR `@media (prefers-reduced-motion)` in any file that imports `framer-motion` / `gsap` / `@react-spring` | animation library imported without reduced-motion guard |
| 6 | No emoji used as icon | regex match emoji codepoint inside JSX where role looks iconic (next to text, in nav, in feature list) | emoji found |
| 7 | Per-page SEO set | Next.js: `export const metadata` exported. Vite: `useSeo(` called. | neither found |
| 8 | File size ≤800 lines | `wc -l` | >800 |
| 9 | No fake-round-number placeholder content | grep for `99\.99`, `John Doe`, `Sarah Chan`, `Acme Corp`, `Nexus`, `SmartFlow` | found in placeholder/example data |
| 10 | Tap-target compliance flag | grep for `<button.*h-\(4\|5\|6\|7\|8\|9\)\b` (under h-10 / 40px is too small on mobile) | found |
| 11 | No `font-family: Inter` literal | grep for Inter explicitly in `style=`, `tailwind.config`, or CSS | found |
| 12 | No custom cursor unless explicit | grep `cursor: url(` or `cursor-custom` className | found and no `// custom-cursor: explicit-opt-in` comment within 5 lines |

Items 1–6, 8, 11–12 are **banned severity** (exit 1). Items 7, 9, 10 are **caution** (logged but exit stays 0).

## Reading the output

```
[PASS] no handoff violations in app/services/page.tsx
```

or

```
[FAIL] app/services/page.tsx
  [banned] inter-banned                    matched 'font-inter'         fix: Geist / Outfit / Cabinet Grotesk
  [banned] debug-code-shipped              matched 'console.log'        fix: remove before commit
  [banned] missing-focus-state             at line 47 (button onClick)  fix: add focus-visible:ring-2
3 banned violations; commit blocked.
```

## How web-page invokes this

After writing the page file but BEFORE marking the page complete:

```bash
bash ~/.claude/skills/web-page/references/run-handoff-check.sh <path-to-just-written-file>
```

If exit 1 → fix violations in-place, re-run, repeat until exit 0. Only then mark the page complete and move to next.

## How web-evolve invokes this

After Phase R (rebuild) or Phase C (refinement) writes a route, before Phase D (verify-delta):

```bash
for route in $(jq -r '.changed_routes[]' .evolution/loop-state.json); do
  file=$(bash references/route-to-file.sh "$route")
  bash ~/.claude/skills/web-page/references/run-handoff-check.sh "$file" || exit 1
done
```

Exit 1 from any route blocks the iter from counting toward the tier floor.

## Adding new checks

Edit `run-handoff-check.sh` — add a new function `check_N_something`. Each check function returns 0 (pass) or 1 (fail) and appends a line to `$REPORT`. The main script wraps them all and aggregates exit codes. Don't add prose-only checks — if a rule needs Claude judgment, it doesn't belong here.

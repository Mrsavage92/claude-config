---
name: web-evolve
disable-model-invocation: true
disallowed-tools: AskUserQuestion
description: One coherent design pass over a full page (or one full system-wide change), verified against THIS project's CLAUDE.md brand system. After every change, screenshot at 375px and 1440px with Playwright and self-critique against the brand bar; do not proceed until the change passes. Explicit-invocation only. Use when the user runs /web-evolve on a route, the landing page, the dashboard, or names a system-wide change.
argument-hint: "[/route | landing | dashboard | \"system change\"]"
---

# /web-evolve

One scope. One coherent design pass. Verify every change against the project's brand system. Commit. Stop.

A "run" is **not** one tweak. A run is a complete, coherent design pass over a **full page** — or **one full system-wide change** (e.g. "apply the new type scale everywhere", "unify every card to the brand card"). Make all the changes that pass requires; the only gate between changes is verification, not a quota.

The bar is **not** generic quality (Awwwards, 21st.dev, "looks polished"). The bar is **this project's brand system as written in its CLAUDE.md**. On-brand-and-correct beats impressive-and-off-brand, every time.

**NOT for:** initial builds → `/web-page`; brand-new project → `/web-scaffold`. This skill evolves an existing, brand-defined surface.

`disallowed-tools: AskUserQuestion` — this skill does not ask the user to make decisions. It reads the brand bar, decides the pass, and verifies its own work. The one thing it may do instead of guessing is **HALT** (see below).

**The two halts (never silently improvise):**
- **No brand system.** If the project has no CLAUDE.md brand system (no design tokens, no Section D design decisions, no brand DNA to critique against), HALT with `NEEDS_HUMAN: no brand system found at [path] — web-evolve critiques against the project brand, not generic taste. Define the brand (tokens + CLAUDE.md design section) first.` Do **not** fall back to generic design opinions — that defeats the purpose of this skill.
- **Unresolvable fork.** If you hit a genuine fork the scope cannot resolve (two equally-valid target routes, every route render-blocked), pick the safest documented default and record it under a `⚠ Assumption:` line in the run report. Silent improvisation presented as if the brand chose it is the failure this prevents.

---

## Invocation

| Command | Behaviour |
|---|---|
| `/web-evolve` | Resume `last_scope` from state.json, or default to `landing` on first run |
| `/web-evolve landing` | One coherent design pass over the whole landing page |
| `/web-evolve /clients` | One coherent design pass over the `/clients` route |
| `/web-evolve dashboard` | Pick the most-impactful renderable app route, pass over the whole page |
| `/web-evolve "unify all cards to the brand card"` | One system-wide change applied + verified across every surface it touches |
| `/web-evolve [unrecognised]` | Treat any leading non-`/` arg as a system-change description; if it is a single bare word that is not `landing`/`dashboard`, halt: `⚠ Ambiguous scope "[arg]". Use a /route, landing, dashboard, or a quoted system-change description.` |

---

## Step 0 — Load the brand bar (mandatory, before anything else)

The **brand bar** is the concrete, project-specific standard every change is judged against. Build it once per run:

1. **Project root** — directory containing `package.json` (`git rev-parse --show-toplevel` if unsure).
2. **Read the project's `CLAUDE.md`** at the root. Extract the design/brand system: brand colours (exact hex/OKLCH), type system (families, scale, weights), spacing system, voice/copy rules, and any **Section D** locked design decisions.
3. **Read the design tokens** — `tokens.lock.json`, `tokens.json`, the CSS custom-property block (`:root`), or the Tailwind theme. Record exact token values. Note `forbidden_additions` if `tokens.lock.json` defines them.
4. **Read any referenced brand docs** the CLAUDE.md points to (design DNA, brand guidelines, style-mirror lock).

Compose these into the **brand bar**: the palette + its semantic roles, the type scale, the spacing scale, the motion stance, the voice, and the **banned patterns** for this project (from `forbidden_additions` + CLAUDE.md's banned reflexes — e.g. no em dash, no navy+gold if the brand is violet, no bento default).

If none of 2–4 yields a brand system → the **No brand system** halt above. Do not continue.

---

## Step 1 — Scope and enumerate

**Page/route scope** (`landing`, `/route`, `dashboard`): identify the surfaces (components) that make up the page.
- Landing: glob `src/components/landing/`, `src/components/sections/`, `app/(marketing)/`, `components/` for `*.{tsx,jsx,vue,svelte}`. Order them top-to-bottom as they render (nav → hero → … → footer).
- A specific `/route`: find the page file (`**/pages/[slug]*`, `**/app/*[slug]*/page.tsx`, `src/routes/**`), read it, list the components it renders, in render order.
- `dashboard`: discover authenticated routes (React/TanStack/Next/Remix/Astro/SvelteKit/Nuxt router conventions), exclude marketing routes, pick the alphabetically-first **renderable** route (static path, or a `**/dev/**Preview*` / `*.stories.*` harness exists). If only render-blocked routes exist, take the first and note `render-blocked: code-only` in the report.

**System-change scope** (quoted description): grep the codebase for every surface the change touches (e.g. all `<Card`, all heading elements, every file importing the old token). The "page" is the union of affected files; the pass is the change applied consistently across all of them.

Write the enumerated surfaces to `.web-evolve/state.json` (see schema). One state object per run scope.

---

## Step 2 — Baseline capture + plan the pass

1. **Start the dev server** if not running (read `package.json` scripts: `dev`/`start`). Record the local URL.
2. **Baseline screenshots** — for the target page (and, for a system change, a representative sample of affected surfaces), capture **375px and 1440px** via the Playwright procedure below. Save to `.web-evolve/shots/`.
3. **Self-critique against the brand bar.** For each surface, list every specific way it deviates from the brand bar or fails a universal gate (contrast, responsive, states). Write these to `area.issues`. This is the FIND-BUGS pass — be specific (`"hero H1 uses Inter, brand type is Söhne"`, `"CTA is #2563eb, brand primary is violet #7c3aed"`, `"pricing card body text 3.1:1 on the tinted bg — fails 4.5:1"`, `"overflows horizontally at 375px"`).
4. **Plan the coherent pass** — the ordered list of changes that brings the whole page onto the brand bar. This is the unit of work. There is **no one-change limit**; the plan is as large as the page needs.

---

## Step 3 — Execute the pass, verify every change

Work the plan in order. For **each change**:

1. Make the edit (direct edits to bring the surface onto the brand bar: correct tokens, type, spacing, states, copy). Prefer editing toward the brand tokens over inventing new values.
2. **Re-screenshot the changed surface at 375px and 1440px** (Playwright procedure below).
3. **Verify against the pass gate** (next section). The change PASSES only if all gates hold.
4. **Do not proceed to the next change until this one passes.**
   - Fails a gate but fixable → fix it now, re-screenshot, re-verify.
   - Made it worse / introduced a banned pattern / broke render → **revert** this change (`git checkout -- [file]` for modified, `rm` for newly created) and try a different approach. Never carry a regression forward.
   - Genuinely stuck after a second approach → record the specific blocker in `area.issues`, leave the surface in its last-passing state, move on.
5. Append a one-line description of what changed to `area.fixes`.

A change with no visible diff at either viewport is **VOID** — it did not happen. Either it resolved to the same rendered value (revert it, it's noise) or the edit didn't land (investigate). Do not count void changes as progress. This is the invisible-change veto.

---

## The pass gate (what "passes" means)

A change passes only when **all** of these hold. The first four are the brand bar; the rest are universal and non-negotiable.

1. **On-palette** — colours used are the project's brand tokens in their correct semantic roles. No off-brand colour, no banned palette (per the brand bar).
2. **On-type** — font family, scale step, and weight come from the brand type system. No stray font, no arbitrary px size outside the scale.
3. **On-spacing / on-motion** — spacing values come from the system; motion matches the brand's stated stance (no unprompted entrance animation if the brand is restrained; no missing motion if the brand is kinetic).
4. **No banned pattern** — the change introduces nothing in `forbidden_additions` or the CLAUDE.md banned-reflex list. Run a diff-aware check: `git diff -- [file] | grep '^+'` — only patterns in **added** lines count as introduced by this change.
5. **Contrast (hard gate, measure — do not eyeball).** Every text element changed (or whose background changed) must clear WCAG against its **actual rendered background**: ≥ 4.5:1 normal, ≥ 3:1 large (≥24px, or ≥19px bold). Measure from the screenshot pixels or `getComputedStyle` + computed ratio — gradient/transparent backgrounds report `transparent`, so composite against what actually renders or sample the screenshot. A pretty element at 3.2:1 is a fail, not "looks right".
6. **Responsive** — no horizontal overflow at 375px; interactive targets ≥ 44px tap height; layout intact at both viewports.
7. **States** — for interactive/data surfaces, empty/loading/error states render (not a blank box, not a frozen UI, not a silent failure); hover/focus/active present.
8. **Renders** — no console error, no broken layout, at both viewports.

---

## Step 4 — Final whole-page verification

After the plan is complete, verify the **whole page** as one composition (not just the individual diffs):

1. Full-page screenshot at 375px and 1440px.
2. Walk the entire pass gate over the composed page — palette/type/spacing coherence across surfaces, contrast on every text element, no overflow, states present, brand voice consistent.
3. If any gate fails at the page level → return to Step 3 for that surface. **Loop until the whole page passes.** Do not declare done on a page that fails its own gate.

---

## Step 5 — Commit, persist, report

```bash
git add [changed files] .web-evolve/state.json .web-evolve/shots/
git commit -m "evolve([scope]): brand pass — [N] surfaces onto brand bar"
# system change:  "evolve([scope]): [change] applied across [N] surfaces"
```

If a pre-commit hook fails: fix the underlying issue (never `--no-verify`). Do not set `status: "done"` until the commit succeeds — state is only authoritative when git agrees.

Set the scope `status: "done"` (page passed Step 4) or `"needs-work"` (a surface left with a recorded blocker). Update `last_scope`. Output the run report, then stop.

---

## Screenshot procedure — Playwright, dual viewport

Capture **375px** and **1440px** for every verification. Preferred mechanism is Playwright; the chrome-devtools/puppeteer MCP is the fallback.

Write `.web-evolve/shot.mjs` once per project:

```js
import { chromium } from 'playwright'
const [url, slug] = process.argv.slice(2)
const browser = await chromium.launch()
for (const [width, tag] of [[375, 'mobile'], [1440, 'desktop']]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.screenshot({ path: `.web-evolve/shots/${slug}-${tag}.png`, fullPage: true })
  await page.close()
}
await browser.close()
```

Run: `node .web-evolve/shot.mjs http://localhost:<port>/<route> <slug>`
If Playwright is not installed: `npx --yes playwright@latest install chromium` then run, or use a project-local Playwright config if one exists.
**MCP fallback** (Playwright unavailable): chrome-devtools — `resize_page` to 375, `take_screenshot` (fullPage, filePath into `.web-evolve/shots/`), then `resize_page` to 1440 and screenshot again. Saving to a file path is zero token cost; never read screenshots back as base64 unless you must reason over pixels.

Screenshots are evidence the user can open. The user cannot see MCP screenshot tool output — saved files in `.web-evolve/shots/` are the proof a change landed.

---

## State schema

```json
{
  "project": "audithq-prod-live",
  "last_scope": "landing",
  "brand_bar_source": ["CLAUDE.md#design", "tokens.lock.json"],
  "scopes": [
    {
      "scope": "landing",
      "status": "done",
      "surfaces": ["src/components/landing/Hero.tsx", "src/components/landing/Pricing.tsx"],
      "issues": ["hero H1 off-brand font", "pricing body text 3.1:1"],
      "fixes": ["hero H1 → brand display type", "pricing body recolored to brand ink, 7.2:1"],
      "shots": [".web-evolve/shots/landing-mobile.png", ".web-evolve/shots/landing-desktop.png"],
      "verified": { "contrast": true, "responsive": true, "states": true, "screenshot": true }
    }
  ]
}
```

State is for resume + evidence, not a quota engine. If state is missing/corrupt/legacy: rename the old file to `.web-evolve/state.json.bak`, log it, and bootstrap fresh.

---

## Output format

```
▶ web-evolve — scope: [scope]  (brand bar: [sources])
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Surfaces in scope:  [N]
Off-brand / failing before:
  - [specific deviation 1]
  - [specific deviation 2]

Pass applied:
  - [change 1 → on-brand result]
  - [change 2 → on-brand result]

Verification (375px + 1440px, every change):
  Contrast: ✅ all text ≥ threshold   Responsive: ✅ no 375px overflow   States: ✅   Renders: ✅
  Shots: .web-evolve/shots/[scope]-mobile.png · [scope]-desktop.png

✅ Done — whole page on brand bar. Committed "evolve([scope]): …"
⚠ Needs more work — [specific blocker on surface X]. Re-run to continue.   ← use when status=needs-work
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Next:  /web-evolve [next route] — or re-run to resume this scope
```

---

## Anti-patterns

- **Judging against generic quality.** "Looks like Awwwards / 21st.dev / polished" is not the bar. The brand bar (this project's CLAUDE.md + tokens) is the only bar. On-brand-and-correct > impressive-and-off-brand.
- **Proceeding on an unverified change.** Every change is screenshot at 375 + 1440 and run through the pass gate before the next change. No exceptions — this is the load-bearing discipline.
- **Eyeballing contrast.** Measure WCAG against the actual rendered background. A faint-but-pretty label is the exact failure this gate exists to stop.
- **Invisible changes counted as progress.** A token swap that resolves to the same rendered value is VOID. State the rendered before→after or it didn't happen.
- **Carrying a regression forward.** If a change makes a surface worse or introduces a banned pattern, revert it and try another approach — never build on top of a regression.
- **Declaring done on a page that fails its own gate.** Step 4 loops until the whole composition passes.
- **Inventing a brand.** No brand system → HALT NEEDS_HUMAN. Never substitute generic design opinions for a missing brand bar.
- **`--no-verify` on a failing hook.** Fix the hook; never bypass it. State is authoritative only when git agrees.

---

## References

All run-time logic lives in this SKILL.md.

- **`tests/`, `evals/`, `references/`** — bundled from the previous area-per-run engine. They assert the old `run_counter` / `session_skill_calls` / area state machine and **do not cover this brand-pass model**. Regenerate them via `skill-creator` before treating them as a gate for this skill.
- **`references/archive/`** — older engine versions. Do not invoke files from `archive/`.

**External:** the screenshot procedure needs Playwright (`npx playwright install chromium`) or a connected chrome-devtools/puppeteer MCP. The brand bar needs the project's CLAUDE.md design section + design tokens — without them the skill halts by design.

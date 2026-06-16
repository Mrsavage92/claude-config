---
name: critique
disable-model-invocation: true
description: Evaluate design from a UX perspective, assessing visual hierarchy, information architecture, emotional resonance, cognitive load, and overall quality with quantitative scoring, persona-based testing, automated anti-pattern detection, and actionable feedback. Use when the user asks to review, critique, evaluate, or give feedback on a design or component.
argument-hint: "[area (feature, page, component...)]"
metadata:
  version: 2.1.1
  user-invocable: true
---

## What this skill does

Produces a structured UX critique of a design surface (page, component, screen, or full route). Two invocation paths:

- **Interactive** — user runs `/critique`. Skill follows Steps 1–5 below: gather assessments, present a Design Health Score table + persona walkthrough + priority issues, ask the user to pick scope, recommend follow-up commands. Output is a markdown report.
- **Orchestrator (Web-evolve Targeted Mode)** — `/web-evolve` calls with `output_format: json` or `mode: web-evolve`. Skill skips the interactive steps, scores routes against the 10-rule Sales-Page Checklist + Nielsen heuristics + AI Slop Detection, and returns structured JSON with `verdict: REBUILD | REFINE | KEEP` per route. See "Web-evolve Targeted Mode" below.

**Output contract (both paths):** every critique passes three mandatory gates — structured-output, hallucinated-stats, banned-phrase. Prose-only "looks good" responses are blocked by design.

## Mandatory gates (run BEFORE returning critique output)

Three gates must pass before the critique artifact is shown to the user OR returned to an orchestrator. Skipping them was the source of the forge baseline's 46/80 score.

1. **Structured-output gate** — `bash scripts/validate-output.sh <artifact-path>` must exit 0. The critique MUST contain: numeric scoring (dimension: number or X/5), a persona section (named persona from `references/personas.md`), an anti-pattern section, ≥3 evidence citations (file:line, screenshot region, section:, line N), and a verdict (REBUILD/REFINE/SHIP/PASS/FAIL). Prose-only critiques are rejected.

2. **Hallucinated-stats gate** — `bash scripts/scan-hallucinated-stats.sh <artifact-path>` must exit 0. Every percentage or `X/N` score in the artifact must either (a) have an `EVIDENCE:`, `computed:`, or `source:` tag on the same line, or (b) be preceded within 5 lines by a code block showing the computation. The "65% we-dominant" pattern caught in the forge baseline is exactly what this gate blocks.

3. **Banned-phrase gate** — `bash scripts/scan-banned-phrases.sh <artifact-path>` must exit 0. Banned: `comprehensive, robust, production-ready, world-class, premium, perfect, 10/10, shit hot, epic, best-in-class, enterprise-grade, battle-tested, deeply, holistic, seamless, cutting-edge`. The "premium" hit in the forge baseline triggered −2 in honest_self_bound.

If any gate exits non-zero, the critique is incomplete. Fix the artifact and re-run the gates. Do not return prose-only "looks good" responses — those are the failure mode this skill exists to prevent.

### Falsifiability rule (source: [.forge-sources.md](.forge-sources.md) Source 3 — scientific-critical-thinking)

Every quantitative or claim-of-fact in the artifact must be **verifiable from evidence the artifact itself cites**. If a reader cannot trace a numeric score back to a specific dimension definition + observation in the artifact, the claim is unfalsifiable and must be stripped or re-grounded.

- "Hierarchy: 2/5" without naming what made it 2 → unfalsifiable. Add: "Hierarchy: 2/5 — heading sizes within 1.2× ratio of body (no scale contrast); primary CTA visual weight equal to secondary link."
- "Reading flow is broken" without naming the broken transition → unfalsifiable. Add: "Reading flow breaks at the hero-to-section-1 boundary because section-1 H2 (32px) is smaller than the body intro paragraph (36px) immediately below it."

### Uncertainty markers (sources: 3, 5)

When the critique infers user intent, mental model, or runtime behaviour that the artifact cannot directly verify, use explicit markers:

- `[INFERRED]` — for guesses about user intent or motivation. E.g. "Visitor stops scrolling here `[INFERRED]` because the next section is jargon-dense."
- `[UNMEASURED]` — for runtime behaviour (animation timing, focus-trap, screen-reader read order) that requires tools not available in this run.

Inferred claims are not deductions. Marking inference honestly is a strength. Pretending an inference is a measurement is the failure mode.

---

## Persona requirement (load-bearing)

Every critique invocation includes a persona walkthrough section. Read `references/personas.md` and pick the 1–2 personas whose ICP matches the target. The persona section must:

- Name the persona (Sarah, James, Priya, Tom, Aisha, Marcus, Lena, David — or a new persona defined in `references/personas.md` with the same shape).
- Cite the persona's actual pain points BY LINE from the personas.md entry (not paraphrased).
- Describe what the persona sees in the first 5 seconds.
- Tie ≥1 concrete observation to ≥1 of the persona's documented pain points.

A critique without a persona section fails the structured-output gate.

---

## Web-evolve Targeted Mode

If your args contain `output_format: json` OR `mode: web-evolve` OR a `checklist:` block, you are invoked from the **web-evolve** orchestrator. In this mode:

1. **Skip Steps 1–5 entirely** (the interactive flow). Do not invoke `/impeccable`. Do not ask the user questions. Do not generate a prose report.
2. **Parse args.** Required:
    - `screenshots: [path1, path2, ...]` — absolute paths to PNGs to score.
    - `routes: [/route1, /route2, ...]` — matching route slugs (one per screenshot).
    - `tier: 90 | 95 | 98 | 100` — target tier for floor calculation.
    - `checklist: sales-page-10` (or inline 10-rule list) — see Sales-Page Checklist below.
    - `mode: per-route-baseline | per-iter-delta | exit-aggregate | vq-compare | memorable-delivery` — what kind of run. See "Mode reference" below.
    - For `mode: vq-compare`: also pass `baseline_screenshot: <path>` and `post_run_screenshot: <path>` — returns `vq_delta` field.
    - For `mode: memorable-delivery`: also pass `memorable_choice: <string>` — returns `delivered: true | false` axis.
3. **For each screenshot, run THREE assessments in sequence:**
    - **(a) Sales-page checklist** (NEW, 10 rules — see below) — count FAILs, list them by rule name.
    - **(b) Nielsen heuristics** (existing — Step 2 Assessment A logic) — score 0–4 per heuristic, sum 0–40.
    - **(c) AI Slop Detection** (existing — Step 2 Assessment A logic) — verdict `clean | suspect | critical`.
4. **Compute per-route verdict:**
    - `REBUILD` if `checklist_fails >= 2` OR `nielsen_total < 20` OR `ai_slop_critical === "critical"`.
    - `REFINE` if `checklist_fails === 1` AND `nielsen_total >= 20` AND `nielsen_total < tier_floor`.
    - `KEEP` if `checklist_fails === 0` AND `nielsen_total >= tier_floor`.
    - **Tier floor (per route, sum-of-40):** target 90 → 24, target 95 → 28, target 98 → 32, target 100 → 36.
5. **Return ONLY structured JSON** (no prose, no recommendations to the user, no questions). Exact schema:
    ```json
    {
      "mode": "per-route-baseline",
      "routes": [
        {
          "route": "/services",
          "screenshot_path": "...",
          "screenshot_sha256": "...",
          "verdict": "REBUILD",
          "checklist_fails": ["sections_earn_place", "what_you_do_above_fold", "outcome_not_process"],
          "checklist_pass_rate": "7/10",
          "nielsen_total": 22,
          "nielsen_scores": { "visibility": 3, "match_real_world": 2, ... },
          "ai_slop_verdict": "suspect",
          "vq_aggregate": 2.4,
          "vq_by_dimension": { "hierarchy": 2.0, "content_density": 2.5, "hero_impact": 2.8, ... },
          "blocking_issues": ["page renders fully black on load — hydration error suspected"],
          "recommended_skill": "web-page",
          "rebuild_brief": "Services index is tile-soup with no service-by-service clarity. Visitor reads 6 problem cards then bounces because no answer section. Rebuild as service-by-service explainer: per service: name + one-sentence what-it-does + outcome the buyer gets + named price-range + 'see details →' link to /services/[slug]. Above the section, add intro: 'Six services. One audit-led flow.' Reference: linear.app/features (single-column-narrative)."
        }
      ]
    }
    ```
6. **Skill routing rules (CRITICAL — recommended_skill field):**
    - For `verdict: "REBUILD"` → `recommended_skill` MUST be `"web-page"` (full route rebuild) OR `"web-scaffold"` (specific section rebuild). **Refinement skills (impeccable / polish / typeset / colorize / animate / overdrive / layout / delight / bolder / clarify / distill / adapt) are BANNED in the recommended_skill field for REBUILD verdicts.** If you find yourself wanting to recommend a refinement skill for a REBUILD route, the verdict is wrong — escalate it to REBUILD by definition.
    - For `verdict: "REFINE"` → `recommended_skill` is the refinement skill most likely to fix the single checklist FAIL or the Nielsen weakness.
    - For `verdict: "KEEP"` → `recommended_skill` is `null`.

### Sales-Page Checklist (the 10 golden rules — applied in Web-evolve Targeted Mode)

Score each route against these 10 rules. Each is binary PASS/FAIL.

1. **`who_you_are_clear_in_5_seconds`** — Within 5 seconds of viewing, can the visitor identify the company name + business category? Brand name + category visible above the fold = PASS. Inferring from copy = FAIL.
2. **`what_you_do_above_fold`** — Is what the company DOES expressed in one plain-English sentence above the fold? Jargon ("deterministic synthesis"), vague ("digital ecosystem optimisation"), or invisible above fold = FAIL.
3. **`who_its_for_named`** — Target audience explicit ("for local service businesses", "for SaaS founders pre-Series-A"). Generic "for businesses" or unnamed = FAIL.
4. **`outcome_not_process`** — Sections describe what the visitor GETS (more leads, less admin time), not what you DO methodologically (we audit, we synthesise). Process-heavy without outcomes = FAIL.
5. **`sections_earn_place`** — Every section answers a visitor question or moves them down the funnel. **A "problem awareness" section MUST be followed immediately by a "here's what we do about it" answer section — never standalone.** Standalone problem-awareness sections that leave the visitor asking "okay so what does this company DO?" = FAIL.
6. **`social_proof_early`** — Logos, testimonials, case studies, or review counts within the first 2 scroll-screens. Social proof only in footer = FAIL.
7. **`clear_primary_cta_above_fold`** — One unambiguous "do this next" button above the fold. Two competing primaries = FAIL. No CTA above fold = FAIL.
8. **`you_language_not_we`** — Hero + first 2 sections frame the visitor's pain and outcome (you / your). Sections starting with "We at [Company]…" or "Our team…" in first 3 scrolls = FAIL.
9. **`pricing_transparency_or_tease`** — Number, "from $X", "starts at $Y", or "free quote in 30 sec" visible somewhere prominent. Mystery-meat pricing = FAIL.
10. **`mobile_parity`** — Rules 1–9 above all pass at 375px viewport, 768px tall above-the-fold. If primary CTA or WHAT YOU DO disappears at mobile = FAIL.

**This checklist is mandatory in Web-evolve Targeted Mode.** It is NOT used in interactive `/critique` invocations (those keep the Nielsen-only flow below).

---

## Mode reference (Web-evolve Targeted)

| Mode | When fired | Required args | Returns |
|---|---|---|---|
| `per-route-baseline` | Phase A.1.5 — initial per-route audit | `screenshots[]`, `routes[]`, `tier`, `checklist: sales-page-10` | Per-route `verdict` (REBUILD/REFINE/KEEP) + `rebuild_brief` |
| `per-iter-delta` | Phase C — every iter, post-Edit | `screenshot_before`, `screenshot_after`, `route` | `visible_delta_0_to_5` + `ssim_estimate` |
| `vq-compare` | Phase A.7.5 (baseline) + Phase D (post-deploy) | `baseline_screenshot`, `post_run_screenshot`, `tier`, `dimensions` | Aggregate `vq_baseline`, `vq_post_run`, `vq_delta` |
| `memorable-delivery` | Phase F — exit gate (Principle 8) | `screenshot`, `route`, `memorable_choice` | `delivered: true \| false`, `evidence`, `gap_if_not_delivered` |
| `exit-aggregate` | Phase F — overall run quality | All Phase D screenshots, `tier` | Awwwards 4-axis scores, gate verdict |

### Canonical dimensions (sum to vq_aggregate, 0–5 scale each)

The skill scores against THIS canonical set in every mode. Do not invent new dimensions per invocation.

| Dimension | What it measures |
|---|---|
| `hero_impact` | Does the hero immediately establish what the site IS? Awwwards Design weight. |
| `hierarchy` | Is there a clear primary-secondary-tertiary scan path? Nielsen visibility + match-real-world. |
| `distinctiveness` | Could this be confused with 10 other AI-template sites? Non-genericity. |
| `product_visibility` | Is the product itself shown (UI screenshot, R3F scene, real video) vs implied (gradient blob)? |
| `motion` | Is motion present and purposeful (scroll choreography, micro-interactions) — OR appropriately absent? |
| `typography` | Foundry-tier type with axis animation, or default-Inter template? Refinement-contract reflex-rejects list. |
| `color` | OKLCH palette, brand-tinted neutrals — or shadcn defaults (slate/zinc/neutral)? |
| `layout` | Grid-breaking, intentional asymmetry — or uniform card grid? |
| `content_clarity` | Sales-page-10 alignment: WHO YOU ARE / WHAT YOU DO / WHO IT'S FOR clear above fold. |
| `structural_integrity` | No broken pages, no fully-blank routes, no hydration errors. Hard floor — if 0, REBUILD verdict mandatory. |

Modes that need fewer dimensions still pull from this list. `per-iter-delta` may use only `hero_impact + distinctiveness + motion` for speed; `exit-aggregate` uses all 10.

### Memorable-delivery mode (NEW — Principle 8 enforcement)

When `/web-evolve` Phase F fires `mode: memorable-delivery`, the skill checks whether the locked `memorable_choice` from Phase A.4 was actually delivered on the deployed site. Returns:

```json
{
  "mode": "memorable-delivery",
  "memorable_choice": "kinetic display headline that re-types on scroll",
  "screenshot_path": "...",
  "screenshot_sha256": "...",
  "delivered": false,
  "evidence": "Hero shows static H1 'AuditHQ - Audit Smarter'. No SplitText animation. No variable-axis morph. Memorable choice missing entirely.",
  "gap_if_not_delivered": "Add SplitText character animation tied to scroll progress. Use Geist Mono with weight-axis animation 100→900 across scroll. Reference: vercel.com homepage scroll.",
  "deliver_score_0_to_5": 0,
  "route": "/"
}
```

`delivered: false` triggers `deviation_count++` in `trajectory.failed_gates` (per /web-evolve Principle 6) AND status `memorable_choice_undelivered`. User-facing summary leads with `⚠️ Memorable choice was locked but not delivered — re-run required.`

### vq-compare mode (formalized — replaces /web-evolve Rule 8 inline spec)

```json
{
  "mode": "vq-compare",
  "baseline_screenshot": { "path": "...", "sha256": "..." },
  "post_run_screenshot": { "path": "...", "sha256": "..." },
  "tier": 95,
  "vq_baseline": 3.2,
  "vq_post_run": 3.8,
  "vq_delta": 0.6,
  "required_delta_for_tier": 0.7,
  "delta_floor_met": false,
  "dimensions_baseline": { "hero_impact": 3.0, "hierarchy": 3.5, ... },
  "dimensions_post_run": { "hero_impact": 3.5, "hierarchy": 4.0, ... },
  "dimensions_with_negative_delta": []
}
```

`delta_floor_met: false` → `/web-evolve` Phase D HALTs or marks status `vq_delta_below_floor` per Principle 6.

### Native sha256 emission (hardened)

Every mode that takes screenshot paths MUST compute sha256 of each file via `Get-FileHash` (Windows PowerShell) / `sha256sum` (POSIX) BEFORE scoring. Return the hash in `screenshot_sha256` (or `baseline_screenshot.sha256` / `post_run_screenshot.sha256` for vq-compare). `/web-evolve` verifies these against orchestrator-computed hashes to catch the failure mode where the skill returns generic scores without actually reading the file (originally caught by `/web-evolve` Cardinal Rule 8 / P10 — now native to critique).

---

## STEPS

(The sections below are the INTERACTIVE flow. Web-evolve Targeted Mode above skips them entirely. Use these only when `/critique` is invoked directly by a user without `output_format: json` or `mode: web-evolve` markers.)

### Step 1: Preparation

Invoke /impeccable, which contains design principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding. If no design context exists yet, you MUST run /impeccable teach first. Additionally gather: what the interface is trying to accomplish.

### Step 2: Gather Assessments

Launch two independent assessments. **Neither must see the other's output** to avoid bias.

You SHOULD delegate each assessment to a separate sub-agent for independence. Use your environment's agent spawning mechanism (e.g., Claude Code's `Agent` tool, or Codex's subagent spawning). Sub-agents should return their findings as structured text. Do NOT output findings to the user yet.

If sub-agents are not available in the current environment, complete each assessment sequentially, writing findings to internal notes before proceeding.

**Tab isolation**: When browser automation is available, each assessment MUST create its own new tab. Never reuse an existing tab, even if one is already open at the correct URL. This prevents the two assessments from interfering with each other's page state.

#### Assessment A: LLM Design Review

Read the relevant source files (HTML, CSS, JS/TS) and, if browser automation is available, visually inspect the live page. **Create a new tab** for this; do not reuse existing tabs. After navigation, label the tab by setting the document title:
```javascript
document.title = '[LLM] ' + document.title;
```
Think like a design director. Evaluate:

**AI Slop Detection (CRITICAL)**: Does this look like every other AI-generated interface? Review against ALL **DON'T** guidelines in the impeccable skill. Check for AI color palette, gradient text, dark glows, glassmorphism, hero metric layouts, identical card grids, generic fonts, and all other tells. **The test**: If someone said "AI made this," would you believe them immediately?

**Holistic Design Review**: visual hierarchy (eye flow, primary action clarity), information architecture (structure, grouping, cognitive load), emotional resonance (does it match brand and audience?), discoverability (are interactive elements obvious?), composition (balance, whitespace, rhythm), typography (hierarchy, readability, font choices), color (purposeful use, cohesion, accessibility), states & edge cases (empty, loading, error, success), microcopy (clarity, tone, helpfulness).

**Cognitive Load** (consult [cognitive-load](reference/cognitive-load.md)):
- Run the 8-item cognitive load checklist. Report failure count: 0-1 = low (good), 2-3 = moderate, 4+ = critical.
- Count visible options at each decision point. If >4, flag it.
- Check for progressive disclosure: is complexity revealed only when needed?

**Emotional Journey**:
- What emotion does this interface evoke? Is that intentional?
- **Peak-end rule**: Is the most intense moment positive? Does the experience end well?
- **Emotional valleys**: Check for anxiety spikes at high-stakes moments (payment, delete, commit). Are there design interventions (progress indicators, reassurance copy, undo options)?

**Nielsen's Heuristics** (consult [heuristics-scoring](reference/heuristics-scoring.md)):
Score each of the 10 heuristics 0-4. This scoring will be presented in the report.

Return structured findings covering: AI slop verdict, heuristic scores, cognitive load assessment, what's working (2-3 items), priority issues (3-5 with what/why/fix), minor observations, and provocative questions.

#### Assessment B: Automated Detection

Run the bundled deterministic detector, which flags 25 specific patterns (AI slop tells + general design quality).

**CLI scan**:
```bash
npx impeccable --json [--fast] [target]
```

- Pass HTML/JSX/TSX/Vue/Svelte files or directories as `[target]` (anything with markup). Do not pass CSS-only files.
- For URLs, skip the CLI scan (it requires Puppeteer). Use browser visualization instead.
- For large directories (200+ scannable files), use `--fast` (regex-only, skips jsdom)
- For 500+ files, narrow scope or ask the user
- Exit code 0 = clean, 2 = findings

**Browser visualization** (when browser automation tools are available AND the target is a viewable page):

The overlay is a **visual aid for the user**. It highlights issues directly in their browser. Do NOT scroll through the page to screenshot overlays. Instead, read the console output to get the results programmatically.

1. **Start the live detection server**:
   ```bash
   npx impeccable live &
   ```
   Note the port printed to stdout (auto-assigned). Use `--port=PORT` to fix it.
2. **Create a new tab** and navigate to the page (use dev server URL for local files, or direct URL). Do not reuse existing tabs.
3. **Label the tab** via `javascript_tool` so the user can distinguish it:
   ```javascript
   document.title = '[Human] ' + document.title;
   ```
4. **Scroll to top** to ensure the page is scrolled to the very top before injection
5. **Inject** via `javascript_tool` (replace PORT with the port from step 1):
   ```javascript
   const s = document.createElement('script'); s.src = 'http://localhost:PORT/detect.js'; document.head.appendChild(s);
   ```
6. Wait 2-3 seconds for the detector to render overlays
7. **Read results from console** using `read_console_messages` with pattern `impeccable`. The detector logs all findings with the `[impeccable]` prefix. Do NOT scroll through the page to take screenshots of the overlays.
8. **Cleanup**: Stop the live server when done:
   ```bash
   npx impeccable live stop
   ```

For multi-view targets, inject on 3-5 representative pages. If injection fails, continue with CLI results only.

Return: CLI findings (JSON), browser console findings (if applicable), and any false positives noted.

### Step 3: Generate Combined Critique Report

Synthesize both assessments into a single report. Do NOT simply concatenate. Weave the findings together, noting where the LLM review and detector agree, where the detector caught issues the LLM missed, and where detector findings are false positives.

Structure your feedback as a design director would:

#### Design Health Score
> *Consult [heuristics-scoring](reference/heuristics-scoring.md)*

Present the Nielsen's 10 heuristics scores as a table:

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | ? | [specific finding or "n/a" if solid] |
| 2 | Match System / Real World | ? | |
| 3 | User Control and Freedom | ? | |
| 4 | Consistency and Standards | ? | |
| 5 | Error Prevention | ? | |
| 6 | Recognition Rather Than Recall | ? | |
| 7 | Flexibility and Efficiency | ? | |
| 8 | Aesthetic and Minimalist Design | ? | |
| 9 | Error Recovery | ? | |
| 10 | Help and Documentation | ? | |
| **Total** | | **??/40** | **[Rating band]** |

Be honest with scores. A 4 means genuinely excellent. Most real interfaces score 20-32.

#### Strengths (mandatory section — never omit)

After the Design Health Score table, list 2–3 things the design does well, with specific evidence (element, location, why it works). Source: anthropics/knowledge-work-plugins design-critique + davila7 scientific-critical-thinking 5-part verdict — every critique includes positive observations.

A critique that returns only negatives is incomplete. If you cannot find 2 strengths, that itself is the most useful finding to report — surface it explicitly rather than padding with manufactured positives.

#### Anti-Patterns Verdict

**Start here.** Does this look AI-generated?

**LLM assessment**: Your own evaluation of AI slop tells. Cover overall aesthetic feel, layout sameness, generic composition, missed opportunities for personality.

**Deterministic scan**: Summarize what the automated detector found, with counts and file locations. Note any additional issues the detector caught that you missed, and flag any false positives.

**Visual overlays** (if browser was used): Tell the user that overlays are now visible in the **[Human]** tab in their browser, highlighting the detected issues. Summarize what the console output reported.

#### Overall Impression
A brief gut reaction: what works, what doesn't, and the single biggest opportunity.

#### What's Working
Highlight 2-3 things done well. Be specific about why they work.

#### Priority Issues
The 3-5 most impactful design problems, ordered by importance.

For each issue, tag with **P0-P3 severity** (consult [heuristics-scoring](reference/heuristics-scoring.md) for severity definitions):
- **[P?] What**: Name the problem clearly
- **Why it matters**: How this hurts users or undermines goals
- **Fix**: What to do about it (be concrete)
- **Suggested command**: Which command could address this (from: /animate, /quieter, /shape, /optimize, /adapt, /clarify, /layout, /distill, /delight, /audit, /polish, /bolder, /typeset, /critique, /colorize, /overdrive)

#### Persona Red Flags
> *Consult [personas](references/personas.md)*

Auto-select 1-2 personas whose ICP matches the target (Sarah, James, Priya, Tom, Aisha, Marcus, Lena, David). Cite the persona's pain points by line number from `references/personas.md`. If `.github/copilot-instructions.md` contains a `## Design Context` section from `impeccable teach`, also generate 1-2 project-specific personas from the audience/brand info.

For each selected persona, walk through the primary user action and list specific red flags found:

**Sarah (SMB owner, trades)** — pain #2 from personas.md:16: "generic stock photos of happy professionals — flags as fake". Hero uses stock-shot of smiling man in polo shirt. She bounces in <10s.

**James (Solo SaaS founder)** — pain #3 from personas.md:29: "pricing pages that hide tiers behind 'contact sales'". Pricing CTA goes to a Calendly link. He won't book a call before seeing a number.

Be specific. Name the exact elements and interactions that fail each persona. Don't write generic persona descriptions; write what broke for them.

#### Minor Observations
Quick notes on smaller issues worth addressing.

#### Questions to Consider
Provocative questions that might unlock better solutions:
- "What if the primary action were more prominent?"
- "Does this need to feel this complex?"
- "What would a confident version of this look like?"

**Remember**:
- Be direct. Vague feedback wastes everyone's time.
- Be specific. "The submit button," not "some elements."
- Say what's wrong AND why it matters to users.
- Give concrete suggestions, not just "consider exploring..."
- Prioritize ruthlessly. If everything is important, nothing is.
- Don't soften criticism. Developers need honest feedback to ship great design.

### Step 4: Ask the User

**After presenting findings**, use targeted questions based on what was actually found. ask the user directly to clarify what you cannot infer. These answers will shape the action plan.

Ask questions along these lines (adapt to the specific findings; do NOT ask generic questions):

1. **Priority direction**: Based on the issues found, ask which category matters most to the user right now. For example: "I found problems with visual hierarchy, color usage, and information overload. Which area should we tackle first?" Offer the top 2-3 issue categories as options.

2. **Design intent**: If the critique found a tonal mismatch, ask whether it was intentional. For example: "The interface feels clinical and corporate. Is that the intended tone, or should it feel warmer/bolder/more playful?" Offer 2-3 tonal directions as options based on what would fix the issues found.

3. **Scope**: Ask how much the user wants to take on. For example: "I found N issues. Want to address everything, or focus on the top 3?" Offer scope options like "Top 3 only", "All issues", "Critical issues only".

4. **Constraints** (optional; only ask if relevant): If the findings touch many areas, ask if anything is off-limits. For example: "Should any sections stay as-is?" This prevents the plan from touching things the user considers done.

**Rules for questions**:
- Every question must reference specific findings from the report. Never ask generic "who is your audience?" questions.
- Keep it to 2-4 questions maximum. Respect the user's time.
- Offer concrete options, not open-ended prompts.
- If findings are straightforward (e.g., only 1-2 clear issues), skip questions and go directly to Step 5.

### Step 5: Recommended Actions

**After receiving the user's answers**, present a prioritized action summary reflecting the user's priorities and scope from Step 4.

#### Action Summary

List recommended commands in priority order, based on the user's answers:

1. **`/<command-name>`**: Brief description of what to fix (specific context from critique findings)
2. **`/<command-name>`**: Brief description (specific context)
...

**Rules for recommendations**:
- Only recommend commands from: /animate, /quieter, /shape, /optimize, /adapt, /clarify, /layout, /distill, /delight, /audit, /polish, /bolder, /typeset, /critique, /colorize, /overdrive
- Order by the user's stated priorities first, then by impact
- Each item's description should carry enough context that the command knows what to focus on
- Map each Priority Issue to the appropriate command
- Skip commands that would address zero issues
- If the user chose a limited scope, only include items within that scope
- If the user marked areas as off-limits, exclude commands that would touch those areas
- End with `/polish` as the final step if any fixes were recommended

After presenting the summary, tell the user:

> You can ask me to run these one at a time, all at once, or in any order you prefer.
>
> Re-run `/critique` after fixes to see your score improve.

---

## Anti-patterns (failure modes /critique runs have committed)

Read this before returning any critique.

1. **Prose-only "looks good" response.** Returning a paragraph of impressions with no numeric scores, no persona walkthrough, no anti-pattern section. The structured-output gate exists to block this — DO NOT bypass it.
2. **Hallucinated stats.** Numbers like "60% of users" or "9/10 hierarchy" without an `EVIDENCE:` / `computed:` / `source:` tag on the same line. The hallucinated-stats gate exists to catch this.
3. **Banned self-praise.** Calling the critique itself "comprehensive" or the design "premium." Strip these words. The banned-phrase gate exists to catch them.
4. **Persona walkthrough that paraphrases personas.md.** The persona's pain points must be cited by line number from `references/personas.md`, not summarised in your own words.
5. **Default-high scoring.** Scoring everything 3-4/5 because the design "looks fine." Per `[[feedback_taste_calibration]]` — recalibrate to SOTM/Bruno Simon, not median SaaS. Most real interfaces score 20-32 on the Nielsen 40-pt scale.
6. **Inference dressed as measurement.** Claiming a user "stops scrolling here" without `[INFERRED]` marker, or claiming animation timing without `[UNMEASURED]` marker. Honest inference is a strength; pretending inference is measurement is the failure mode.
7. **All-negative report.** Omitting the Strengths section because "nothing was great." If you cannot find 2 strengths, name that explicitly — it's the most useful finding.
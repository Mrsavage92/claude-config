# /web-evolve - Phase Protocols D/E/F (final + post-deploy + retrospective)

_Archived from `phase-protocols.md` 2026-05-18 to keep file size under the 1000-line cap. Phases A/B/C live in `phase-protocols.md`. Decisions live in `decisions.md`._

---

## Phase D — Final report + push

1. Spawn 4 parallel web-score agents (same category split as Phase B) against current state → merge into `.evolution/scores/final-score.json`
2. Spawn web-screenshot for full-page desktop + mobile → `.evolution/final/`
3. Write `EVOLUTION-LOG.md`:
   - Baseline → Final score + category delta table
   - Per-section before/after screenshot pairs
   - Full iteration log from BUILD-LOG entries
   - PageSpeed delta (LCP / INP / CLS baseline → final)
   - a11y delta (violation count baseline → final, if --high-tier)
   - SEO delta (if target ≥ 95)
   - /critique scored dimensions (if target ≥ 95)
4. Commit + push to **evolve branch first** (never directly to main):
   ```bash
   # CRITICAL: never push directly to main from Phase D.
   # All evolve-branch changes go to remote, get a Vercel preview URL,
   # get visually verified, THEN merged to main.
   git -C "{project_path}" add EVOLUTION-LOG.md BUILD-LOG.md
   git -C "{project_path}" commit -m "evolve: {page} final — score {baseline} → {final}"
   git -C "{project_path}" push -u origin {evolve_branch}
   ```

5. **Resolve Vercel preview URL for the evolve branch (P19 + P5 — gh precheck + fallback):**

   **5a. Precheck `gh` CLI availability + auth:**
   ```bash
   if ! command -v gh >/dev/null 2>&1; then
     log "gh CLI not found. Cannot query GitHub deployments API for Vercel preview URL."
     PREVIEW_RESOLUTION_PATH="fallback-construct"
   elif ! gh auth status >/dev/null 2>&1; then
     log "gh CLI present but not authenticated. Run 'gh auth login' first."
     PREVIEW_RESOLUTION_PATH="fallback-construct"
   else
     PREVIEW_RESOLUTION_PATH="gh-api"
   fi
   ```

   **5b. Detect Vercel project's preview deploy config (P5 — handles Vercel projects with previews disabled):**
   ```bash
   # Check if any prior preview deploy exists on this project (means previews are enabled):
   if [ "$PREVIEW_RESOLUTION_PATH" = "gh-api" ]; then
     prior_previews=$(gh api "repos/${ORG}/${REPO}/deployments?environment=Preview&per_page=1" --jq 'length')
     if [ "$prior_previews" = "0" ]; then
       log "No prior Vercel preview deploys found — preview deploys may be disabled on this Vercel project."
       PREVIEW_RESOLUTION_PATH="no-preview-deploys"
     fi
   fi
   ```

   **5c. Branch:**

   **Path 1 — `gh-api` (preferred):**
   ```bash
   sleep 5  # Vercel webhook ~5s
   PREVIEW_URL=$(gh api "repos/${ORG}/${REPO}/deployments?sha=$(git rev-parse HEAD)&per_page=1" \
     --jq '.[0].statuses_url' | xargs -I {} gh api {} --jq '.[0].target_url')
   ```
   Wait up to 90s polling. If URL not resolved within 90s → fall through to Path 3.

   **Path 2 — `fallback-construct`:** Construct the typical Vercel preview URL pattern and probe:
   ```bash
   # Pattern: {project-slug}-git-{branch-slug}-{team-slug}.vercel.app
   BRANCH_SLUG=$(echo "${EVOLVE_BRANCH}" | tr '/' '-' | tr '_' '-')
   PROJECT_SLUG=$(cat "${PROJECT_PATH}/.vercel/project.json" 2>/dev/null | jq -r .projectName)
   TEAM_SLUG=$(cat "${PROJECT_PATH}/.vercel/project.json" 2>/dev/null | jq -r .orgSlug)
   CANDIDATE_URL="https://${PROJECT_SLUG}-git-${BRANCH_SLUG}-${TEAM_SLUG}.vercel.app"
   # Probe — wait up to 90s for HTTP 200:
   for i in {1..18}; do
     if curl -fsS -o /dev/null "$CANDIDATE_URL"; then
       PREVIEW_URL="$CANDIDATE_URL"
       break
     fi
     sleep 5
   done
   ```
   If URL still not 200 within 90s → fall through to Path 3.

   **Path 3 — `no-preview-deploys` OR all-paths-failed:** Vercel previews are disabled or unreachable. Two sub-options:

   - **`--no-preview-verify` flag set** → skip preview verify entirely, push directly to main, accept the verify-on-prod risk. Log: `"Preview-verify SKIPPED per --no-preview-verify flag. Pushing direct to main. Rollback ready if regression detected at Step 10."`
   - **Default behavior** → HALT NEEDS_HUMAN with explicit options:
     ```
     "Cannot resolve Vercel preview URL. Possible causes:
       1. Vercel preview deploys disabled on this project → enable in Vercel dashboard
       2. gh CLI unavailable or not authenticated → run 'gh auth login'
       3. First commit to this branch — wait 2 min and re-run
     Options:
       (a) Fix above + re-run /web-evolve (resumes from Phase D)
       (b) Override with --no-preview-verify (push direct to main, accept risk)
       (c) Discard evolve branch entirely"
     ```

   **HALT escalation counter (P20):** Each HALT writes `${PROJECT_PATH}/.evolution/halts.json`:
   ```json
   { "halts": [{"phase": "D", "step": "5", "reason": "preview-url-unresolvable", "ts": "..."}, ...] }
   ```
   If `halts[].length >= 3` for THIS project → escalate beyond HALT: fire `Skill('root-cause-analyzer', args='analyze .evolution/halts.json across last 3 halts — common pattern?')` to surface the underlying issue. Don't loop user through 3 prompts.

6. **Poll preview URL until deploy completes** (HTTP 200 + new content marker present):
   ```bash
   PREVIEW_URL="<from step 5>"
   # Use a marker unique to this run — e.g. a new check/visual you know just landed
   MARKER="<unique-string-from-the-iter-2-or-later-change>"
   until curl -fsS "$PREVIEW_URL" 2>/dev/null | grep -q "$MARKER"; do sleep 5; done
   ```

7. **Visual-verify on preview URL with Puppeteer + critique (THE preview-deploy-verify gate):**
   - Puppeteer navigate to preview URL
   - Screenshot at 1440×900 desktop + 390×844 mobile
   - `Skill('critique', args='compare preview vs Phase A baseline | screenshots: [{baseline}, {preview-desktop}, {preview-mobile}] | scored | dimensions: hero-impact, hierarchy, distinctiveness, product-visibility')` — same critique invocation as Cardinal Rule 8 VQ measurement
   - If critique's delta ≥ tier_vq_delta_floor → proceed to step 8
   - If critique's delta < floor → trajectory.json status `vq_delta_below_floor_at_preview`, HALT NEEDS_HUMAN: `"Preview deployed but visual delta below floor ({delta} < {required}). Inspect preview URL: {PREVIEW_URL}. Decide: (a) merge anyway (override), (b) discard branch, (c) run more iterations."`

8. **Fast-forward merge evolve → main + push to main** (only AFTER preview verify):
   ```bash
   git -C "{project_path}" checkout main
   git -C "{project_path}" merge --ff-only {evolve_branch}
   git -C "{project_path}" push origin main
   ```

9. Wait 45s for Vercel production rebuild (main triggers prod alias auto-deploy).

10. **Production verify** (final sanity check on live URL):
    ```bash
    until curl -fsS "{live_url}" 2>/dev/null | grep -q "$MARKER"; do sleep 5; done
    ```
    If marker doesn't appear within 120s on prod → HALT NEEDS_HUMAN: `"Prod deploy didn't propagate marker '{MARKER}' within 120s. Vercel/CDN may need cache invalidation. Check {live_url} manually."`

**Why this flow:** Run #2 on Orbit Digital (2026-05-16) shipped a broken hero (everything opacity:0 at landing) directly to prod via `git push origin main` from Phase D — discovered only via Puppeteer probe AFTER prod was already broken. The preview-deploy-verify gate moves the visual check BEFORE main, so prod never sees a regression that hadn't been verified on a preview URL first. **Added 2026-05-16.**

---

## Phase E — Post-deploy verification (chrome-devtools-driven, not curl)

**Step E.1 — Status code:**
```bash
curl -s -o /dev/null -w "%{http_code}" "{live_url}"
```
HALT if not 200.

**Step E.2 — Hydration + font + DOM sweep (chrome-devtools):**
```
mcp__chrome-devtools__new_page(url={live_url})
mcp__chrome-devtools__evaluate_script(function=`async () => {
  await document.fonts.ready;
  return {
    title: document.title,
    h1_text: document.querySelector('h1')?.textContent || null,
    has_react_root: !!document.querySelector('#__next, #root, [data-reactroot]'),
    hydration_complete: !document.querySelector('[data-react-loading]'),
    fonts_loaded: Array.from(document.fonts).map(f => ({family: f.family, status: f.status})),
    css_var_root_color: getComputedStyle(document.documentElement).getPropertyValue('--background'),
    section_count: document.querySelectorAll('section').length,
    images_with_alt: Array.from(document.querySelectorAll('img')).map(i => ({src: i.src, alt: i.alt, loaded: i.complete && i.naturalHeight !== 0}))
  };
}`)
```

Parse the result. HALT NEEDS_HUMAN if any:
- `h1_text` does NOT contain the expected hero text from CONTEXT.md (deploy is showing stale content)
- `has_react_root` is false
- `fonts_loaded` includes any font with `status: 'error'` or `status: 'unloaded'`
- `css_var_root_color` is empty string (token system not loaded)
- `section_count` differs from local-build expected count by >1
- Any image has `loaded: false`

**Step E.3 — Console + network capture (native chrome-devtools, no JS hack):**
```
mcp__chrome-devtools__list_console_messages(types=["error","warn"])
mcp__chrome-devtools__list_network_requests()
```
For console: if non-empty, log to EVOLUTION-LOG.md as deploy_warning. Same-origin errors (not 3rd-party analytics) → HALT NEEDS_HUMAN.
For network: filter to status ≥ 400, exclude analytics/3p; any same-origin failure = HALT NEEDS_HUMAN with the failed URL list.

(Puppeteer fallback if chrome-devtools unavailable: previous JS-hack snippet using `window.__pp_console_errors` and `performance.getEntriesByType('resource').filter(r => r.responseStatus >= 400)`.)

**Step E.4 — Re-run perf trace on the deployed URL:**
- Top-tier: `mcp__chrome-devtools__performance_start_trace` on live_url, compare to Phase B `.evolution/perf-trace.json`
- Standard: WebFetch PageSpeed on live_url, compare to `.evolution/pagespeed.json`

If LCP regressed >500ms or INP regressed >50ms or CLS regressed >0.05 → flag deploy_regression in EVOLUTION-LOG.md.

**Step E.4b — Vercel Speed Insights RUM (if project deploys to Vercel AND `@vercel/speed-insights` is installed):**

Real-user monitoring data is the ultimate truth — synthetic Lighthouse can't catch what users actually experience. Read the deployed RUM data:
```
WebFetch(
  url=`https://vercel.com/api/web-vitals/{project_id}?since=24h`,
  prompt="Extract p75 LCP, INP, CLS, FCP, TTFB across all real visitors in the last 24h. Compare to synthetic targets (LCP < 2.0s, INP < 150ms, CLS < 0.05). Return JSON."
)
```
Note: requires Vercel API token in env. If unavailable, log "Vercel Speed Insights RUM skipped (no token)" — do not HALT.

If p75 RUM values regress vs Phase E.4 synthetic by >30% on any metric → flag rum_real_world_regression in EVOLUTION-LOG.md. This is the strongest possible signal — synthetic looked fine but real users are suffering.

**Step E.5 — Final rescore (tier A+G):**
Spawn web-score (tier: category:A,G) against `live_url` — the two most likely categories to have deploy-specific regressions (fonts not loading, real-world CWV values). Append result to EVOLUTION-LOG.md.

---

## Phase F — Self-audit retrospective (MANDATORY — Cardinal Rule 14)

The loop never exits without Phase F. This is how `/web-evolve` improves itself between runs. Output: `.evolution/retro.md` + a separate commit `evolve-retro: {date}` to a `retro/` folder.

**Step F.1 — Read run data:**
- `.evolution/loop-state.json` (final state)
- `BUILD-LOG.md` (all iteration entries this session)
- `.evolution/scores/score.json` + `.evolution/scores/final-score.json`
- `.evolution/{a11y,seo,critique,pagespeed}.json` (if target ≥ 95)

**Step F.1.5 — Phase R signature delivery checklist (target ≥ 98 only — Cardinal Rule 17 + Gate F):**

Read `DESIGN-BRIEF.md` `## Top-Tier Anchor` section → extract `hero_signature` (A, B, or C). Then verify the signature was ACTUALLY delivered, not just that a skill was invoked claiming to deliver it. This is the gate that Run #2 on Orbit Digital (2026-05-16) bypassed — it declared "B+A+C combined" and delivered B-only at ~40%, calling it done.

**Verification approach (P2 fix — Puppeteer runtime, not grep):**

Grep on source code is brittle — comments pass (`// scrub: true`), template-literal end values fail (`end: \`+=${vh*2}\``), .next chunks may not exist yet, font-variation can route via `next/font` without literal CSS. **Replace all greps with Puppeteer runtime probes against the deployed preview/prod URL.** Runtime is ground truth, source code is hope.

```javascript
// Puppeteer navigate to {live_url} or {preview_url}, then evaluate:
(async () => {
  await new Promise(r => setTimeout(r, 2000)); // wait for hero motion to mount
  return JSON.stringify({
    // Signature A — WebGL via R3F
    A_canvas_present: !!document.querySelector('canvas'),
    A_canvas_count: document.querySelectorAll('canvas').length,
    A_three_loaded: typeof THREE !== 'undefined',
    A_r3f_reconciler: !!document.querySelector('canvas[data-engine*="three"], canvas[data-engine*="r3f"]')
                    || (typeof window.__R3F !== 'undefined'),

    // Signature B — GSAP ScrollTrigger pin + scrub + SplitText
    B_gsap_loaded: typeof gsap !== 'undefined' || !!window.gsap,
    B_scrolltrigger_loaded: typeof ScrollTrigger !== 'undefined' || (window.gsap && !!window.gsap.ScrollTrigger),
    B_pin_active: (function(){
      try { return (window.ScrollTrigger || window.gsap?.ScrollTrigger)?.getAll?.()
        ?.some(t => t.pin && t.scrub) ?? false; } catch { return false; }
    })(),
    B_pin_distance_vh: (function(){
      try {
        const triggers = (window.ScrollTrigger || window.gsap?.ScrollTrigger)?.getAll?.() || [];
        const pinned = triggers.find(t => t.pin && t.scrub);
        if (!pinned) return 0;
        return Math.round((pinned.end - pinned.start) / window.innerHeight * 100); // % of vh
      } catch { return 0; }
    })(),
    B_splittext_used: document.querySelectorAll('.hero-word, [class*="split-text"]').length > 0,
    B_lenis_active: !!window.lenis || typeof Lenis !== 'undefined'
                  || !!document.documentElement.dataset.lenisPrevent,

    // Signature C — Kinetic typography with variable-axis on scroll
    C_h1_font_variation_settings: getComputedStyle(document.querySelector('h1')).fontVariationSettings,
    C_variable_font_present: (function(){
      const ff = getComputedStyle(document.querySelector('h1')).fontFamily;
      // Check if the loaded font has variable axes
      try {
        return Array.from(document.fonts).some(f => f.family.includes(ff.split(',')[0].replace(/['"]/g, '')) && f.featureSettings !== 'normal');
      } catch { return false; }
    })(),
    C_axis_animated_on_scroll: (function(){
      // Inspect H1 inline style or any animation tied to scroll changing font-variation-settings
      const h1 = document.querySelector('h1');
      if (!h1) return false;
      const initialFVS = getComputedStyle(h1).fontVariationSettings;
      window.scrollBy(0, 200);
      const afterScrollFVS = getComputedStyle(h1).fontVariationSettings;
      window.scrollBy(0, -200);
      return initialFVS !== afterScrollFVS;
    })(),
  });
})()
```

Orchestrator parses the JSON and evaluates per signature:

**Signature A delivered** = `A_canvas_present === true` AND `A_canvas_count >= 1` AND (`A_three_loaded === true` OR `A_r3f_reconciler === true`). Bundle-size check is OPTIONAL — runtime presence is the real proof.

**Signature B delivered** = `B_gsap_loaded === true` AND `B_scrolltrigger_loaded === true` AND `B_pin_active === true` AND `B_pin_distance_vh >= 150` AND `B_splittext_used === true` AND `B_lenis_active === true`.

**Signature C delivered** = `C_h1_font_variation_settings !== 'normal'` AND `C_variable_font_present === true` AND `C_axis_animated_on_scroll === true`.

If any fail for the picked signature → Gate F status `signature_{a|b|c}_undelivered` with the SPECIFIC field that failed (e.g. `signature_b_undelivered: pin_distance_vh was 80, required >=150`).

**Combined signature override:** verify ALL applicable signature checks pass (P9 fix — combined requires ALL, doesn't soften).

**Combined signature (Cardinal Rule 17 — user-overrode_singularity = true):** verify ALL applicable signature gates above. Combined doesn't lower the bar — it raises it (must deliver all 2-3 picks). If user-overrode happened, the orchestrator MUST surface in retro: "User declared combined signature. Verified pieces: A={pass/fail}, B={pass/fail}, C={pass/fail}. Anything `fail` = signature_combined_partial_delivery."

**Add Gate F to Cardinal Rule 14 evaluation:**
- Gate F — `signature_delivered` (target ≥ 98 only):
  - signature A → R3F Canvas in DOM + bundle chunk present
  - signature B → ScrollTrigger pin + scrub + ≥150% viewport + SplitText
  - signature C → font-variation-settings + scroll-driven + variable font registered
  - If false → status `signature_{a|b|c}_undelivered`

**Step F.2 — Compute per-skill efficacy table:**

For each fix_skill that was invoked this run:
```
{
  "typeset":   { "calls": 7, "keeps": 4, "reverts": 2, "voids": 1, "keep_rate": 0.57, "avg_delta_score": +0.6 },
  "overdrive": { "calls": 3, "keeps": 3, "reverts": 0, "voids": 0, "keep_rate": 1.00, "avg_delta_score": +4.2 },
  ...
}
```

Flag any skill with `keep_rate < 0.5` AND `calls >= 3` → recommend routing edit.

**Step F.3 — Propose `fix-routing.md` edits:**

For each flagged skill:
- If a `secondary` was set and outperformed primary → recommend swapping primary↔secondary in SKILL_LOOKUP
- If no secondary set → propose one based on which skill produced the cleanest unrelated improvements

Output as a unified diff in retro.md that the user can apply with `git apply` if they agree.

**Step F.4 — Propose `SKILL.md` (this file) edits:**

Catalog this run's friction:
- Steps that produced GUARD FAIL — what condition? Tighten the guard.
- Iterations that needed UNCERTAIN → 10s retry — was the selector wrong? Was the scroll position off? Recommend selector-map improvement.
- VOID rate above 30% — what was the common cause? (skill choice, selector, scope mismatch)
- Cardinal rule violations — any iteration where a rule was bent? Strengthen the wording.

Output as a "Recommended SKILL.md edits" section in retro.md.

**Step F.5 — Diff against this skill's Cardinal Rules + tier-contracts.md:**

Read `~/.claude/skills/web-evolve/references/decisions.md` (Cardinal Rules) and `~/.claude/skills/web-evolve/references/tier-contracts.md`. Compare against what this run actually did. Flag drift:
- Any Cardinal Rule not enforced this run?
- Any tier-contracts.md requirement skipped?
- Any MCP/Skill the loop should have used but didn't?

Output as a "Contract Drift" table in retro.md.

**Step F.6 — Update Trend Pulse / fix-routing if user approves:**

After writing retro.md, surface the top-3 recommended edits to the user:
> "Self-audit complete. 3 recommended edits to web-evolve config:
>  1. fix-routing.md: swap A7 primary/secondary (overdrive keep_rate 1.00 > impeccable 0.40)
>  2. SKILL.md: tighten Step 4.5 fix_type detection (3 mis-classifications this run)
>  3. fix-routing.md: add `delight` as secondary for D5 (animate REVERTed twice on hero)
>  Apply now? (yes/no/edit)"

If yes — apply via Edit tool, commit `evolve-retro: route updates from {date}`. If no — retro.md still exists for future review.

**Step F.7 — Update trajectory.json with this run's completion + EVALUATE HARD GATES (Cardinal Rule 14):**

Before writing the run entry, compute `status` (worst gate) + `failed_gates: string[]` (P8 fix — array, not single string) by evaluating ALL six hard gates and collecting all failures:

```
failed_gates = []

# Gate A — route-around detection
if refinement_skill_invocations_count == 0 AND target_score >= 90:
    failed_gates.append({"gate": "A", "name": "route_around_detected", "severity": "CRITICAL",
      "detail": "Zero refinement skills fired. Skill invocations: " + str(skill_invocations_log)})

# Gate B — visual quality delta floor (via Skill('critique'), not self-scored)
if (critique.aggregate_vq_post_run - critique.aggregate_vq_baseline) < tier_vq_delta_floor:
    failed_gates.append({"gate": "B", "name": "vq_delta_below_floor", "severity": "HIGH",
      "detail": "delta=" + str(delta) + ", required=" + str(tier_vq_delta_floor)})

# Gate C — refinement-skill floor (effect-verified count, not invocation count)
if refinement_skill_effective_count < tier_refinement_floor:
    failed_gates.append({"gate": "C", "name": "incomplete_refinement_floor", "severity": "HIGH",
      "detail": "effective=" + str(count) + ", required=" + str(tier_refinement_floor)})

# Gate D — mandated agents (artifact-verified)
if mandated_agents_artifact_count < tier_required_artifacts:
    failed_gates.append({"gate": "D", "name": "mandated_agents_skipped", "severity": "HIGH",
      "detail": "missing artifacts: " + ", ".join(missing_artifacts)})

# Gate E — Phase R artifacts (target >= 98)
if target_score >= 98 AND not phase_r_artifacts_present:
    failed_gates.append({"gate": "E", "name": "phase_r_skipped", "severity": "CRITICAL"})

# Gate F — signature delivery via Puppeteer runtime
if target_score >= 98 AND not signature_runtime_verified:
    failed_gates.append({"gate": "F", "name": "signature_" + signature.lower() + "_undelivered",
      "severity": "HIGH", "detail": runtime_check_failure_field})

# Status assignment from collected failures
if failed_gates is empty:
    status = "completed"
elif any gate has severity CRITICAL:
    status = (first CRITICAL gate's name)  # most-severe wins
elif any gate has severity HIGH:
    status = (first HIGH gate's name)
else:
    status = "completed_with_warnings"
```

The trajectory.json entry records BOTH `status` (single most-severe gate for backwards-compat with old code that reads one status) AND `failed_gates` (full array — what new code reads to see complete picture). Run #2 on Orbit Digital recorded `completed_at_lower_tier` and lost the fact that Gates B + C + D all failed independently — `failed_gates: []` preserves all of them.

Then write the run entry:

```json
{
  "id": N,
  "started_at": "...",
  "completed_at": "{now}",
  "status": "{computed above — completed | route_around_detected | vq_delta_below_floor | incomplete_refinement_floor}",
  "gate_a_route_around": {"failed": bool, "refinement_skill_invocations_count": N, "iterations_via_edit_direct_only": [list of check_ids]},
  "gate_b_vq_delta": {"failed": bool, "baseline_vq": x, "post_run_vq": y, "delta": z, "required": w},
  "gate_c_refinement_floor": {"failed": bool, "count": N, "required": M, "tier_min": K},
  "target_score": ...,
  "tier": "...",
  "mode": "...",
  "baseline_score": ...,
  "final_score": ...,
  "real_iterations": ...,
  "void_count": ...,
  "visual_quality_baseline": ...,
  "visual_quality_final": ...,
  "refinement_skill_invocations_count": ...,
  "refinement_skills_used": ["overdrive", "typeset", ...],
  "awwwards": {"design": ..., "usability": ..., "creativity": ..., "content": ..., "avg": ...},
  "perf_trace": {"lcp_ms": ..., "inp_ms": ..., "cls": ..., "lighthouse_perf": ...},
  "uncompleted_wc_checks": [...],
  "next_run_recommendations": [
    "Top 3 fixes the loop ran out of iterations on, ordered by visual_bonus",
    "Any check stuck at WONTFIX that the user might want to revisit",
    "Any NEEDS_HUMAN that was never resolved"
  ],
  "phase_f_retro_path": ".evolution/retro.md",
  "skill_efficacy": { "typeset": {"keeps": 4, "reverts": 1, ...}, ... }
}
```

**If any gate failed, the Phase F.9 user-facing summary MUST lead with the failure (see Rule 14):**

```
⚠️ ROUTE-AROUND DETECTED — Run #{N} did not invoke any refinement skill.
   Score moved {baseline} → {final} via edit_direct on checks the SKILL_LOOKUP
   says require refinement skills: {list}.
   Visual quality moved {baseline_vq} → {post_run_vq} (delta {x}, required {y}).
   This run does NOT count as a tier-advance. Re-run required.

   Refinement skills that should have fired:
   - Skill('typeset')  on A1 (font swap requires typography judgment, not edit)
   - Skill('layout')   on E10 (footer restructure)
   - Skill('clarify')  on J2 (copy quality)
   - Skill('colorize') on C4 (token migration)
   - Skill('animate')  on D1 (motion adoption)

   Run them now? (yes / pick subset / no)
```

The next `/web-evolve` invocation reads `trajectory.runs[-1].status` — if it is anything other than `"completed"`, it MUST NOT advance the target tier. It re-runs at the SAME target with `mode: "advance"` carrying the failed-gates as `focus_list`.

If this run set `world_class_anchor` (Phase R) or installed motion stack (Phase G), update those fields at the trajectory root level (not under any specific run — they are cross-run invariants).

Clear `current_run_state` (set to null).

Write trajectory.json back to disk.

**Step F.8 — Commit trajectory + retro:**
```bash
git -C "{project_path}" add .evolution/retro.md .evolution/trajectory.json
git -C "{project_path}" commit -m "evolve-retro: Run #{N} {baseline}→{final} ({tier}) — trajectory updated"
git -C "{project_path}" push origin {evolve_branch_or_main}
```

**Step F.9 — Final echo to user:**

```
✓ web-evolve Run #{N} complete.

  Baseline:  {baseline}/100 ({baseline_tier})
  Final:     {final}/100 ({final_tier})
  Delta:     +{delta} ({iterations} iterations, {void_count} VOIDs)

Awwwards-equivalent score: {design}D / {usability}U / {creativity}Cr / {content}Co = {avg}/10 avg
Perf: LCP {lcp}ms · INP {inp}ms · CLS {cls} · Lighthouse {lh}/100

Next-run recommendations:
  1. {rec 1}
  2. {rec 2}
  3. {rec 3}

To advance to the next tier, run /web-evolve again (here or in a new chat).
The skill will read trajectory.json and push toward {next_target}/100.
```

This is the explicit invitation for the user to re-invoke. The trajectory.json now has everything the next run needs.

---

## Hard stops — this skill MUST NOT

- Run grep/Read/Bash for auditing — always via web-score
- Edit source files directly — Skill() does that, web-patch commits it
- Call `Skill('mcp__...')` — MCP tools are called directly, not via Skill wrapper
- Self-grade vision checks — always NEEDS_HUMAN
- Skip BUILD-LOG entry for any iteration (including VOID)
- Count VOID toward max_iterations
- **Skip `Skill('impeccable', args='teach')` in Phase A** — every refinement skill needs design context to avoid generic output (Cardinal Rule 12)
- **Call refinement Skills without `design_context:` and `design_dna_tokens:` markers** — those markers are how the skills enter targeted mode (Cardinal Rule 13)
- **Use inspiration MCP without the builder/refiner follow-up** — three-stage pipeline is mandatory (Cardinal Rule 15)
- **Exit without Phase F retro** — the loop must self-audit (Cardinal Rule 14)
- **Touch `main` directly when `branch_isolation = true`** — Phase A creates `evolve/{date}`, Phase D pushes there, user merges to main

---

## Changelog

Spec version log. Each entry references commits in `Mrsavage92/claude-config`. Rules tagged `[CL-N]` reference these entries.

**CL-5 (2026-05-17, this commit):** Cardinal Rule 28 — `--unsupervised` mode. The gate-tightening series in CL-1/2/3 added ~15 HALT NEEDS_HUMAN paths. Adam pointed out this makes overnight unsupervised runs unviable — HALT means wait for human, no human = run dies. Rule 28 converts the 14 soft-failure HALTs to log+degrade+continue when `--unsupervised` flag is set. Only 5 hard HALTs preserved (TS errors, dirty tree, ≥5 consecutive VOIDs, Vercel prod build fail, infrastructure errors). Soft-degrades record in trajectory.failed_gates for morning review. The 1 path that stays HALT even unsupervised: ≥3 consecutive Skill no-op invocations (legitimately stuck signal).

**CL-4 (2026-05-17, 55b6ed9):** Installed `taste-skill` from `github.com/Leonxlnx/taste-skill` (Leonxlnx) into `~/.claude/skills/taste-skill/SKILL.md`. The skill is a 226-line bias-correction system for AI-generated frontend: dial values (DESIGN_VARIANCE 8 / MOTION_INTENSITY 6 / VISUAL_DENSITY 4), 10 sections covering typography/color/layout/materiality/interactive-states/forms/creative-proactivity/performance/AI-tells/creative-arsenal/bento-motion-engine/pre-flight-check. Cardinal Rule 26 rewritten to DEFER to taste-skill as the canonical authority for banned patterns + approved alternatives (it's more researched than my own banned-list — notable diff: my Rule 26 banned Geist outright; taste-skill allows Geist when paired with Geist Mono for technical UIs). Mandatory taste-skill integration points: (1) Phase R Step R.3 signature commitment cross-checks taste-skill rules, (2) Phase A Step A.8.5 fires taste-skill in parallel with impeccable teach + merges output into design-context.md, (3) every Phase C refinement skill call includes taste-skill rules marker in args, (4) Phase F.1.5 pre-flight check runs taste-skill against final deployed URL, (5) project-to-project trajectory cross-check preserved. Memory: `feedback_taste_calibration` updated to reference taste-skill as canonical source.

**CL-3 (2026-05-16, cd17c7e + 09c6ced):** Adam called out two failure modes after Run #2 on Orbit Digital. (a) Behavioural: orchestrator self-rated output as "ideal / first-rate / major" then found post-hoc P0s. (b) Taste: orchestrator default reaches are mid-2024-SaaS template (Geist, dark navy + gold, dashboard mockup in hero, bento grid, Lucide-tinted-squares, GSAP pinned scroll as default). Patches: Cardinal Rule 26 (Originality Gate — banned reflex reaches with project-to-project trajectory cross-check), Cardinal Rule 27 (orchestrator may not self-rate visual output as quality claim). Memory entries: `feedback_no_self_quality_claims`, `feedback_taste_calibration`. Plus the 22-issue P0/P1/P2/P3 patch batch:
- P1 mtime fingerprint (Gate A counts effect, not invocations)
- P2 grep → Puppeteer runtime for Phase F.1.5 signature checks
- P3 baseline VQ via Skill('critique'), not self-scored
- P4 deliverable_target signature-lib re-check at Phase R Step R.3.5
- P5 Vercel preview fallback path + `--no-preview-verify` flag
- P6 structured critique output contract with JSON schema
- P7 Gate D counts artifacts (.evolution/a11y.json etc), not firings
- P8 trajectory.status as worst-gate + failed_gates: string[] array
- P9 combined-signature contract: HARDENS Gate F + raises Gate C floor, not softens (contradiction fixed)
- P10 critique screenshot hash verification (sha256 echo)
- P11 Phase A.7.5 baseline screenshot save to `${PROJECT_PATH}/.evolution/baseline/probe-1440.png` mandated
- P12 complexity gate explicit disposal (git checkout + clean) on user-discard
- P13 max_iterations 12 at target=98 / 16 at target=100 (math actually adds up now)
- P14 Phase R.3.6 CONTEXT.md anti-goal vs signature conflict check
- P15 trajectory.json `schema_version: 2` + migration step
- P16 new flags in Inputs table: --allow-large-change, --allow-tier-mismatch, --allow-anti-goal-override, --no-preview-verify
- P17 ${PROJECT_PATH} env-var convention at Phase 0
- P18 above-fold check trigger detection via explicit `git diff --name-only` + glob match
- P19 gh CLI precheck + fallback URL construction
- P20 HALT escalation counter (`.evolution/halts.json`, fires root-cause-analyzer at 3 halts)
- P21 this Changelog section
- P22 Rule 17 long copy moved to references/top-tier-tier.md

**CL-2 (2026-05-16, 1a9fff5):** First 10-patch batch responding to Run #2's deliveries-vs-claims gap. Cardinal Rules 11.6 (edit_direct enforcement), 11.7 (refinement-skill floor), 14 (Phase F hard gates A/B/C), 17 (combined signature ban first pass), 24 (chrome-devtools-mcp HALT). Added Phase R.5 (top-tier-references.json gate), Phase G.5 (mcp install path), Phase A.0.10 (deliverable_target_score), Phase D Steps 4-10 (preview-deploy-verify flow), Phase F.1.5 (signature delivery checklist — first version, replaced by P2 runtime checks in CL-3), Phase F.7 (gate evaluation).

**CL-1 (2026-05-16, 4867e7a):** Initial route-around prevention patch series after Run #1 on Orbit Digital fired zero refinement skills + reported 60→99 score with 0.1 vq delta. Tightened Rules 8, 11.5, 14. Added Step 0 iteration guards 0.8 (edit_direct gate), 0.9 (refinement floor tracking). Replaced loose OR-clause Stop conditions with tier floor table.

**Date-policy:** Date stamps in rule text reference the Changelog entry, not inline ("see CL-N" rather than "added 2026-05-16"). Older inline date stamps stay where they are for traceability but new patches reference CL entries.

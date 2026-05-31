# chatbot-deploy — cold rating: **71/100** (deploy-verification skill)

The skill's core thesis is sound and the "silently dead bot" framing is the right mental model. But three real gaps mean a user following this procedure exactly can still declare a dead deploy as done: step 8 (lead capture) is manually-executed but excluded from the done-gate, the 400 ms settle in `exercise-bot.mjs` is fragile against slow LLM responses and will sometimes capture a partial/streaming reply, and Playwright install location is ambiguous enough to block a first-time user. The HTTP verification script (`verify-chatbot.mjs`) is solid and correct. The `exercise-bot.mjs` `waitForFunction` pattern is valid Playwright usage. What this skill does well it does genuinely well — the gaps are specific and fixable, not architectural.

---

## What 100/100 looks like

1. Step 8 (lead path) is either scripted as `exercise-lead.mjs` or explicitly listed in the done-gate alongside steps 5, 6, and 7.
2. `exercise-bot.mjs` waits for reply content stability (two consecutive reads 300 ms apart that are identical) rather than a fixed 400 ms settle, preventing partial-streaming false-passes.
3. A `# Requires Node ≥16 and Playwright ≥1.40` comment appears at the top of both `.mjs` scripts, and SKILL.md states `npm i -D playwright` is run from `<repoPath>` (not the skill directory).
4. Each eval question in `exercise-bot.mjs` gets up to one automatic retry on timeout before recording FAIL, with "retry 1/1" flagged in the receipt.
5. `verify-chatbot.mjs` rejects a `canonicalUrl` containing a `#` fragment before appending the cache-bust query param, with a clear error message.
6. Steps 6 and 7 are separated in SKILL.md — step 6: offline-fallback check, step 7: answer-quality eval — so the receipt checklist maps 1:1 to procedure steps (currently "step 6 and 7" in the receipt refers to a merged heading but "steps 5, 6 and 7" in the done-gate implies three distinct items).
7. `exercise-bot.mjs` prints the full selector set used at startup so selector mismatches are diagnosable without reading the source.
8. SKILL.md mentions rollback: "if steps 6-7 fail after a deploy, `wrangler rollback` / `vercel rollback` before investigating."
9. Config template `selectors._comment` is removed or replaced with a real JSON `$schema` comment convention so it does not silently land in `sel` (harmless today, confusing to debug).
10. SKILL.md includes at least one trigger example for CI/automated smoke testing: "run chatbot smoke test in GitHub Actions after deploy."

---

## Area-by-area

| Area | Score | Evidence |
|---|---|---|
| **Triggering precision** | **82** | Description enumerates deploy, re-deploy, "is it live?", "silently dead" phrases — good coverage. "ship the bot" is intentionally broad (SKILL.md line 12-14). No false-positive analysis for generic "ship" commands not related to chatbot. |
| **Done-gate correctness** | **52** | SKILL.md line 163: "Do not declare the deploy done unless steps 5, 6 and 7 all pass." Step 8 (Supabase + Resend lead path) is explicitly required in procedure but excluded from the gate. A deploy with broken lead capture passes as done. |
| **verify-chatbot.mjs correctness** | **84** | Cache-busting param, redirect-follow, host-signature heuristics, security-header enumeration, ASCII-only output, exit-code discipline — all correct. Fragment-in-URL bug on cache-bust append (line 49: `canonicalUrl.includes("?")` does not account for `#fragment`). In practice URLs won't have fragments, but no guard. |
| **exercise-bot.mjs correctness** | **72** | `waitForFunction` array-arg pattern is correct Playwright API usage. `checkReply` logic is complete. Offline-fallback detection works. Fixed 400 ms settle (line 119) will mis-pass a slow streaming reply that has just started rendering. No retry on timeout — a network hiccup fails the question with no second chance. |
| **Step 8 (lead path) automation** | **30** | Entirely manual. No script, no structured receipt, no field in the done-gate. SKILL.md gives instructions but they're prose ("confirm a row landed") with no machine-checkable assertion. This is a separate class of failure — Supabase/Resend secrets can be missing even when the Claude key is wired. |
| **Cross-platform runnability** | **78** | ASCII-only output comment and implementation in both scripts (line 10 in each). Windows path in template (`C:/Users/Adam/`). Playwright install line present. No `node:` version guard in either `.mjs`. Playwright install location ambiguous — SKILL.md says "Needs Playwright once" but does not say in which directory to run `npm i -D playwright`. |
| **Config template completeness** | **79** | All required fields present. `selectors._comment` is a JSON hack — not harmful but it lands in the spread `sel` object. `offlineFallbackMarker` defaults are consistent between template and exercise-bot.mjs (both use "offline right now"). `evalQuestions` examples include `mustNotInclude: ["**"]` which is the documented pattern. |
| **Procedure coverage** | **74** | Steps 1-5 + 6-7 combined + 8 are all load-bearing and all present. Steps 6 and 7 are merged into one heading — the done-gate in the output section says "steps 5, 6 and 7" implying three items but there are only two headings (5 and 6-7). Minor but creates a receipt that doesn't map cleanly to procedure steps. Rollback path not mentioned anywhere. |
| **Output / receipt format** | **81** | SKILL.md defines a PASS/FAIL checklist with evidence expectation. Both scripts produce machine-readable `[PASS]`/`[FAIL]` lines and a summary. Receipt quotes reply text (truncated at 280 chars — correct for output, does not affect assertion). |
| **SKILL.md prose quality** | **83** | "Why this skill exists" section correctly names the fail-open pattern as the root cause. Host-aware deploy auth section (step 4) is genuinely useful institutional knowledge. No rollback guidance. No CI integration mention. |

---

## Path to 100 — ordered by cost-to-fix vs value

### P0 — Required (71 → ~81)

1. **Add step 8 to the done-gate.** Change SKILL.md line 163 from `"steps 5, 6 and 7 all pass"` to `"steps 5, 6, 7 and 8 all pass"`. This is the cheapest fix with the highest failure-prevention value — a Supabase-less deploy currently passes the gate silently. ~5 min. [`SKILL.md` line 163](SKILL.md).

2. **Replace fixed 400 ms settle with stability polling in `exercise-bot.mjs`.** After the `waitForFunction` resolves, read reply text twice 300 ms apart; if they differ, wait another 300 ms and re-check (max 3 cycles). This closes the partial-streaming false-pass. ~30 min. [`scripts/exercise-bot.mjs` lines 118-122](scripts/exercise-bot.mjs).

3. **Add Playwright install-location instruction to SKILL.md.** Change the current "Needs Playwright once: `npm i -D playwright && npx playwright install chromium`" line to specify that this runs from the site's `<repoPath>`, not the skill directory, and that the path to `exercise-bot.mjs` is separate from where Playwright resolves. ~10 min. [`SKILL.md` step 6-7 block](SKILL.md).

### P1 — Nice-to-have (81 → ~91)

4. **Separate steps 6 and 7 in SKILL.md** so the receipt maps 1:1 to procedure headings. Step 6: offline-fallback gate. Step 7: answer-quality eval (mustInclude / mustNotInclude). The done-gate already references both — just give them discrete headings. ~15 min. [`SKILL.md`](SKILL.md).

5. **Add one-retry on timeout in `exercise-bot.mjs`.** Wrap the `waitForFunction` block in a retry: if it times out, send the question again and re-await. Print "retry 1/1" in the receipt. This removes flakiness on slow networks without masking real dead-bot failures. ~25 min. [`scripts/exercise-bot.mjs` lines 108-122](scripts/exercise-bot.mjs).

6. **Add Node version comment to both scripts.** One-liner at the top: `// Requires Node >=16 (top-level await, ESM .mjs)`. ~5 min. [`scripts/verify-chatbot.mjs` line 1](scripts/verify-chatbot.mjs), [`scripts/exercise-bot.mjs` line 1](scripts/exercise-bot.mjs).

### P2 — Polish (91 → 100)

7. **Guard fragment-in-URL on cache-bust append.** In `verify-chatbot.mjs` line 49, strip any `#fragment` before appending `_cb=`. `const base = cfg.canonicalUrl.split('#')[0]`. ~5 min. [`scripts/verify-chatbot.mjs` line 49](scripts/verify-chatbot.mjs).

8. **Add rollback note to SKILL.md.** One sentence under "After a clean run": if exercise-bot exits 1 post-deploy, run `wrangler rollback` / `vercel rollback` before investigating. ~5 min. [`SKILL.md`](SKILL.md).

9. **Print selector set at startup in `exercise-bot.mjs`.** `console.log("[selectors]", JSON.stringify(sel))` before navigating. Makes selector-mismatch failures self-diagnosing. ~5 min. [`scripts/exercise-bot.mjs` after line 45](scripts/exercise-bot.mjs).

10. **Remove `_comment` from config template `selectors` block** or replace with a `$schema` pointer. Currently it lands in `sel` via the spread. Harmless, but every new deployer will see it and wonder why `sel._comment` is present. ~5 min. [`references/site.config.template.json`](references/site.config.template.json).

---

## Verdict

**71/100.** The skill correctly identifies and addresses the canonical "build green, bot dead" failure mode, and `verify-chatbot.mjs` is the right tool for HTTP-level proof. The score is held back by a done-gate that excludes the lead-path step (meaning a Supabase/Resend outage passes as a clean deploy), a 400 ms settle that can falsely pass a streaming partial reply, and ambiguous Playwright install instructions that will block a first-time user before they reach any of the verification steps. All three P0s are under 45 minutes of work combined. Fix P0-1 first — it's a five-word change to a single line and it closes the highest-value gap.

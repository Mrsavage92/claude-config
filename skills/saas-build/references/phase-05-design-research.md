### Phase 0.5 — Design Research — MANDATORY

**This phase runs before Phase 1 (/web-scope) on EVERY new product. It is not optional.**

**Action: invoke `Skill('web-design-research')` now.**

Do NOT read `~/.claude/skills/web-design-research/SKILL.md` and execute its steps inline. That bypasses the skill's own enforcement, the Component Lock contract, and the 21st.dev MCP queries — and produces generic AI-SaaS output. The Skill tool exists; use it.

If you find yourself about to write DESIGN-BRIEF.md from main-context knowledge, STOP — that is the failure mode that wasted the AuditHQ v2 build (April 2026 retro). The numbered steps below are a **summary of what `Skill('web-design-research')` does**, not a substitute for invoking it. They exist so you can recognise the expected outputs and verify the skill ran end-to-end:

1. **Personality** — classify product into one of 8 types (Enterprise Authority / Data Intelligence / Trusted Productivity / Premium Professional / Bold Operator / Health & Care / Growth Engine / Civic/Government)
2. **Product category** — identify the product category (from PRODUCT-CATEGORY-LIBRARY.md categories 1-8): Reputation/Reviews, Entity Intelligence, Regulatory Compliance, Procurement Intelligence, Practice Management, HR/People Ops, Finance/Accounting, Document Management. This determines the landing page structure — it is separate from personality type and supersedes the generic dark SaaS template.
3. **Category-specific competitor research** — look at 3 direct competitors IN THE SAME CATEGORY (not just "enterprise dark SaaS" broadly). For reputation tools, study BirdEye/Podium. For WHS tools, study SafetyCulture/FlourishDx. For tender tools, study Tendertrace/TenderPilot. Generic "B2B SaaS design inspiration" is not sufficient. If MARKET-BRIEF.md exists and has category-specific research, read it instead. If not, run 3 WebSearch queries: "[product category] software Australia landing page," "[top competitor] homepage," "[product category] SaaS design pattern."
4. **Category hero override** — after competitor research, check if the category has a mandatory hero pattern in PRODUCT-CATEGORY-LIBRARY.md. If yes, lock this as the hero architecture. The generic dark animated hero is WRONG for: WHS tools (light-mode field tools), entity intelligence (search-bar-first), AML/CTF (deadline-urgency banner). Write the override to DESIGN-BRIEF.md.
5. **Color system** — select from personality palette library. Explicitly reject hsl(213 94% 58%). **Monorepo cross-check:** grep `apps/*/DESIGN-BRIEF.md` AND `apps/*/src/styles/index.css` for existing `--brand:` values — if same hue (±15 degrees) already used in either file, pick different palette and document why. (DESIGN-BRIEF.md may be stale or missing; index.css is the ground truth for what colour is actually deployed.) **Category check:** WHS/health tools should NOT use dark-first. Regulatory compliance tools should NOT use bold consumer colors. Cross-check against category conventions.
6. **Typography lock** — select font pairing per personality type (not just "Inter"). Lock heading weight and tracking.
7. **Hero architecture** — choose pattern: Centered / Split-pane / Full-screen immersive / Minimal editorial. Tie choice to personality + user type + category convention. The category hero pattern (from step 4) overrides this if it specifies a mandatory pattern.
6. **Component Lock** — run `mcp__magic__21st_magic_component_inspiration` for ALL 11 mandatory sections using personality-specific search terms (not generic "dark SaaS"). Apply selection criteria (visual weight, animation level, layout) to pick the right variant for each. If MCP unavailable: use defaults from Component Registry in `premium-website.md` and continue. Record all choices in DESIGN-BRIEF.md Component Lock table.
7. **LottieFiles** — find 3 product-specific animations (empty state, success state, processing state). WebSearch `"lottiefiles.com [product-category] animation"`. Note "unavailable" if nothing fits — do not block.
8. **Differentiation audit** — grep recent `apps/*/DESIGN-BRIEF.md` files, confirm 3+ dimensions differ from last build (color, hero pattern, features layout).
9. **Marketing tier** — choose Tier 1/2/3. Default: Tier 2 (/, /features, /pricing, /auth as separate routes).
10. **Write DESIGN-BRIEF.md** — must include: Product Personality, Color System, Typography, Hero Architecture, Component Lock table (all 11 sections), LottieFiles, Differentiation Audit, Marketing Structure, Build Order.

**Build skills (web-scaffold, web-page) read the Component Lock from DESIGN-BRIEF.md — they do NOT re-run MCP queries.**

Do not proceed to Phase 1 until DESIGN-BRIEF.md exists with the Component Lock table fully populated.

**Run `/impeccable teach` immediately after DESIGN-BRIEF.md is written.**

Impeccable teach reads DESIGN-BRIEF.md and creates `.agents/context.json` with the project's target audience, brand personality, and use cases. This context file is required by all refinement skills (`/typeset`, `/layout`, `/colorize`, `/animate`, `/critique`, etc.) that fire during Phase 5 (`/web-review`). Without it they produce generic output. One-time cost — permanent benefit across the entire build.

If `Skill('impeccable')` is unavailable: HALT Phase 0.5 and surface NEEDS_HUMAN with the exact missing skill name. Do NOT continue without it — generic refinement output downstream is worse than no output, because it looks done but isn't.

---

### Phase 0.5 completion gate (transcript-verifiable — do not self-grade)

Phase 0.5 cannot be marked complete unless THIS conversation's tool-call log contains all of:

- [ ] At least one `Skill('web-design-research')` invocation
- [ ] At least 11 `mcp__magic__21st_magic_component_inspiration` invocations (one per mandatory landing section: Nav, Hero, Logo Cloud, Stats, Features, Testimonials, Pricing, FAQ, Final CTA, Footer, plus the personality-specific section from the Component Lock table)
- [ ] One `Skill('impeccable')` invocation with `args: 'teach'`

If any of the above are missing → Phase 0.5 has NOT completed. Re-invoke the missing tools. Do NOT advance to Phase 1. Do NOT write "Phase 0.5 complete" to BUILD-LOG.md.

**Self-grading is forbidden.** If you find yourself about to write "DESIGN-BRIEF.md complete (synthesised in main context because subagent failed / MCP unavailable / time pressure)" — stop. That sentence IS the bug. Either the tools fired or the phase did not complete.

Log to BUILD-LOG.md: "Phase 0.5 complete — Skill('web-design-research') invoked, 11/11 MCP component queries fired, Skill('impeccable teach') established context."

---
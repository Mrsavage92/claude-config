### Phase 0.5 — Design Research (run /web-design-research) — MANDATORY

**This phase runs before /web-scope on EVERY new product. It is not optional.**

Read `~/.claude/skills/web-design-research/SKILL.md` in full and execute all 10 steps:

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

If `/impeccable` skill is unavailable: log NEEDS_HUMAN "Run /impeccable teach manually before Phase 5" and continue — do not block Phase 1.

Log: "Phase 0.5 complete — DESIGN-BRIEF.md written, impeccable context established" to BUILD-LOG.md.

---
# Memory rule cross-check

Before finalising the plan, walk every routed item through this list. If an item conflicts with a rule, tag it `RISK: banned-default`, quote the rule line in the plan, and set `requires_opt_in: true` so Phase 4 will skip it without an explicit override.

The authoritative source files live in `~/.claude/projects/c--Users-Adam--claude-projects/memory/`. Read them at runtime — these summaries can drift, the sources cannot.

## Rule index (read these at runtime)

| Memory file | What it bans |
|---|---|
| `feedback_taste_calibration.md` | Banned fonts, banned palettes, banned components, mid-tier reflex moves |
| `feedback_no_custom_cursor_by_default.md` | Custom cursors on service-business brands without explicit authorisation |
| `feedback_no_self_quality_claims.md` | Self-praise words in the plan output ("premium", "world-class", "comprehensive") |
| `feedback_ai_time_not_human_time.md` | Effort estimates in days/weeks for AI-executed work |
| `feedback_no_jargon_in_adam_marketing_copy.md` | Dev jargon in marketing-facing copy |

## Banned defaults (from feedback_taste_calibration)

### Banned fonts (for "premium" briefs)
- Inter (the absolute-baseline AI default)
- Geist alone (Vercel-by-default; same family/foundry as Inter; reads as default-y)
  - Note: taste-skill allows Geist when paired with Geist Mono for technical UIs — flag this nuance, don't ban absolutely
- System default stacks for display type

**Recommended reaches instead:** Pangram Pangram, Velvetyne, Klim, ABC Dinamo, Future Fonts

### Banned palettes
- Dark navy bg + warm gold accent on dark (universal SaaS dark-mode reach)
- 4-shade-near-black surface palette (the shadcn `slate`/`zinc`/`neutral` default)
- Single brand-colour accent over flat gray field with no tint variation

### Banned components without rebuild
- Lucide-icons-in-tinted-squares feature row
- SVG arc gauges as decoration
- Sparklines as visual texture
- Workflow node diagrams as decoration
- Bento grid services (the universal SaaS pattern — only ship as a *custom variation* that no other project will use)
- Dashboard mockup in hero (Stripe / Linear / Vercel / Resend / every YC SaaS)

### Banned signature reflexes
- GSAP pinned scroll as the default "signature moment" — it's the safest of A/B/C
- A "memorable_choice" that's been used in any of the last 3 projects (originality cross-check)

## Banned tools by site type

### Service-business brands (Orbit Digital, Automation Agency, agency sites)
- **No custom cursor.** Dot-and-ring follower, magnetic snap, color-shifting hover state — all banned absent explicit user authorisation or `tokens.lock.json` reference proof.
  - Rule source: `feedback_no_custom_cursor_by_default.md`
  - User's verdict on Orbit Digital iter-1 cursor: "wtf is that mouse animation - omg no remove immediately"

### SaaS marketing sites
- No bento grid as the default services layout (only as a custom variation)
- No dashboard-mockup hero (Stripe / Linear default)

## Plan output rules

### Banned phrases in plan output (`feedback_no_self_quality_claims`)

The banlist below is forbidden / do not use in `.visual-uplift/plan.md`. The grader regex will fail the plan if any appears.

Banlist: `premium`, `world-class`, `comprehensive`, `robust`, `production-ready`, `perfect`, `10/10`, `shit hot`, `epic`, `best-in-class`, `enterprise-grade`, `battle-tested`, `deeply`, `holistic`, `seamless`, `cutting-edge`

### Sizing rules (`feedback_ai_time_not_human_time`)
- Effort estimates for work the orchestrator executes: minutes/hours, never days/weeks.
- Banned: "1 week", "2 weeks", "few days", "a couple days", "next sprint", "month of work".
- Use instead: "10 min", "30 min", "an hour", "this turn", "this session".

## What to do when a rule conflicts with the routing

Two valid options:

1. **Re-route to an alternative.** If the routing tree points to a banned default (e.g. bento grid for layout_uniform), pick the next alternative in the tree (e.g. editorial-asymmetric instead of bento).
2. **Surface and require opt-in.** If the alternative is materially worse for the project, propose the banned default but tag it `RISK: banned-default`, quote the rule, and set `requires_opt_in: true`. The user must explicitly accept before Phase 4 will run it.

Never silently recommend a banned default. The rule exists because Adam has rejected it before — surfacing the rule is how the skill earns its keep.

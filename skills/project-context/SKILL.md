---
name: project-context
description: >
  Reads ALL project documentation (CLAUDE.md, doc folders, README, recent git activity) and
  synthesises CONTEXT.md — the project's product goal, ICP, value prop, locked decisions,
  pricing, landing page structure, and gaps. Downstream improvement skills (/web-evolve,
  /saas-improve, /web-review, /audit) read CONTEXT.md FIRST so they score and refine against
  the actual product, not generic templates. Run when starting an improvement loop, when
  CONTEXT.md is missing, or when CONTEXT.md is >7 days stale.
---

# /project-context

Synthesises everything we know about a project into one machine-readable brief that downstream improvement skills anchor to. Replaces "improve toward generic premium SaaS" with "improve toward what THIS product is actually meant to be."

## Why This Exists

Improvement skills score against templates. Templates produce convergence — every product gets the same "add stats section, add testimonials, polish hero." That's wrong when the product's own docs decided a different structure.

Anchor failure example: `/web-evolve` on GrowLocal — if it never reads `GrowLocal_Landing_Page_Map_UPDATED.md`, it'll polish the wrong landing page. Adam's memory has the rule [feedback_read_doc_index_before_executing.md]: "read strategy docs before tactical." This skill enforces it.

---

## When to Use

- **Mandatory Phase 0** of `/web-evolve`, `/saas-improve`, `/web-review`, `/audit` on any non-trivial project
- Before any "improve the site" loop on a product with documented strategy
- When switching back to a project after a gap >7 days
- When CONTEXT.md is missing OR older than 7 days

## When NOT to Use

- One-shot bug fix (`/web-fix`) — too lightweight to need it
- Brand-new project with no docs yet — there's nothing to read
- Client work where docs live in a separate system (Smartsheet, Confluence) — different skill

---

## Invocation

```
/project-context                          # auto-detect from cwd
/project-context {slug}                   # explicit slug, search standard doc paths
/project-context --docs={absolute-path}   # explicit doc folder
/project-context --refresh                # force regenerate even if CONTEXT.md is fresh
```

---

## Process

### Phase 1 — Detect Project Identity

1. Project root = current working directory. Read `package.json` `name` field if present.
2. Slug = kebab-case of project root folder name (or `name` field).
3. Aliases — projects don't always match folder names. Check known aliases:
   - `audit-genius` → AuditHQ
   - `growlocal` / `orbit-digital` → Orbit Digital (rebranded from GrowLocal 2026-05-16; folder still named `growlocal`; docs in `~/Documents/Agency/GrowLocal_*_UPDATED.md`)
   - `automation-agency` → Automation Agency
   - `resumecheck` → Authmark
   - `BDR Group.co.uk` → BDR MuleSoft
   - `bdr-integrations` → BDR Integrations Platform
   - `glossbeauty.com.au` → Gloss Beauty
4. Confirm slug in one sentence in output. If ambiguous, HALT and ask once.

### Phase 2 — Discover Document Sources

Run all checks in parallel:

| Source | Path pattern |
|---|---|
| Project CLAUDE.md | `{project-root}/CLAUDE.md` |
| Memory file | `~/.claude/projects/c--Users-Adam--claude-projects/memory/project_{slug}*.md` |
| Notion live state | `~/.claude/notion-context.md` |
| Doc folder A | `~/Documents/Agency/*{Slug}*` |
| Doc folder B | `~/Documents/Claude/{slug}/` |
| Doc folder C | `~/Documents/Claude/outputs/product-validation-{slug}.md` |
| Doc folder D | `{project-root}/docs/` |
| Doc folder E | `{project-root}/README.md` |
| Active projects registry | `~/Documents/Claude/outputs/active-revenue-projects.md` |
| Recent git activity | `git log --oneline -30` |

Build a Source Index. If a path is missing, log it — don't HALT.

### Phase 3 — Read in the Right Order (strategy before tactical)

This is the load-bearing rule. Read in this order, NOT alphabetical:

1. **Index / Pack docs first** — any file matching `*Index*`, `*Pack*`, `*UPDATED_Document_Pack*` — tells you what else is in the folder.
2. **Strategy docs second** — `*Blueprint*`, `*Business_Blueprint*`, `*Deep_Research*`, `*Master_Blueprint*`, `*Brief*`.
3. **Positioning docs** — `*Map*` (Landing_Page_Map), `*Pricing*`, `*Scope_Rules*`, `*Sales_Process*`, `*SOP*`.
4. **Operational docs** — `*Fulfilment*`, `*Tracker*`, `*Checklist*`, `*Issues_Register*`.
5. **Implementation docs last** — `*Implementation*`, `*Spec*`, `*Architecture*`, `*Migration*`. These tell you HOW, not WHAT or WHY.
6. **CLAUDE.md Section D** — running decision ledger, frequently overrides docs above.
7. **Validator file** — `~/Documents/Claude/outputs/product-validation-{slug}.md` for current verdict.

If a doc set has 19 files (e.g. GrowLocal), read 1–4 in full and skim 5. Don't read tactical specs line-by-line — extract decisions, not procedure.

### Phase 4 — Synthesise CONTEXT.md

Write to `{project-root}/CONTEXT.md` using the template at `references/context-template.md`. Required sections:

| # | Section | Content |
|---|---|---|
| 1 | Header | Slug, generation date, source count, freshness TTL (7 days) |
| 2 | Product Goal | One sentence. What this product IS, in plain English. |
| 3 | ICP | Specific. Industry, size, geography, role. No "businesses". |
| 4 | Value Proposition | What it sells, headline framing, positioning vs alternatives |
| 5 | Locked Decisions | Bullet list from CLAUDE.md Section D + any `*Rules*` / `*Blueprint*` |
| 6 | Landing Page Structure | If `*Landing_Page_Map*` exists, the locked section order. Otherwise: "not locked" |
| 7 | Pricing & Packaging | Tiers, currency, price points. Source: `*Pricing*` docs |
| 8 | Fulfilment / Ops | One paragraph. Source: `*SOP*` |
| 9 | Recent Activity | Last 30 commits, last 7 days emphasised. What was actually being worked on. |
| 10 | Open Questions / Gaps | Things downstream skills should flag (missing pricing, undefined ICP, etc.) |
| 11 | Source Index | Every file read with one-line summary. Marks `read-in-full` vs `skimmed`. |
| 12 | Anti-Goals | What this product is explicitly NOT. From CLAUDE.md and Blueprint. Often missing — flag if so. |

CONTEXT.md max length: 600 lines. If sources overflow, summarise — don't truncate raw quotes.

### Phase 5 — Freshness Stamp

Append to CONTEXT.md:

```
---
Generated: {ISO date}
Sources read: {N files}
TTL: 7 days (regenerate via /project-context --refresh)
```

Print a one-line summary to the user: `CONTEXT.md written ({N} sources, {M} locked decisions, {gaps} gaps flagged).`

---

## Calling Pattern (for downstream skills)

In `/web-evolve`, `/saas-improve`, `/web-review`, `/audit`:

```
Phase 0 — Project Context Read
1. Check {project-root}/CONTEXT.md exists.
2. If missing OR generated >7 days ago → fire Skill('project-context'). Do NOT self-synthesise.
3. Read CONTEXT.md.
4. Every subsequent scoring/refinement decision references CONTEXT.md fields.
   - "Add a stats section" → CHECK: does Landing Page Structure include stats? If no → SKIP.
   - "Polish hero copy" → CHECK: Value Proposition + Anti-Goals → align rewrite, don't drift.
   - "Recommend pricing change" → CHECK: Pricing & Packaging is locked → DO NOT propose changes.
```

This is a literal Skill invocation directive, not "read these docs yourself."

---

## Output Artifacts

| Request | Deliverable | Format |
|---|---|---|
| `/project-context` | `CONTEXT.md` at project root | Markdown, 12 sections |
| `/project-context --refresh` | Overwrites existing CONTEXT.md | Markdown |

---

## Anti-Patterns

- **Reading implementation spec before business blueprint.** Tactical-first produces line-by-line-correct, business-model-wrong output. Always strategy → positioning → operational → implementation.
- **Generic ICP fallback.** "Small businesses" is not an ICP. If docs say "AU NDIS providers 5-50 staff", write that. If docs don't say it, flag as gap — don't invent.
- **Self-synthesising the brief instead of reading docs.** If 19 docs exist and you skim 3 then write CONTEXT.md from memory, you've failed the rule. Read 1-4 in full.
- **Treating CLAUDE.md and docs as equal.** CLAUDE.md Section D is the running ledger and OVERRIDES older docs when they conflict. Newer decisions win.
- **Refreshing CONTEXT.md silently when stale.** Print the staleness reason so user knows what changed: "Last generated 2026-04-22 (24d ago) — regenerating."
- **Writing CONTEXT.md without an Anti-Goals section.** Anti-goals prevent the loop from drifting toward generic templates. If docs don't state anti-goals, write "MISSING — flag for human" and surface it.

---

## Proactive Triggers

- If a downstream skill (`/web-evolve`, `/saas-improve`, `/web-review`, `/audit`) fires without CONTEXT.md present → fire `/project-context` automatically as Phase 0.
- If CONTEXT.md exists but `git log -1` shows commits after CONTEXT.md `Generated:` date → flag "CONTEXT.md may be stale, recent commits since generation."
- If product is on `active-revenue-projects.md` but no doc folder found → flag "active project missing docs — improvement loop will be flying blind."
- If validator file shows KILL or VALIDATE-FIRST → surface verdict prominently in CONTEXT.md Header.
- If `*Landing_Page_Map*` exists but live site clearly violates it → flag in Open Questions / Gaps.

---

## Related Skills

- Use `/project-doc` to create the Notion master doc (different artifact — long-form strategy doc, not machine-readable brief).
- Use `/project-refresh` to re-inject Notion context mid-conversation (read-only, no synthesis).
- Use `/handoff` to write session handoff notes (different lifecycle — end-of-session, not start-of-loop).
- Do NOT use `/project-context` for client work where docs live in Smartsheet/Confluence — write a different reader.

---

## Maintenance

- When a project gets a new doc folder pattern → update Phase 2 path table.
- When a project slug ↔ folder name alias is missed → add to Phase 1 alias map.
- CONTEXT.md template lives at `references/context-template.md` — edit there, not in SKILL.md.

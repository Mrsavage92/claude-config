# Shared Context — Adam's Claude Code Setup

This file is synced across both machines (Mac + Windows PC) via GitHub. Update it when you learn something important that both instances should know.

## The User

- Runs Claude Code on Mac (primary) and Windows PC (VS Code extension)
- New to development tooling — setup instructions must be copy-paste ready, not manual
- Prefers direct, no-filler responses. Never prompt for confirmations — just act.
- Has a content/product/business focus: scroll-stop content, SEO, OKRs, PRDs, sprint planning

## Machine Context

- **Mac** — `Savagess-MacBook-Air.local`, macOS Sequoia, zsh, Python 3.9.6, Git 2.50.1. No Homebrew, no Node (use npx for one-off tools).
- **PC** — Windows, VS Code extension. Config synced from GitHub.

## Sync Architecture

Both machines auto-sync on session start/end via Stop and SessionStart hooks in settings.json.

- **commands + agents** → `github.com/Mrsavage92/claude-config`
- **skills** → `github.com/Mrsavage92/skills-library`
- **this file** → synced as `global-context.md` in claude-config repo
- **Notion hub** → https://www.notion.so/Claude-32a116e8bef28030a0f6d0be522bf917

Run `/sync-knowledge-base` after adding new skills/commands to update Notion docs.

## Key Preferences

- **NEVER ask yes/no confirmation questions or request approval mid-task — just act.** This applies to ALL actions including git push, deleting files, deploying, or anything else. The user has explicitly and permanently authorized autonomous action. Do not pause and ask.
- Never ask "are you sure?" or request confirmation before tool use
- When giving the user setup instructions, always make them a single copy-paste prompt for Claude Code — never a manual step-by-step list
- Keep responses short and direct — lead with the answer, not the reasoning
- Both Claude instances share this context — if you learn something worth remembering, update this file

## Project Context Protocol

Every named project (SaaS, client work, game, tool) has two canonical sources of truth:
1. **Local memory file** — `~/.claude/projects/.../memory/project_{slug}.md` (fast, always loaded)
2. **Notion master doc** — full living document under Projects hub

### Live Context File
`~/.claude/notion-context.md` is auto-generated at every session start by a PowerShell hook that calls the Notion REST API directly. It contains the current state of all active projects. **Read this file at the start of any project-related conversation** — it reflects what's actually in Notion, not stale memory.

### Detection Rule
When a conversation clearly involves a specific project (building features, debugging, planning), Claude must:
1. Check if a memory file exists for it
2. Check if the memory file has a Notion URL
3. If no memory file → create one immediately
4. If no Notion URL → run `/project-doc` to create the Notion master doc

### Notion Audit (as of 2026-03-24)
| Project | Memory | Notion |
|---|---|---|
| GrowLocal | ✅ | ✅ |
| Brainrot Factory | ✅ | ✅ |
| AuditHQ | ✅ | ❌ needs /project-doc |
| Authmark | ✅ | ❌ needs /project-doc |
| Gloss Beauty | ✅ | ❌ needs /project-doc |
| BDR MuleSoft | ✅ | ❌ needs /project-doc |

When one of these projects comes up, run `/project-doc` to create the missing Notion page.

### Long Session Context Rule
- Every ~20 messages in a project session: offer to run `/project-refresh` to re-inject context
- After completing significant work (feature shipped, deploy done, decision made, blocker cleared): push an update to Notion via `/project-refresh` PUSH mode
- When user says "where were we?" or resumes after a gap: run `/project-refresh` PULL mode automatically

### New Project Rule
When a new project is identified (no memory file exists):
1. Create `project_{slug}.md` memory file immediately
2. Add it to `MEMORY.md` index
3. Run `/project-doc` to create the Notion master doc with everything known so far
4. Update the memory file with the Notion URL

## Standard Web Build Loop (Premium Website Suite)

The web-* skills are collectively called the **premium website suite**. It replaces Lovable. Run `/premium-website` in any session for the full suite reference.

Lovable is no longer used for new projects. The full pipeline is orchestrated by `/saas-build` — just give it a product brief and it runs everything autonomously. For reference, the phases are:

```
/saas-build        - ORCHESTRATOR — runs the full pipeline autonomously from brief to deploy
  Phase 0.25       - market research (MARKET-BRIEF.md)
  Phase 0.5        - design research via /web-design-research (DESIGN-BRIEF.md)
  Phase 1          - scope via /web-scope (SCOPE.md)
  Phase 2          - scaffold: config, design system, routes, AppLayout, Sentry, NotFoundPage, useSeo
  Phase 3          - backend via /web-supabase (schema, RLS, auth, TypeScript types)
  Phase 3b         - payments via /web-stripe (checkout, webhooks, UpgradeButton)
  Phase 3c         - email via /web-email (Resend + React Email, 5 templates, trial reminders)
  Phase 4          - pages (landing first, auth, /setup, app pages, /settings, /privacy, /terms)
  Phase 4.5        - tests (auth flow, onboarding flow, core feature smoke)
  Phase 5          - quality gate via /web-review (38+/40 required, fix loop)
  Phase 6          - deploy via /web-deploy (Vercel or Railway, bundle audit, smoke test)
  Phase 7          - gap analysis loop (saas-gap-checklist.md, ~110 items)
  Phase 8          - handoff (BUILD-LOG.md final entry, NEEDS_HUMAN list)

/saas-improve      - post-launch improvement swarm (6 agents, production signals, gap stack)
```

**Skill detection in Phase 4 — saas-build reads the right skill automatically:**
- Dashboard/analytics page → reads `/dashboard-design`
- List page with records → reads `/web-table`
- `/setup` or `/onboarding` → reads `/web-onboarding`
- `/settings` → reads `/web-settings`
- Transactional email → reads `/web-email`

All web skills read `~/.claude/web-system-prompt.md` (the Design DNA) before generating anything.

**Landing page non-negotiables (every product, every time):**
- Animated background via `mcp__magic__21st_magic_component_inspiration` - mandatory
- Product visual mockup: **max-w-4xl minimum, never max-w-2xl** — the mockup IS the hero, it must dominate
- For AI products: split-pane mockup (input/inbox left, AI output with typewriter right) — Technique 5 in `/web-animations`
- Hero headline: minimum `text-5xl sm:text-6xl lg:text-7xl` with `letterSpacing: '-0.03em'` — never text-4xl
- Hero entrance: Technique 3 STAGGER from `/web-animations` (pill → headline → sub → CTAs → stats → visual last)
- The mockup must show the product DOING SOMETHING — typewriter, animated counters, sparklines drawing in
- Floating AI toast/badge that slides in after mockup renders (signals live activity)

For animation patterns: read `/web-animations` (5 techniques — Technique 3 STAGGER is hero entrance, Technique 5 is typewriter for AI products).

**Suite maintenance rule:** When any web-* skill is created or updated with a new non-negotiable, pattern, or checklist item — update `premium-website.md` in the same session. That file is the contract saas-build reads. If a rule isn't in premium-website.md, saas-build won't enforce it.

## Power User Shortcuts

- **`@filename`** — Reference files inline without asking Claude to read them first. Example: `Review @src/index.ts and compare with @CHANGELOG.md`. Works in chat input.
- **`# fact`** — Add to memory instantly mid-conversation. Example: `# glossbeauty.com.au is hosted on Lovable`. No need to say "remember this".
- **Project CLAUDE.md** — Drop a `CLAUDE.md` in any project root for project-specific context (stack, conventions, what not to touch). Loaded on top of this global file.
- **`isolation: "worktree"`** — Pass this in Agent tool calls that write files. Agent gets a sandboxed git branch; changes are reviewable before merge.
- **Tool use log** — Every Write/Edit/Bash is logged to `~/.claude/tool-use.log`. Check it to audit what Claude has changed.
- **Scheduled logs** — Daily review, news brief, and weekly audit outputs saved to `~/.claude/logs/YYYY-MM-DD-{type}.md`.

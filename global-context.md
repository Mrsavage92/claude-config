# Shared Context — Adam's Claude Code Setup

This file is synced across both machines (Mac + Windows PC) via GitHub. Update it when you learn something important that both instances should know.

## The User

- Runs Claude Code on Mac (primary) and Windows PC (VS Code extension)
- New to development tooling — setup instructions must be copy-paste ready, not manual
- Prefers direct, no-filler responses. Never prompt for confirmations — just act.
- Has a content/product/business focus: scroll-stop content, SEO, OKRs, PRDs, sprint planning

## Core Behavior Rule

**Verify before asserting.** Before stating anything as fact, check: "Have I actually verified this, or am I guessing?" If guessing → check first. If the user contradicts me → investigate before responding. If something looks right on the surface (HTTP 200, familiar pattern, "obvious" answer) → verify the content, not just the surface. If I don't know → "let me check", never "that doesn't exist." If I'm wrong → one sentence owning it, then fix. Never defend a shortcut.

## Product Idea Gate (global, not just /saas-build)

**Any path that introduces a new product idea — user's idea, my suggestion, a pivot discussion, a "what if we built X" riff — triggers `/product-validator` FIRST, before any design/scope/build discussion.** No exceptions.

Triggers include:
- Adam says: "build X", "let's make X", "I have an idea for X", "what if we built X", "should we pivot to X"
- I propose: "the real opportunity is X", "you could build X to solve that", "a better angle would be X"
- Any pivot of an existing product (e.g. Tender Writer → zero-wins segment) = new validation required, prior verdict does not transfer

If the validator doesn't exist for the slug yet → run it. If it returns KILL → redirect to active revenue project (AuditHQ). If it returns VALIDATE-FIRST → run buyer-interview protocol, don't touch code.

Why this rule exists: **Tender Writer (2026-04-18) burned 6 days because a prior session (me) proposed the "find+write combined = moat" framing and started building without validation.** Doreva, TenderPilot, GovBid already did both. This rule prevents the next one.

See: `~/Documents/Claude/retrospectives/validator-learnings.md` for the full post-mortem log. Every new KILL adds a line there.

## Machine Context

- **Mac** — `Savagess-MacBook-Air.local`, macOS Sequoia, zsh, Python 3.9.6, Git 2.50.1. No Homebrew, no Node (use npx for one-off tools).
- **PC** — Windows, VS Code extension. Config synced from GitHub.

## Sync Architecture

Both machines auto-sync on session start/end via Stop and SessionStart hooks in settings.json.

**Single source of truth: `github.com/Mrsavage92/claude-config`**

Everything lives here — skills, agents, commands, this file, sync scripts. Both machines pull from and push to this one repo.

- **skills** → `claude-config/skills/` (166 skill directories)
- **agents** → `claude-config/agents/` (60 agent .md files)
- **commands** → `claude-config/commands/` (81 command .md files)
- **this file** → synced as `global-context.md` in claude-config repo
- **Notion hub** → https://www.notion.so/Claude-32a116e8bef28030a0f6d0be522bf917

`github.com/Mrsavage92/skills-library` is a separate forked repo Adam found — NOT the working config. It's a public showcase only. Never push working content there first.

Run `/sync-knowledge-base` after adding new skills/commands to update Notion docs.

## Key Preferences

- **NEVER ask yes/no confirmation questions or request approval mid-task — just act.** This applies to ALL actions including git push, deleting files, deploying, or anything else. The user has explicitly and permanently authorized autonomous action. Do not pause and ask.
- Never ask "are you sure?" or request confirmation before tool use
- When giving the user setup instructions, always make them a single copy-paste prompt for Claude Code — never a manual step-by-step list
- Keep responses short and direct — lead with the answer, not the reasoning
- Both Claude instances share this context — if you learn something worth remembering, update this file

## Token Budget — Model Routing Rules

Claude Max has a finite token budget per period. Route subagents to the cheapest model that can do the job.

**Use `model: "haiku"` for Agent calls that:**
- Search/explore codebases (subagent_type: Explore)
- Look up files, grep for symbols, read configs
- Summarize or extract info from files
- Do web searches or fetch URLs for research
- Run simple git commands or status checks
- Any read-only reconnaissance task

**Use `model: "sonnet"` for Agent calls that:**
- Write or edit code (implementation work)
- Review PRs or audit code quality
- Generate content (copy, emails, social posts)
- Run multi-step analysis requiring judgment

**Keep Opus (default, no model param) only for:**
- `/saas-build`, `/saas-improve` orchestration
- `/audit`, `/full-audit`, `/parallel-audit` — client deliverables
- Architecture decisions (`/design`, `/validate`, `/decide`)
- Complex PRDs, pitch decks, strategic planning
- Anything the user is paying a client for

**Rule of thumb:** If the agent's job is to FIND information → haiku. If it's to THINK about information → sonnet. If it's to PRODUCE client-quality output → opus.

**New conversation nudge:** When you detect the user is switching to an unrelated topic (different project, different domain, or a quick question unrelated to the current work), append a one-liner: `💡 This is a new topic — starting a fresh conversation would save your token budget.` Don't block the work — answer first, nudge after.

**Token conservation tactics (Opus 4.7 burns tokens fast — these are mandatory):**
- Run `/compact` after any large output (audit results, long code gen, big file reads) before continuing
- Keep responses short — no summaries of what you just did, no recaps unless asked
- When reading files, only read the lines you need (`offset`/`limit`), never the whole file unless necessary
- Prefer direct Grep/Glob over spawning Explore agents when the search target is clear
- Never re-read a file you just wrote or edited — the tool confirms success

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

### Project Rules
- Projects without Notion pages: AuditHQ, Authmark, Gloss Beauty, BDR MuleSoft → run `/project-doc` when they come up
- Long sessions (~20 msgs): offer `/project-refresh`. After significant work: PUSH mode. On resume: PULL mode.
- New project: create `project_{slug}.md` → add to MEMORY.md → run `/project-doc` → update memory with Notion URL

## Standard Web Build Loop (Premium Website Suite)

Run `/premium-website` for the full suite reference. Pipeline: `/saas-build` (orchestrator) → `/saas-improve` (post-launch).
All web skills read `~/.claude/web-system-prompt.md` (Design DNA) before generating. Landing page rules and phase details are in `premium-website.md` — the contract saas-build reads. When any web-* skill adds a non-negotiable, update `premium-website.md` in the same session.

## Power User Shortcuts

- **`@filename`** — Reference files inline without asking Claude to read them first. Example: `Review @src/index.ts and compare with @CHANGELOG.md`. Works in chat input.
- **`# fact`** — Add to memory instantly mid-conversation. Example: `# glossbeauty.com.au is hosted on Lovable`. No need to say "remember this".
- **Project CLAUDE.md** — Drop a `CLAUDE.md` in any project root for project-specific context (stack, conventions, what not to touch). Loaded on top of this global file.
- **`isolation: "worktree"`** — Pass this in Agent tool calls that write files. Agent gets a sandboxed git branch; changes are reviewable before merge.
- **Tool use log** — Every Write/Edit/Bash is logged to `~/.claude/tool-use.log`. Check it to audit what Claude has changed.
- **Scheduled logs** — Daily review, news brief, and weekly audit outputs saved to `~/.claude/logs/YYYY-MM-DD-{type}.md`.

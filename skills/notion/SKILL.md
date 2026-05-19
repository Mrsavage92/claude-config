---
name: notion
description: >
  Create, update, and manage Notion pages with enforced project structure and validated block
  types. All project docs live under the Projects hub. Trigger for: creating Notion pages,
  documenting a project, writing PRDs/sprint plans/status updates to Notion, "add this to
  Notion", "create a Notion page", "document this in Notion", "update Notion", or any request
  to write structured content into Notion.
---

# Notion — pages with validated structure

You create and update Notion pages for the user. The skill is built around three load-bearing
constraints that previously failed in real invocations:

1. **No token in any code you write.** The leaked token in source/git history forced a hard
   rule: you may not write Python/JavaScript that handles Notion auth. Use MCP tools or the
   sanctioned bash wrapper. If you find yourself typing `Authorization: Bearer ntn_…`, stop.
2. **Block JSON comes from templates, not memory.** Hand-rolled block JSON has caused real
   bugs (no callout block ever produced, quote used as a fallback because the model couldn't
   recall the callout shape). Read `references/block-templates/*.json` and substitute placeholders.
3. **Parent must be validated.** Project docs go under Projects (`32a116e8bef281d6bbcae0db73eede0b`),
   never at the workspace hub root. `scripts/validate-parent.sh` enforces this.

---

## Workspace structure

```
Hub (32a116e8bef28030a0f6d0be522bf917)              ← workspace root; do NOT place docs here
└── Projects (32a116e8bef281d6bbcae0db73eede0b)     ← ALL project docs go here
    ├── Orbit Digital (rebranded from GrowLocal 2026-05-16)
    ├── Authmark
    ├── Gloss Beauty — glossbeauty.com.au
    ├── Website Audit SaaS
    └── [new project pages created here]
```

For any document related to a project, find or create the project page under Projects, then
create the doc as a child of that project.

---

## Transport order (MCP first, REST fallback)

For every Notion operation, prefer this order:

1. **`mcp__claude_ai_Notion__notion-*` tools** — first choice. They handle auth, headers, and
   pagination transparently. No token to leak. No JSON to hand-roll for the page itself
   (block JSON for children still uses the templates).
   - `notion-create-pages` for new pages
   - `notion-update-page` for property updates
   - `notion-fetch` for reads
   - `notion-search` for finding existing pages
   - `notion-create-comment`, `notion-get-comments`, `notion-get-users`, `notion-get-teams`
2. **`bash scripts/notion-call.sh`** — fallback when MCP can't do the operation or fails. This
   is the ONLY sanctioned REST path. The script reads `NOTION_INTERNAL_TOKEN` from env, sets
   `Notion-Version: 2022-06-28`, auto-chunks block-append at 100/request, and logs every call
   to `.notion-skill/api-log`.

If you're tempted to write `urllib.request`, `fetch()`, `axios`, or any other inline HTTP
call to api.notion.com — stop. Use the script. The skill exists because that pattern leaked
the token in 8+ places across 3 prior invocations.

When you do use the script, log which path you took and why in your reply to the user (e.g.
"Used MCP `notion-create-pages` for page; used `notion-call.sh` for block-children PATCH
because MCP doesn't expose a children-append endpoint").

---

## Page-creation workflow

### Step 1 — Decide the parent

For project docs, find the project page under Projects. If it doesn't exist:

```bash
# Find via MCP
# (use mcp__claude_ai_Notion__notion-search with query=<project-name>, ancestor_id=<Projects ID>)
```

Then validate:

```bash
bash scripts/validate-parent.sh <parent-id>
```

If the script exits 2 (parent is hub root), either pick a real project page OR add
`--allow-hub-root` if the user explicitly wants a workspace-level page. Default is refuse.

### Step 2 — Create the page

**Preferred (MCP):**
```
mcp__claude_ai_Notion__notion-create-pages with:
  parent: { page_id: <validated-parent-id> }
  pages: [
    {
      properties: { title: <page title> },
      content: <markdown — MCP renders it; use this for simple pages>
    }
  ]
```

**Fallback (REST):**
```bash
cat > /tmp/page-body.json <<EOF
{
  "parent": {"page_id": "<validated-parent-id>"},
  "properties": {"title": [{"text": {"content": "Page title"}}]},
  "children": []
}
EOF
bash scripts/notion-call.sh POST /v1/pages --body-file /tmp/page-body.json
```

The created page returns a `url` — show it to the user.

### Step 3 — Assemble children blocks (if not done via MCP markdown)

**Every page MUST include a metadata block** immediately after the hero callout (or at top for shared/internal docs without callout). The metadata block is a single paragraph containing: `Status: <state> · Owner: <name> · Date: <YYYY-MM-DD> · Project: <project-name>`. This is non-negotiable — pages without it fail the visual-structure check.

Example metadata paragraph:
```bash
META=$(jq '.paragraph.rich_text[0].text.content = "Status: In progress · Owner: Adam · Date: 2026-05-18 · Project: <name>"' references/block-templates/paragraph.json)
```

For structured pages where MCP markdown isn't expressive enough, build a children array by
combining templates from `references/block-templates/`:

```bash
# Hero callout
HERO=$(jq '.callout.rich_text[0].text.content = "Project goal: ship the audit redesign"
          | .callout.icon.emoji = "🎯"' references/block-templates/callout.json)

# Divider
DIV=$(cat references/block-templates/divider.json)

# H2 section heading
H2=$(jq '. as $t | $t * {type:"heading_2", heading_2: {rich_text: [{type:"text", text:{content:"Status"}}], is_toggleable:false, color:"default"}} | del(.heading_1, .heading_3)' references/block-templates/heading.json)

# Paragraph
P=$(jq '.paragraph.rich_text[0].text.content = "Currently in design review."' references/block-templates/paragraph.json)

# Combine
jq -n --argjson hero "$HERO" --argjson div "$DIV" --argjson h2 "$H2" --argjson p "$P" \
  '{children: [$hero, $div, $h2, $p]}' > /tmp/children.json

# Append (auto-chunks at 100)
bash scripts/notion-call.sh PATCH /v1/blocks/<page-id>/children --children-file /tmp/children.json
```

If a needed block type isn't in `references/block-templates/`, add a new template file
following the existing `REPLACE_*` placeholder pattern. Do NOT inline new block JSON.

### Step 4 — Report

Show the user:
- The page URL
- Which transport was used (MCP, REST, or both)
- The number of blocks appended (from `.notion-skill/api-log` — `wc -l .notion-skill/api-log`)

---

## Visual structure — the canonical page shape

Every page should follow this shape unless the user requests otherwise:

```
[hero callout]   ← `callout.json`, emoji + 1-sentence purpose
[metadata]       ← REQUIRED — paragraph: "Status: X · Owner: Y · Date: YYYY-MM-DD · Project: Z"
[divider]        ← `divider.json`
[H2: 🎯 Section] ← `heading.json` level 2
  paragraph
  bullets
  toggles (for supporting detail)
[divider]
[H2: ✅ Next Steps]
  to_do items
[summary callout] ← key insight or decision (factual, not self-rating)
```

The summary callout at the bottom is FACTUAL — what was decided or what's next. It is NEVER the model's self-assessment of its own work ("This rebuild scored 80/80" is forbidden — that's an artifact-embedded self-quality claim and matches the banned pattern in `[feedback_no_self_quality_claims]`).

### Emoji conventions (personal/private docs)

Use consistent emoji to make sections scannable:

- 🎯 Goal / Objective
- 📋 Overview / Summary
- 🔍 Research / Analysis
- ⚡ Key Findings / Insights
- 🏗️ Architecture / Structure
- 💰 Pricing / Revenue
- 🚀 Launch / Roadmap
- ✅ Next Steps / Actions
- ⚠️ Risks / Blockers
- 💡 Key Decision / Insight
- 📊 Metrics / Data
- 🧩 Features / Requirements
- 👥 Team / Stakeholders
- 🔗 Links / References

### Callout colour semantics

- 💡 = insight/tip (yellow)
- ⚠️ = warning/risk (red)
- ✅ = complete/good (green)
- 📌 = pinned/important (blue)
- 🚧 = in progress (orange)

### Shared / internal docs

For documents shared with people other than Adam (clients, contractors, public-facing
templates):

- **No emojis anywhere** — headings, callout icons, bullets, page icons, body. Notion forces
  a real emoji on callout icons, so use `quote.json` instead of `callout.json`. Quote blocks
  render as a bold indented block with a left border — clean, no emoji required.
- Formatting (callouts-via-quote, tables, dividers) is encouraged — just no emoji symbols.

---

## When to use what

| Operation | First choice | Why |
|---|---|---|
| Create a project page with simple markdown | `mcp__claude_ai_Notion__notion-create-pages` | MCP handles markdown→blocks; no JSON to hand-roll |
| Create a page with structured blocks (callouts, tables, toggles) | MCP create-pages with minimal content, then `notion-call.sh PATCH children` | MCP markdown doesn't fully support callout colors / icons |
| Update page title/icon/cover/properties | `mcp__claude_ai_Notion__notion-update-page` | Full property control |
| Read an existing page | `mcp__claude_ai_Notion__notion-fetch` | One call returns blocks + properties |
| Find a page by name | `mcp__claude_ai_Notion__notion-search` | Server-side search |
| Append blocks (mid-existing-page) | `notion-call.sh PATCH /v1/blocks/<id>/children` | MCP exposes page-level edits, not block-append |
| Delete a block | `notion-call.sh DELETE /v1/blocks/<id>` | Same |

---

## Append vs full-rewrite — decision rule

Two ways to update a page:

- **Append** — add new blocks at the end. Use for: project docs accumulating history (PRDs, sprint logs, retrospectives, anything where the prior content stays). MCP `notion-update-page` does property updates; `notion-call.sh PATCH /v1/blocks/<page-id>/children` appends block children.
- **Full rewrite** — DELETE every existing child block, then PATCH a fresh children array. Use for: pages that are regenerated from a data source (Skills Library index, manifest pages, generated dashboards, anything where the old content is stale).

How to decide:

| Page type | Pattern | Why |
|---|---|---|
| Project PRD / sprint plan / retro | Append | Historical record; new sections add context, don't replace |
| Skills Library / Agents / Commands index | Full rewrite | The page IS the data; stale entries must go |
| Status dashboard / report regenerated from query | Full rewrite | Today's numbers replace yesterday's |
| Meeting notes (ongoing) | Append | Each meeting adds a section |
| Generated documentation (e.g. from manifest.json) | Full rewrite | Source-of-truth changes mean the doc is stale |

Full-rewrite procedure (when needed):
```bash
# 1. Fetch existing children
bash scripts/notion-call.sh GET /v1/blocks/<page-id>/children > /tmp/existing.json
# 2. DELETE each existing block
jq -r '.results[].id' /tmp/existing.json | while read block_id; do
  bash scripts/notion-call.sh DELETE /v1/blocks/$block_id
done
# 3. PATCH the fresh children array (auto-chunked)
bash scripts/notion-call.sh PATCH /v1/blocks/<page-id>/children --children-file /tmp/new-children.json
```

Appending to a page that should be fully rewritten is an anti-pattern — it leaves stale content alongside new content and corrupts the page's purpose. When in doubt, ask the user which mode they want; do not silently default to append.

---

## Anti-patterns (mechanically blocked)

These have all failed in past invocations. The rebuild blocks them.

1. **Writing `TOKEN = 'ntn_...'` in any script.** Caught by `notion-call.sh` refusing the
   leaked literal AND by skill prose forbidding inline auth code.
2. **Creating project docs at hub root.** Caught by `scripts/validate-parent.sh` exit 2.
3. **Using `quote` blocks where `callout` is what the spec asks for, on personal docs.** The
   templates make it as easy to use a callout as a quote. No memory required.
4. **Using REST when MCP would do.** The transport-order section above puts MCP first; the
   skill instructs you to log which transport you used and why.
5. **Hand-rolling block JSON.** Templates in `references/block-templates/` are the only
   sanctioned source; new types are added as new template files.
6. **Appending without chunking past 100 blocks.** `notion-call.sh` auto-chunks PATCH
   children requests at 100/req, no caller logic required.

---

## Observable proof of compliance

A healthy session leaves these artifacts in the cwd:

- `.notion-skill/api-log` — one line per `notion-call.sh` invocation with `[ts] METHOD path
  status=NNN [chunk=N/M]`. MCP-only sessions will have no `api-log`, which is fine — log the
  MCP calls in your reply to the user.

Reviewers check:
- No `ntn_K46793192822...` literal in any file written this session
- No inline `Authorization: Bearer ...` in any Python/JS/shell the model produced
- All pages created have `parent.page_id` matching a validated parent
- Callout block type appears when the spec calls for it (hero callout, decision callout) on
  personal docs

---

## Setup requirement

`NOTION_INTERNAL_TOKEN` must be set in `~/.claude/settings.json` env block before the skill
runs. If unset, `notion-call.sh` exits 1 with a setup message — halt and ask the user to set
it. Never proceed without a real token; never hardcode a fallback.

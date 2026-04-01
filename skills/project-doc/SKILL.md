---
name: project-doc
description: >
  Create or update a full project master doc in Notion and the local memory file.
  Trigger when: starting work on a named project, "document this project", "create project page",
  "add to Notion", or when Claude detects a project has no Notion page in its memory file.
  Also runs automatically when a new project is identified and has no memory file or Notion link.
---

# Skill: Project Doc — Notion Master Doc + Memory Sync

You are building or updating the canonical master document for a project. This is the single source
of truth that will be re-read in future sessions when context is lost.

---

## What This Skill Does

1. **Reads** the local memory file for this project (if exists) to get current state
2. **Searches** Notion Projects for an existing page (case-insensitive)
3. **Creates or updates** the Notion master doc with full project context
4. **Updates** the local memory file with the Notion URL + latest state
5. **Updates** MEMORY.md index if needed

---

## Notion Setup

```python
TOKEN = 'ntn_K46793192822yLb12pUWso1QC0gaYtsA6dENpcn0xjhfKB'
HEADERS = {
    'Authorization': f'Bearer {TOKEN}',
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
}
PROJECTS_ID = '32a116e8bef281d6bbcae0db73eede0b'
```

---

## Step 1 — Gather Context

Before writing anything, collect:
- Project name and slug
- What it is (product, SaaS, client work, game, etc.)
- Current status (design / building / live / paused)
- Tech stack
- URLs (live site, GitHub, Railway, Vercel, Supabase, etc.)
- Goals and target user
- What's been built / what's next
- Known blockers
- Any key decisions made

Pull from: conversation context, local memory file, CLAUDE.md, anything the user has shared.

---

## Step 2 — Find or Create Notion Project Page

```python
import urllib.request, json

def find_project_page(name):
    """Search for existing project page under Projects"""
    req = urllib.request.Request(
        f'https://api.notion.com/v1/blocks/{PROJECTS_ID}/children?page_size=50',
        headers=HEADERS
    )
    data = json.loads(urllib.request.urlopen(req).read())
    for block in data.get('results', []):
        if block.get('type') == 'child_page':
            title = block['child_page']['title'].lower()
            if name.lower() in title or title in name.lower():
                return block['id']
    return None

def create_project_page(name):
    """Create a new project page under Projects"""
    payload = {
        'parent': {'page_id': PROJECTS_ID},
        'properties': {'title': {'title': [{'text': {'content': name}}]}}
    }
    req = urllib.request.Request(
        'https://api.notion.com/v1/pages',
        data=json.dumps(payload).encode(),
        headers=HEADERS,
        method='POST'
    )
    result = json.loads(urllib.request.urlopen(req).read())
    return result['id']
```

---

## Step 3 — Create the Master Doc

Create a child page under the project page titled **"[ProjectName] — Master Doc"**.

### Page Structure

```
📌 [Project Name] — Master Doc
[Status: {status} | Owner: Adam | Updated: {date}]
─────
H2: 🎯 What Is This
  paragraph: one clear sentence on what the project is and who it's for

H2: 📋 Current Status
  callout (🚧 orange if building, ✅ green if live, 🔴 red if blocked)
  bullet: key facts about current state

H2: 🏗️ Tech Stack
  table: Layer | Technology | Notes
  (Frontend, Backend, Database, Auth, Payments, Email, Hosting, etc.)

H2: 🔗 Key URLs
  bullet: Live site
  bullet: GitHub repos
  bullet: Hosting dashboards (Railway, Vercel, Supabase)
  bullet: Notion page

H2: 🎯 Goals
  H3: Short Term (this sprint/week)
    checkbox items
  H3: Medium Term (next 30 days)
    bullet items
  H3: Vision
    paragraph

H2: 🧩 What's Been Built
  bullet: completed features/milestones

H2: 🚀 What's Next
  checkbox: next action items in priority order

H2: ⚠️ Blockers & Risks
  bullet items (or "None currently" if clear)

H2: 💡 Key Decisions
  toggle per decision: [Decision title] → detail inside

─────
✅ Last Updated: [date] — [one sentence on what changed]
```

---

## Step 4 — Update Local Memory File

After creating the Notion page, update the project's memory file at:
`C:/Users/Adam/.claude/projects/C--Users-Adam/memory/project_{slug}.md`

Add the Notion URL at the top under the frontmatter, and update the content to match
what was written to Notion.

Memory file format:
```markdown
---
name: {project name}
description: {one-line summary}
type: project
---

**Notion:** https://notion.so/{page_id_no_dashes}

# {Project Name}

{Full current state — mirrors what's in Notion}

**Why:** {motivation for this project}
**How to apply:** Use this context when working on {project name} in any session.
```

---

## Step 5 — Update MEMORY.md

Check `C:/Users/Adam/.claude/projects/C--Users-Adam/memory/MEMORY.md`.
If the project is not listed under `## Projects`, add it.
If it exists but has no Notion mention, update the line to include it.

---

## Output

After completing, print:
```
✅ Project doc created/updated
📄 Notion: https://notion.so/{page_id}
💾 Memory: project_{slug}.md updated
```

---

## Rules

1. Always search for existing project page before creating — never duplicate
2. If a master doc already exists under the project, UPDATE it (append new section or rewrite stale sections) — don't create a second one
3. Keep the master doc as a living document — it should always reflect current reality
4. After any significant session (feature shipped, blocker resolved, pivot made), offer to update this doc

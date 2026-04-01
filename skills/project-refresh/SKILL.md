---
name: project-refresh
description: >
  Re-inject project context mid-conversation by reading the Notion master doc.
  Trigger when: context is getting long, "refresh context", "reload project", "what's the current
  state", switching back to a project after a gap, or when Claude detects it has lost track of
  project state in a long session. Also use to push a session update TO Notion after key progress.
---

# Skill: Project Refresh — Context Re-injection + Notion Sync

Context gets lost in long chats. This skill has two modes:

- **PULL** — Read the Notion master doc and re-inject project context into the conversation
- **PUSH** — Write a session progress update back to the Notion master doc

Run PULL at the start of a resumed session or when context feels stale.
Run PUSH after completing significant work (feature shipped, decision made, blocker cleared).

---

## Notion Setup

```python
TOKEN = 'ntn_K46793192822yLb12pUWso1QC0gaYtsA6dENpcn0xjhfKB'
HEADERS = {
    'Authorization': f'Bearer {TOKEN}',
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
}
```

---

## Mode: PULL — Read Notion, Re-inject Context

### Step 1 — Find the Notion URL

1. Read the project memory file: `C:/Users/Adam/.claude/projects/C--Users-Adam/memory/project_{slug}.md`
2. Extract the Notion page URL (look for `https://notion.so/...`)
3. If no Notion URL found → run `/project-doc` first to create one

### Step 2 — Fetch the Notion Page

```python
import urllib.request, json

def get_page_blocks(page_id):
    """Fetch all blocks from a Notion page"""
    blocks = []
    url = f'https://api.notion.com/v1/blocks/{page_id}/children?page_size=100'
    while url:
        req = urllib.request.Request(url, headers=HEADERS)
        data = json.loads(urllib.request.urlopen(req).read())
        blocks.extend(data.get('results', []))
        cursor = data.get('next_cursor')
        url = f'https://api.notion.com/v1/blocks/{page_id}/children?page_size=100&start_cursor={cursor}' if cursor else None
    return blocks

def extract_text(blocks):
    """Convert blocks to readable text"""
    lines = []
    for b in blocks:
        btype = b.get('type', '')
        rich = b.get(btype, {}).get('rich_text', [])
        text = ''.join(r['text']['content'] for r in rich if r.get('type') == 'text')
        if btype == 'heading_1': lines.append(f'\n# {text}')
        elif btype == 'heading_2': lines.append(f'\n## {text}')
        elif btype == 'heading_3': lines.append(f'\n### {text}')
        elif btype == 'paragraph' and text: lines.append(text)
        elif btype == 'bulleted_list_item': lines.append(f'  • {text}')
        elif btype == 'to_do': lines.append(f'  {"✅" if b["to_do"]["checked"] else "☐"} {text}')
        elif btype == 'callout': lines.append(f'\n💡 {text}\n')
        elif btype == 'divider': lines.append('─────')
    return '\n'.join(lines)
```

### Step 3 — Print Context Block

After fetching, output a clearly marked context block:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 CONTEXT REFRESH — {Project Name}
Last updated: {date from doc}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{extracted text from Notion page}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Context loaded. Continuing from here.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Mode: PUSH — Write Progress to Notion

Use this after completing meaningful work in a session.

### What to Push

Gather from the conversation:
- What was completed this session
- Any decisions made
- Current blockers
- Updated "What's Next" list

### How to Push

Find the "What's Been Built" section and append new completions.
Find the "What's Next" section and update checkboxes.
Find the "Blockers" section and update.
Append to the page bottom:

```python
def append_session_update(page_id, date, summary, completed, next_up):
    blocks = [
        divider(),
        h2(f'📝 Session Update — {date}'),
        callout(summary, '🚧'),
        h3('✅ Completed This Session'),
        *[bullet(item) for item in completed],
        h3('🚀 Up Next'),
        *[todo(item) for item in next_up],
    ]
    # POST to /blocks/{page_id}/children
    payload = {'children': blocks}
    req = urllib.request.Request(
        f'https://api.notion.com/v1/blocks/{page_id}/children',
        data=json.dumps(payload).encode(),
        headers=HEADERS,
        method='PATCH'
    )
    urllib.request.urlopen(req)
```

Also update the local memory file to match.

---

## When Claude Should Proactively Offer This

Claude should suggest running `/project-refresh` when:
- Resuming a project after the conversation has gone 20+ messages on other topics
- The user asks "where were we?" or "what's the current state?"
- Starting a new session on a known project
- After completing a major feature, deploy, or decision

---

## Output

**PULL:**
```
📋 Context refreshed from Notion — {project name}
```

**PUSH:**
```
✅ Session update pushed to Notion
📄 https://notion.so/{page_id}
💾 Memory file updated
```
